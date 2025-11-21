import puppeteer from "puppeteer";
import fs from "fs-extra";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import path from "path";

/* ----------------------------------------------------------
   Load your elements array (modify this path)
----------------------------------------------------------- */
import guitar from "../config/guitar.js";

/**
 * Generate all paths following your order:
 * 1. Chords in /spreading/
 * 2. Scales in /references/
 * 3. Same scales in /spreading/
 * 4. Arpeggios in /references/
 * 5. Arpeggios in /spreading/
 */
function buildPaths() {
    const keys = guitar.notes.sharps;

    const result = [];

    keys.forEach((key) => {
        /* ---------------------------------------------
           1. Chords (spreading)
        --------------------------------------------- */
        Object.keys(guitar.arppegios).forEach((ch) => {
            result.push({
                label: `Chord: ${guitar.arppegios[ch].name} in ${key}`,
                href: `/spreading/chords/${key.replace('#','sharp')}/${ch.replace('#','sharp')}`
            });
        });

        /* ---------------------------------------------
           2. Scales (references)
        --------------------------------------------- */
        Object.keys(guitar.scales).forEach((scale) => {
            const sc = guitar.scales[scale];
            if (sc.isModal) {
                sc.modes.forEach((m) => {
                    result.push({
                        label: `Scale: ${sc.name} in ${key} (Mode: ${m.name})`,
                        href: `/references/scales/${key.replace('#','sharp')}/${scale}/modal/${m.name.toLowerCase().replace(/ /g,'-').replace('#','sharp')}`
                    });
                });
            } else {
                result.push({
                    label: `Scale: ${sc.name} in ${key} (Single)`,
                    href: `/references/scales/${key.replace('#','sharp')}/${scale}/single`
                });
            }
        });

        /* ---------------------------------------------
           3. Scales (spreading)
        --------------------------------------------- */
        Object.keys(guitar.scales).forEach((scale) => {
            const sc = guitar.scales[scale];
            if (sc.isModal) {
                sc.modes.forEach((m) => {
                    result.push({
                        label: `Scale Spread: ${sc.name} in ${key} - ${m.name}`,
                        href: `/spreading/scales/${key.replace('#','sharp')}/${scale}/modal/${m.name.toLowerCase().replace(/ /g,'-').replace('#','sharp')}`
                    });
                });
            } else {
                result.push({
                    label: `Scale Spread: ${sc.name} in ${key}`,
                    href: `/spreading/scales/${key.replace('#','sharp')}/${scale}/single`
                });
            }
        });

        /* ---------------------------------------------
           4. Arpeggios (references)
        --------------------------------------------- */
        Object.keys(guitar.arppegios).forEach((arp) => {
            result.push({
                label: `Arpeggio: ${guitar.arppegios[arp].name} in ${key}`,
                href: `/references/arppegios/${key.replace('#','sharp')}/${arp.replace('#','sharp')}`
            });
        });

        /* ---------------------------------------------
           5. Arpeggios (spreading)
        --------------------------------------------- */
        Object.keys(guitar.arppegios).forEach((arp) => {
            result.push({
                label: `Arpeggio Spread: ${guitar.arppegios[arp].name} in ${key}`,
                href: `/spreading/arppegios/${key.replace('#','sharp')}/${arp.replace('#','sharp')}`
            });
        });
    });

    return result;
}

/* ----------------------------------------------------------
   Screenshot Pages
----------------------------------------------------------- */
async function screenshotAll(elements) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    const outDir = "./screens";
    await fs.ensureDir(outDir);

    for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const url = `http://localhost:3000${el.href}`;
        console.log(`📸 Capturing: ${url}`);

        await page.goto(url, { waitUntil: "networkidle2" });

        const imgPath = path.join(outDir, `page_${i}.png`);
        await page.screenshot({
            path: imgPath,
            fullPage: true,
        });

        elements[i].screenshot = imgPath;
    }

    await browser.close();
    return elements;
}

/* ----------------------------------------------------------
   Generate Final PDF (A4)
----------------------------------------------------------- */
async function generatePDF(elements) {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    /* ---------- COVER PAGE ---------- */
    let cover = pdf.addPage([595, 842]); // A4 size
    cover.drawText("Complete Guitar References", {
        x: 40,
        y: 780,
        size: 32,
        font,
        color: rgb(0, 0, 0),
    });

    cover.drawText("Chords • Scales • Arpeggios (Spreading + Reference Views)", {
        x: 40,
        y: 750,
        size: 16,
        font,
    });

    cover.drawText("Generated Automatically – © 2025 Your Name", {
        x: 40,
        y: 100,
        size: 12,
        font,
        color: rgb(0.3, 0.3, 0.3),
    });

    /* ---------- ADD SCREENSHOT PAGES ---------- */
    for (let el of elements) {
        const imgBytes = await fs.readFile(el.screenshot);
        const png = await pdf.embedPng(imgBytes);

        const page = pdf.addPage([595, 842]);
        const scale = 550 / png.width;
        const height = png.height * scale;

        page.drawImage(png, {
            x: 20,
            y: 842 - height - 20,
            width: 550,
            height,
        });
    }

    await fs.writeFile("final.pdf", await pdf.save());
    console.log("📄 PDF saved as final.pdf");
}

/* ----------------------------------------------------------
   MAIN
----------------------------------------------------------- */
(async () => {
    const elements = buildPaths();
    const withScreens = await screenshotAll(elements);
    await generatePDF(withScreens);
})();

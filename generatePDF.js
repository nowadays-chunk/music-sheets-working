import puppeteer from "puppeteer";
import fs from "fs-extra";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import path from "path";
import guitar from "./config/guitar.js";

/* ----------------------------------------------------------
   BUILD PATHS GROUPED BY KEY
----------------------------------------------------------- */
function buildPathsByKey() {
    const keys = guitar.notes.sharps;
    const result = {};

    keys.forEach((key) => {
        result[key] = [];

        /* 1. Chords (spreading) */
        Object.keys(guitar.arppegios).forEach((ch) => {
            result[key].push({
                label: `Chord: ${guitar.arppegios[ch].name} in ${key}`,
                href: `/spreading/chords/${key.replace('#','sharp')}/${ch.replace('#','sharp')}`
            });
        });

        /* 2. Scales (references) */
        Object.keys(guitar.scales).forEach((scale) => {
            const sc = guitar.scales[scale];
            if (sc.isModal) {
                sc.modes.forEach((m) => {
                    result[key].push({
                        label: `Scale: ${sc.name} in ${key} (Mode: ${m.name})`,
                        href: `/references/scales/${key.replace('#','sharp')}/${scale}/modal/${m.name.toLowerCase().replace(/ /g,'-').replace('#','sharp')}`
                    });
                });
            } else {
                result[key].push({
                    label: `Scale: ${sc.name} in ${key} (Single)`,
                    href: `/references/scales/${key.replace('#','sharp')}/${scale}/single`
                });
            }
        });

        /* 3. Scales (spreading) */
        Object.keys(guitar.scales).forEach((scale) => {
            const sc = guitar.scales[scale];
            if (sc.isModal) {
                sc.modes.forEach((m) => {
                    result[key].push({
                        label: `Scale Spread: ${sc.name} in ${key}`,
                        href: `/spreading/scales/${key.replace('#','sharp')}/${scale}/modal/${m.name.toLowerCase().replace(/ /g,'-').replace('#','sharp')}`
                    });
                });
            } else {
                result[key].push({
                    label: `Scale Spread: ${sc.name} in ${key}`,
                    href: `/spreading/scales/${key.replace('#','sharp')}/${scale}/single`
                });
            }
        });

        /* 4. Arpeggios (references) */
        Object.keys(guitar.arppegios).forEach((arp) => {
            result[key].push({
                label: `Arpeggio: ${guitar.arppegios[arp].name} in ${key}`,
                href: `/references/arppegios/${key.replace('#','sharp')}/${arp.replace('#','sharp')}`
            });
        });

        /* 5. Arpeggios (spreading) */
        Object.keys(guitar.arppegios).forEach((arp) => {
            result[key].push({
                label: `Arpeggio Spread: ${guitar.arppegios[arp].name} in ${key}`,
                href: `/spreading/arppegios/${key.replace('#','sharp')}/${arp.replace('#','sharp')}`
            });
        });
    });

    return result;
}

/* ----------------------------------------------------------
   TAKE SCREENSHOTS FOR ONE KEY (LOCAL CHROME)
----------------------------------------------------------- */
async function screenshotForKey(key, items) {
    const browser = await puppeteer.launch({
        headless: "new",
        executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
    });

    const page = await browser.newPage();
    const dir = `./screens/${key}`;
    await fs.ensureDir(dir);

    for (let i = 0; i < items.length; i++) {
        const url = `https://nowadays-chunk.github.io/music-sheets-working${items[i].href}`;
        console.log(`📸 [${key}] Capturing: ${url}`);

        await page.goto(url, { waitUntil: "networkidle2", timeout: 120000 });

        const imgPath = path.join(dir, `${i}.png`);
        await page.screenshot({ path: imgPath, fullPage: true });

        items[i].screenshot = imgPath;
    }

    await browser.close();
    return items;
}

/* ----------------------------------------------------------
   GENERATE PDF FOR ONE KEY
----------------------------------------------------------- */
async function generatePDFForKey(key, items) {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    // COVER
    const cover = pdf.addPage([595, 842]);
    cover.drawText(`${key} — Complete Guitar Reference`, {
        x: 40, y: 780, size: 30, font
    });
    cover.drawText("Chords • Scales • Arpeggios\nSpreading + Reference Views", {
        x: 40, y: 740, size: 14, font
    });
    cover.drawText("© 2025 – Auto-generated", {
        x: 40, y: 100, size: 12, font
    });

    // SCREENSHOT PAGES
    for (let el of items) {
        const imgBytes = await fs.readFile(el.screenshot);
        const png = await pdf.embedPng(imgBytes);

        const page = pdf.addPage([595, 842]);
        const scale = 550 / png.width;
        const h = png.height * scale;

        page.drawImage(png, {
            x: 20,
            y: 842 - h - 20,
            width: 550,
            height: h
        });
    }

    const filePath = `./pdf/${key}.pdf`;
    await fs.ensureDir("./pdf");
    await fs.writeFile(filePath, await pdf.save());

    console.log(`✔ PDF for ${key} saved → ${filePath}`);
}

/* ----------------------------------------------------------
   MAIN SCRIPT
----------------------------------------------------------- */
(async () => {
    const grouped = buildPathsByKey();

    for (const key of Object.keys(grouped)) {
        console.log(`\n========================`);
        console.log(`📕 GENERATING PDF FOR ${key}`);
        console.log(`========================`);

        const items = await screenshotForKey(key, grouped[key]);
        await generatePDFForKey(key, items);
    }

    console.log("\n🎉 All PDFs generated successfully!");
})();

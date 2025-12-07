import puppeteer from "puppeteer-core";
import fs from "fs-extra";
import { PDFDocument, StandardFonts } from "pdf-lib";
import path from "path";
import sharp from "sharp";
import guitar from "./config/guitar.js";

/* ----------------------------------------------------------
   BUILD PATHS GROUPED BY KEY
----------------------------------------------------------- */
function buildPathsByKey() {
    const keys = guitar.notes.sharps;
    const result = {};

    keys.forEach((key) => {
        result[key] = [];

        // 1. Chords (spreading)
        Object.keys(guitar.arppegios).forEach((ch) => {
            result[key].push({
                label: `Chord: ${guitar.arppegios[ch].name} in ${key}`,
                section: "Chords",
                href: `/spreading/chords/${key.replace('#','sharp')}/${ch.replace('#','sharp')}`
            });
        });

        // 2. Scales (references)
        Object.keys(guitar.scales).forEach((scale) => {
            const sc = guitar.scales[scale];

            if (sc.isModal) {
                sc.modes.forEach((m) => {
                    result[key].push({
                        label: `Scale: ${sc.name} in ${key} (Mode: ${m.name})`,
                        section: "Scales",
                        href: `/spreading/scales/${key.replace('#','sharp')}/${scale}/modal/${m.name.toLowerCase().replace(/ /g,'-').replace('#','sharp')}`
                    });
                });
            } else {
                result[key].push({
                    label: `Scale: ${sc.name} in ${key} (Single)`,
                    section: "Scales",
                    href: `/spreading/scales/${key.replace('#','sharp')}/${scale}/single`
                });
            }
        });

        // 3. Scales (spreading)
        Object.keys(guitar.scales).forEach((scale) => {
            const sc = guitar.scales[scale];

            if (sc.isModal) {
                sc.modes.forEach((m) => {
                    result[key].push({
                        label: `Scale Spread: ${sc.name} in ${key}`,
                        section: "Scales",
                        href: `/spreading/scales/${key.replace('#','sharp')}/${scale}/modal/${m.name.toLowerCase().replace(/ /g,'-').replace('#','sharp')}`
                    });
                });
            } else {
                result[key].push({
                    label: `Scale Spread: ${sc.name} in ${key}`,
                    section: "Scales",
                    href: `/spreading/scales/${key.replace('#','sharp')}/${scale}/single`
                });
            }
        });

        // 5. Arpeggios (spreading)
        Object.keys(guitar.arppegios).forEach((arp) => {
            result[key].push({
                label: `Arpeggio Spread: ${guitar.arppegios[arp].name} in ${key}`,
                section: "Arpeggios",
                href: `/spreading/arppegios/${key.replace('#','sharp')}/${arp.replace('#','sharp')}`
            });
        });
    });

    return result;
}

/* ----------------------------------------------------------
   CREATE A SECTION TITLE PAGE
----------------------------------------------------------- */
async function createSectionPage(title) {
    const pageWidth = 595;  // A4
    const pageHeight = 842;

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([pageWidth, pageHeight]);

    const font = await pdf.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 48;

    const textWidth = font.widthOfTextAtSize(title, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    const x = (pageWidth - textWidth) / 2;
    const y = (pageHeight - textHeight) / 2 + textHeight;

    page.drawText(title, {
        x,
        y,
        font,
        size: fontSize,
    });

    return pdf;
}

/* ----------------------------------------------------------
   SCREENSHOT + ONE PDF PAGE PER IMAGE
----------------------------------------------------------- */
async function screenshotForKey(key, items) {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--window-size=1400,1200"
        ],
        defaultViewport: { width: 1400, height: 1000 }
    });

    const page = await browser.newPage();

    const imgDir = `./screens/${key}`;
    const pdfDir = `./pdf-pages/${key}`;

    await fs.ensureDir(imgDir);
    await fs.ensureDir(pdfDir);

    const pageWidth = 595;  // A4
    const pageHeight = 842;

    for (let i = 0; i < items.length; i++) {
        const url = `https://music-sheets-working.vercel.app${items[i].href}`;
        console.log(`📸 [${key}] Capturing: ${url}`);

        await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 60000
        });

        await page.waitForSelector("canvas, svg", { timeout: 60000 });
        await new Promise(res => setTimeout(res, 1500));

        // Full page screenshot
        const buffer = await page.screenshot({ fullPage: true });
        const meta = await sharp(buffer).metadata();

        // Crop 200px left/right and 80px top
        const cropped = await sharp(buffer)
            .extract({
                left: 200,
                top: 80,
                width: meta.width - 400,
                height: meta.height - 80
            })
            .png()
            .toBuffer();

        const imgPath = path.join(imgDir, `${i}.png`);
        await fs.writeFile(imgPath, cropped);

        items[i].screenshot = imgPath;

        // Create PDF page for image
        const pdf = await PDFDocument.create();
        const img = await pdf.embedPng(cropped);

        const { width: imgW, height: imgH } = img.scale(1);

        const scale = Math.min(pageWidth / imgW, pageHeight / imgH);
        const w = imgW * scale;
        const h = imgH * scale;

        const x = (pageWidth - w);
        const y = (pageHeight - h);

        const pdfPage = pdf.addPage([pageWidth, pageHeight]);
        pdfPage.drawImage(img, { x, y, width: w, height: h });

        const pdfPath = path.join(pdfDir, `${i}.pdf`);
        await fs.writeFile(pdfPath, await pdf.save());

        console.log(`   ✔ Saved PNG      → ${imgPath}`);
        console.log(`   ✔ Saved PAGE PDF → ${pdfPath}`);
    }

    await browser.close();
    return items;
}

/* ----------------------------------------------------------
   MERGE ALL PAGES FOR ONE KEY — WITH SECTION TITLES
----------------------------------------------------------- */
async function mergePDF(key, items) {
    const finalPDF = await PDFDocument.create();
    const pdfDir = `./pdf-pages/${key}`;

    let lastSection = null;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Insert section page if new
        if (item.section !== lastSection) {
            console.log(`➡️ Adding section title page: ${item.section}`);
            lastSection = item.section;

            const sectionPDF = await createSectionPage(item.section);
            const sectionBytes = await sectionPDF.save();
            const temp = await PDFDocument.load(sectionBytes);
            const [page] = await finalPDF.copyPages(temp, [0]);
            finalPDF.addPage(page);
        }

        // Insert actual item page
        const filePath = path.join(pdfDir, `${i}.pdf`);
        const bytes = await fs.readFile(filePath);

        const tempPDF = await PDFDocument.load(bytes);
        const [page] = await finalPDF.copyPages(tempPDF, [0]);
        finalPDF.addPage(page);

        console.log(`   ➕ Added page #${i} (${item.label})`);
    }

    await fs.ensureDir("./pdf");
    const finalPath = `./pdf/${key}-merged.pdf`;
    await fs.writeFile(finalPath, await finalPDF.save());

    console.log(`\n🎉 MERGED PDF CREATED → ${finalPath}\n`);
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
        await mergePDF(key, items);
    }

    console.log("\n🎉 ALL PDFs GENERATED SUCCESSFULLY!");
})();

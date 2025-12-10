// ============================================================================
// scrape-ug-batch.js — Batch scrape all tabs using existing scrape logic
// ============================================================================

import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

// Load song list
const SONG_LIST_PATH = "./output_songs/songs-all.json";
const OUTPUT_DIR = "./tabs";

// Ensure folder exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

// =====================
// Helper: Clean strings
// =====================
const clean = (s) =>
  s?.replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/ +/g, " ")
    .trim() ?? "";

// =====================
// Fetch HTML
// =====================
async function fetchHTML(url) {
  return fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
      "Accept-Language": "en-US,en;q=0.9",
    },
  }).then((res) => res.text());
}

// =====================
// Extract JSON store
// =====================
function extractStoreJSON($) {
  const raw = $(".js-store").attr("data-content");
  if (!raw) return null;
  const jsonText = raw.replace(/&quot;/g, '"');
  return JSON.parse(jsonText);
}

// =============================
// Extract chunks (YOUR FUNCTION)
// =============================
function extractChunksFromMerged(line) {
  const chordRegex = /\[ch\](.*?)\[\/ch\]/g;
  const chords = [];
  let match;

  while ((match = chordRegex.exec(line)) !== null) {
    chords.push({ chord: match[1], index: match.index });
  }

  const lyricsOnly = line.replace(chordRegex, "");

  if (chords.length === 0) return [];

  const chunks = [];

  for (let i = 0; i < chords.length; i++) {
    const start = chords[i].index;
    const end =
      i < chords.length - 1 ? chords[i + 1].index : lyricsOnly.length;

    chunks.push({
      chord: chords[i].chord,
      lyrics: lyricsOnly.slice(start, end).trim(),
    });
  }

  return chunks;
}

function isRealSection(line) {
  return /^\[(intro|verse|chorus|bridge|pre-chorus|outro|solo)/i.test(line);
}

// =====================
// Core scrape function
// =====================
async function scrapeTab(tabUrl) {
  const html = await fetchHTML(tabUrl);
  const $ = cheerio.load(html);
  const store = extractStoreJSON($);

  if (!store) {
    console.warn("⚠️ No js-store found:", tabUrl);
    return null;
  }

  const tab = store?.store?.page?.data?.tab_view?.wiki_tab?.content ?? "";
  const rawLines = tab.split(/\r?\n/).map(clean);

  // Merge paired chord/lyric lines
  const mergedLines = [];
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];

    if (
      line.includes("[ch]") &&
      rawLines[i + 1] &&
      !rawLines[i + 1].includes("[ch]")
    ) {
      const merged =
        line.replace(/\[\/?tab\]/g, "") +
        " " +
        rawLines[i + 1].replace(/\[\/?tab\]/g, "");
      mergedLines.push(clean(merged));
      i++;
    } else {
      mergedLines.push(line.replace(/\[\/?tab\]/g, "").trim());
    }
  }

  // Build sections
  const sections = [];
  let current = { name: "Main", lines: [] };

  for (let line of mergedLines) {
    if (!line) continue;

    if (isRealSection(line)) {
      current = { name: line.replace(/[\[\]]/g, ""), lines: [] };
      sections.push(current);
      continue;
    }

    if (line.includes("[ch]")) {
      const chunks = extractChunksFromMerged(line);
      if (chunks.length > 0) {
        current.lines.push({ chunks });
      }
      continue;
    }

    current.lines.push({ chunks: [{ chord: null, lyrics: clean(line) }] });
  }

  return {
    url: tabUrl,
    title: store?.store?.page?.data?.tab?.song_name ?? "",
    artist: store?.store?.page?.data?.tab?.artist_name ?? "",
    key: store?.store?.page?.data?.tab?.tonality_name ?? "",
    scrapedAt: new Date().toISOString(),
    sections,
  };
}

// =====================
// Batch runner
// =====================
console.log("📥 Loading song list:", SONG_LIST_PATH);
const songs = JSON.parse(fs.readFileSync(SONG_LIST_PATH, "utf8"));

console.log(`🎵 Total songs to scrape: ${songs.length}`);

let index = 0;

for (const song of songs) {
  index++;
  const { id, tab_url } = song;

  if (!tab_url) {
    console.log(`⏭️  Skipping (no tab_url) id=${id}`);
    continue;
  }

  const outPath = path.join(OUTPUT_DIR, `${id}.json`);

  if (fs.existsSync(outPath)) {
    console.log(`✔️ Already exists: ${outPath}`);
    continue;
  }

  console.log(`\n[${index}/${songs.length}] Scraping ID=${id}`);
  console.log("URL:", tab_url);

  try {
    const result = await scrapeTab(tab_url);

    if (!result) {
      console.log("❌ Failed to scrape");
      continue;
    }

    fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");
    console.log("💾 Saved:", outPath);
  } catch (err) {
    console.error("❌ Error scraping", tab_url, err);
  }
}

console.log("\n🎉 DONE SCRAPING ALL TABS!");

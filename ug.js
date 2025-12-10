// ============================================================================
// scrape-explore.js — Extract songs from UG Explore pages using js-store JSON
// Run: node scrape-explore.js
// ============================================================================

import fetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";

const BASE = "https://www.ultimate-guitar.com/explore";
const START_PAGE = 1;
const END_PAGE = 100; // ← change range here

// Ensure output directory exists
const OUTPUT_DIR = "./output_songs";
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
  console.log("Created folder:", OUTPUT_DIR);
}

// ============================================================================
// Fetch 1 explore page
// ============================================================================
async function fetchExplorePage(page) {
  const url = `${BASE}?page=${page}&type%5B%5D=Chords`; // ← encoded "type[]"

  console.log(`\nFetching Explore Page ${page}: ${url}`);

  const html = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
    },
  }).then((r) => r.text());

  const $ = cheerio.load(html);

  console.log($.html())
  const rawJson = $(".js-store").attr("data-content");
  if (!rawJson) {
    console.error("❌ Could not find js-store on page:", page);
    return [];
  }

  let store;
  try {
    store = JSON.parse(rawJson);
  } catch (err) {
    console.error("❌ Failed to parse JSON on page:", page, err);
    return [];
  }

  const tabs = store?.store?.page?.data?.data?.tabs || [];

  return tabs.map((t) => ({
    id: t.id,
    song_id: t.song_id,
    song_name: t.song_name,
    artist_name: t.artist_name,
    key: t.tonality_name,
    tab_url: t.tab_url,
    artist_url: t.artist_url,
    rating: t.rating,
    difficulty: t.difficulty,
  }));
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
(async () => {
  let allSongs = [];

  for (let page = START_PAGE; page <= END_PAGE; page++) {
    const songs = await fetchExplorePage(page);

    // Save page songs into individual file
    const pageFile = path.join(OUTPUT_DIR, `songs-page-${page}.json`);
    fs.writeFileSync(pageFile, JSON.stringify(songs, null, 2), "utf8");
    console.log(`💾 Saved Page ${page} → ${pageFile}`);

    console.log(`→ Found ${songs.length} songs on page ${page}`);

    allSongs = allSongs.concat(songs);
  }

  // Remove duplicates by unique tab ID
  allSongs = [...new Map(allSongs.map((s) => [s.id, s])).values()];

  // Save global file
  const finalFile = path.join(OUTPUT_DIR, "songs-all.json");
  fs.writeFileSync(finalFile, JSON.stringify(allSongs, null, 2), "utf8");

  console.log("\n==========================================");
  console.log(`TOTAL SONGS SCRAPED: ${allSongs.length}`);
  console.log("Saved to:", finalFile);
  console.log("==========================================\n");
})();

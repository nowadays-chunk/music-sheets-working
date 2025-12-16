// ============================================================
// SongsSelector.jsx — Infinite Scroll + Search + SSG Routing
// ============================================================

"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
} from "@mui/material";
import { styled } from "@mui/system";
import { useRouter } from "next/router";

import songsFirst from "@/output_songs/first-songs.json";
import songsSecond from "@/output_songs/second-songs.json";

/* ============================================================
   HELPERS
============================================================ */
function safeFilename(title, artist) {
  return `${title}_${artist}`
    .normalize("NFD")                 // remove accents
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")      // keep only a-z 0-9 _
    .replace(/_+/g, "_")              // collapse multiple _
    .replace(/^_|_$/g, "");           // trim _
}

const slugify = (song_name, artist_name, tab_url) => {
  if(tab_url.includes('chordie.com')){
    return `${artist_name}-${song_name}`
      .replace(/[^\w\d]+/g, "_")
      .toLowerCase();
  } else {
    return safeFilename(song_name, artist_name);
  }
}

/* ============================================================
   STYLES
============================================================ */

const CardsGrid = styled("div")({
  display: "grid",
  gap: 24,
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",

  "@media (max-width: 800px)": {
    gridTemplateColumns: "repeat(2, 1fr)",
  },
  "@media (max-width: 600px)": {
    gridTemplateColumns: "1fr",
  },
});

const SongCard = styled(Card)({
  cursor: "pointer",
  transition: "0.2s",
  padding: "8px 12px",
  "&:hover": { transform: "scale(1.02)" },
});

/* ============================================================
   COMPONENT
============================================================ */

const SongsSelector = () => {
  const router = useRouter();

  /* ------------------------------------------------------------
     MERGE LISTS (ONCE)
  ------------------------------------------------------------ */

  const allSongs = useMemo(
    () => [...songsFirst, ...songsSecond],
    []
  );

  /* ------------------------------------------------------------
     STATE
  ------------------------------------------------------------ */

  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(100);

  /* ------------------------------------------------------------
     FILTER
  ------------------------------------------------------------ */

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allSongs.filter((s) =>
      `${s.song_name} ${s.artist_name}`.toLowerCase().includes(q)
    );
  }, [search, allSongs]);

  const visibleSongs = filtered.slice(0, visibleCount);

  /* ------------------------------------------------------------
     INFINITE SCROLL
  ------------------------------------------------------------ */

  useEffect(() => {
    const onScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 400;

      if (nearBottom) {
        setVisibleCount((c) =>
          Math.min(c + 100, filtered.length)
        );
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [filtered.length]);

  /* ------------------------------------------------------------
     NAVIGATION
  ------------------------------------------------------------ */

  const openSong = (song) => {
    const slug = slugify(song.song_name, song.artist_name, song.tab_url);
    router.push(`/learn/${slug}`);
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <Box
      sx={{
        paddingTop: 3,
        paddingBottom: 3,
        paddingLeft: "180px",
        paddingRight: "180px",

        "@media (max-width: 1000px)": {
          paddingLeft: "120px",
          paddingRight: "120px",
        },
        "@media (max-width: 800px)": {
          paddingLeft: "60px",
          paddingRight: "60px",
        },
        "@media (max-width: 600px)": {
          paddingLeft: "12px",
          paddingRight: "12px",
        },
      }}
    >
      <Typography variant="h4" mb={2}>
        Guitar Songs Library
      </Typography>

      <TextField
        label="Search songs"
        fullWidth
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setVisibleCount(100);
        }}
        sx={{ mb: 3 }}
      />

      <CardsGrid>
        {visibleSongs.map((song) => (
          <SongCard
            key={`${song.song_id}-${song.source}`}
            onClick={() => openSong(song)}
          >
            <CardContent>
              <Typography variant="h6">
                {song.song_name}
              </Typography>
              <Typography variant="subtitle2">
                {song.artist_name}
              </Typography>
              {song.key && (
                <Typography variant="body2">
                  Key: {song.key}
                </Typography>
              )}
            </CardContent>
          </SongCard>
        ))}
      </CardsGrid>

      {visibleCount < filtered.length && (
        <Typography
          align="center"
          sx={{ mt: 4, opacity: 0.6 }}
        >
          Loading more songs…
        </Typography>
      )}
    </Box>
  );
};

export default SongsSelector;

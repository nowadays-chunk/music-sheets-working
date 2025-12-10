// ============================================================
//   SongsSelector.jsx — Clean Grid + Responsive Padding + Fullscreen
// ============================================================

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { styled } from "@mui/system";

import songsAll from "@/output_songs/songs-all.json";

/* ============================================================
   GRID LAYOUT (2 columns until 600px)
============================================================ */

const CardsGrid = styled("div")(({ theme }) => ({
  display: "grid",
  gap: "24px",

  // Normal behavior: auto grid
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",

  // ⭐ Force exactly 2 columns until 600px
  "@media (max-width: 800px)": {
    gridTemplateColumns: "repeat(2, 1fr)",
  },

  // ⭐ 1 column under 600px
  "@media (max-width: 600px)": {
    gridTemplateColumns: "1fr",
  },
}));

const SongCard = styled(Card)({
  width: "100%",
  cursor: "pointer",
  transition: "0.2s",
  padding: "8px 12px",
  boxSizing: "border-box",
  "&:hover": { transform: "scale(1.02)" },
});

/* ============================================================
   CHORD + LYRIC STYLES
============================================================ */

const ChordBox = styled("span")({
  padding: "4px 6px",
  marginRight: 6,
  borderRadius: 6,
  border: "1px solid #ccc",
  background: "#fafafa",
  fontWeight: "bold",
});

const ChunkLine = styled("div")({
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  marginBottom: 8,
  justifyContent: "flex-start",
});

const ChunkItem = styled("div")({
  display: "flex",
  alignItems: "center",
  marginRight: 10,
});

/* ============================================================
   SONG VIEW WRAPPER (CENTERED)
============================================================ */

const SongViewContainer = styled("div")({
  maxWidth: "900px",
  margin: "0 auto",
  textAlign: "left",
});

/* ============================================================
   FULLSCREEN MODE (RESPONSIVE)
============================================================ */

const FullscreenOverlay = styled("div")(({ theme }) => ({
  position: "fixed",
  inset: 0,
  zIndex: 5000,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",

  // ⭐ RESPONSIVE padding — fixes disappearing text
  padding: "0px 160px",

  "@media (max-width: 1200px)": {
    padding: "0px 120px",
  },
  "@media (max-width: 1000px)": {
    padding: "0px 80px",
  },
  "@media (max-width: 800px)": {
    padding: "0px 40px",
  },
  "@media (max-width: 600px)": {
    padding: "0px 16px",
  },

  backdropFilter: "blur(20px)",
  background:
    "linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(230,230,230,0.95))",
}));

const FullscreenCenterWrapper = styled("div")({
  flex: 1,
  width: "100%",
  maxWidth: "1400px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const FullscreenLineRow = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexWrap: "nowrap",
  whiteSpace: "nowrap",
  overflow: "hidden",
  maxWidth: "90vw",

  [theme.breakpoints.down("lg")]: {
    whiteSpace: "normal",
    flexWrap: "wrap",
    textAlign: "center",
  },
}));

const FullscreenChunk = styled("span")({
  display: "inline-flex",
  alignItems: "center",
  marginRight: 18,
});

const FullscreenLyrics = styled("span")(({ theme }) => ({
  fontSize: 44,
  fontWeight: 800,
  [theme.breakpoints.down("lg")]: { fontSize: 30 },
  [theme.breakpoints.down("sm")]: { fontSize: 26 },
}));

const FullscreenButtons = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 60,
  left: "50%",
  transform: "translateX(-50%)",

  display: "flex",
  gap: 30,

  [theme.breakpoints.down("lg")]: {
    bottom: 40,
    gap: 20,
  },
}));

/* ============================================================
   COMPONENT
============================================================ */

const SongsSelector = () => {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState(songsAll);

  const [selectedSong, setSelectedSong] = useState(null);
  const [songData, setSongData] = useState(null);

  const [fullscreen, setFullscreen] = useState(false);

  const [playableLines, setPlayableLines] = useState([]);
  const [playIndex, setPlayIndex] = useState(0);

  const [touchStart, setTouchStart] = useState(null);

  /* ============================================================
     SEARCH
  ============================================================ */

  useEffect(() => {
    const q = search.toLowerCase();

    setFiltered(
      songsAll.filter((s) =>
        Object.values(s).some(
          (v) => typeof v === "string" && v.toLowerCase().includes(q)
        )
      )
    );
  }, [search]);

  /* ============================================================
     LOAD SONG
  ============================================================ */

  const loadSong = async (song) => {
    setSelectedSong(song);
    setSongData(null);

    try {
      const json = await import(`@/tabs/${song.id}.json`);
      const data = json.default ?? json;

      const extracted = [];

      data.sections.forEach((section) => {
        section.lines.forEach((line) => {
          if (line.chunks.some((chunk) => chunk.chord)) {
            extracted.push(line);
          }
        });
      });

      setPlayableLines(extracted);
      setSongData(data);
      setPlayIndex(0);
    } catch {
      setSongData({ error: "File not found or unreadable" });
    }
  };

  /* ============================================================
     FULLSCREEN CONTROLS
  ============================================================ */

  const toggleFullscreen = () =>
    songData && playableLines.length && setFullscreen((f) => !f);

  const nextLine = () =>
    setPlayIndex((i) => (i + 1 < playableLines.length ? i + 1 : i));

  const prevLine = () =>
    setPlayIndex((i) => (i - 1 >= 0 ? i - 1 : i));

  /* ============================================================
     SWIPE
  ============================================================ */

  const onTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const onTouchEnd = (e) => {
    if (!touchStart) return;

    const diff = touchStart - e.changedTouches[0].clientX;

    if (diff > 50) nextLine();
    else if (diff < -50) prevLine();

    setTouchStart(null);
  };

  /* ============================================================
     KEYBOARD
  ============================================================ */

  useEffect(() => {
    const handler = (e) => {
      // Enter opens fullscreen
      if (e.key === "Enter" && !fullscreen) {
        e.preventDefault();
        toggleFullscreen();
      }

      // Space or → goes next
      if (fullscreen && (e.key === " " || e.key === "ArrowRight")) {
        e.preventDefault();
        nextLine();
      }

      // ← goes previous
      if (fullscreen && e.key === "ArrowLeft") {
        e.preventDefault();
        prevLine();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [fullscreen]);

  /* ============================================================
     FULLSCREEN RENDER
  ============================================================ */

  const renderFullscreen = () =>
    fullscreen &&
    playableLines[playIndex] && (
      <FullscreenOverlay onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <FullscreenCenterWrapper>
          <FullscreenLineRow>
            {playableLines[playIndex].chunks.map((chunk, i) => (
              <FullscreenChunk key={i}>
                {chunk.chord && (
                  <ChordBox
                    style={{
                      fontSize:
                        window.innerWidth > 1600
                          ? 40
                          : window.innerWidth > 1200
                          ? 32
                          : window.innerWidth > 800
                          ? 26
                          : 20,
                      padding:
                        window.innerWidth > 1600
                          ? "10px 16px"
                          : window.innerWidth > 1200
                          ? "8px 14px"
                          : window.innerWidth > 800
                          ? "6px 10px"
                          : "4px 6px",
                      borderRadius: 10,
                      marginRight: 12,
                    }}
                  >
                    {chunk.chord}
                  </ChordBox>
                )}

                {chunk.lyrics && (
                  <FullscreenLyrics>{chunk.lyrics}</FullscreenLyrics>
                )}
              </FullscreenChunk>
            ))}
          </FullscreenLineRow>
        </FullscreenCenterWrapper>

        <FullscreenButtons>
          <Button variant="outlined" onClick={prevLine}>
            ← Previous
          </Button>

          <Button variant="contained" onClick={nextLine}>
            Next →
          </Button>

          <Button variant="outlined" onClick={toggleFullscreen}>
            Exit
          </Button>
        </FullscreenButtons>
      </FullscreenOverlay>
    );

  /* ============================================================
     SONG VIEW
  ============================================================ */

  if (selectedSong)
    return (
      <SongViewContainer>
        <Box p={3}>
          {renderFullscreen()}

          {songData ? (
            <>
              <Typography variant="h4">{songData.title}</Typography>
              <Typography variant="h6">{songData.artist}</Typography>

              <Box
                mt={2}
                mb={2}
                display="flex"
                justifyContent="center"
                gap={2}
              >
                <Button variant="contained" onClick={toggleFullscreen}>
                  Fullscreen
                </Button>
                <Button variant="outlined" onClick={() => setSelectedSong(null)}>
                  ← Back
                </Button>
              </Box>

              <Typography
                variant="h5"
                sx={{ mb: 2, textAlign: "center" }}
              >
                Playable Lines
              </Typography>

              {playableLines.map((line, i) => (
                <ChunkLine key={i}>
                  {line.chunks.map((chunk, k) => (
                    <ChunkItem key={k}>
                      {chunk.chord && <ChordBox>{chunk.chord}</ChordBox>}
                      <Typography>{chunk.lyrics}</Typography>
                    </ChunkItem>
                  ))}
                </ChunkLine>
              ))}
            </>
          ) : (
            <Button variant="outlined" onClick={() => setSelectedSong(null)}>
              ← Back
            </Button>
          )}
        </Box>
      </SongViewContainer>
    );

  /* ============================================================
     SONG LIST (GRID)
  ============================================================ */

  return (
    <Box
      sx={{
        paddingTop: "24px",
        paddingBottom: "24px",
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
        "@media (max-width: 700px)": {
          paddingLeft: "24px",
          paddingRight: "24px",
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
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
      />

      <CardsGrid>
        {filtered.map((song) => (
          <SongCard key={song.id} onClick={() => loadSong(song)}>
            <CardContent>
              <Typography variant="h6">{song.song_name}</Typography>
              <Typography variant="subtitle2">{song.artist_name}</Typography>
              <Typography variant="body2">Key: {song.key}</Typography>
            </CardContent>
          </SongCard>
        ))}
      </CardsGrid>
    </Box>
  );
};

export default SongsSelector;

// ui/editor/TransportBar.jsx
import React, { useState } from "react";
import { Box, IconButton, Slider } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import LoopIcon from "@mui/icons-material/Loop";
import { useScore } from "@/core/editor/ScoreContext";

export default function TransportBar() {
  const { playback, score } = useScore();
  const [bpm, setBpm] = useState(120);

  // SSR protection: playback is null until client initializes it
  if (!playback) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: 1,
          borderBottom: "1px solid #ddd",
        }}
      >
        Loading audio engine…
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: 1,
        borderBottom: "1px solid #ddd",
        background: "#fafafa",
      }}
    >
      <IconButton onClick={() => playback.playScore(score)}>
        <PlayArrowIcon />
      </IconButton>

      <IconButton onClick={() => playback.stop()}>
        <StopIcon />
      </IconButton>

      <IconButton onClick={() => playback.setLoop(0, 4)}>
        <LoopIcon />
      </IconButton>

      <Slider
        value={bpm}
        min={40}
        max={200}
        sx={{ width: 200 }}
        onChange={(e, v) => {
          setBpm(v);
          playback.setTempo(v);
        }}
      />

      {bpm} BPM
    </Box>
  );
}

// ui/editor/Toolbar.jsx
import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import ExposureIcon from "@mui/icons-material/Exposure";
import { useScore } from "@/core/editor/ScoreContext";

export default function Toolbar() {
  const { input } = useScore();

  const dur = (q) => (
    <Tooltip title={`${q} note`}>
      <IconButton onClick={() => input.setDuration(q)}>
        <ExposureIcon />
      </IconButton>
    </Tooltip>
  );

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        padding: 1,
        borderBottom: "1px solid #ddd",
        background: "#fafafa",
      }}
    >
      <Tooltip title="Select tool">
        <IconButton>
          <MusicNoteIcon />
        </IconButton>
      </Tooltip>

      {dur(4)} {dur(2)} {dur(1)} {dur(0.5)} {dur(0.25)}
    </Box>
  );
}

// ui/editor/InspectorPanel.jsx
import React from "react";
import { Box, Typography, TextField } from "@mui/material";
import { useScore } from "@/core/editor/ScoreContext";

export default function InspectorPanel() {
  const { selection } = useScore();

  const selected = selection.selected;

  return (
    <Box
      sx={{
        width: 250,
        borderLeft: "1px solid #ddd",
        padding: 2,
      }}
    >
      <Typography variant="h6">Inspector</Typography>

      {!selected && <p>No selection</p>}

      {selected?.pitch && (
        <>
          <Typography variant="subtitle1">Pitch</Typography>
          <TextField
            size="small"
            label="Note"
            value={selected.pitch.fullName}
          />
          <TextField
            size="small"
            label="Octave"
            value={selected.pitch.octave}
            sx={{ mt: 1 }}
          />
        </>
      )}

      {selected?.duration && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Duration
          </Typography>
          <TextField size="small" label="Beats" value={selected.duration.value} />
        </>
      )}
    </Box>
  );
}

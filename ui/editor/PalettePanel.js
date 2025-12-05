// ui/editor/PalettePanel.jsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";

export default function PalettePanel() {
  return (
    <Box
      sx={{
        width: 200,
        borderRight: "1px solid #ddd",
        padding: 2,
        background: "#fafafa",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Palette
      </Typography>

      <Button fullWidth variant="outlined">
        Add Clef
      </Button>

      <Button fullWidth variant="outlined" sx={{ mt: 1 }}>
        Add Time Signature
      </Button>

      <Button fullWidth variant="outlined" sx={{ mt: 1 }}>
        Add Key Signature
      </Button>

      <Button fullWidth variant="outlined" sx={{ mt: 1 }}>
        Articulations
      </Button>
    </Box>
  );
}

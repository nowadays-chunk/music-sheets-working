// ui/editor/MenuBar.jsx
import React from "react";
import { Box, Button } from "@mui/material";
import FileMenu from "./FileMenu";

export default function MenuBar() {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        padding: 1,
        borderBottom: "1px solid #ddd",
        background: "#eee",
      }}
    >
      <FileMenu />
      <Button>Edit</Button>
      <Button>View</Button>
      <Button>Help</Button>
    </Box>
  );
}

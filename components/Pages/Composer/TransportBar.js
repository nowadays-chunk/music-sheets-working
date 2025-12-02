import React from "react";
import { Button, ButtonGroup } from "@mui/material";

export default function TransportBar({
  isPlaying,
  onPlay,
  onPause,
  onStop,
  onStart,
  onEnd,
  onRewind,
  onFastForward,
  loop,
  onToggleLoop,
  onExport
}) {
  return (
    <ButtonGroup size="large" variant="outlined" sx={{ mb: 2 }}>
      <Button onClick={onStart}>⏮︎</Button>
      <Button onClick={onRewind}>⏪</Button>

      {!isPlaying ? (
        <Button color="success" onClick={onPlay}>⏵︎</Button>
      ) : (
        <Button color="warning" onClick={onPause}>⏸︎</Button>
      )}

      <Button color="error" onClick={onStop}>⏹︎</Button>
      <Button onClick={onFastForward}>⏩</Button>
      <Button onClick={onEnd}>⏭︎</Button>

      <Button
        color={loop ? "success" : "inherit"}
        onClick={onToggleLoop}
      >
        🔁
      </Button>

      <Button onClick={onExport}>💾</Button>
    </ButtonGroup>
  );
}

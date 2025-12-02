import React from "react";
import { Button, ButtonGroup, Slider, Box, Typography } from "@mui/material";

export default function TransportBar({
  isPlaying,
  onPlay,
  onPause,
  onStop,
  bpm,
  onBpmChange,
  volume,
  onVolumeChange,
  metronome,
  onToggleMetronome,
  countIn,
  onCountInChange,
  onExport
}) {
  return (
    <Box sx={{ mb: 3 }}>
      <ButtonGroup size="large" variant="outlined" sx={{ mb: 2 }}>
        {!isPlaying ? (
          <Button color="success" onClick={onPlay}>⏵ Play</Button>
        ) : (
          <Button color="warning" onClick={onPause}>⏸ Pause</Button>
        )}
        <Button color="error" onClick={onStop}>⏹ Stop</Button>
        <Button onClick={onToggleMetronome} color={metronome ? "success" : "inherit"}>
          🔔 Metronome
        </Button>
        <Button onClick={onExport}>💾 Export MIDI</Button>
      </ButtonGroup>

      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography sx={{ width: 80 }}>BPM: {bpm}</Typography>
        <Slider
          min={40}
          max={240}
          value={bpm}
          onChange={(e, v) => onBpmChange(v)}
          sx={{ width: 200 }}
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography sx={{ width: 80 }}>Volume: {Math.round(volume * 100)}%</Typography>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e, v) => onVolumeChange(v)}
          sx={{ width: 200 }}
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography sx={{ width: 80 }}>Count-In Bars: {countIn}</Typography>
        <Slider
          min={0}
          max={4}
          value={countIn}
          onChange={(e, v) => onCountInChange(v)}
          sx={{ width: 200 }}
        />
      </Box>
    </Box>
  );
}

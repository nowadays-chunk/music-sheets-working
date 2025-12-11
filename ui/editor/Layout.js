// ui/editor/Layout.jsx
import React from "react";
import PalettePanel from "./PalettePanel";
import ScoreCanvas from "./ScoreCanvas";
import InspectorPanel from "./InspectorPanel";
import MusicApp from "@/components/Containers/MusicApp";

export default function Layout() {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "auto",
        minHeight: "100vh",
        overflow: "visible",
      }}
    >
      <PalettePanel />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "auto",
          overflow: "visible",
        }}
      >
        {/* FRETBOARD & CONTROLS */}
        <MusicApp
          board="compose"
          showFretboardControls={false}
          showCircleOfFifths={false}
          showFretboard={true}
          showChordComposer={false}
          showProgressor={false}
          showSongsSelector={false}
        />

        {/* SCORE + TAB TOGGLE + SVG */}
        <ScoreCanvas />
      </div>

      <InspectorPanel />
    </div>
  );
}

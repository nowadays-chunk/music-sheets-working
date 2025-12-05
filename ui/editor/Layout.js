// ui/editor/Layout.jsx
import React from "react";
import PalettePanel from "./PalettePanel";
import ScoreCanvas from "./ScoreCanvas";
import InspectorPanel from "./InspectorPanel";

export default function Layout() {
  return (
    <div style={{ display: "flex", height: "calc(100vh - 100px)" }}>
      <PalettePanel />
      <div style={{ flex: 1, overflow: "auto" }}>
        <ScoreCanvas />
      </div>
      <InspectorPanel />
    </div>
  );
}

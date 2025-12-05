// ui/app/AppShell.jsx
import React from "react";
import { ScoreProvider } from "@/core/editor/ScoreContext";
import MenuBar from "@/ui/editor/MenuBar";
import Toolbar from "@/ui/editor/Toolbar";
import TransportBar from "@/ui/editor/TransportBar";
import Layout from "@/ui/editor/Layout";
import KeyboardShortcutsOverlay from "@/ui/editor/KeyboardShortcutsOverlay";
import MusicApp from "@/components/Containers/MusicApp";

export default function AppShell() {
  return (
    <ScoreProvider>
      <MusicApp
        board="compose"
        showFretboardControls={false}
        showCircleOfFifths={false}
        showFretboard={true}
        showChordComposer={false}
        showProgressor={false}
        showSongsSelector={false} />
      <MenuBar />
      <Toolbar />
      <TransportBar />
      <Layout />
      <KeyboardShortcutsOverlay />
    </ScoreProvider>
  );
}

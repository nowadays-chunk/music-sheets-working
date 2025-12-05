// ui/editor/KeyboardShortcutsOverlay.jsx
import React, { useEffect, useState } from "react";

export default function KeyboardShortcutsOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.shiftKey && e.key === "?") setOpen(true);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        color: "white",
        padding: 40,
        zIndex: 2000,
      }}
      onClick={() => setOpen(false)}
    >
      <h2>Keyboard Shortcuts</h2>
      <p>A–G → Insert notes</p>
      <p>1,2,4,8 → Durations</p>
      <p>Ctrl+Z / Ctrl+Y → Undo/Redo</p>
      <p>Space → Play/Pause</p>
    </div>
  );
}

// ScoreRenderer.jsx
import React, { useEffect, useRef } from "react";
import {
  Renderer,
  Stave,
  StaveNote,
  Formatter,
  Voice,
} from "vexflow";

export default function ScoreRenderer({ notes }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    const context = renderer.getContext();
    renderer.resize(800, 160);

    const stave = new Stave(10, 20, 760);
    stave.addClef("treble").addTimeSignature("4/4");
    stave.setContext(context).draw();

    if (!notes || notes.length === 0) return;

    const vexNotes = notes.map((n) => {
      const pitch = convertStringFretToPitch(n.string, n.fret);

      return new StaveNote({
        clef: "treble",
        keys: [pitch],
        duration: "q",
      });
    });

    if (vexNotes.length === 0) return;

    const voice = new Voice({
      num_beats: vexNotes.length,
      beat_value: 4,
    }).addTickables(vexNotes);

    new Formatter().joinVoices([voice]).format([voice], 700);
    voice.draw(context, stave);
  }, [notes]);

  return <div ref={containerRef} style={{ marginBottom: 20 }} />;
}

function convertStringFretToPitch(stringIndex, fret) {
  const tuning = ["E4", "B3", "G3", "D3", "A2", "E2"];
  const baseNote = tuning[stringIndex] || "E4";
  const midi = noteNameToMidi(baseNote) + fret;
  return midiToNoteName(midi);
}

function noteNameToMidi(note) {
  const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const match = /^([A-G]#?)(\d)$/.exec(note);
  if (!match) return 60;
  const [, pitch, octave] = match;
  return NOTES.indexOf(pitch) + (parseInt(octave) + 1) * 12;
}

function midiToNoteName(midi) {
  const NOTES = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];
  const pitch = NOTES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${pitch}/${octave}`;
}

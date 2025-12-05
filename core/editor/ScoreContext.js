import React, { createContext, useContext, useEffect, useRef, useState } from "react";

import Score from "@/core/music/score/Score";
import Note from "@/core/music/score/Note";
import Duration from "@/core/music/score/Duration";
import Pitch from "@/core/music/score/Pitch";

import UndoManager from "./UndoManager";
import SelectionManager from "./SelectionManager";
import NoteInputManager from "./NoteInputManager";
import TimeSignature from "../music/score/TimeSignature";
import KeySignature from "../music/score/KeySignature";
import Clef from "../music/score/Clef";
import PlaybackEngine from "../music/playback/PlaybackEngine";

export const ScoreContext = createContext(null);

export function ScoreProvider({ children }) {
  const [score, setScore] = useState(null);
  const [cursorBeat, setCursorBeat] = useState(0);

  const undo = useRef(new UndoManager());
  const selection = useRef(new SelectionManager());
  const input = useRef(new NoteInputManager());

  const playback = useRef(null);

  useEffect(() => {
    if (!score) {
      const s = new Score({
        title: "Untitled",
        composer: "Anonymous",
        timeSignature: new TimeSignature(4,4),
        keySignature: new KeySignature("C"),
        clef: new Clef("treble")
      });

      s.addMeasure();   // <--- VERY important
      setScore(s);
    }
  }, []);

  const initAudio = async () => {
    if (typeof window === "undefined") return;
    if (playback.current) return;

    playback.current = new PlaybackEngine();
  };

  useEffect(() => {
    window.addEventListener("click", initAudio, { once: true });
    return () => window.removeEventListener("click", initAudio);
  }, []);

  // // Initialize score + audio only on client
  // useEffect(() => {
  //   if (!score) {
  //     setScore(new Score());
  //   }
  //   if (typeof window !== "undefined" && !playback.current) {
  //     playback.current = new PlaybackEngine();
  //   }
  // }, []);

  const updateScore = (mutator) => {
    if (!score) return;

    undo.current.snapshot(score);

    setScore(prev => {
      const next = prev.clone();
      mutator(next);
      return next;
    });
  };

  // Called when clicking a fretboard note
  const addNoteFromFretboard = (fbNote) => {
    if (!score) return;

    const pitchClass = fbNote.noteName[0].toUpperCase();
    const alter = fbNote.noteName.includes("#") ? 1 : 0;

    const pitch = new Pitch(
      pitchClass,
      alter,
      fbNote.octave ?? 4
    );

    const duration = new Duration("q");
    const note = new Note(pitch, duration);

    note.fret = fbNote.fret;
    note.string = fbNote.string;
    note.velocity = fbNote.velocity ?? 0.8;
    note.midi = fbNote.midi;

    updateScore(d => {
      d.addNote(cursorBeat, note);
    });

    setCursorBeat(c => c + 1);
  };

  return (
    <ScoreContext.Provider
      value={{
        score,
        updateScore,
        cursorBeat,
        setCursorBeat,
        undo: undo.current,
        selection: selection.current,
        input: input.current,
        playback: playback.current,
        addNoteFromFretboard,
      }}
    >
      {children}
    </ScoreContext.Provider>
  );
}

export const useScore = () => useContext(ScoreContext);

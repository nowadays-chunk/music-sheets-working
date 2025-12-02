import { useEffect, useRef, useState } from "react";
import Soundfont from "soundfont-player";

export default function useMidiEngine({
  bpm = 120,
  onTick,
  loopStartBeat,
  loopEndBeat
}) {
  const audioCtxRef = useRef(null);
  const instrumentRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [cursorBeat, setCursorBeat] = useState(0);

  const nextNoteTimeRef = useRef(0);
  const currentBeatRef = useRef(0);
  const schedulerRef = useRef(null);

  const secondsPerBeat = 60 / bpm;

  const init = async () => {
    if (!audioCtxRef.current)
      audioCtxRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();

    // CORRECTED VERSION
    if (!instrumentRef.current) {
      instrumentRef.current = await Soundfont.instrument(
        audioCtxRef.current,
        "acoustic_guitar_nylon"
      );
    }
  };

  const playNote = async (note, scheduledTime) => {
    if (!instrumentRef.current) return;

    instrumentRef.current.play(note.midi, scheduledTime, {
      gain: note.velocity ?? 0.8,
      duration: (note.duration || 1) * secondsPerBeat,
    });
  };

  const scheduler = (notes) => {
    while (
      nextNoteTimeRef.current <
      audioCtxRef.current.currentTime + 0.1
    ) {
      const beat = currentBeatRef.current;

      if (onTick) onTick(beat);

      notes
        .filter((n) => n.time === beat)
        .forEach((n) => playNote(n, nextNoteTimeRef.current));

      nextNoteTimeRef.current += secondsPerBeat;
      currentBeatRef.current += 1;

      // LOOP LOGIC
      if (
        loopStartBeat !== null &&
        loopEndBeat !== null &&
        currentBeatRef.current >= loopEndBeat
      ) {
        currentBeatRef.current = loopStartBeat;
        nextNoteTimeRef.current =
          audioCtxRef.current.currentTime + 0.05;
      }
    }

    schedulerRef.current = requestAnimationFrame(() =>
      scheduler(notes)
    );
  };

  const start = async (notes) => {
    if (!notes.length) return;

    await init();

    setIsPlaying(true);
    setCursorBeat(0);

    currentBeatRef.current = loopStartBeat ?? 0;
    nextNoteTimeRef.current =
      audioCtxRef.current.currentTime + 0.1;

    scheduler(notes);
  };

  const stop = () => {
    setIsPlaying(false);
    cancelAnimationFrame(schedulerRef.current);
    currentBeatRef.current = 0;
    nextNoteTimeRef.current = 0;
    setCursorBeat(0);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(schedulerRef.current);
  }, []);

  return { start, stop, isPlaying, cursorBeat };
}

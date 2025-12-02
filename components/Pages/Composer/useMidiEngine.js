// useMidiEngine.js
import { useEffect, useRef, useState } from "react";
import Soundfont from "soundfont-player";

export default function useMidiEngine({
  bpm = 120,
  volume = 0.8,
  enableMetronome = false,
  loopStartBeat = 0,
  loopEndBeat = 16,
}) {
  const audioCtxRef = useRef(null);
  const instrumentRef = useRef(null);
  const clickRef = useRef(null);

  const masterGainRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cursor, setCursor] = useState(0);

  const nextNoteTimeRef = useRef(0);
  const currentBeatRef = useRef(0);
  const schedulerRef = useRef(null);

  const secondsPerBeat = 60 / bpm;

  const init = async () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (!masterGainRef.current) {
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.value = volume;
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }

    if (!instrumentRef.current) {
      instrumentRef.current = await Soundfont.instrument(
        audioCtxRef.current,
        "acoustic_guitar_nylon",
        { destination: masterGainRef.current }
      );
    }

    if (!clickRef.current) {
      clickRef.current = (time) => {
        if (!enableMetronome) return;
        const osc = audioCtxRef.current.createOscillator();
        const g = audioCtxRef.current.createGain();
        osc.frequency.value = 1200;
        g.gain.value = 0.6;

        osc.connect(g);
        g.connect(masterGainRef.current);

        osc.start(time);
        osc.stop(time + 0.03);
      };
    }
  };

  const playNote = async (noteObj) => {
    await init();
    if (!instrumentRef.current) return;
    if (!noteObj.midi) return;

    instrumentRef.current.play(noteObj.midi, 0, {
      gain: noteObj.velocity ?? 0.8,
      duration: 1,
    });
  };

  const scheduler = (notes) => {
    const ctx = audioCtxRef.current;
    while (nextNoteTimeRef.current < ctx.currentTime + 0.1) {
      const beat = currentBeatRef.current;

      clickRef.current?.(nextNoteTimeRef.current);

      const notesOnBeat = notes.filter((n) => n.time === beat);
      notesOnBeat.forEach((n) =>
        instrumentRef.current.play(n.midi, nextNoteTimeRef.current, {
          gain: n.velocity ?? 0.8,
          duration: n.duration,
        })
      );

      setCursor(beat);

      nextNoteTimeRef.current += secondsPerBeat;
      currentBeatRef.current += 1;

      if (currentBeatRef.current >= loopEndBeat) {
        currentBeatRef.current = loopStartBeat;
        nextNoteTimeRef.current = ctx.currentTime + 0.05;
      }
    }

    schedulerRef.current = requestAnimationFrame(() => scheduler(notes));
  };

  const start = async (notesRef) => {
    await init();

    setIsPlaying(true);
    const ctx = audioCtxRef.current;

    currentBeatRef.current = loopStartBeat;
    nextNoteTimeRef.current = ctx.currentTime + 0.1;

    scheduler(notesRef.current);
  };

  const stop = () => {
    setIsPlaying(false);

    cancelAnimationFrame(schedulerRef.current);
    currentBeatRef.current = 0;
    nextNoteTimeRef.current = 0;
    setCursor(0);
  };

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = volume;
    }
  }, [volume]);

  return {
    playNote,
    start,
    stop,
    isPlaying,
    cursor,
  };
}

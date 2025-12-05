// core/music/import/MidiImport.js
import { Score, Measure, Voice, Note, Duration, Pitch } from "@/core/music/score";
import { parseMidi } from "midi-file";

export default class MidiImport {
  static parse(midiBuffer) {
    const midi = parseMidi(new Uint8Array(midiBuffer));

    const score = new Score();
    score.measures = [new Measure({ index: 0 })];

    let voice = new Voice(0);
    let timeCursor = 0;

    midi.tracks[0].forEach((event) => {
      timeCursor += event.deltaTime;

      if (event.type === "noteOn" && event.velocity > 0) {
        const midiNote = event.noteNumber;

        const pitch = MidiImport.midiToPitch(midiNote);

        voice.addNote(
          new Note({
            pitch,
            duration: new Duration(1), // Default, quantization pending
          })
        );
      }
    });

    score.measures[0].voices = [voice];
    return score;
  }

  static midiToPitch(midi) {
    const steps = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const step = steps[midi % 12];
    const octave = Math.floor(midi / 12) - 1;

    let accidental = 0;
    const base = step[0];
    if (step.includes("#")) accidental = 1;
    if (step.includes("b")) accidental = -1;

    return new Pitch(base, accidental, octave);
  }
}

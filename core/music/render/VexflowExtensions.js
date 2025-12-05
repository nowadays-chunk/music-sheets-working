// core/music/render/VexflowExtensions.js
import Vex from "vexflow";

export const VF = Vex.Flow;

export function createStave({ x = 20, y = 40, width = 600, clef = "treble", timeSignature, keySignature }) {
  const stave = new VF.Stave(x, y, width);

  if (clef) stave.addClef(clef);
  if (timeSignature) stave.addTimeSignature(timeSignature.toString());
  if (keySignature) stave.addKeySignature(keySignature.key);

  return stave;
}

export function pitchToVexKey(pitch) {
  // { step: "C", accidental: 1, octave: 4 } => "c#/4"
  const steps = {
    C: "c",
    D: "d",
    E: "e",
    F: "f",
    G: "g",
    A: "a",
    B: "b",
  };

  const accidental =
    pitch.accidental === 1
      ? "#"
      : pitch.accidental === -1
      ? "b"
      : pitch.accidental > 1
      ? "##"
      : pitch.accidental < -1
      ? "bb"
      : "";

  return `${steps[pitch.step]}${accidental}/${pitch.octave}`;
}

export function durationToVex(duration) {
  // 1 = quarter → "q"
  const map = {
    1: "q",
    0.5: "8",
    0.25: "16",
    2: "h",
    4: "w",
  };

  const base = map[duration.value] || "q";
  return base + (duration.dots > 0 ? "d".repeat(duration.dots) : "");
}

export function createVexNote(note) {
  const keys = [pitchToVexKey(note.pitch)];
  const dur = durationToVex(note.duration);

  const vfNote = new VF.StaveNote({
    keys,
    duration: dur,
  });

  // accidentals
  if (note.pitch.accidental === 1) vfNote.addAccidental(0, new VF.Accidental("#"));
  if (note.pitch.accidental === -1) vfNote.addAccidental(0, new VF.Accidental("b"));
  if (note.pitch.accidental === 2) vfNote.addAccidental(0, new VF.Accidental("##"));
  if (note.pitch.accidental === -2) vfNote.addAccidental(0, new VF.Accidental("bb"));

  // articulations
  note.articulations?.forEach((a) => {
    if (a === "staccato") vfNote.addArticulation(0, new VF.Articulation("a.").setPosition(3));
    if (a === "accent") vfNote.addArticulation(0, new VF.Articulation("a>").setPosition(3));
    if (a === "tenuto") vfNote.addArticulation(0, new VF.Articulation("a-").setPosition(3));
  });

  return vfNote;
}

export function createVexRest(rest) {
  const dur = durationToVex(rest.duration);
  return new VF.StaveNote({
    keys: ["b/4"],
    duration: `${dur}r`,
  });
}

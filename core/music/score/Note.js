// core/music/score/Note.js
import Pitch from "./Pitch";
import Duration from "./Duration";

export default class Note {
  constructor(pitch, duration) {
    this.pitch = pitch;
    this.duration = duration instanceof Duration ? duration : new Duration("q");
    this.isRest = false;
  }

  static fromFretboard(f) {
    // f = { string, fret, midi or noteName, octave }
    console.log("note selected ", f)
    // If MIDI is available, use it
    let pitch;
    if (f.midi != null) {
      pitch = Pitch.fromMidi(f.midi);
    } else {
      // fallback: string + fret → pitchClass + octave
      pitch = Pitch.fromStringFret(f.string, f.fret);
    }

    return new Note({
      pitch,
      duration: new Duration("q"),
      string: f.string + 1, // VexFlow TAB uses 1–6
      fret: f.fret
    });
  }

  serialize() {
    return {
      pitch: this.pitch ? this.pitch.serialize() : null,
      duration: this.duration.serialize(),
      isRest: this.isRest ?? false,
      string: this.string,
      fret: this.fret,
      midi: this.midi
    };
  }

  static deserialize(json) {
    const pitch = json.pitch ? Pitch.deserialize(json.pitch) : null;
    const duration = Duration.deserialize(json.duration);

    const n = new Note(pitch, duration);

    n.isRest = json.isRest ?? false;
    n.string = json.string;
    n.fret = json.fret;
    n.midi = json.midi;

    return n;
  }

  clone() {
    return new Note(this.pitch.clone(), this.duration.clone());
  }
}

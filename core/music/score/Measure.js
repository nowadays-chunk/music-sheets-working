// core/music/score/Measure.js
import Voice from "./Voice";
import TimeSignature from "./TimeSignature";
import KeySignature from "./KeySignature";
import Clef from "./Clef";

export default class Measure {
  constructor(index = 0, timeSignature = new TimeSignature()) {
    this.index = index;
    this.timeSignature = timeSignature;
    this.keySignature = new KeySignature("C");
    this.clef = new Clef("treble");
    this.voices = [];
  }

  addVoice() {
    const v = new Voice();
    this.voices.push(v);
    return v;
  }

  serialize() {
    return {
      index: this.index,
      timeSignature: this.timeSignature.serialize(),
      keySignature: this.keySignature.serialize(),
      clef: this.clef.serialize(),
      voices: this.voices.map((v) => v.serialize()),
    };
  }

  static deserialize(json) {
    const m = new Measure(json.index);

    m.timeSignature = TimeSignature.deserialize(json.timeSignature);
    m.keySignature = KeySignature.deserialize(json.keySignature);
    m.clef = Clef.deserialize(json.clef);
    m.voices = (json.voices || []).map((v) => Voice.deserialize(v));

    return m;
  }

  clone() {
    const m = new Measure(this.index, this.timeSignature.clone());
    m.keySignature = this.keySignature.clone();
    m.clef = this.clef.clone();
    m.voices = this.voices.map((v) => v.clone());
    return m;
  }
}

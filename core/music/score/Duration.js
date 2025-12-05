// core/music/score/Duration.js

export default class Duration {
  /** symbol = "w" | "h" | "q" | "8" | "16" */
  constructor(symbol = "q") {
    this.symbol = symbol;
    this.total = Duration.toBeats(symbol); // required for playback
  }

  static toBeats(symbol) {
    switch (symbol) {
      case "w": return 4;
      case "h": return 2;
      case "q": return 1;
      case "8": return 0.5;
      case "16": return 0.25;
      default: return 1;
    }
  }

  toVexflow() {
    return this.symbol;
  }

  clone() {
    return new Duration(this.symbol);
  }

  serialize() {
    return { symbol: this.symbol };
  }

  // -----------------------------
  // SAFE DESERIALIZATION FIX
  // -----------------------------
  static deserialize(d) {
    if (!d || typeof d !== "object") {
      // fallback to quarter note
      return new Duration("q");
    }
    return new Duration(d.symbol);
  }
}

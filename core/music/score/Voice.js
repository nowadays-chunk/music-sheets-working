// core/music/score/Voice.js
import Note from "./Note.js";
import Rest from "./Rest.js";

export default class Voice {
  constructor(index = 0) {
    this.index = index;
    this.elements = []; // notes + rests
  }

  addNote(note) {
    this.elements.push(note);
  }

  addRest(rest) {
    this.elements.push(rest);
  }

  removeAt(index) {
    this.elements.splice(index, 1);
  }

  serialize() {
    return {
      elements: this.elements.map((e) => {
        if (e && typeof e.serialize === "function") {
          // Already a class instance
          return {
            type: e.constructor.name.toLowerCase(), // "note" or "rest"
            data: e.serialize(),
          };
        }

        // If e is already plain JSON from undo/deserialize
        return {
          type: e.type || "note",
          data: e.data || e,
        };
      }),
    };
  }

  static deserialize(json) {
    const voice = new Voice();

    voice.elements = (json.elements || []).map((e) => {
      if (!e) return null;

      if (e.type === "note") {
        return Note.deserialize(e.data);
      }

      if (e.type === "rest") {
        return Rest.deserialize(e.data);
      }

      // fallback
      return null;
    });

    return voice;
  }

}

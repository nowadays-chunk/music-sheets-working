// core/editor/NoteInputManager.js
import Duration from "@/core/music/score/Duration";

export default class NoteInputManager {
  constructor() {
    this.activeDuration = new Duration(1);
    this.override = false; // overwrite mode
  }

  setDuration(q) {
    this.activeDuration = new Duration(q);
  }
}

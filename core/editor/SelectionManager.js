// core/editor/SelectionManager.js
export default class SelectionManager {
  constructor() {
    this.selected = null; // Note, Rest, Measure
  }

  select(obj) {
    this.selected = obj;
  }

  clear() {
    this.selected = null;
  }
}

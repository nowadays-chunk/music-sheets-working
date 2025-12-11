// core/music/render/TabRenderer.js
import Vex from "vexflow";
const VF = Vex;

export default class TabRenderer {
  constructor({ container, score }) {
    this.container = container;
    this.score = score;
  }

  destroy() {
    if (this.container) this.container.innerHTML = "";
  }

  render() {
    if (!this.container || !this.score) return;
    this.destroy();

    // Big enough SVG for multi-line layout
    const renderer = new VF.Renderer(this.container, VF.Renderer.Backends.SVG);
    renderer.resize(900, 1200);
    const ctx = renderer.getContext();

    // ---- Layout constants ----
    const MEASURES_PER_LINE = 4;
    const MEASURE_WIDTH = 200;
    const SYSTEM_HEIGHT = 100;
    const START_X = 20;

    let x = START_X;
    let y = 40;

    const measures = this.score.measures || [];

    measures.forEach((measure, index) => {
      const isFirstInLine = index % MEASURES_PER_LINE === 0;

      // New line?
      if (isFirstInLine && index !== 0) {
        x = START_X;
        y += SYSTEM_HEIGHT;  
      }

      // -------------------------------
      // CREATE TAB STAVE FOR THIS MEASURE
      // -------------------------------
      const stave = new VF.TabStave(x, y, MEASURE_WIDTH);

      if (index === 0) {
        stave.addClef("tab");
      }

      stave.setContext(ctx).draw();

      // -------------------------------
      // BUILD TICKABLES FOR THIS MEASURE
      // -------------------------------
      const notes = [];

      for (const voice of measure.voices) {
        if (!voice.elements) continue;

        for (const entry of voice.elements) {
          const n = entry.note ?? entry.element ?? entry;
          if (!n) continue;

          const duration = n.duration?.symbol || "q";

          const stringNumber = n.string || 1;
          const fretNumber = n.fret || 0;

          const tabNote = new VF.TabNote({
            positions: [{ str: stringNumber, fret: fretNumber }],
            duration,
          });

          notes.push(tabNote);
        }
      }

      if (notes.length === 0) {
        x += MEASURE_WIDTH;
        return;
      }

      // -------------------------------
      // Build the VexFlow voice *for this measure only*
      // -------------------------------
      const vfVoice = new VF.Voice({
        num_beats: measure.timeSignature?.beats || 4,
        beat_value: measure.timeSignature?.beatValue || 4,
      });

      vfVoice.setMode(VF.Voice.Mode.SOFT);  // allow incomplete measures
      vfVoice.addTickables(notes);

      // Format inside the measure width
      new VF.Formatter()
        .joinVoices([vfVoice])
        .format([vfVoice], MEASURE_WIDTH - 20);

      vfVoice.draw(ctx, stave);

      // Advance X
      x += MEASURE_WIDTH;
    });
  }
}

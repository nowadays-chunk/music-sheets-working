import {
  Renderer,
  TabStave,
  TabNote,
  Voice,
  Formatter
} from "vexflow";

export default class TabRenderer {
  constructor({ container, score, layout = {} }) {
    this.container = container;
    this.score = score;
    this.layout = layout;
  }

  render() {
    const container = this.container;
    const score = this.score;

    if (!container || !score) return;

    container.innerHTML = "";

    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(800, 180);
    const ctx = renderer.getContext();

    const stave = new TabStave(10, 30, 780);
    stave.addTabGlyph();
    stave.setContext(ctx).draw();

    const notes = [];

    // Extract notes from Score model
    for (const m of score.measures) {
      for (const v of m.voices) {
        v.elements.forEach((entry) => {
          const el = entry.element || entry;
          if (!el) return;

          let { string, fret } = el;

          // Fallback: compute from pitch
          if ((string == null || fret == null) && el.pitch) {
            const tuning = [64, 59, 55, 50, 45, 40]; // E4, B3, G3, D3, A2, E2
            const midi = el.pitch.toMidi();
            string = 1; // high E
            fret = Math.max(0, midi - tuning[0]);
          }

          string = string ?? 1;
          fret = fret ?? 0;

          const duration = el.duration?.symbol ?? "q";

          // VexFlow 4 TAB note syntax
          const tabNote = new TabNote({
            positions: [{ str: string, fret }],
            duration
          });

          notes.push(tabNote);
        });
      }
    }

    const voice = new Voice({
      time: score.timeSignature?.toString() || "4/4",
    }).setMode(Voice.Mode.SOFT);

    if (notes.length > 0) {
      voice.addTickables(notes);

      new Formatter().joinVoices([voice]).format([voice], 700);

      notes.forEach((n) => {
        n.setStave(stave);
        n.setContext(ctx);
        n.draw();
      });
    }
  }
}

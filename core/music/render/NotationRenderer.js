import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter
} from "vexflow";

export default class NotationRenderer {
  constructor({ container, score, layout = {} }) {
    this.container = container;
    this.score = score;
    this.layout = layout;
  }

  render() {
    if (!this.container || !this.score) return;

    const score = this.score;

    // Reset container
    this.container.innerHTML = "";

    const renderer = new Renderer(this.container, Renderer.Backends.SVG);
    renderer.resize(800, 200);
    const context = renderer.getContext();

    const stave = new Stave(10, 40, 780);
    stave.addClef("treble");
    stave.addTimeSignature(score.timeSignature.toString());
    stave.setContext(context).draw();

    const vfNotes = [];

    // Extract from Score model
    for (const measure of score.measures) {
      for (const voice of measure.voices) {
        for (const entry of voice.elements) {
          const el = entry.element || entry.data || entry;

          if (!el) continue;

          // Rest
          if (el.isRest) {
            const dur = el.duration?.toVexflow?.() ?? "qr";

            vfNotes.push(
              new StaveNote({
                clef: "treble",
                keys: ["b/4"],
                duration: dur
              })
            );

            continue;
          }

          // Note, must have pitch
          if (!el.pitch) continue;

          const key = `${el.pitch.step.toLowerCase()}${
            el.pitch.alter === 1 ? "#" : ""
          }/${el.pitch.octave}`;

          const duration = el.duration?.toVexflow?.() ?? "q";

          vfNotes.push(
            new StaveNote({
              clef: "treble",
              keys: [key],
              duration
            })
          );
        }
      }
    }

    // Cannot create a voice if no notes → skip
    if (vfNotes.length === 0) return;

    const voice = new Voice({
      num_beats: vfNotes.length,
      beat_value: 4,
    });

    voice.addTickables(vfNotes);

    new Formatter().joinVoices([voice]).format([voice], 700);

    voice.draw(context, stave);
  }
}

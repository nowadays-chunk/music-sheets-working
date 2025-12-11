// core/music/render/NotationRenderer.js
import Vex from "vexflow";
const VF = Vex;

export default class NotationRenderer {
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

    const renderer = new VF.Renderer(this.container, VF.Renderer.Backends.SVG);
    renderer.resize(900, 1200); // enough height for multiple systems
    const ctx = renderer.getContext();

    // ---- LAYOUT CONSTANTS ----
    const MEASURES_PER_LINE = 4;
    const MEASURE_WIDTH = 200;
    const START_X = 20;

    let x = START_X;
    let y = 40;
    const SYSTEM_HEIGHT = 120;

    const measures = this.score.measures || [];

    measures.forEach((measure, index) => {
      const isFirstInLine = index % MEASURES_PER_LINE === 0;

      // Start new system?
      if (isFirstInLine && index !== 0) {
        x = START_X;
        y += SYSTEM_HEIGHT;
      }

      // -------------------------------
      // CREATE STAVE FOR THIS MEASURE
      // -------------------------------
      const stave = new VF.Stave(x, y, MEASURE_WIDTH);

      if (index === 0) {
        stave.addClef(this.score.clef?.name || "treble");
        stave.addTimeSignature(this.score.timeSignature.toString());
        stave.addKeySignature(this.score.keySignature.key);
      }

      stave.setContext(ctx).draw();

      // -------------------------------
      // BUILD VOICES FOR THIS MEASURE
      // -------------------------------
      const vfVoices = [];

      for (const voice of measure.voices) {
        if (!voice.elements || voice.elements.length === 0) continue;

        const tickables = [];

        for (const entry of voice.elements) {
          const n = entry.note ?? entry.element ?? entry;
          if (!n) continue;

          let vexNote;
          const dur = n.duration?.symbol || "q";

          if (n.isRest) {
            vexNote = new VF.StaveNote({
              keys: ["b/4"],
              duration: dur + "r",
            });
          } else {
            const key = `${n.pitch.step.toLowerCase()}${n.pitch.alter === 1 ? "#" : n.pitch.alter === -1 ? "b" : ""}/${n.pitch.octave}`;
            vexNote = new VF.StaveNote({
              keys: [key],
              duration: dur,
            });
          }

          tickables.push(vexNote);
        }

        if (tickables.length === 0) continue;

        const vfVoice = new VF.Voice({
          num_beats: measure.timeSignature.beats,
          beat_value: measure.timeSignature.beatValue,
        });

        vfVoice.setMode(VF.Voice.Mode.SOFT); // allow incomplete measures
        vfVoice.addTickables(tickables);

        vfVoices.push(vfVoice);
      }

      // Nothing to draw for this measure?
      if (vfVoices.length === 0) {
        x += MEASURE_WIDTH;
        return;
      }

      // Format & Draw voices only within THIS measure box
      const formatter = new VF.Formatter();
      formatter.joinVoices(vfVoices);
      formatter.format(vfVoices, MEASURE_WIDTH - 20);

      vfVoices.forEach(v => v.draw(ctx, stave));

      x += MEASURE_WIDTH;
    });
  }
}

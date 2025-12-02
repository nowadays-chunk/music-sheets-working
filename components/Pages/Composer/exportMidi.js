import { writeMidi } from "midi-file";

export function exportMidi(timelineNotes) {
  const header = {
    format: 0,
    numTracks: 1,
    ticksPerBeat: 480
  };

  const track = [];
  let lastTick = 0;

  timelineNotes.forEach((note) => {
    const startTick = note.time * 480;
    const endTick = (note.time + note.duration) * 480;

    track.push({
      deltaTime: startTick - lastTick,
      type: "noteOn",
      noteNumber: note.midi,
      velocity: Math.floor((note.velocity ?? 0.8) * 127)
    });

    track.push({
      deltaTime: endTick - startTick,
      type: "noteOff",
      noteNumber: note.midi,
      velocity: 0
    });

    lastTick = endTick;
  });

  const midiData = writeMidi({ header, tracks: [track] });

  const blob = new Blob([midiData], { type: "audio/midi" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "composition.mid";
  a.click();
}

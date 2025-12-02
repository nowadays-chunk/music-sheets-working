import React, { useState, useRef, useEffect } from "react";
import { styled } from "@mui/system";

const NUM_STRINGS = 6;
const STRING_HEIGHT = 40;
const BEAT_WIDTH = 50;
const NOTE_HEIGHT = 28;

const TimelineWrapper = styled("div")({
  width: "100%",
  overflowX: "auto",
  overflowY: "hidden",
  border: "1px solid #ccc",
  background: "#fff",
  position: "relative",
  height: STRING_HEIGHT * NUM_STRINGS + 60,
});

const StringLine = styled("div")({
  position: "absolute",
  left: 0,
  right: 0,
  height: STRING_HEIGHT,
  borderBottom: "1px solid #ddd",
  display: "flex",
  alignItems: "center",
  paddingLeft: 10,
  fontSize: 12,
  color: "#666",
  zIndex: 1
});

const NoteBlock = styled("div")(({ selected }) => ({
  position: "absolute",
  height: NOTE_HEIGHT,
  minWidth: BEAT_WIDTH,
  background: selected ? "#0057ff" : "#222",
  color: "#fff",
  fontWeight: "bold",
  fontSize: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 4,
  cursor: "pointer",
  userSelect: "none",
  zIndex: 5
}));

const BeatGridLine = styled("div")({
  position: "absolute",
  top: 0,
  bottom: 0,
  width: 1,
  background: "#eee",
  zIndex: 0
});

const CursorLine = styled("div")({
  position: "absolute",
  top: 0,
  bottom: 0,
  width: 2,
  background: "red",
  pointerEvents: "none",
  zIndex: 10
});

const TimelineComposer = ({
  incomingNote,
  onPlayNote,
  onNotesChange,
  externalCursorBeat,
  loopStartBeat,
  loopEndBeat,
  onLoopChange
}) => {
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  const timelineRef = useRef(null);

  // -----------------------------------
  // Add incoming notes from fretboard
  // -----------------------------------
  useEffect(() => {
    if (!incomingNote) return;

    const placedNote = {
      ...incomingNote,
      time: Math.max(...notes.map(n => n.time + n.duration), 0), // auto place after last note
      duration: 1
    };

    setNotes((prev) => [...prev, placedNote]);
  }, [incomingNote]);

  // External playback cursor
  useEffect(() => {
    if (!timelineRef.current) return;

    const scrollX =
      externalCursorBeat * BEAT_WIDTH - timelineRef.current.clientWidth / 2;

    timelineRef.current.scrollLeft = Math.max(0, scrollX);
  }, [externalCursorBeat]);

  useEffect(() => onNotesChange(notes), [notes]);

  // Delete note
  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Keyboard delete
  useEffect(() => {
    const k = (e) => {
      if (e.key === "Delete" && selectedNoteId) {
        deleteNote(selectedNoteId);
        setSelectedNoteId(null);
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [selectedNoteId]);

  // Drag note
  const handleDrag = (e, note) => {
    const startX = e.clientX;
    const startBeat = note.time;

    const move = (ev) => {
      const dx = ev.clientX - startX;
      const beatDelta = Math.round(dx / BEAT_WIDTH);

      setNotes((prev) =>
        prev.map((n) =>
          n.id === note.id ? { ...n, time: Math.max(0, startBeat + beatDelta) } : n
        )
      );
    };

    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  // Drag vertical (ALT)
  const handleStringDrag = (e, note) => {
    const startY = e.clientY;
    const startString = note.string;

    const move = (ev) => {
      const dy = ev.clientY - startY;
      const sDelta = Math.round(dy / STRING_HEIGHT);
      const newString = Math.min(5, Math.max(0, startString + sDelta));

      setNotes((prev) =>
        prev.map((n) =>
          n.id === note.id ? { ...n, string: newString } : n
        )
      );
    };

    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  // Resize note duration
  const handleResize = (e, note) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startDur = note.duration;

    const move = (ev) => {
      const dx = ev.clientX - startX;
      const durDelta = Math.round(dx / BEAT_WIDTH);
      const newDur = Math.max(1, startDur + durDelta);

      setNotes((prev) =>
        prev.map((n) =>
          n.id === note.id ? { ...n, duration: newDur } : n
        )
      );
    };

    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  // Drag loop handles
  const handleLoopHandleDrag = (e, type) => {
    const startX = e.clientX;

    const move = (ev) => {
      const dx = ev.clientX - startX;
      const beatDelta = Math.round(dx / BEAT_WIDTH);

      if (type === "start") {
        onLoopChange({
          start: Math.max(0, loopStartBeat + beatDelta),
          end: loopEndBeat
        });
      } else {
        onLoopChange({
          start: loopStartBeat,
          end: Math.max(loopStartBeat + 1, loopEndBeat + beatDelta)
        });
      }
    };

    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const maxBeat =
    notes.length === 0
      ? 32
      : Math.max(...notes.map((n) => n.time + n.duration)) + 8;

  return (
    <TimelineWrapper ref={timelineRef}>
      {Array.from({ length: maxBeat }).map((_, beat) => (
        <BeatGridLine key={beat} style={{ left: beat * BEAT_WIDTH }} />
      ))}

      {/* Loop region background */}
      {loopEndBeat > loopStartBeat && (
        <div
          style={{
            position: "absolute",
            top: 0,
            height: STRING_HEIGHT * NUM_STRINGS,
            left: loopStartBeat * BEAT_WIDTH,
            width: (loopEndBeat - loopStartBeat) * BEAT_WIDTH,
            background: "rgba(0,255,0,0.15)",
            pointerEvents: "none",
            zIndex: 0
          }}
        />
      )}

      {/* Loop handles */}
      <div
        onMouseDown={(e) => handleLoopHandleDrag(e, "start")}
        style={{
          position: "absolute",
          top: 0,
          left: loopStartBeat * BEAT_WIDTH - 4,
          width: 8,
          height: STRING_HEIGHT * NUM_STRINGS,
          background: "rgba(0,255,0,0.4)",
          cursor: "ew-resize",
          zIndex: 15
        }}
      />
      <div
        onMouseDown={(e) => handleLoopHandleDrag(e, "end")}
        style={{
          position: "absolute",
          top: 0,
          left: loopEndBeat * BEAT_WIDTH - 4,
          width: 8,
          height: STRING_HEIGHT * NUM_STRINGS,
          background: "rgba(0,255,0,0.4)",
          cursor: "ew-resize",
          zIndex: 15
        }}
      />

      {/* Playhead */}
      <CursorLine style={{ left: externalCursorBeat * BEAT_WIDTH }} />

      {Array.from({ length: NUM_STRINGS }).map((_, s) => (
        <StringLine
          key={s}
          style={{ top: s * STRING_HEIGHT }}
        >
          {["E", "B", "G", "D", "A", "E"][s]}
        </StringLine>
      ))}

      {notes.map((note) => (
        <NoteBlock
          key={note.id}
          selected={selectedNoteId === note.id}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedNoteId(note.id);
            onPlayNote(note);
          }}
          onDoubleClick={() => deleteNote(note.id)}
          onMouseDown={(e) => {
            if (e.altKey) handleStringDrag(e, note);
            else handleDrag(e, note);
          }}
          style={{
            top: note.string * STRING_HEIGHT + 6,
            left: note.time * BEAT_WIDTH + 2,
            width: note.duration * BEAT_WIDTH - 4
          }}
        >
          {note.fret}

          <div
            onMouseDown={(e) => handleResize(e, note)}
            style={{
              width: 8,
              height: "100%",
              position: "absolute",
              right: 0,
              top: 0,
              cursor: "ew-resize"
            }}
          />
        </NoteBlock>
      ))}
    </TimelineWrapper>
  );
};

export default TimelineComposer;

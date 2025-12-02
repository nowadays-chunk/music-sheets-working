// MusicApp.jsx
import { IconButton } from "@mui/material";
import { styled } from "@mui/system";
import { useEffect, useCallback, useState, useRef } from "react";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import FretboardControls from "../Pages/Fretboard/FretboardControls";
import CircleOfFifths from "../Pages/CircleOfFifths/CircleOfFifths";
import FretboardDisplay from "../Pages/Fretboard/FretboardDisplay";
import ChordComposer from "../Pages/Composer/ChordComposer";
import SongsSelector from "../Pages/LearnSongs/SongsSelector";

import TimelineComposer from "../Pages/Composer/TimelineComposer";
import ScoreRenderer from "../Pages/Composer/ScoreRenderer";

import withFretboardState from "../../hocs/withFretboardState";
import withChordProgression from "../../hocs/withChordProgression";

import { connect, useDispatch } from "react-redux";
import {
  addFretboard,
  updateStateProperty,
  setProgression,
  setProgressionKey,
} from "../../redux/actions";

import useMidiEngine from "../Pages/Composer/useMidiEngine";

import guitar from "../../config/guitar";
import Meta from "../Partials/Head";

const Root = styled("div")({
  display: "flex",
  flexDirection: "column",
  margin: "0 auto",
  width: "80%",
  "@media (min-width: 1024px)": {
    width: "65%",
  },
});

const FretboardContainer = styled("div")({
  width: "100%",
  marginTop: 20,
  marginBottom: 20,
});

const MusicApp = (props) => {
  const dispatch = useDispatch();

  const {
    boards,
    selectedFretboard,
    selectedFretboardIndex,
    handleFretboardSelect,
    handleChoiceChange,
    createNewBoardDisplay,
    cleanFretboard,
    onElementChange,
    onNoteClick,
    updateBoards,

    board,
    showFretboardControls,
    showCircleOfFifths,
    showChordComposer,
    showSongsSelector,
    showAddMoreFretboardsButton,
    showFretboard,

    keyIndex,
    scale,
    modeIndex,
    shape,
    quality,
    display,
  } = props;

  // ----------- MIDI ENGINE -----------
  const timelineNotesRef = useRef([]);
  const {
    playNote,
    start,
    stop,
    isPlaying,
    cursor,
  } = useMidiEngine({
    bpm: 110,
    volume: 1,
    enableMetronome: false,
    loopStartBeat: 0,
    loopEndBeat: 16,
  });

  // incoming note from fretboard
  const [incomingNote, setIncomingNote] = useState(null);

  const handleComposerNote = (noteObj) => {
    // noteObj = {string, fret, midi, id}
    setIncomingNote(noteObj);
    playNote(noteObj);
  };

  const finalNoteClick = board === "compose" ? handleComposerNote : onNoteClick;

  // ----------- BOARD UPDATE LOGIC (unchanged) -----------
  const updateBoardsCallback = useCallback(() => {
    if (!selectedFretboard?.id) return;

    if (!isNaN(keyIndex)) {
      dispatch(
        updateBoards(
          selectedFretboard.id,
          "keySettings." + display,
          keyIndex
        )
      );
    }

    if (!isNaN(modeIndex)) {
      dispatch(updateBoards(selectedFretboard.id, "keySettings.mode", modeIndex));
    }

    if (display === "scale") {
      dispatch(updateBoards(selectedFretboard.id, "generalSettings.choice", "scale"));
      dispatch(updateBoards(selectedFretboard.id, "scaleSettings.scale", scale));

      const sc = guitar.scales[scale];
      if (sc?.isModal) {
        dispatch(
          updateBoards(
            selectedFretboard.id,
            "modeSettings.mode",
            sc.modes[modeIndex]?.name
          )
        );
        if (shape) {
          dispatch(updateBoards(selectedFretboard.id, "modeSettings.shape", shape));
          dispatch(updateBoards(selectedFretboard.id, "scaleSettings.shape", shape));
        }
      } else if (shape) {
        dispatch(updateBoards(selectedFretboard.id, "scaleSettings.shape", shape));
      }
    }

    if (display === "arppegio") {
      dispatch(updateBoards(selectedFretboard.id, "generalSettings.choice", "arppegio"));
      dispatch(updateBoards(selectedFretboard.id, "arppegioSettings.arppegio", quality));
      if (shape) {
        dispatch(updateBoards(selectedFretboard.id, "arppegioSettings.shape", shape));
      }
    }

    if (display === "chord") {
      dispatch(updateBoards(selectedFretboard.id, "generalSettings.choice", "chord"));
      dispatch(updateBoards(selectedFretboard.id, "chordSettings.chord", quality));
      if (shape) {
        dispatch(updateBoards(selectedFretboard.id, "chordSettings.shape", shape));
      }
    }
  }, [
    dispatch,
    display,
    keyIndex,
    modeIndex,
    scale,
    shape,
    quality,
    selectedFretboard,
  ]);

  useEffect(() => updateBoardsCallback(), [updateBoardsCallback]);

  if (!selectedFretboard) return <div>Loading...</div>;

  return (
    <Root>
      <Meta title="Guitar Sheets" />

      {showAddMoreFretboardsButton && (
        <IconButton onClick={createNewBoardDisplay}>
          <AddCircleOutlineIcon />
        </IconButton>
      )}

      {showFretboard && (
        <FretboardContainer>
          <FretboardDisplay
            selectedFretboard={selectedFretboard}
            boards={boards}
            handleFretboardSelect={handleFretboardSelect}
            onElementChange={onElementChange}
            onNoteClick={finalNoteClick}
            visualizerModalIndex={selectedFretboard.modeSettings.mode}
          />
        </FretboardContainer>
      )}

      {board === "compose" && (
        <>
          <ScoreRenderer notes={timelineNotesRef.current} />

          <TimelineComposer
            incomingNote={incomingNote}
            onNotesChange={(arr) => (timelineNotesRef.current = arr)}
            externalCursorBeat={cursor}
            playNote={playNote}
          />

          <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
            <button onClick={() => start(timelineNotesRef)} disabled={isPlaying}>
              ▶ Play
            </button>
            <button onClick={stop} disabled={!isPlaying}>
              ■ Stop
            </button>
          </div>
        </>
      )}

      {showFretboardControls && (
        <FretboardControls
          handleChoiceChange={handleChoiceChange}
          onCleanFretboard={cleanFretboard}
          selectedKey={selectedFretboard.keySettings.key}
          selectedScale={selectedFretboard.scaleSettings.scale}
          selectedChord={selectedFretboard.chordSettings.chord}
          selectedShape={selectedFretboard.chordSettings.shape}
          selectedMode={selectedFretboard.modeSettings.mode}
          onElementChange={onElementChange}
          scaleModes={[]}
          arppegiosNames={Object.keys(guitar.arppegios)}
          choice={selectedFretboard.generalSettings.choice}
        />
      )}

      {showCircleOfFifths && (
        <CircleOfFifths
          tone={"C"}
          onElementChange={onElementChange}
          selectedFretboardIndex={selectedFretboardIndex}
          quality={"Major"}
        />
      )}

      {showChordComposer && (
        <ChordComposer
          onElementChange={onElementChange}
          selectedKey={selectedFretboard.keySettings.key}
          selectedArppegio={selectedFretboard.arppegioSettings.arppegio}
        />
      )}
    </Root>
  );
};

const mapStateToProps = (state, ownProps) => {
  const filteredBoards = state.fretboard.components.filter(
    (b) => b.generalSettings.page === ownProps.board
  );
  return {
    boards: filteredBoards,
  };
};

const mapDispatchToProps = {
  addFretboard,
  updateBoards: updateStateProperty,
  setProgression,
  setProgressionKey,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withFretboardState(withChordProgression(MusicApp)));

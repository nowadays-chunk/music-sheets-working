// MusicApp.jsx
import { IconButton } from "@mui/material";
import { styled } from "@mui/system";
import { useEffect, useCallback, useState, useRef } from "react";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useScore } from "@/core/editor/ScoreContext";

import FretboardControls from "../Pages/Fretboard/FretboardControls";
import CircleOfFifths from "../Pages/CircleOfFifths/CircleOfFifths";
import FretboardDisplay from "../Pages/Fretboard/FretboardDisplay";
import ChordComposer from "../Pages/Composer/ChordComposer";


import withFretboardState from "../../hocs/withFretboardState";

import { connect, useDispatch } from "react-redux";
import {
  addFretboard,
  updateStateProperty,
  setProgression,
  setProgressionKey,
} from "../../redux/actions";


import guitar from "../../config/guitar";
import Meta from "../Partials/Head";
import Stats from "../Pages/Stats/Stats"

const Root = styled("div")({
  display: "flex",
  flexDirection: "column",
  margin: "0 auto",
  width: "80%",
  "@media (min-width: 1024px)": {
    width: "65%",
  },
});

const FretboardContainer = styled('div')({
  width: '100%',
  marginTop: '20px',
  marginBottom: '20px',
});

const ChordPressionDisplay = styled('div')({
  marginTop: '20px',
  marginBottom: '20px',
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
    addChordToProgression,
    saveProgression,
    playProgression,
    playSelectedNotes,
    progressions,
    setProgression,
    setProgressionKey,
    getScaleNotes,
    showFretboardControls,
    showProgressor,
    showCircleOfFifths,
    showChordComposer,
    showSongsSelector,
    showAddMoreFretboardsButton,
    showFretboard,
    showStats,
    updateBoards,
    keyIndex,
    scale,
    modeIndex,
    shape,
    quality,
    display,
    onNoteClick,
    playSingleChord,
  } = props;


  const { addNoteFromFretboard } = useScore();

  // incoming note from fretboard
  const [incomingNote, setIncomingNote] = useState(null);

  const updateBoardsCallback = useCallback(() => {
    if (selectedFretboard?.id) {
      if (!isNaN(keyIndex)) {
        dispatch(updateBoards(selectedFretboard.id, 'keySettings.' + display, keyIndex));
      }

      if (!isNaN(modeIndex)) {
        dispatch(updateBoards(selectedFretboard.id, 'keySettings.mode', modeIndex));
      }

      console.log("updated modeIndex ", modeIndex);
      console.log("updated keyIndex ", keyIndex);
      
      if (display === 'scale') {
        dispatch(updateBoards(selectedFretboard.id, 'generalSettings.choice', 'scale'));
        dispatch(updateBoards(selectedFretboard.id, 'scaleSettings.scale', scale));
        if (guitar.scales[scale]?.isModal) {
          dispatch(
            updateBoards(
              selectedFretboard.id,
              'modeSettings.mode',
              guitar.scales[scale].modes[modeIndex].name
            )
          );
          if (shape !== '') {
            dispatch(updateBoards(selectedFretboard.id, 'modeSettings.shape', shape));
            dispatch(updateBoards(selectedFretboard.id, 'scaleSettings.shape', shape));
          }
        } else {
          dispatch(updateBoards(selectedFretboard.id, 'scaleSettings.shape', shape));
        }
      }

      if (display === 'arppegio') {
        dispatch(updateBoards(selectedFretboard.id, 'generalSettings.choice', 'arppegio'));
        dispatch(updateBoards(selectedFretboard.id, 'arppegioSettings.arppegio', quality));
        if (shape !== '') {
          dispatch(updateBoards(selectedFretboard.id, 'arppegioSettings.shape', shape));
        }
      }

      if (display === 'chord') {
        dispatch(updateBoards(selectedFretboard.id, 'generalSettings.choice', 'chord'));
        dispatch(updateBoards(selectedFretboard.id, 'chordSettings.chord', quality));
        if (shape !== '') {
          dispatch(updateBoards(selectedFretboard.id, 'chordSettings.shape', shape));
        }
      }
    }
  }, [
    dispatch,
    display,
    selectedFretboard,
    keyIndex,
    modeIndex,
    scale,
    shape,
    quality,
    updateBoards,
  ]);

  useEffect(() => {
    updateBoardsCallback();
  }, [updateBoardsCallback]);

  if (!selectedFretboard) {
    return <div>Loading...</div>;
  }

  const getDegree = (choice) => {
    const defaultDegree = 'Major';
    if (!choice || selectedFretboardIndex === -1 || !boards.length) return defaultDegree;

    if (choice === 'scale') {
      const scale = guitar.scales[selectedFretboard.scaleSettings.scale];
      return scale ? scale.degree : defaultDegree;
    } else if (choice === 'chord' || choice === 'arppegio') {
      const chord = guitar.arppegios[selectedFretboard[choice + 'Settings'][choice]];
      return chord ? chord.degree : defaultDegree;
    }
    return defaultDegree;
  };

  const getCircleData = () => {
    const defaultPoint = { tone: 'C', degree: 'Major' };
    if (selectedFretboardIndex === -1 || !selectedFretboard) return defaultPoint;
    const selectedKey = selectedFretboard.keySettings[selectedFretboard.generalSettings.choice];
    const selectedTone = guitar.notes.flats[selectedKey];
    return { tone: selectedTone, degree: getDegree(selectedFretboard.generalSettings.choice) };
  };

  const circleData = getCircleData();

  const currentScale = selectedFretboardIndex >= 0 && selectedFretboard ? guitar.scales[selectedFretboard.scaleSettings.scale] : 'major';
  const scaleModes = currentScale?.isModal ? currentScale.modes : [];
  const { choice } = selectedFretboard.generalSettings;
  const selectedKey = selectedFretboard.keySettings[choice];
  const selectedShape = selectedFretboard[choice + 'Settings'].shape;
  const selectedArppegio = selectedFretboard.arppegioSettings.arppegio;
  const { fret } = selectedFretboard.chordSettings;
  const selectedChord = selectedFretboard.chordSettings.chord;
  const selectedScale = selectedFretboard.scaleSettings.scale;
  const { mode } = selectedFretboard.modeSettings;

  const components = (
    <Root>
      <Meta
        title="Musical Guitar Sheets | Complete References (5000 pages for FREE / No Subscription / No Fees / No Payments)"
        description="Explore my complete references for musical keys, scales, modes, and arpeggios. Find detailed information and resources for all keys, sharps, scales, modes, and arpeggios to enhance your musical knowledge"
      />
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
            onNoteClick={(noteObj) => {
              addNoteFromFretboard(noteObj);
            }}
            visualizerModalIndex={selectedFretboard.modeSettings.mode}
          />
        </FretboardContainer>
      )}

      {showFretboardControls && (
        <FretboardControls
          handleChoiceChange={handleChoiceChange}
          onCleanFretboard={cleanFretboard}
          selectedKey={selectedFretboard.keySettings[selectedFretboard.generalSettings.choice]}
          selectedScale={selectedFretboard.scaleSettings.scale}
          selectedChord={selectedFretboard.chordSettings.chord}
          selectedShape={selectedFretboard[selectedFretboard.generalSettings.choice + 'Settings'].shape}
          selectedMode={selectedFretboard.modeSettings.mode}
          onElementChange={onElementChange}
          scaleModes={selectedFretboard.scaleSettings.scale ? guitar.scales[selectedFretboard.scaleSettings.scale].modes : []}
          arppegiosNames={Object.keys(guitar.arppegios)}
          choice={selectedFretboard.generalSettings.choice}
        />
      )}

      {
        showStats && <Stats boards={boards} />
      }
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

  return <>{components}</>;
};

const mapStateToProps = (state, ownProps) => {
  const filteredBoards = state.fretboard.components.filter(
    (board) => board.generalSettings.page === ownProps.board
  );
  return {
    boards: filteredBoards,
    progressions: state.partitions,
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
)(withFretboardState(MusicApp));

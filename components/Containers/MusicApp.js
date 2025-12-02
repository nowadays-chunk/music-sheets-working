import { IconButton } from '@mui/material';
import { styled } from '@mui/system';
import { useCallback, useEffect, useState } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FretboardControls from '../Pages/Fretboard/FretboardControls';
import Progressor from '../UpComingPages/Page.ChordProgressionsComposer/OldVersion.Trialed.NotSucceeded/Progressor';
import CircleOfFifths from '../Pages/CircleOfFifths/CircleOfFifths';
import FretboardDisplay from '../Pages/Fretboard/FretboardDisplay';
import ChordComposer from '../Pages/Composer/ChordComposer';
import withFretboardState from '../../hocs/withFretboardState';
import withChordProgression from '../../hocs/withChordProgression';
import withPlayback from '../../hocs/withPlayback';
import { connect } from 'react-redux';
import { addFretboard, updateStateProperty, setProgression, setProgressionKey } from '../../redux/actions';
import guitar from '../../config/guitar';
import SongsSelector from '../Pages/LearnSongs/SongsSelector';
import { useDispatch } from 'react-redux';
import Meta from '../Partials/Head';
import { GoogleTagManager } from '@next/third-parties/google';

/* NEW IMPORTS */
import TimelineComposer from '../Pages/Composer/TimelineComposer';
import TransportBar from '../Pages/Composer/TransportBar';
import useMidiEngine from '../Pages/Composer/useMidiEngine';
import { exportMidi } from '../Pages/Composer/exportMidi';
/* END NEW IMPORTS */

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  margin: '0 auto',
  width: '80%',
  '@media (min-width: 1024px)': {
    width: '65%',
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

  /* -------------------------------------------
     NEW STATE FOR COMPOSER
  ------------------------------------------- */
  const [incomingNote, setIncomingNote] = useState(null);
  const [timelineNotes, setTimelineNotes] = useState([]);
  const [loopStartBeat, setLoopStartBeat] = useState(0);
  const [loopEndBeat, setLoopEndBeat] = useState(8);

  /* PLAYBACK ENGINE */
  const {
    start: startPlayback,
    stop: stopPlayback,
    isPlaying,
    cursorBeat
  } = useMidiEngine({
    bpm: 120,
    onTick: () => {},
    loopStartBeat,
    loopEndBeat
  });

  /* -------------------------------------------
     EXISTING PROPS (unchanged)
  ------------------------------------------- */
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

  /* -------------------------------------------
     INTERCEPT NOTE CLICKS FROM FRETBOARD 
     AND SEND TO COMPOSER
  ------------------------------------------- */
  const handleIncomingNote = (noteObj) => {
    setIncomingNote(noteObj);
  };

  /* -------------------------------------------
     PLAYBACK CONTROLS
  ------------------------------------------- */
  const handlePlay = () => startPlayback(timelineNotes);
  const handlePause = () => stopPlayback();
  const handleStop = () => stopPlayback();

  const handleExport = () => exportMidi(timelineNotes);

  /* -------------------------------------------
     EXISTING LOGIC - UNCHANGED
  ------------------------------------------- */
  const updateBoardsCallback = useCallback(() => {
    if (selectedFretboard?.id) {
      if (!isNaN(keyIndex)) {
        dispatch(updateBoards(selectedFretboard.id, 'keySettings.' + display, keyIndex));
      }

      if (!isNaN(modeIndex)) {
        dispatch(updateBoards(selectedFretboard.id, 'keySettings.mode', modeIndex));
      }

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
    dispatch, display, selectedFretboard, keyIndex, modeIndex,
    scale, shape, quality, updateBoards
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

  const selectedKey = selectedFretboard.keySettings[selectedFretboard.generalSettings.choice];
  const selectedArppegio = selectedFretboard.arppegioSettings.arppegio;
  const { mode } = selectedFretboard.modeSettings;
  const selectedChord = selectedFretboard.chordSettings.chord;
  const selectedScale = selectedFretboard.scaleSettings.scale;

  return (
    <Root>
      <Meta title="Musical Guitar Sheets" />
      <GoogleTagManager gtmId="GTM-XXXXXXX" />

      {/* ----------------------------  
           NEW COMPOSER UI ADDED HERE
      ---------------------------- */}
      { showChordComposer &&
        <>
          <TransportBar
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onPause={handlePause}
            onStop={handleStop}
            onStart={() => setLoopStartBeat(0)}
            onEnd={() =>
              setLoopEndBeat(
                Math.max(...timelineNotes.map((n) => n.time + n.duration))
              )
            }
            onRewind={() => {}}
            onFastForward={() => {}}
            loop={true}
            onToggleLoop={() => {}}
            onExport={handleExport}
          />

          <TimelineComposer
            incomingNote={incomingNote}
            onNotesChange={setTimelineNotes}
            onPlayNote={(note) => startPlayback([note])}
            externalCursorBeat={cursorBeat}
            loopStartBeat={loopStartBeat}
            loopEndBeat={loopEndBeat}
            onLoopChange={({ start, end }) => {
              setLoopStartBeat(start);
              setLoopEndBeat(end);
            }}
          />
        </>
      }

      {/* ----------------------------  
          ORIGINAL APP UI (UNCHANGED)
      ---------------------------- */}
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

            /* NOTE: HERE WE RE-ROUTE TO COMPOSER */
            onNoteClick={handleIncomingNote}

            visualizerModalIndex={mode}
          />
        </FretboardContainer>
      )}

      {showFretboardControls && (
        <FretboardControls
          playSelectedNotes={playSelectedNotes}
          handleChoiceChange={handleChoiceChange}
          scaleModes={[]}
          arppegiosNames={Object.keys(guitar.arppegios)}
          choice={selectedFretboard.generalSettings.choice}
          onCleanFretboard={cleanFretboard}
          selectedKey={isNaN(selectedKey) ? '' : selectedKey}
          onCopyLink={() => {}}
          selectedMode={mode || ''}
          selectedScale={selectedScale || ''}
          selectedChord={selectedChord || ''}
          selectedShape={selectedFretboard.chordSettings.shape || ''}
          selectedArppegio={selectedArppegio}
          selectedFret={selectedFretboard.chordSettings.fret}
          addChordToProgression={addChordToProgression}
          saveProgression={saveProgression}
          playProgression={playProgression}
          progressions={progressions.progression}
          onElementChange={onElementChange}
        />
      )}

      {showCircleOfFifths && (
        <CircleOfFifths
          tone={'C'}
          onElementChange={onElementChange}
          selectedFretboardIndex={selectedFretboardIndex}
          quality={'Major'}
        />
      )}

      {showChordComposer && (
        <ChordComposer
          addChordToProgression={addChordToProgression}
          playProgression={playProgression}
          saveProgression={saveProgression}
          onElementChange={onElementChange}
          selectedArppegio={selectedArppegio}
          selectedKey={selectedKey}
        />
      )}

      {showProgressor && (
        <Progressor
          className={ChordPressionDisplay}
          progression={progressions.progression}
          setProgression={setProgression}
          playProgression={playProgression}
          setProgressionKey={setProgressionKey}
          selectedKey={progressions.key}
          getScaleNotes={getScaleNotes}
        />
      )}

      {showSongsSelector && (
        <SongsSelector
          playProgression={playProgression}
          getScaleNotes={getScaleNotes}
          onElementChange={onElementChange}
          playSingleChord={playSingleChord}
        />
      )}
    </Root>
  );
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
)(withFretboardState(withChordProgression(withPlayback(MusicApp))));

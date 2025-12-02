import React from 'react';
import PropTypes from 'prop-types';
import guitar from '../../../config/guitar';
import { styled } from '@mui/system';
import MidiReader from '../LearnSongs/MidiReader';

const CELL_SIZE = 25; // <- EXACT requirement
const NOTE_SIZE = 20; // circle size inside cell

const FretboardContainer = styled('div')({
  width: '100%',
  maxWidth: '100vw',
  '@media (min-width: 1024px)': {
    width: '100%',
    height: '100%',
  },
  '@media print': {
    width: '100%',
    height: '100%',
  },
});

const FretboardTable = styled('table')({
  width: '100%',
  borderCollapse: 'collapse',
  tableLayout: 'fixed',
  borderSpacing: 0,
});

const TableRow = styled('tr')({
  margin: 0,
  padding: 0,
  height: CELL_SIZE,
});

const TableHeader = styled('th')({
  width: CELL_SIZE,
  height: CELL_SIZE,
  minWidth: CELL_SIZE,
  maxWidth: CELL_SIZE,
  minHeight: CELL_SIZE,
  maxHeight: CELL_SIZE,
  padding: 0,
  margin: 0,
  borderTop: 'none',
  borderRight: 'none',
  borderLeft: 'none',
  borderBottom: 'none',
  textAlign: 'center',
  verticalAlign: 'middle',
  fontSize: 10,
  lineHeight: `${CELL_SIZE}px`,
  fontWeight: 'bold',
  userSelect: 'none',
});

const TableData = styled('td')({
  width: CELL_SIZE,
  height: CELL_SIZE,
  minWidth: CELL_SIZE,
  maxWidth: CELL_SIZE,
  minHeight: CELL_SIZE,
  maxHeight: CELL_SIZE,
  padding: 0,
  margin: 0,
  borderRight: '1px solid black',
  verticalAlign: 'middle',
  position: 'relative',
  cursor: 'pointer',
  textAlign: 'center',
  overflow: 'hidden',
});

const Note = styled('div')({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: NOTE_SIZE,
  height: NOTE_SIZE,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2,
  fontWeight: 'bold',
  fontSize: 11,
  lineHeight: 1,
  transition: 'transform 0.1s ease-in-out',
  userSelect: 'none',
  border: '1px solid black',
});

const NoteContent = styled('span')({
  fontSize: 11,
  fontWeight: 'bold',
  textAlign: 'center',
  color: '#000',
  '@media print': {
    fontSize: 10,
  },
});

const NoteLine = styled('hr')({
  position: 'absolute',
  top: '50%',
  left: 0,
  right: 0,
  width: '100%',
  margin: 0,
  padding: 0,
  border: 'none',
  borderTop: '1px solid black',
  transform: 'translateY(-50%)',
  zIndex: 1,
  pointerEvents: 'none',
});

const TunerInput = styled('input')({
  width: CELL_SIZE,
  height: CELL_SIZE,
  borderRadius: '50%',
  border: '1px solid #ccc',
  textAlign: 'center',
  outline: 'none',
  fontSize: 11,
  lineHeight: `${CELL_SIZE}px`,
  boxSizing: 'border-box',
  background: '#fff',
});

const getNoteStyle = (note, noteIndex, modalNoteIndex) => {
  let backgroundColor = 'lightblue';

  if (note.show && note.interval === '1') backgroundColor = 'lightsalmon';
  if (noteIndex === 0) backgroundColor = 'lightsalmon';
  if (noteIndex === modalNoteIndex) backgroundColor = 'darkseagreen';

  return { backgroundColor };
};

const FretboardDisplay = ({
  boards,
  handleFretboardSelect,
  onElementChange,
  onNoteClick,
  selectedFretboard,
  visualizerModalIndex
}) => {
  const calculateOctave = (stringIndex, fretIndex) => {
    const baseOctaves = selectedFretboard?.generalSettings?.baseOctaves || [];
    let octave = baseOctaves[stringIndex];
    const tuning = selectedFretboard?.generalSettings?.tuning || [];
    const notes = guitar.notes.sharps;

    let currentNoteIndex = tuning[stringIndex] % 12;

    for (let i = 0; i <= fretIndex; i++) {
      const note = notes[(currentNoteIndex + i) % 12];
      if (note === 'B') octave++;
    }
    return octave;
  };

  const fretboardElements = boards.map((fretboard, fretboardIndex) => {
    const numStrings = Math.min(
      selectedFretboard.generalSettings.page.includes('references')
        ? 6
        : fretboard.generalSettings.nostrs,
      12
    );

    const numFrets = fretboard.generalSettings.nofrets;

    const fretNumbers = Array.from({ length: numFrets }, (_, i) => i);

    const newRows = [...Array(numStrings)].map((_, i) => (
      <TableRow key={`row-${fretboardIndex}-${i}`}>
        {/* tuner cell */}
        <TableData>
          <TunerInput
            value={guitar.notes.flats[fretboard.generalSettings.tuning[i]] || ''}
            onChange={(e) => {
              const newTuning = [...fretboard.generalSettings.tuning];
              if (e.target.value !== '') {
                newTuning[i] = guitar.notes.flats.indexOf(e.target.value);
                onElementChange(newTuning.join('-'), 'tuning');
              }
            }}
          />
        </TableData>

        {fretNumbers.map((fret) => {
          const note =
            fretboard[fretboard.generalSettings.choice + 'Settings']?.fretboard?.[i]?.[fret] || {};

          const displayedNoteIndex =
            (fretboard.generalSettings.tuning[i] + fret) % 12
          const displayedNote = guitar.notes.sharps[displayedNoteIndex];

          let noteIndex = '';
          let modalNoteIndex = 0;

          if (fretboard.generalSettings.choice === 'scale' && fretboard.scaleSettings.scale) {
            const isModalRequest = guitar.scales[fretboard.scaleSettings.scale]?.isModal;

            if (isModalRequest) {
              noteIndex =
                fretboard[fretboard.generalSettings.choice + 'Settings']?.notes?.indexOf(
                  note.current
                );
              modalNoteIndex = visualizerModalIndex >= 0 ? visualizerModalIndex : fretboard.keySettings.mode ;
            }
          }
 
          const noteStyle = getNoteStyle(note, noteIndex, modalNoteIndex);

          return (
            <TableData
              key={`note-${fretboardIndex}-${i}-${fret}`}
              onClick={() => {
                onNoteClick(displayedNote + calculateOctave(i, fret), i, fret);
              }}
            >
              <NoteLine />
              {note.show && (
                <Note
                  id={`note-${fretboardIndex}-${i}-${fret}`}
                  style={noteStyle}
                >
                  <NoteContent>{displayedNote}</NoteContent>
                </Note>
              )}
            </TableData>
          );
        })}
      </TableRow>
    ));

    const newHeads = [
      <TableHeader key="tuner">tuner</TableHeader>,
      fretNumbers.map((fret, i) => (
        <TableHeader key={`head-${fretboardIndex}-${i}`}>{fret}</TableHeader>
      )),
    ];

    return (
      <FretboardContainer
        key={`fretboard-${fretboardIndex}`}
        onFocus={() => handleFretboardSelect(fretboardIndex)}
        onClick={() => handleFretboardSelect(fretboardIndex)}
      >
        <label style={{ fontWeight: 'bold' }}>
          #Strings:
          <input
            type="number"
            key="strings-changer"
            style={{ margin: '6px' }}
            value={numStrings}
            onChange={(e) => onElementChange(e.target.value, 'nostrs')}
            min="4"
            max="12"
          />
        </label>
        <label style={{ fontWeight: 'bold' }}>
          #Frets:
          <input
            type="number"
            key="frets-changer"
            style={{ margin: '6px' }}
            value={numFrets}
            onChange={(e) => onElementChange(e.target.value, 'nofrets')}
            min="12"
            max="24"
          />
        </label>

        <FretboardTable>
          <tbody>{newRows}</tbody>
          <tfoot>
            <TableRow>{newHeads}</TableRow>
          </tfoot>
        </FretboardTable>
{/* 
      <MidiReader playNote={onNoteClick} onHighlight={(e) => {
        console.log("note being played ", e);
      }} /> */}
      </FretboardContainer>
    );
  });

  return <div>{fretboardElements}</div>;
};

FretboardDisplay.propTypes = {
  boards: PropTypes.array,
  handleFretboardSelect: PropTypes.func.isRequired,
  onElementChange: PropTypes.func.isRequired,
  onNoteClick: PropTypes.func.isRequired,
  selectedFretboard: PropTypes.object.isRequired,
};

export default FretboardDisplay;

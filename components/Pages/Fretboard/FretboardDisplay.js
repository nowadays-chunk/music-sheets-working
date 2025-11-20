import React from 'react';
import PropTypes from 'prop-types';
import guitar from '../../../config/guitar';
import { styled } from '@mui/system';
import classNames from 'classnames';

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
    pageBreakAfter: 'always',
  },
});

const FretboardTable = styled('table')({
  width: '100%',
});

const TableRow = styled('tr')({
  margin: 0,
  padding: 0,
});

const TableData = styled('td')({
  height: '20px', // Reduced height
  padding: 0,
  borderRight: '1px solid black',
  verticalAlign: 'middle',
  position: 'relative',
  cursor: 'pointer',
  textAlign: 'center', // Center the content horizontally
  '@media (min-width: 1024px)': {
    height: '50px', // Original height for larger screens
  },
});

const Note = styled('div')({
  display: 'inline-block',
  position: 'relative',
  cursor: 'pointer',
  lineHeight: '20px', // Reduced line height
  zIndex: 1000,
  transition: 'transform 0.1s ease-in-out', // Add transition for scaling effect
  '@media (min-width: 1024px)': {
    lineHeight: '25px', // Original line height for larger screens
  },
});

const NoteContent = styled('span')({
  fontSize: '10px', // Reduced font size
  fontWeight: 'bold',
  textAlign: 'center', // Center the text inside the note
  '@media (min-width: 1024px)': {
    fontSize: '20px', // Original font size for larger screens
  },
  '@media print': {
    fontSize: '10px', // Reduced font size
  },
});

const NoteLine = styled('hr')({
  position: 'absolute',
  width: '100%',
  top: '50%',
  left: 0,
  margin: 0,
  padding: 0,
  border: 'none',
  borderTop: '1px solid black',
  transform: 'translateY(-50%)',
});

const getNoteStyle = (note) => {
  if (!note.show) return {};
  let backgroundColor = 'lightblue';
  if (note.interval === '1' || note.interval === 'root') backgroundColor = 'purple';
  if (note.interval === '3' || note.interval === 'b3') backgroundColor = 'lightsalmon';
  if (note.interval === '5') backgroundColor = 'lightgoldenrodyellow';
  if (note.interval === '7' || note.interval === 'b7') backgroundColor = 'lightcoral';

  return { backgroundColor };
};

const FretboardDisplay = ({
  boards,
  handleFretboardSelect,
  onElementChange,
  onNoteClick,
  selectedFretboard,
}) => {
  const calculateOctave = (stringIndex, fretIndex) => {
    const baseOctaves = selectedFretboard?.generalSettings?.baseOctaves || [];
    let octave = baseOctaves[stringIndex];
    const tuning = selectedFretboard?.generalSettings?.tuning || [];
    const notes = guitar.notes.sharps;

    // Calculate the number of half steps from the open string
    let halfSteps = (tuning[stringIndex] + fretIndex) % 12;
    let currentNoteIndex = tuning[stringIndex] % 12;

    // Loop through each fret and determine if we pass a B note
    for (let i = 0; i <= fretIndex; i++) {
      const note = notes[(currentNoteIndex + i) % 12];
      if (note === 'B') {
        octave++;
      }
    }

    return octave;
  };

  const makeSound = (note, octave, stringIndex, fretIndex, fretboardIndex) => {
    const noteElement = document.getElementById(`note-${fretboardIndex}-${stringIndex}-${fretIndex}`);
    if (noteElement) {
      noteElement.classList.add('playing');
      setTimeout(() => {
        noteElement.classList.remove('playing');
      }, 500); // Adjust the timeout duration as needed
    }
  };

  const fretboardElements = boards.map((fretboard, fretboardIndex) => {
    const numStrings = Math.min(
      selectedFretboard.generalSettings.page.includes('references') ? 6 : fretboard.generalSettings.nostrs,
      12
    );
    const numFrets = selectedFretboard.generalSettings.page.includes('references') ? 12 : fretboard.generalSettings.nofrets;

    const centeredFretboard = () => {
      return Array.from({ length: numFrets }, (_, i) => i);
    };

    const fretNumbers = centeredFretboard();

    const newRows = [...Array(numStrings)].map((_, i) => (
      <TableRow key={`row-${fretboardIndex}-${i}`}>
        <TableData width="10px"> {/* Adjusted width */}
          <input
            value={guitar.notes.flats[fretboard.generalSettings.tuning[i]] || ''}
            onChange={(e) => {
              const newTuning = [...fretboard.generalSettings.tuning];
              if (e.target.value !== '') {
                newTuning[i] = guitar.notes.flats.indexOf(e.target.value);
                onElementChange(newTuning.join('-'), 'tuning');
              }
            }}
            style={{
              width: '25px', // Reduced width for print
              height: '25px', // Reduced height for print
              borderRadius: '50%',
              border: '1px solid #ccc',
              textAlign: 'center',
              outline: 'none',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
              '@media (minWidth: 1024px)?': {
                width: '36px', // Original width for larger screens
                height: '36px', // Original height for larger screens
              },
            }}
          />
        </TableData>

        {fretNumbers.map((fret, j) => {
          const note = fretboard[fretboard.generalSettings.choice + 'Settings']?.fretboard[i]?.[fret] || {};
          const displayedNoteIndex = (fretboard.generalSettings.tuning[i] + fret) % 12;
          const displayedNote = guitar.notes.sharps[displayedNoteIndex];
          const octave = Math.floor((fretboard.generalSettings.tuning[i] + fret) / 12) + 4;

          let newChoice = fretboard.generalSettings.choice;
          let noteIndex = '';

          if (fretboard.generalSettings.choice === 'scale' && fretboard.scaleSettings.scale) {
            const isModalRequest = guitar.scales[fretboard.scaleSettings.scale]?.isModal;
            newChoice = isModalRequest ? 'mode' : 'scale';
            noteIndex = fretboard[newChoice + 'Settings'].notes.indexOf(note.current);
          }

          const rootNote = note.show && (noteIndex === 0 || note.interval === '1') ? 'root-note' : '';
          const thirdNote = note.show && (noteIndex === 2 || ['3', 'b3'].includes(note.interval)) ? 'third-note' : '';
          const fifthNote = note.show && (noteIndex === 4 || note.interval === '5') ? 'fifth-note' : '';
          const seventhNote = note.show && (noteIndex === 6 || ['7', 'b7'].includes(note.interval)) ? 'seventh-note' : '';

          const noteClassNames = classNames({
            'note': note.show,
            'root-note': rootNote,
            'third-note': thirdNote,
            'fifth-note': fifthNote,
            'seventh-note': seventhNote,
          });

          const noteStyle = getNoteStyle(note);

          return (
            <TableData key={`note-${fretboardIndex}-${i}-${fret}`} onClick={() => { onNoteClick(displayedNote + calculateOctave(i, fret), i, fret); }}>
              <Note id={`note-${fretboardIndex}-${i}-${fret}`} className={noteClassNames} style={noteStyle}>
                {note.show && <NoteContent>{displayedNote}</NoteContent>}
              </Note>
              <NoteLine />
            </TableData>
          );
        })}
      </TableRow>
    ));

    const newHeads = [
      <th key="tuner">
        <span className="fretNumber">tuner</span>
      </th>,
      fretNumbers.map((fret, i) => (
        <th key={`head-${fretboardIndex}-${i}`} width={numFrets - i + 30}>
          <span className="fretNumber">{fret}</span>
        </th>
      )),
    ];

    return (
      <FretboardContainer key={`fretboard-${fretboardIndex}`} onFocus={() => handleFretboardSelect(fretboardIndex)} onClick={() => handleFretboardSelect(fretboardIndex)}>
        <label style={{ fontWeight: 'bold' }}>
          #Strings:
          <input type="number" key="strings-changer" style={{ margin: '6px' }} value={numStrings} onChange={(e) => onElementChange(e.target.value, 'nostrs')} min="4" max="12" />
        </label>
        <label style={{ fontWeight: 'bold' }}>
          #Frets:
          <input type="number" key="frets-changer" style={{ margin: '6px' }} value={numFrets} onChange={(e) => onElementChange(e.target.value, 'nofrets')} min="12" max="24" />
        </label>
        <FretboardTable>
          <tbody>{newRows}</tbody>
          <tfoot>
            <tr>{newHeads}</tr>
          </tfoot>
        </FretboardTable>
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

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  updateStateProperty,
  newFretboard,
  addFretboard,
  setProgression,
  newLayout
} from '../redux/actions';
import { getNoteFromFretboard } from '../redux/helpers';
import guitar from '../config/guitar';

const defaultTuning = [4, 11, 7, 2, 9, 4];

const withFretboardState = (WrappedComponent) => {
  return (props) => {
    const dispatch = useDispatch();
    const { boards } = props;

    const [selectedFretboardIndex, setSelectedFretboardIndex] = useState(0);
    const [selectedFretboard, setSelectedFretboard] = useState(
      boards[selectedFretboardIndex]
    );

    useEffect(() => {
      setSelectedFretboard(boards[selectedFretboardIndex]);
    }, [boards, selectedFretboardIndex]);

    // Restore progression once
    useEffect(() => {
      const restoredChordProgression = JSON.parse(localStorage.getItem('progression'));
      if (restoredChordProgression?.length) {
        dispatch(setProgression(restoredChordProgression));
      }
    }, [dispatch]);

    const handleFretboardSelect = (index) => {
      setSelectedFretboardIndex(index);
    };

    useEffect(() => {
      if (selectedFretboardIndex === -1 || !selectedFretboard) return;

      const {
        chordSettings,
        keySettings,
        scaleSettings,
        generalSettings,
        modeSettings,
        arppegioSettings
      } = selectedFretboard;

      const choice = generalSettings.choice;
      if (isNaN(keySettings[choice])) return;

      let notes = [];
      let intervals = [];
      const shape = selectedFretboard[choice + 'Settings'].shape;

      if (choice === 'chord' && chordSettings.chord && shape) {
        displayChordPortion({
          key: keySettings[choice],
          chord: chordSettings.chord,
          shape
        });
        return;
      } else if (choice === 'arppegio' && arppegioSettings.arppegio) {
        notes = getArppegioNotes(arppegioSettings.arppegio);
        intervals = getArppegioIntervals(arppegioSettings.arppegio);
      } else if (choice === 'scale' && scaleSettings.scale) {
        notes = getScaleNotes(scaleSettings.scale, keySettings.scale);
        intervals = getScaleIntervals(scaleSettings.scale);

        if (guitar.scales[scaleSettings.scale].isModal) {
          notes = getModeNotes(notes, modeSettings.mode);
        }
      }

      const fretboardClone = JSON.parse(JSON.stringify(selectedFretboard));

      const choiceKey = `${choice}Settings`;
      const choiceBoard = fretboardClone[choiceKey]?.fretboard || [];

      // REAL fret count from actual data (0..11 => length 12)
      const fretCount =
        choiceBoard?.[0]?.length ??
        fretboardClone.generalSettings.nofrets ??
        12;

      // Reset board state safely
      choiceBoard.forEach((string) => {
        string.forEach((note) => {
          note.show = false;
          note.interval = undefined;
        });
      });

      const adjustFretIndex = (fretIndex) => {
        return generalSettings.page.includes('references') && fretIndex > 11
          ? fretIndex - 12
          : fretIndex;
      };

      const adjustShapeInterval = (interval, page) => {
        if (page.includes('references')) {
          if (interval > 12) interval -= 12;
          if (interval < 0) interval = 0;
        }
        return interval;
      };

      const ensureStartEndOrder = (start, end, page) => {
        if (start > end) {
          start = adjustShapeInterval(start, page);
          end = adjustShapeInterval(end, page);
        }
        return { start, end };
      };

      if (shape !== '' && notes.length && intervals.length) {
        const shapeIndex = guitar.shapes.names.indexOf(shape);
        const rootNoteIndex = keySettings[choice];

        let shapeIntervals = null;

        if (choice === 'arppegio') {
          shapeIntervals = guitar.shapes.indexes[shapeIndex];
        } else if (choice === 'scale') {
          shapeIntervals = guitar.scales[scaleSettings.scale].indexes[shapeIndex];
        }

        choiceBoard.forEach((string, stringIndex) => {
          for (let fretIndex = rootNoteIndex; fretIndex < fretCount; fretIndex++) {
            const adjustedFretIndex = adjustFretIndex(fretIndex);
            const currentNote = getNoteFromFretboard(
              stringIndex,
              adjustedFretIndex,
              fretboardClone.generalSettings.tuning
            );

            if (notes.includes(currentNote)) {
              const fretPosition = adjustedFretIndex;
              let startInterval = shapeIntervals.start + rootNoteIndex;
              let endInterval = shapeIntervals.end + rootNoteIndex;

              if (generalSettings.page.includes('references') && endInterval > 12) {
                endInterval -= 12;
                startInterval -= 12;
                if (startInterval < 0) startInterval = 0;
              }

              ({ start: startInterval, end: endInterval } = ensureStartEndOrder(
                startInterval,
                endInterval,
                generalSettings.page
              ));

              if (fretPosition >= startInterval && fretPosition <= endInterval) {
                const row = choiceBoard[stringIndex];
                const noteData = row?.[adjustedFretIndex];
                if (!noteData) continue; // guard for 12-fret boards

                noteData.show = true;
                noteData.current = generalSettings.notesDisplay
                  ? currentNote
                  : intervals[notes.indexOf(currentNote)];
                noteData.interval = intervals[notes.indexOf(currentNote)];
              }
            }
          }
        });
      } else {
        // No-shape mode: show all notes everywhere
        choiceBoard.forEach((string, stringIndex) => {
          for (let fretIndex = 0; fretIndex < fretCount; fretIndex++) {
            const adjustedFretIndex = adjustFretIndex(fretIndex);
            const currentNote = getNoteFromFretboard(
              stringIndex,
              adjustedFretIndex,
              fretboardClone.generalSettings.tuning
            );

            if (notes.includes(currentNote)) {
              const row = choiceBoard[stringIndex];
              const noteData = row?.[adjustedFretIndex];
              if (!noteData) continue;

              noteData.show = true;
              noteData.current = generalSettings.notesDisplay
                ? currentNote
                : intervals[notes.indexOf(currentNote)];
              noteData.interval = intervals[notes.indexOf(currentNote)];
            }
          }
        });
      }

      if (
        JSON.stringify(selectedFretboard[choiceKey]) !==
        JSON.stringify(fretboardClone[choiceKey])
      ) {
        dispatch(
          updateStateProperty(
            selectedFretboard.id,
            `${choiceKey}.fretboard`,
            fretboardClone[choiceKey].fretboard
          )
        );
      }
    }, [selectedFretboard, selectedFretboardIndex, dispatch]);

    const displayChordPortion = (chordObject) => {
      const { key, chord, shape } = chordObject;
      const cagedShape = guitar.arppegios[chord]?.cagedShapes[shape];
      if (!cagedShape) return;

      const { formula } = guitar.arppegios[chord];
      let currentNoteIndex = key;

      const chordNotes = [guitar.notes.sharps[currentNoteIndex]];
      formula.forEach((step) => {
        currentNoteIndex = (currentNoteIndex + step) % 12;
        chordNotes.push(guitar.notes.sharps[currentNoteIndex]);
      });
      chordNotes.pop();

      const chordIntervals = guitar.arppegios[chord].intervals;
      const newBoard = JSON.parse(JSON.stringify(selectedFretboard)).chordSettings
        .fretboard;

      newBoard.forEach((string) =>
        string.forEach((note) => {
          note.show = false;
          note.interval = null;
        })
      );

      const adjustFretIndex = (fretIndex) => {
        return selectedFretboard.generalSettings.page.includes('references') &&
          fretIndex > 11
          ? fretIndex - 12
          : fretIndex;
      };

      const adjustShapeInterval = (interval, page) => {
        if (page.includes('references')) {
          if (interval > 12) interval -= 12;
          if (interval < 0) interval = 0;
        }
        return interval;
      };

      const ensureStartEndOrder = (start, end, page) => {
        if (start > end) {
          start = adjustShapeInterval(start, page);
          end = adjustShapeInterval(end, page);
        }
        return { start, end };
      };

      newBoard.forEach((string, stringIndex) => {
        let firstNoteFound = false;

        string.forEach((note, fretIndex) => {
          if (firstNoteFound) return;

          const adjustedFretIndex = adjustFretIndex(fretIndex);
          const shapeIndex = guitar.shapes.names.indexOf(shape);
          const shapeIntervals = guitar.shapes.indexes[shapeIndex];
          const noteIndex =
            (selectedFretboard.generalSettings.tuning[stringIndex] +
              adjustedFretIndex) %
            12;
          const noteName = guitar.notes.sharps[noteIndex];

          let startInterval = shapeIntervals.start + key;
          let endInterval = shapeIntervals.end + key;

          if (selectedFretboard.generalSettings.page.includes('references') &&
              endInterval > 12) {
            endInterval -= 12;
            startInterval -= 12;
            if (startInterval < 0) startInterval = 0;
          }

          ({ start: startInterval, end: endInterval } = ensureStartEndOrder(
            startInterval,
            endInterval,
            selectedFretboard.generalSettings.page
          ));

          if (
            chordNotes.includes(noteName) &&
            adjustedFretIndex <= endInterval &&
            adjustedFretIndex >= startInterval
          ) {
            newBoard[stringIndex][adjustedFretIndex].show = true;
            newBoard[stringIndex][adjustedFretIndex].interval =
              chordIntervals[chordNotes.indexOf(noteName)];
            firstNoteFound = true;
          }
        });
      });

      if (
        JSON.stringify(selectedFretboard.chordSettings.fretboard) !==
        JSON.stringify(newBoard)
      ) {
        dispatch(
          updateStateProperty(
            selectedFretboard.id,
            'chordSettings.fretboard',
            newBoard
          )
        );
      }
    };

    const getArppegioNotes = (arppegio) => {
      const formula = guitar.arppegios[arppegio]?.formula;
      const keyIndex = parseInt(selectedFretboard.keySettings.arppegio);

      if (!formula || isNaN(keyIndex)) return [];

      let currentIndex = keyIndex;
      const arppegioNotes = [guitar.notes.sharps[currentIndex]];

      formula.forEach((step) => {
        currentIndex = (currentIndex + step) % 12;
        arppegioNotes.push(guitar.notes.sharps[currentIndex]);
      });

      return arppegioNotes;
    };

    const getArppegioIntervals = (arppegio) => {
      return guitar.arppegios[arppegio]?.intervals || [];
    };

    const getModeNotes = (scaleNotes, mode) => {
      return scaleNotes
        .slice(parseInt(mode))
        .concat(scaleNotes.slice(0, parseInt(mode)));
    };

    const getScaleNotes = (scale, key) => {
      if (scale === '' || isNaN(key)) return [];
      const { formula } = guitar.scales[scale];
      const keyIndex = parseInt(key);

      let currentNoteIndex = keyIndex;
      const scaleNotes = [guitar.notes.sharps[currentNoteIndex]];

      formula.forEach((step) => {
        currentNoteIndex = (currentNoteIndex + step) % 12;
        scaleNotes.push(guitar.notes.sharps[currentNoteIndex]);
      });

      return scaleNotes.filter((note) => note !== undefined);
    };

    const getScaleIntervals = (scale) => {
      return guitar.scales[scale]?.intervals || [];
    };

    const handleChoiceChange = (newChoice) => {
      dispatch(
        updateStateProperty(selectedFretboard.id, 'generalSettings.choice', newChoice)
      );
    };

    const createNewBoardDisplay = () => {
      const currentPath = props.history.location.pathname;
      // 12 frets ONLY
      const newBoard = newFretboard(
        6,
        12,
        [4, 7, 2, 9, 11, 4],
        [4, 3, 3, 3, 2, 2],
        currentPath,
        'scale'
      );
      dispatch(addFretboard(newBoard));
    };

    const cleanFretboard = () => {
      if (selectedFretboardIndex === -1) return;

      const choice = selectedFretboard.generalSettings.choice;
      const newBoard = newLayout(
        selectedFretboard.generalSettings.nostrs,
        selectedFretboard.generalSettings.nofrets,
        selectedFretboard.generalSettings.tuning
      );

      dispatch(updateStateProperty(selectedFretboard.id, `keySettings.${choice}`, ''));
      dispatch(updateStateProperty(selectedFretboard.id, `${choice}Settings.${choice}`, ''));

      if (choice === 'chord') {
        dispatch(updateStateProperty(selectedFretboard.id, `${choice}Settings.shape`, ''));
      }

      dispatch(updateStateProperty(selectedFretboard.id, `${choice}Settings.${choice}`, ''));
      dispatch(
        updateStateProperty(
          selectedFretboard.id,
          `${selectedFretboard.generalSettings.choice}Settings.fretboard`,
          newBoard
        )
      );
    };

    const getPropertiesUpdate = (element, value, newElement) => {
      switch (element) {
        case 'key':
          return [{ property: `keySettings.${selectedFretboard.generalSettings.choice}`, value }];

        case 'scale':
          return [{ property: 'scaleSettings.scale', value: guitar.scales[value] ? value : '' }];

        case 'mode':
          return [
            { property: 'modeSettings.mode', value: value >= 0 && value <= 6 ? value : '' }
          ];

        case 'arppegio':
          return [
            { property: 'arppegioSettings.arppegio', value: guitar.arppegios[value] ? value : '' }
          ];

        case 'chord':
          return [
            { property: 'chordSettings.chord', value: guitar.arppegios[value] ? value : '' }
          ];

        case 'shape':
          return [
            { property: `${selectedFretboard.generalSettings.choice}Settings.shape`, value: value || '' }
          ];

        case 'fret':
          return [
            { property: 'chordSettings.fret', value: value > 0 && value < 22 ? value : '' }
          ];

        case 'notesDisplay':
          return [{ property: 'generalSettings.notesDisplay', value: newElement }];

        case 'tuning':
          return [
            {
              property: 'generalSettings.tuning',
              value: value.split('-').map((num) => parseInt(num, 10)) || defaultTuning
            }
          ];

        case 'nostrs': {
          const newBoardForStr = newLayout(
            parseInt(value),
            selectedFretboard.generalSettings.nofrets,
            selectedFretboard.generalSettings.tuning
          );

          let baseOctaves = selectedFretboard.generalSettings.baseOctaves;
          if (parseInt(value) === 6) {
            baseOctaves = [...selectedFretboard.generalSettings.baseOctaves, 2];
          } else if (parseInt(value) === 7) {
            baseOctaves = [...selectedFretboard.generalSettings.baseOctaves, 1];
          }

          return [
            { property: 'generalSettings.baseOctaves', value: baseOctaves },
            { property: 'generalSettings.nostrs', value: parseInt(value) || 6 },
            { property: 'scaleSettings.fretboard', value: newBoardForStr },
            { property: 'chordSettings.fretboard', value: newBoardForStr },
            { property: 'modeSettings.fretboard', value: newBoardForStr },
            { property: 'arppegioSettings.fretboard', value: newBoardForStr }
          ];
        }

        case 'nofrets': {
          const newBoardForFrets = newLayout(
            selectedFretboard.generalSettings.nostrs,
            parseInt(value),
            selectedFretboard.generalSettings.tuning
          );

          return [
            // default to 12 frets
            { property: 'generalSettings.nofrets', value: parseInt(value) || 12 },
            { property: 'scaleSettings.fretboard', value: newBoardForFrets },
            { property: 'chordSettings.fretboard', value: newBoardForFrets },
            { property: 'modeSettings.fretboard', value: newBoardForFrets },
            { property: 'arppegioSettings.fretboard', value: newBoardForFrets }
          ];
        }

        case 'arppegio':
          return [
            { property: 'arppegioSettings.arppegio', value: value },
            {
              property: `arppegioSettings.fretboard`,
              value: newLayout(
                selectedFretboard.generalSettings.nostrs,
                parseInt(value),
                selectedFretboard.generalSettings.tuning
              )
            }
          ];

        default:
          return null;
      }
    };

    const dispatchPropertiesUpdate = (updates) => {
      if (updates && updates.length > 0) {
        updates.forEach((update) => {
          dispatch(updateStateProperty(selectedFretboard.id, update.property, update.value));
        });
      }
    };

    const getNewElementValue = (value, element) => {
      return element === 'notesDisplay'
        ? !selectedFretboard.generalSettings.notesDisplay
        : value;
    };

    const onElementChange = (value, element) => {
      const newElement = getNewElementValue(value, element);
      const propertiesUpdate = getPropertiesUpdate(element, value, newElement);
      dispatchPropertiesUpdate(propertiesUpdate);
    };

    return (
      <WrappedComponent
        {...props}
        selectedFretboard={selectedFretboard}
        handleFretboardSelect={handleFretboardSelect}
        handleChoiceChange={handleChoiceChange}
        createNewBoardDisplay={createNewBoardDisplay}
        cleanFretboard={cleanFretboard}
        onElementChange={onElementChange}
        selectedFretboardIndex={selectedFretboardIndex}
        setSelectedFretboardIndex={setSelectedFretboardIndex}
        getScaleNotes={getScaleNotes}
        boards={boards}
      />
    );
  };
};

export default withFretboardState;

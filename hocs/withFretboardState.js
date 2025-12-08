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
import { useRouter } from "next/router";

const defaultTuning = [4, 11, 7, 2, 9, 4];



const withFretboardState = (WrappedComponent) => {
  return (props) => {
    const dispatch = useDispatch();
    const { boards } = props;
    const router = useRouter();

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
      const shape = selectedFretboard[choice + "Settings"].shape;
      let modalNotes = [];

      /* ---------------------------
        1. CHORDS / ARPEGGIOS / SCALES
      ---------------------------- */
      if (choice === "chord" && chordSettings.chord && shape) {
        displayChordPortion({
          key: keySettings[choice],
          chord: chordSettings.chord,
          shape
        });
        return;

      } else if (choice === "arppegio" && arppegioSettings.arppegio) {
        notes = getArppegioNotes(arppegioSettings.arppegio);
        intervals = getArppegioIntervals(arppegioSettings.arppegio);

      } else if (choice === "scale" && scaleSettings.scale) {
        notes = getScaleNotes(scaleSettings.scale, keySettings.scale);
        intervals = getScaleIntervals(scaleSettings.scale);

        if (guitar.scales[scaleSettings.scale].isModal) {
          modalNotes = getModeNotes(notes, modeSettings.mode);
        }
      }

      const fretboardClone = JSON.parse(JSON.stringify(selectedFretboard));

      const choiceKey = `${choice}Settings`;
      const choiceBoard = fretboardClone[choiceKey]?.fretboard || [];

      // fix: allow arbitrarily long fretboards (NOT wrapped)
      const fretCount = fretboardClone.generalSettings.nofrets || 12;

      /* ---------------------------
        2. CLEAN RESET OF BOARD
      ---------------------------- */
      choiceBoard.forEach((string) => {
        string.forEach((note) => {
          note.show = false;
          note.interval = undefined;
        });
      });

      /* ---------------------------
        CLAMP HELPER FOR REFERENCES
      ---------------------------- */

      /* ---------------------------
        3. SHAPED MODE
      ---------------------------- */
      if (shape !== "" && notes.length && intervals.length) {
        const shapeIndex = guitar.shapes.names.indexOf(shape);
        const rootNoteIndex = keySettings[choice];
        const page = generalSettings.page;

        let shapeIntervals = null;

        if (choice === "arppegio") {
          shapeIntervals =
            guitar.shapes.indexes[arppegioSettings.arppegio][shapeIndex];
        } else if (choice === "scale") {
          shapeIntervals =
            guitar.scales[scaleSettings.scale].indexes[shapeIndex];
        }

        choiceBoard.forEach((string, stringIndex) => {
          for (let fretIndex = rootNoteIndex; fretIndex < fretCount; fretIndex++) {
            const currentNote = getNoteFromFretboard(
              stringIndex,
              fretIndex,
              fretboardClone.generalSettings.tuning
            );

            if (!notes.includes(currentNote)) continue;

            const fretPosition = fretIndex;

            console.log("shapeIntervals.start + rootNoteIndex", [shapeIntervals.start, rootNoteIndex])
            console.log("shapeIntervals.end + rootNoteIndex", [shapeIntervals.end, rootNoteIndex])
            // convert shape start/end to absolute fret positions
            let startInterval = shapeIntervals.start + rootNoteIndex;
            let endInterval = shapeIntervals.end + rootNoteIndex;

            const row = choiceBoard[stringIndex];
            const noteData = row?.[fretIndex];
            if(fretIndex >= startInterval && fretIndex <= endInterval){
              if (!noteData) continue;
                noteData.show = true;
                noteData.current = generalSettings.notesDisplay
                  ? currentNote
                  : intervals[notes.indexOf(currentNote)];
                noteData.interval = intervals[notes.indexOf(currentNote)];
            }
            }
        });

      } else {
        /* ---------------------------
          4. NON-SHAPE MODE
        ---------------------------- */
        choiceBoard.forEach((string, stringIndex) => {
          for (let fretIndex = 0; fretIndex < fretCount; fretIndex++) {
            const currentNote = getNoteFromFretboard(
              stringIndex,
              fretIndex,
              fretboardClone.generalSettings.tuning
            );

            if (!notes.includes(currentNote)) continue;

            // clamp for references

            const row = choiceBoard[stringIndex];
            const noteData = row?.[fretIndex];
            if (!noteData) continue;

              noteData.show = true;
              noteData.current = generalSettings.notesDisplay
                ? currentNote
                : intervals[notes.indexOf(currentNote)];
              noteData.interval = intervals[notes.indexOf(currentNote)];
          }
        });
      }

      /* ---------------------------
        FINALIZE AND DISPATCH
      ---------------------------- */
      fretboardClone[choiceKey].modalNotes = modalNotes;
      fretboardClone[choiceKey].notes = notes;

      if (
        JSON.stringify(selectedFretboard[choiceKey]) !==
        JSON.stringify(fretboardClone[choiceKey])
      ) {
        dispatch(
          updateStateProperty(
            selectedFretboard.id,
            `${choiceKey}`,
            fretboardClone[choiceKey]
          )
        );
      }
    }, [
      selectedFretboard,
      selectedFretboardIndex,
      dispatch
    ]);

    const displayChordPortion = (chordObject) => {
      const { key, chord, shape } = chordObject;

      const cagedShape = guitar.arppegios[chord]?.cagedShapes[shape];
      if (!cagedShape) return;

      // --- compute real frets (0–24)
      let realFrets = cagedShape.map(fret => fret === null ? null : fret + key);
      // reverse orientation for your board (low→high to high→low)
      realFrets = realFrets.reverse();

      // build chord notes
      const { formula } = guitar.arppegios[chord];
      let currentNoteIndex = key;
      const chordNotes = [guitar.notes.sharps[currentNoteIndex]];
      formula.forEach(step => {
        currentNoteIndex = (currentNoteIndex + step) % 12;
        chordNotes.push(guitar.notes.sharps[currentNoteIndex]);
      });
      chordNotes.pop();

      const chordIntervals = guitar.arppegios[chord].intervals;

      const newBoard = JSON.parse(JSON.stringify(selectedFretboard)).chordSettings.fretboard;

      // reset board
      newBoard.forEach(string =>
        string.forEach(note => {
          note.show = false;
          note.interval = null;
        })
      );

      // display shape
      newBoard.forEach((string, stringIndex) => {
        string.forEach((note, fretIndex) => {
          const targetFret = realFrets[stringIndex];

          if (targetFret === null) return;
          if (fretIndex !== targetFret) return;

          // find note name at this fret
          const openTuningNote =
            selectedFretboard.generalSettings.tuning[stringIndex];
          const noteIndex = (openTuningNote + fretIndex) % 12;
          const noteName = guitar.notes.sharps[noteIndex];

          if (chordNotes.includes(noteName)) {
            newBoard[stringIndex][fretIndex].show = true;
            newBoard[stringIndex][fretIndex].interval =
              chordIntervals[chordNotes.indexOf(noteName)];
          }
        });
      });

      // commit update
      if (
        JSON.stringify(selectedFretboard.chordSettings.fretboard) !==
        JSON.stringify(newBoard)
      ) {
        dispatch(
          updateStateProperty(
            selectedFretboard.id,
            "chordSettings.fretboard",
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
      const newBoard = newFretboard(
        6,
        25,
        [4, 7, 2, 9, 11, 4],
        [4, 3, 3, 3, 2, 2],
        'home',
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
            { property: 'chordSettings.fret', value: value > 0 && value < 25 ? value : '' }
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

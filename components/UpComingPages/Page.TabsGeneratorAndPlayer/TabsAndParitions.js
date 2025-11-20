import React, { useState } from 'react';
import { IconButton, Button, Switch, FormControlLabel } from '@mui/material';
import { styled } from '@mui/system';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import MusicApp from './MusicApp';

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
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  overflowX: 'auto',
  maxWidth: '100vw',
  marginTop: '20px',
  marginBottom: '20px',
});

const DisplayContainer = styled('div')({
  marginTop: '20px',
  marginBottom: '20px',
  padding: '20px',
  backgroundColor: '#f0f0f0',
  borderRadius: '8px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
});


const ButtonGroup = styled('div')({
    display: 'flex',
    padding: "0 20%",
    width: '80%',
    '@media (min-width: 1024px)': {
        width: '65%',
    },
});
  

const FixedWidthButton = styled(Button)({
  width: '200px', // Fixed width for buttons
  margin: '20px'
});

const TabsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  fontFamily: 'monospace',
  marginBottom: '20px',
});

const TabString = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  whiteSpace: 'pre',
});

const NoteDisplay = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const NoteItem = styled('div')({
  display: 'flex',
  alignItems: 'center',
  padding: '8px',
  marginBottom: '4px',
  backgroundColor: '#fff',
  borderRadius: '4px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
});

const TabsAndPartitions = () => {
  const [displayMode, setDisplayMode] = useState('tabs'); // 'tabs' or 'partitions'
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [numStrings, setNumStrings] = useState(6); // Default number of strings for a guitar
  const [chordMode, setChordMode] = useState(false);
  const [stringPositions, setStringPositions] = useState(Array(numStrings).fill(0));
  const [globalPosition, setGlobalPosition] = useState(0);
  const [tabStacks, setTabStacks] = useState([{ stack: Array(numStrings).fill('-'.repeat(125)), notes: [] }]);

  const handleNoteClick = (note, stringIndex, fretIndex) => {
    let newNotes = [...selectedNotes];
    let newStringPositions = [...stringPositions];
    let newGlobalPosition = globalPosition;
    let newTabStacks = [...tabStacks];
    let currentStackIndex = newTabStacks.length - 1;
    let currentStack = newTabStacks[currentStackIndex].stack;

    if (chordMode) {
      newNotes.push({ note, stringIndex, fretIndex, position: globalPosition, stackIndex: currentStackIndex });
      newStringPositions[stringIndex] = globalPosition + 3; // Allow space for two-digit fret numbers
    } else {
      const currentPosition = newStringPositions[stringIndex];
      const notePosition = Math.max(currentPosition, globalPosition);
      newNotes.push({ note, stringIndex, fretIndex, position: notePosition, stackIndex: currentStackIndex });
      newStringPositions[stringIndex] = notePosition + 3; // Allow space for two-digit fret numbers
      newGlobalPosition = notePosition + 3; // Move global position accordingly
    }

    // Check if we need to create a new tab stack
    if (newGlobalPosition >= currentStack[0].length) {
      newTabStacks.push({ stack: Array(numStrings).fill('-'.repeat(125)), notes: [] });
      newGlobalPosition = 0;
      newStringPositions = Array(numStrings).fill(0);
      // Clear selected notes for the new stack
      newNotes = [];
    }

    newTabStacks[currentStackIndex].notes = newNotes.filter(note => note.stackIndex === currentStackIndex);

    setSelectedNotes(newNotes);
    setStringPositions(newStringPositions);
    setGlobalPosition(newGlobalPosition);
    setTabStacks(newTabStacks);
  };

  const renderTabsDisplay = () => {
    return tabStacks.map((stackObj, stackIndex) => {
      const { stack, notes } = stackObj;
      const updatedStack = stack.map((line, stringIndex) => {
        let updatedLine = line;
        notes
          .filter(note => note.position < updatedLine.length && note.stringIndex === stringIndex)
          .forEach(({ fretIndex, position }) => {
            const fretString = fretIndex.toString();
            const padding = fretString.length === 2 ? '--' : '-';
            updatedLine = `${updatedLine.slice(0, position)}${fretString}${padding}${updatedLine.slice(position + fretString.length + padding.length)}`;
          });
        return updatedLine;
      });

      return (
        <TabsContainer key={stackIndex}>
          {updatedStack.map((tab, index) => (
            <TabString key={index}>
              <span>{'eBGDAE'.charAt(index % 6)} |</span>
              <span>{tab}</span>
            </TabString>
          ))}
        </TabsContainer>
      );
    });
  };

  const renderPartitionsDisplay = () => (
    <NoteDisplay>
      {selectedNotes.map((note, index) => (
        <NoteItem key={index}>
          <MusicNoteIcon />
          <span>Note: {note.note}</span>
        </NoteItem>
      ))}
    </NoteDisplay>
  );

  return (
    <>
      <FretboardContainer>
        <ButtonGroup>
            <FormControlLabel
                control={<Switch checked={chordMode} onChange={() => setChordMode(!chordMode)} />}
                label="Chord Mode"
                style={{ alignSelf: 'center', marginBottom: '20px', width: '200px' }}
            />
            <FixedWidthButton variant={displayMode === 'tabs' ? 'contained' : 'outlined'} onClick={() => setDisplayMode('tabs')}>
                Guitar Tabs
            </FixedWidthButton>
            <FixedWidthButton variant={displayMode === 'partitions' ? 'contained' : 'outlined'} onClick={() => setDisplayMode('partitions')}>
                Partitions
            </FixedWidthButton>
        </ButtonGroup>
        <MusicApp showFretboard={true} board="generate"/>
      </FretboardContainer>
      <Root>
        {displayMode === 'tabs' ? renderTabsDisplay() : renderPartitionsDisplay()}
      </Root>
    </>
  );
};

export default TabsAndPartitions;

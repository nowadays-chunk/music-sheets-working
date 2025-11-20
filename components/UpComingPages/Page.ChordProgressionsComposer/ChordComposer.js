import React, { useState, useEffect } from 'react';
import { Grid, Typography, Card } from '@mui/material';
import { styled } from '@mui/system';
import ChordGraph from './ChordGraph';
import guitar from '../../../config/guitar';
import { KeySelector } from '../../Pages/Fretboard/FretboardControls';

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const ProgressionContainer = styled('div')({
  marginTop: '1rem',
  padding: '0.5rem',
  border: '1px solid rgba(0, 0, 0, 0.3)',
  overflowX: 'auto',
  display: 'flex',
  alignItems: 'center',
});

const initialRomanNumerals = new Map([
  [0, 'I'],
  [1, 'ii'],
  [2, 'iii'],
  [3, 'IV'],
  [4, 'V'],
  [5, 'vi'],
  [6, 'vii°'],
  [7, 'i'],
  [8, 'ii°'],
  [9, 'III'],
  [10, 'iv'],
  [11, 'v'],
  [12, 'VI'],
  [13, 'VII'],
]);

const ChordComposer = ({ selectedKey, onElementChange }) => {
  const [chordPath, setChordPath] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [chordNames, setChordNames] = useState([]);

  const handleNodeClick = (nodeId) => {
    const chosenRoman = nodeId.split('-')[0];
    const newNodes = chordNames
      .filter((numeral) => numeral !== chosenRoman)
      .map((roman, index) => ({
        id: `${roman}-${nodes.length + index}-${chordPath.join('-')}`,
        label: `${roman} - ${getChordName(roman, guitar.notes.sharps[selectedKey || 0])}`,
        group: 'roman',
        x: Math.random() * 400,
        y: Math.random() * 400,
      }));
  
    const newEdges = newNodes.map((node) => ({
      id: `edge-${nodeId}-${node.id}`,
      from: nodeId,
      to: node.id,
    }));
  
    setNodes([
      ...nodes.filter((n) => n.group !== 'roman'),
      {
        id: nodeId,
        label: `${chosenRoman} - ${getChordName(chosenRoman, guitar.notes.sharps[selectedKey || 0])}`,
        group: 'chosen',
      },
      ...newNodes,
    ]);
  
    setEdges([...edges, ...newEdges]);
  
    // Add only the chord name (not the Roman numeral) to the chordPath
    setChordPath([
      ...chordPath,
      { id: nodeId, label: getChordName(chosenRoman, guitar.notes.sharps[selectedKey || 0]) },  // Only chord name
    ]);
  };

  const getChordName = (romanNumeral, selectedKey) => {
    // const chordMap = new Map([
    //   ['I', { interval: 0, type: 'Major' }],
    //   ['ii', { interval: 2, type: 'minor' }],
    //   ['iii', { interval: 4, type: 'minor' }],
    //   ['IV', { interval: 5, type: 'Major' }],
    //   ['V', { interval: 7, type: 'Major' }],
    //   ['vi', { interval: 9, type: 'minor' }],
    //   ['vii°', { interval: 11, type: 'diminished' }],
    //   ['i', { interval: 0, type: 'minor' }],
    //   ['ii°', { interval: 2, type: 'diminished' }],
    //   ['III', { interval: 3, type: 'Major' }],
    //   ['iv', { interval: 5, type: 'minor' }],
    //   ['v', { interval: 7, type: 'minor' }],
    //   ['VI', { interval: 8, type: 'Major' }],
    //   ['VII', { interval: 10, type: 'Major' }],
    // ]);

    const chordMap = [
      { interval: 0, type: 'Major' },
      { interval: 2, type: 'minor' },
      { interval: 4, type: 'minor' },
      { interval: 5, type: 'Major' },
      { interval: 7, type: 'Major' },
      { interval: 9, type: 'minor' },
      { interval: 11, type: 'diminished' },
      { interval: 0, type: 'minor' },
      { interval: 2, type: 'diminished' },
      { interval: 3, type: 'Major' },
      { interval: 5, type: 'minor' },
      { interval: 7, type: 'minor' },
      { interval: 8, type: 'Major' },
      { interval: 10, type: 'Major' },
    ];

    const romanArray = [...initialRomanNumerals.values()];


    const chordInfo = chordMap[romanArray.indexOf(romanNumeral)]
    console.log(`Chord Info for ${romanNumeral}:`, chordInfo);

    if (!chordInfo) return '';
    const noteIndex = guitar.notes.sharps.indexOf(selectedKey);
    if (noteIndex === -1) return 'Invalid Key';

    const note = guitar.notes.sharps[noteIndex];
    const chordRootIndex = (noteIndex + chordInfo.interval) % guitar.notes.sharps.length;
    const chordRoot = guitar.notes.sharps[chordRootIndex];

    return `${chordRoot} ${chordInfo.type}`;
  };

  useEffect(() => {
    const chordNames = Array.from(initialRomanNumerals.values()).map((roman) => {
      return `${roman} - ${getChordName(roman, guitar.notes.sharps[selectedKey || 0])}`;
    });

    setChordNames(chordNames);

    const initialNodes = Array.from(initialRomanNumerals.entries()).map(([index, roman]) => ({
      id: `${roman}-${index}`,
      label: `${roman} - ${getChordName(roman, guitar.notes.sharps[selectedKey || 0])}`,
      group: 'roman',
      x: Math.random() * 400,
      y: Math.random() * 400,
    }));
    setNodes(initialNodes);
  }, [selectedKey]);

  return (
    <Root>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6">Please, choose a key to begin</Typography>
          <KeySelector choice="key" selectedKey={selectedKey || 0} onElementChange={onElementChange} />
        </Grid>
        <Grid item xs={12}>
          <ProgressionContainer>
            {chordPath.length === 0 && (
              <Typography variant="h6">Selected Chord Progression Will Appear Here...</Typography>
            )}
            {chordPath.map((chord, index) => (
              <React.Fragment key={index}>
                <Card
                  style={{
                    height: '48px',
                    backgroundColor: 'beige',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    whiteSpace: 'nowrap',
                    border: '1px solid rgba(0, 0, 0, 0.3)',
                    boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.2)',
                    padding: '0 10px',
                  }}
                >
                  [{index + 1}] {chord.label}
                </Card>
                {index < chordPath.length - 1 && (
                  <Typography variant="h6" style={{ margin: '0 10px' }}>
                    →
                  </Typography>
                )}
              </React.Fragment>
            ))}
          </ProgressionContainer>
        </Grid>
        <Grid item xs={12}>
          <ChordGraph nodesData={nodes} edgesData={edges} onNodeClick={handleNodeClick} />
        </Grid>
      </Grid>
    </Root>
  );
};

export default ChordComposer;

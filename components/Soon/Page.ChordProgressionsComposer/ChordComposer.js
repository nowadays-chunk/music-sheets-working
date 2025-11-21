import React, { useState, useEffect } from 'react';
import { FormControl, Button, Grid, Select, MenuItem, InputLabel, Card, Typography } from '@mui/material';
import { styled } from '@mui/system';
import ChordGraph from './ChordGraph';
import PropTypes from 'prop-types';
import guitar from '../../../config/guitar';
import { KeySelector } from '../../Pages/Fretboard/FretboardControls';

function isLowerCase(str) {
  return str === str.toLowerCase();
}

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const StyledFormControl = styled(FormControl)({
  width: '100%',
});

const GraphContainer = styled('div')({
  height: 400,
  width: '100%',
  border: '1px solid rgba(0, 0, 0, 0.3)',
});

const ProgressionContainer = styled('div')({
  marginTop: '1rem',
  padding: '0.5rem',
  border: '1px solid rgba(0, 0, 0, 0.3)',
  overflowX: 'auto',
  display: 'flex',
  alignItems: 'center',
});

const initialRomanNumerals = [
  'I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°',
  'i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII',
];

const ChordComposer = ({ addChordToProgression, saveProgression, playProgression, selectedArppegio, onElementChange, selectedKey }) => {
  const [chordPath, setChordPath] = useState([]);
  const [chordProgression, setChordProgression] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [showInitial, setShowInitial] = useState(true);
  const [chordNames, setChordNames] = useState([]); // To store the dynamically generated chord names

  const handleNodeClick = (nodeId) => {
    const chosenRoman = nodeId.split('-')[0];

    // Generate new nodes excluding the chosen one
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
      { id: nodeId, label: `${chosenRoman} - ${getChordName(chosenRoman, guitar.notes.sharps[selectedKey || 0])}`, group: 'chosen' },
      ...newNodes,
    ]);
    
    setEdges([...edges, ...newEdges]);
    setChordPath([...chordPath, { id: nodeId, label: `${chosenRoman} - ${getChordName(chosenRoman, guitar.notes.sharps[selectedKey || 0])}` }]);
    setShowInitial(false);
  };

  const handleSelectChange = (event) => {
    setChordProgression(event.target.value);
  };

  const getChordName = (romanNumeral, selectedKey) => {

    const rootNote = selectedKey; // Find root note
    let chordName = '';

    switch (romanNumeral) {
      case 'I':
        chordName = `${guitar.notes.sharps[(guitar.notes.sharps.indexOf(rootNote)) % 12]} Major`;
        break;
      case 'ii':
        chordName = `${guitar.notes.sharps[(guitar.notes.sharps.indexOf(rootNote) + 2) % 12]} minor`;
        break;
      case 'iii':
        chordName = `${guitar.notes.sharps[(guitar.notes.sharps.indexOf(rootNote) + 4) % 12]} minor`;
        break;
      case 'IV':
        chordName = `${guitar.notes.sharps[(guitar.notes.sharps.indexOf(rootNote) + 5) % 12]} Major`;
        break;
      case 'V':
        chordName = `${guitar.notes.sharps[(guitar.notes.sharps.indexOf(rootNote) + 7) % 12]} Major`;
        break;
      case 'vi':
        chordName = `${guitar.notes.sharps[(guitar.notes.sharps.indexOf(rootNote) + 9) % 12]} minor`;
        break;
      case 'vii°':
        chordName = `${guitar.notes.sharps[(guitar.notes.sharps.indexOf(rootNote) + 11) % 12]} diminished`;
        break;
      case 'i':
        chordName = `${guitar.notes.sharps[(guitar.notes.sharps.indexOf(rootNote) + 9) % 12]} minor`;
        break;
      case 'ii°':
        chordName = `${guitar.notes.sharps[(guitar.notes.sharps.indexOf(rootNote) + 11) % 12]} diminished`;
        break;
      case 'III':
        chordName = `${guitar.notes.sharps[(guitar.notes.sharps.indexOf(rootNote) + 12) % 12]} Major`;
        break;
      case 'iv':
        chordName = `${guitar.notes.sharps[(guitar.notes.sharps.indexOf(rootNote) + 2) % 12]} minor`;
        break;
      case 'v':
        chordName = `${guitar.notes.sharps[(guitar.notes.sharps.indexOf(rootNote) + 4) % 12]} minor`;
        break;
      case 'VI':
        chordName = `${guitar.notes.sharps[(guitar.notes.sharps.indexOf(rootNote) + 5) % 12]} Major`;
        break;
      case 'VII':
        chordName = `${guitar.notes.sharps[(guitar.notes.sharps.indexOf(rootNote) + 7) % 12]} Major`;
        break;
    }

    return chordName;
  };

  const initialNodes = initialRomanNumerals.map((roman, index) => ({
    id: `${roman}-${index}`,
    label: `${roman} - ${getChordName(roman, guitar.notes.sharps[selectedKey || 0])}`,
    group: 'roman',
    x: Math.random() * 400, 
    y: Math.random() * 400,
  }));

  // Arrays to hold major and minor arpeggios
  const majorArpeggios = [];
  const minorArpeggios = [];

  // Loop through the arppegios object
  for (const key in guitar.arppegios) {
    const arp = guitar.arppegios[key];

    // Check if degree is Major or Minor and push the name to the corresponding array
    if (arp.degree === "Major") {
      majorArpeggios.push(arp.name);
    } else if (arp.degree === "Minor") {
      minorArpeggios.push(arp.name);
    }
  }

  useEffect(() => {
   const chordNames = initialRomanNumerals.map(roman => {
      return `${roman} - ${getChordName(roman, guitar.notes.sharps[selectedKey])}`;
    });
    // Dynamically generate tupdateBoardshe chord names based on the selected key
    setChordNames(chordNames);
  }, [selectedKey,]);

  return (
    <Root>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6">Please, chose a key to begin</Typography>
          <KeySelector choice="key" selectedKey={selectedKey || 0} onElementChange={onElementChange} />
        </Grid>
        <Grid item xs={12}>
          <ProgressionContainer>
            {chordPath.length === 0 && (
              <Typography variant="h6">Selected Chord Progression Should Appear Here...</Typography>
            )}
            {chordPath.length > 0 && chordPath.map((chord, index) => (
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
                    boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Typography variant="h6" sx={{ m: 4 }}>
                    {chord.label}
                  </Typography>
                  <Select
                    labelId="arppegio-name-label"
                    id="arppegio-name-select"
                    fullWidth
                    value={selectedArppegio}
                    onChange={(e) => onElementChange(e.target.value, 'choice')}
                    displayEmpty
                  >
                    {isLowerCase(chord.label[0]) && 
                      minorArpeggios.map((arppegioName, index) => (
                        <MenuItem key={index} value={arppegioName}>
                          {arppegioName}
                        </MenuItem>
                    ))}

                    {!isLowerCase(chord.label[0]) &&
                      majorArpeggios.map((arppegioName, index) => (
                        <MenuItem key={index} value={arppegioName}>
                          {arppegioName}
                        </MenuItem>
                    ))}
                  </Select>
                </Card>
                {index < chordPath.length - 1 && (
                  <span style={{ margin: '0 0.5rem', fontSize: '1.5rem' }}>→</span>
                )}
              </React.Fragment>
            ))}
          </ProgressionContainer>
        </Grid>
        <Grid item xs={12}>
          <StyledFormControl>
            <InputLabel id="select-roman-label">Selected Roman Numeral</InputLabel>
            <Select
              labelId="select-roman-label"
              value={chordNames[0] || ''}
              onChange={handleSelectChange}
              sx={{ border: "none" }}
            >
              {chordNames.length > 0 && chordNames.map((chord, index) => (
                <MenuItem key={index} value={chord}>
                  {chord}
                </MenuItem>
              ))}
            </Select>
          </StyledFormControl>
        </Grid>
      </Grid>

      <GraphContainer>
        <ChordGraph
          nodesData={showInitial ? initialNodes : nodes}
          edgesData={edges}
          onNodeClick={handleNodeClick}
        />
      </GraphContainer>

      <Grid container spacing={2} style={{ marginTop: '1rem' }}>
        <Grid item xs={12} style={{ textAlign: 'center' }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => saveProgression(chordProgression)}
          >
            Save Progression
          </Button>
        </Grid>
        <Grid item xs={12} style={{ textAlign: 'center' }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => playProgression(chordProgression)}
          >
            Play Progression
          </Button>
        </Grid>
      </Grid>
    </Root>
  );
};

ChordComposer.propTypes = {
  addChordToProgression: PropTypes.func.isRequired,
  saveProgression: PropTypes.func.isRequired,
  playProgression: PropTypes.func.isRequired,
  selectedArppegio: PropTypes.string,
  onElementChange: PropTypes.func.isRequired,
  selectedKey: PropTypes.number.isRequired,
};

export default ChordComposer;

import React from 'react';
import { Button, Select, MenuItem, FormControl, InputLabel, Grid } from '@mui/material';
import guitar from '../../../config/guitar.js';
import PropTypes from 'prop-types';
import { styled} from '@mui/system';

const ChoiceButton = styled(Button)({
  margin: 10,
});

const FullWidthButton = styled(Button)({
  width: '100%',
});

const SelectContainer = styled(FormControl)({
  width: '100%', // For mobile screens
});

const ChordSelect = styled(FormControl)({
  width: '50%', // 50% width for both mobile and desktop screens
});

const ButtonGroup = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  gap: '8px',
});

const FretboardControls = ({
  choice,
  handleChoiceChange,
  selectedKey,
  onElementChange,
  scaleModes,
  arppegiosNames,
  onCleanFretboard,
  selectedMode,
  selectedScale,
  selectedChord,
  selectedArppegio,
  selectedFret,
  selectedShape,
  addToProgression,
  saveProgression,
  playProgression,
  progression,
  playSelectedNotes,
}) => {
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const handleButtonClick = (newChoice) => {
    handleChoiceChange(newChoice);
  };

  return (
      <footer>
        <ButtonGroup>
          <ChoiceButton
            size="small"
            variant={choice === 'scale' ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => handleButtonClick('scale')}
          >
            Scales
          </ChoiceButton>
          <ChoiceButton
            size="small"
            variant={choice === 'chord' ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => handleButtonClick('chord')}
          >
            Chords
          </ChoiceButton>
          <ChoiceButton
            size="small"
            variant={choice === 'arppegio' ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => handleButtonClick('arppegio')}
          >
            Arpeggios
          </ChoiceButton>
        </ButtonGroup>

        <Grid container spacing={2}>
          {choice === 'scale' && (
            <>
              <Grid item xs={12}>
                <KeySelector choice={choice} selectedKey={selectedKey} onElementChange={onElementChange} />
              </Grid>
              <Grid item xs={12}>
                <SelectContainer>
                  <InputLabel id="scale-name-label">Choose Scale</InputLabel>
                  <Select
                    labelId="scale-name-label"
                    id="scale-name-select"
                    value={selectedScale}
                    onChange={(e) => onElementChange(e.target.value, 'scale')}
                    displayEmpty
                  >
                    {Object.keys(guitar.scales).map((scaleName, index) => (
                      <MenuItem key={index} value={scaleName}>{capitalize(scaleName)}</MenuItem>
                    ))}
                  </Select>
                </SelectContainer>
              </Grid>
              {scaleModes.length > 0 && (
                <Grid item xs={12}>
                  <SelectContainer>
                    <InputLabel id="scale-mode-label">Choose Mode</InputLabel>
                    <Select
                      labelId="scale-mode-label"
                      id="scale-mode-select"
                      value={selectedMode}
                      onChange={(e) => onElementChange(e.target.value, 'mode')}
                      displayEmpty
                    >
                      {scaleModes.map((mode, index) => (
                        <MenuItem key={index} value={index}>{mode.name}</MenuItem>
                      ))}
                    </Select>
                  </SelectContainer>
                </Grid>
              )}
            </>
          )}

          {choice === 'chord' && (
            <>
              <Grid item xs={12}>
                <KeySelector choice={choice} selectedKey={selectedKey} onElementChange={onElementChange} />
              </Grid>
              <Grid item xs={12}>
                <SelectContainer>
                  <InputLabel id="chord-name-label">Choose Chord</InputLabel>
                  <Select
                    labelId="chord-name-label"
                    id="chord-name-select"
                    value={selectedChord}
                    onChange={(e) => onElementChange(e.target.value, 'chord')}
                    displayEmpty
                  >
                    {Object.keys(guitar.arppegios).map((chordName, index) => (
                      <MenuItem key={index} value={chordName}>{chordName}</MenuItem>
                    ))}
                  </Select>
                </SelectContainer>
              </Grid>
              <Grid item xs={12}>
                <SelectContainer>
                  <InputLabel id="fret-label">Choose Fret</InputLabel>
                  <Select
                    labelId="fret-label"
                    id="fret-select"
                    value={selectedFret}
                    onChange={(e) => onElementChange(e.target.value, 'fret')}
                    displayEmpty
                  >
                    {Array.from({ length: guitar.numberOfFrets }, (_, i) => i + 1).map((fretNumber, index) => (
                      <MenuItem key={index} value={fretNumber}>{fretNumber}</MenuItem>
                    ))}
                  </Select>
                </SelectContainer>
              </Grid>
            </>
          )}

          {choice === 'arppegio' && (
            <>
              <Grid item xs={12}>
                <KeySelector choice={choice} selectedKey={selectedKey} onElementChange={onElementChange} />
              </Grid>
              <Grid item xs={12}>
                <SelectContainer>
                  <InputLabel id="arppegio-name-label">Choose Arpeggio</InputLabel>
                  <Select
                    labelId="arppegio-name-label"
                    id="arppegio-name-select"
                    value={selectedArppegio}
                    onChange={(e) => onElementChange(e.target.value, 'arppegio')}
                    displayEmpty
                  >
                    {arppegiosNames.map((arppegioName, index) => (
                      <MenuItem key={index} value={arppegioName}>{arppegioName}</MenuItem>
                    ))}
                  </Select>
                </SelectContainer>
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <SelectContainer>
              <InputLabel id="shape-label">Choose Shape</InputLabel>
              <Select
                labelId="shape-label"
                id="shape-select"
                value={selectedShape}
                onChange={(e) => onElementChange(e.target.value, 'shape')}
                displayEmpty
              >
                {guitar.shapes.names.map((shapeName, index) => (
                  <MenuItem key={index} value={shapeName}>{shapeName}</MenuItem>
                ))}
              </Select>
            </SelectContainer>
          </Grid>
          <Grid item xs={6}>
            <FullWidthButton
              variant="contained"
              color="primary"
              size="medium"
              onClick={onCleanFretboard}
            >
              Clean
            </FullWidthButton>
          </Grid>
          <Grid item xs={6}>
            <FullWidthButton
              variant="contained"
              color="secondary"
              onClick={saveProgression}
              disabled={progression && progression.length === 0}
            >
              Save
            </FullWidthButton>
          </Grid>
          <Grid item xs={6}>
            <FullWidthButton
              onClick={playSelectedNotes}
              variant="contained"
              color="primary"
            >
              Play Sound
            </FullWidthButton>
          </Grid>
        </Grid>
      </footer>
  );
};

export const KeySelector = ({ choice, selectedKey, onElementChange }) => {
  return (
    choice && (
      <SelectContainer>
        <InputLabel id="key-signature-label">Choose Key</InputLabel>
        <Select
          labelId="key-signature-label"
          id="key-signature-select"
          value={selectedKey} // Ensure default value
          onChange={(e) => onElementChange(e.target.value, 'key')}
          displayEmpty
        >
          {guitar.notes.sharps.map((key, index) => (
            <MenuItem key={index} value={index}>{key}</MenuItem>
          ))}
        </Select>
      </SelectContainer>
    )
  );
};

FretboardControls.propTypes = {
  playSelectedNotes: PropTypes.func.isRequired,
  handleChoiceChange: PropTypes.func.isRequired,
  scaleModes: PropTypes.array.isRequired,
  arppegiosNames: PropTypes.array.isRequired,
  choice: PropTypes.string.isRequired,
  onCleanFretboard: PropTypes.func.isRequired,
  selectedKey: PropTypes.any,
  onCopyLink: PropTypes.func.isRequired,
  selectedMode: PropTypes.any,
  selectedScale: PropTypes.string,
  selectedChord: PropTypes.string,
  selectedShape: PropTypes.string,
  selectedArppegio: PropTypes.string,
  selectedFret: PropTypes.string,
  addToProgression: PropTypes.func,
  saveProgression: PropTypes.func.isRequired,
  playProgression: PropTypes.func.isRequired,
  progression: PropTypes.array,
  onElementChange: PropTypes.func.isRequired,
};

export default FretboardControls;

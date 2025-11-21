import React from 'react';
import { Button, Select, MenuItem, FormControl, InputLabel, Grid } from '@mui/material';
import guitar from '../../../config/guitar.js';
import PropTypes from 'prop-types';
import { styled } from '@mui/system';

const ChoiceButton = styled(Button)({
  margin: 10,
});

const FullWidthButton = styled(Button)({
  width: '100%',
});

const SelectContainer = styled(FormControl)({
  width: '100%',
});

const ChordSelect = styled(FormControl)({
  width: '50%',
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

  const slugSharp = (s) => (s || '').replace('#', 'sharp');

  const buildReferencePath = () => {
    const keyName = guitar.notes.sharps[selectedKey];
    if (!keyName) return null;

    const keySlug = slugSharp(keyName);

    if (choice === 'chord') {
      if (!selectedChord) return null;
      const chordSlug = slugSharp(selectedChord);
      return `/references/chords/${keySlug}/${chordSlug}`;
    }

    if (choice === 'arppegio') {
      if (!selectedArppegio) return null;
      const arpSlug = slugSharp(selectedArppegio);
      return `/references/arppegios/${keySlug}/${arpSlug}`;
    }

    if (choice === 'scale') {
      if (!selectedScale) return null;
      const scaleKey = selectedScale;

      if (guitar.scales[selectedScale]?.isModal) {
        const modeIndex = parseInt(selectedMode, 10);
        const modeName = scaleModes?.[modeIndex]?.name;
        if (!modeName) return null;

        const modeSlug = decodeURIComponent(
          modeName.toLowerCase().replace(/\s+/g, '-')
        ).replace('#', 'sharp');

        return `/references/scales/${keySlug}/${scaleKey}/modal/${modeSlug}`;
      }

      return `/references/scales/${keySlug}/${scaleKey}/single`;
    }

    return null;
  };

  const printUrl = (url) => {
    const w = window.open(url, '_blank', 'noopener,noreferrer');
    if (!w) return;

    const tryPrint = () => {
      try {
        w.focus();
        w.print();
      } catch (e) {
        // If print fails (blocked), tab is still open for manual printing
        console.warn('Auto-print failed:', e);
      }
    };

    // Best-effort auto print when loaded
    w.onload = () => setTimeout(tryPrint, 300);

    // Fallback if onload doesn't fire for some reason
    setTimeout(tryPrint, 1500);
  };

  const handlePrintTwoPages = () => {
    const refPath = buildReferencePath();
    if (!refPath) return;

    const origin = window.location.origin;
    const refUrl = origin + refPath;
    const spreadUrl = origin + refPath.replace('/references/', '/spreading/');

    printUrl(refUrl);
    printUrl(spreadUrl);
  };

  const canPrint =
    !!buildReferencePath(); // disables button until selection is complete

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
                    <MenuItem key={index} value={scaleName}>
                      {capitalize(scaleName)}
                    </MenuItem>
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
                      <MenuItem key={index} value={index}>
                        {mode.name}
                      </MenuItem>
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
                    <MenuItem key={index} value={chordName}>
                      {chordName}
                    </MenuItem>
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
                    <MenuItem key={index} value={fretNumber}>
                      {fretNumber}
                    </MenuItem>
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
                    <MenuItem key={index} value={arppegioName}>
                      {arppegioName}
                    </MenuItem>
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
                <MenuItem key={index} value={shapeName}>
                  {shapeName}
                </MenuItem>
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

        {/* ✅ NEW PRINT BUTTON */}
        <Grid item xs={6}>
          <FullWidthButton
            onClick={handlePrintTwoPages}
            variant="contained"
            color="success"
            disabled={!canPrint}
          >
            Print (Refs + Spread)
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
          value={selectedKey}
          onChange={(e) => onElementChange(e.target.value, 'key')}
          displayEmpty
        >
          {guitar.notes.sharps.map((key, index) => (
            <MenuItem key={index} value={index}>
              {key}
            </MenuItem>
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

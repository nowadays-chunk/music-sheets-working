import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@mui/material';
import { styled } from '@mui/system';

const ProgressionContainer = styled('div')({
});

const ChordDisplay = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

const ChordButton = styled(Button)({
});

const Progressor = ({ progression, playProgression }) => {
  const handlePlay = () => {
    playProgression(progression);
  };

  return (
      <ProgressionContainer>
        <ChordDisplay>
          {progression.map((chord, index) => (
            <ChordButton key={index}>
              {chord.label}
            </ChordButton>
          ))}
        </ChordDisplay>
        <Button variant="contained" color="primary" onClick={handlePlay}>
          Play Progression
        </Button>
      </ProgressionContainer>
  );
};

Progressor.propTypes = {
  progression: PropTypes.array.isRequired,
  setProgression: PropTypes.func.isRequired,
  playProgression: PropTypes.func.isRequired,
  setProgressionKey: PropTypes.func.isRequired,
  selectedKey: PropTypes.string,
  getScaleNotes: PropTypes.func.isRequired,
};

export default Progressor;


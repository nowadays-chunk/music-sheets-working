import React, { useState } from 'react';
import { Button, Card, CardContent, Typography, Grid } from '@mui/material';
import { styled } from '@mui/system';
import { keys, mostCommonSongs } from '../../../config/mostCommonSongs';
import guitar from '../../../config/guitar';

function generateRandomCagedSystem() {
  const systems = ['C', 'A', 'G', 'E', 'D'];
  return systems[Math.floor(Math.random() * systems.length)];
}

const chordMap = {
  "I": {
    index: 0,
    chord: "M",
    caged: generateRandomCagedSystem(),
  },
  "i": {
    index: 0,
    chord: "m",
    caged: generateRandomCagedSystem(),
  },
  "ii": {
    index: 1,
    chord: "m",
    caged: generateRandomCagedSystem(),
  },
  "ii°": {
    index: 1,
    chord: "diminished",
    caged: generateRandomCagedSystem(),
  },
  "III": {
    index: 2,
    chord: "M",
    caged: generateRandomCagedSystem(),
  },
  "iii": {
    index: 2,
    chord: "m",
    caged: generateRandomCagedSystem(),
  },
  "IV": {
    index: 3,
    chord: "M",
    caged: generateRandomCagedSystem(),
  },
  "iv": {
    index: 3,
    chord: "m",
    caged: generateRandomCagedSystem(),
  },
  "V": {
    index: 4,
    chord: "M",
    caged: generateRandomCagedSystem(),
  },
  "V7": {
    index: 4,
    chord: "dominant 7th",
    caged: generateRandomCagedSystem(),
  },
  "V+": {
    index: 4,
    chord: "augmented",
    caged: generateRandomCagedSystem(),
  },
  "v": {
    index: 4,
    chord: "m",
    caged: generateRandomCagedSystem(),
  },
  "v7": {
    index: 4,
    chord: "minor 7th",
    caged: generateRandomCagedSystem(),
  },
  "VI": {
    index: 5,
    chord: "M",
    caged: generateRandomCagedSystem(),
  },
  "vi": {
    index: 5,
    chord: "m",
    caged: generateRandomCagedSystem(),
  },
  "vii°": {
    index: 6,
    chord: "diminished",
    caged: generateRandomCagedSystem(),
  },
  "viio7": {
    index: 6,
    chord: "half-diminished 7th",
    caged: generateRandomCagedSystem(),
  },
};

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
});

const ChoiceButton = styled(Button)({
  width: '100%',
  margin: '10px 0', // Added margin between buttons
});

const StyledButton = styled(Button)({
  borderRadius: '20px',
  margin: '10px', // Added margin between buttons
});

const BackButton = styled(Button)({
  margin: 20,
  borderRadius: '20px',
});

const CardsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  width: '100vw',
  margin: '10px 0', // Added margin between cards container and other elements
});

const StyledCard = styled(Card)({
  minWidth: 200,
  cursor: 'pointer',
  transition: 'transform 0.3s ease',
  margin: '10px', // Added margin between cards
  '&:hover': {
    transform: 'scale(1.05)',
  },
});

const ButtonsContainer = styled('div')({
  padding: 20,
});

const PlayProgressionButton = styled(Button)({
  margin: 20,
  borderRadius: '20px',
});

const FixedWidthContainer = styled('div')({
  maxWidth: '100%',
  overflowX: 'auto',
  width: '100vw',
  '&::-webkit-scrollbar': {
    width: '8px',
    borderRadius: '10px',
    height: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'darkgrey',
    borderRadius: '10px',
    height: '8px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: 'grey',
    height: '8px',
  },
});

const SongsSelector = ({ playProgression, getScaleNotes }) => {
  const [selectedSongIndex, setSelectedSongIndex] = useState(null);
  const [selectedKey, setSelectedKey] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [filteredSongs, setFilteredSongs] = useState(mostCommonSongs.songs);
  const [showChordProgression, setShowChordProgression] = useState(false);
  const [selectedChordProgression, setSelectedChordProgression] = useState('');

  const handlePlayProgression = () => {
    const selectedSong = filteredSongs[selectedSongIndex];
    if (selectedSong) {
      const convertedProgression = convertChordProgression(selectedSong.chords, selectedKey);
      playProgression(convertedProgression)
    }
  };

  const convertChordProgression = (progressionString, selectedKey) => {
    const keyIndex = keys.indexOf(selectedKey);

    const isMajorScale = selectedKey.includes('m') === false;
    const scaleNotes = getScaleNotes(isMajorScale ? 'major' : 'minor', keyIndex)

    return progressionString.split('-').map(chordSymbol => {
      const chordType = chordMap[chordSymbol].chord;
      const chordCaged = chordMap[chordSymbol].caged;
      const chordIndex = chordMap[chordSymbol].index;

      return {
        key: guitar.notes.sharps.indexOf(scaleNotes[chordIndex]),
        chord: chordType,
        shape: chordCaged,
      };
    });
  };

  const handleGenreFilter = (genre) => {
    setSelectedGenre(genre);
    filterSongs('genre', genre);
  };

  const handleBackButtonClick = () => {
    setShowChordProgression(false);
    setSelectedChordProgression('');
    setSelectedSongIndex(null);
  };

  const handleSongCardClick = (index) => {
    setSelectedSongIndex(index);
    const selectedSong = filteredSongs[index];
    setSelectedChordProgression(convertChordProgression(selectedSong.chords, selectedSong.key));
    setShowChordProgression(true);
  };

  const filterSongs = (filterKey, filterValue) => {
    let filtered = mostCommonSongs.songs;

    if (filterValue !== '') {
      filtered = filtered.filter(song => song[filterKey].toLowerCase().includes(filterValue.toLowerCase()));
    }

    setFilteredSongs(filtered);
    setSelectedSongIndex(null); // Reset selected song index when filter changes
  };

  function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  const uniqueGenres = Array.from(new Set(mostCommonSongs.songs.map(song => song.genre)));

  return (
      <Root>
        {showChordProgression ? (
          <>
            <Typography variant="h6">Chord Progressions:</Typography>
            <BackButton
              variant="outlined"
              color="primary"
              onClick={handleBackButtonClick}
            >
              Back
            </BackButton>
            <FixedWidthContainer>
              <PlayProgressionButton
                variant="contained"
                color="primary"
                onClick={handlePlayProgression}
              >
                Play Progression
              </PlayProgressionButton>
              <CardsContainer>
                {selectedChordProgression.map((chord, index) => (
                  <StyledCard
                    key={index}
                    onClick={() => playProgression([chord])}
                  >
                    <CardContent>
                      <Typography variant="body2">Key: {guitar.notes.sharps[chord.key]}</Typography>
                      <Typography variant="body2">Quality: {chord.chord}</Typography>
                      <Typography variant="body2">CAGED: {chord.shape}</Typography>
                    </CardContent>
                  </StyledCard>
                ))}
              </CardsContainer>
            </FixedWidthContainer>
          </>
        ) : (
          <>
            <ButtonsContainer>
              <Typography variant="h6">Genres:</Typography>
              <div>
                {uniqueGenres.map((genre, index) => (
                  <StyledButton
                    key={index}
                    variant={selectedGenre === genre ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => handleGenreFilter(genre)}
                  >
                    {genre}
                  </StyledButton>
                ))}
              </div>
            </ButtonsContainer>
            <FixedWidthContainer>
              <CardsContainer>
                {chunkArray(filteredSongs, filteredSongs.length / 10).map((chunk, rowIndex) => (
                  <div key={rowIndex}>
                    {chunk.map((song, index) => (
                      <StyledCard
                        key={index}
                        onClick={() => handleSongCardClick(index)}
                      >
                        <CardContent>
                          <Typography variant="h6">{song.title}</Typography>
                          <Typography variant="subtitle1">{song.artist}</Typography>
                          <Typography variant="body2">Key: {song.key}</Typography>
                          <Typography variant="body2">Chords: {song.chords}</Typography>
                          <Typography variant="body2">Genre: {song.genre}</Typography>
                        </CardContent>
                      </StyledCard>
                    ))}
                  </div>
                ))}
              </CardsContainer>
            </FixedWidthContainer>
          </>
        )}
      </Root>
  );
};

export default SongsSelector;

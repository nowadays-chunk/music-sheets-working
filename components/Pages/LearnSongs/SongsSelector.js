import React, { useState } from 'react';
import { Button, Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { keys, mostCommonSongs } from '../../../config/mostCommonSongs';
import guitar from '../../../config/guitar';

/* ----------------------------------------------------
   RANDOM CAGED SYSTEM
---------------------------------------------------- */
function generateRandomCagedSystem() {
  const systems = ['C', 'A', 'G', 'E', 'D'];
  return systems[Math.floor(Math.random() * systems.length)];
}

/* ----------------------------------------------------
   HELPERS
---------------------------------------------------- */

// Normalize unicode dashes + whitespace
function normalizeProgressionString(str) {
  return str
    .replace(/–/g, "-")
    .replace(/—/g, "-")
    .replace(/\s+/g, "")
    .trim();
}

// Convert flat note names to sharps if needed
function toSharpEnharmonic(note) {
  const flatToSharp = {
    "Cb": "B",
    "Db": "C#",
    "Eb": "D#",
    "Fb": "E",
    "Gb": "F#",
    "Ab": "G#",
    "Bb": "A#",
    "E#": "F",
    "B#": "C",
  };
  return flatToSharp[note] || note;
}

/* ----------------------------------------------------
   CORRECT ROMAN NUMERAL PARSER
   - Accidentals shift by semitone (NOT scale degree)
   - Keeps real chord qualities
---------------------------------------------------- */
function parseRomanNumeral(rawSymbol) {
  let symbol = rawSymbol;
  let accidentalSemitones = 0;

  // 1) Extract accidentals
  while (symbol.startsWith("b") || symbol.startsWith("#")) {
    if (symbol.startsWith("b")) accidentalSemitones -= 1;
    if (symbol.startsWith("#")) accidentalSemitones += 1;
    symbol = symbol.slice(1);
  }

  // 2) Extract roman degree
  const degreeMatch = symbol.match(
    /^(I{1,3}|IV|V|VI{0,2}|VII|i{1,3}|iv|v|vi{0,2}|vii)/  
  );
  if (!degreeMatch) return null;

  const numeral = degreeMatch[0];
  const remaining = symbol.slice(numeral.length);

  const degreeMap = { I:0, II:1, III:2, IV:3, V:4, VI:5, VII:6 };
  const degreeIndex = degreeMap[numeral.toUpperCase()];
  if (degreeIndex === undefined) return null;

  // 3) Base quality from case
  let quality = numeral === numeral.toUpperCase() ? "M" : "m";

  // 4) Quality overrides from modifiers
  const hasDim = remaining.includes("°") || remaining.includes("o") || remaining.includes("ø");
  const hasAug = remaining.includes("+");
  const has7   = remaining.includes("7");

  if (hasDim && has7) quality = "half-diminished 7th";
  else if (hasDim) quality = "diminished";
  else if (hasAug) quality = "augmented";
  else if (has7) {
    quality = (quality === "M") ? "dominant 7th" : "minor 7th";
  }

  return {
    degreeIndex,            // diatonic scale degree 0..6
    accidentalSemitones,    // chromatic shift in semitones
    quality,                // correct chord type
    shape: generateRandomCagedSystem(),
  };
}

/* ----------------------------------------------------
   STYLES
---------------------------------------------------- */

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
});

const StyledButton = styled(Button)({
  borderRadius: '20px',
  margin: '10px',
});

const BackButton = styled(Button)({
  margin: 20,
  borderRadius: '20px',
});

const SectionContainer = styled('div')({
  marginBottom: '30px',
});

const Row = styled('div')({
  display: 'flex',
  flexDirection: 'row',
});

const StyledCard = styled(Card)({
  minWidth: 180,
  cursor: 'pointer',
  margin: '10px',
  transition: 'transform 0.3s ease',
  '&:hover': { transform: 'scale(1.05)' },
});

/* ----------------------------------------------------
   MAIN COMPONENT
---------------------------------------------------- */

const SongsSelector = ({ playProgression, getScaleNotes }) => {
  const [selectedSongIndex, setSelectedSongIndex] = useState(null);
  const [selectedKey, setSelectedKey] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [filteredSongs, setFilteredSongs] = useState(mostCommonSongs.songs);
  const [showChordProgression, setShowChordProgression] = useState(false);
  const [sectionedProgression, setSectionedProgression] = useState([]);

  /* ----------------------------------------------------
     Convert Roman progression → MULTI-SECTION chords
  ---------------------------------------------------- */
  const convertChordProgression = (progressionString, selectedKey) => {
    const normalized = normalizeProgressionString(progressionString);

    const keyIndex = keys.indexOf(selectedKey.replace('m', ''));
    const isMajorKey = !selectedKey.includes('m');

    const majorScale = getScaleNotes('major', keyIndex);
    const minorScale = getScaleNotes('minor', keyIndex);

    // Sections split by "/"
    const sections = normalized.split('/');

    return sections.map(section => {
      const symbols = section.split('-').filter(Boolean);

      return symbols.map(sym => {
        const parsed = parseRomanNumeral(sym);
        if (!parsed) return null;

        // base diatonic note from scale
        const baseNoteName = isMajorKey
          ? majorScale[parsed.degreeIndex]
          : minorScale[parsed.degreeIndex];

        // convert base to sharp enharmonic if needed
        const baseSharp = toSharpEnharmonic(baseNoteName);

        let baseSemitone = guitar.notes.sharps.indexOf(baseSharp);
        if (baseSemitone < 0) {
          // safety fallback if scale gave exotic spelling
          baseSemitone = 0;
        }

        // apply chromatic accidental (± semitone)
        const finalSemitone = (baseSemitone + parsed.accidentalSemitones + 12) % 12;

        return {
          key: finalSemitone,
          chord: parsed.quality,
          shape: parsed.shape,
        };
      });
    });
  };

  /* ----------------------------------------------------
     PLAY FULL SONG = flatten all sections
  ---------------------------------------------------- */
  const handlePlayFull = () => {
    playProgression(sectionedProgression.flat().filter(Boolean));
  };

  /* ----------------------------------------------------
     Handle Song Click
  ---------------------------------------------------- */
  const handleSongCardClick = (index) => {
    const song = filteredSongs[index];
    const sections = convertChordProgression(song.chords, song.key);

    setSelectedSongIndex(index);
    setSelectedKey(song.key);
    setSectionedProgression(sections);
    setShowChordProgression(true);
  };

  /* ----------------------------------------------------
     Genre Filtering
  ---------------------------------------------------- */
  const handleGenreFilter = (genre) => {
    setSelectedGenre(genre);

    const filtered = mostCommonSongs.songs.filter(s =>
      s.genre.toLowerCase().includes(genre.toLowerCase())
    );

    setFilteredSongs(filtered);
    setSelectedSongIndex(null);
  };

  const uniqueGenres = Array.from(
    new Set(mostCommonSongs.songs.map(s => s.genre))
  );

  return (
    <Root>
      {showChordProgression ? (
        <>
          <Typography variant="h6" style={{ marginLeft: 15, marginTop: 10 }}>
            Chord Progression Sections
          </Typography>

          <BackButton
            variant="outlined"
            onClick={() => {
              setShowChordProgression(false);
              setSectionedProgression([]);
              setSelectedSongIndex(null);
            }}
          >
            Back
          </BackButton>

          <Button
            variant="contained"
            color="primary"
            onClick={handlePlayFull}
            style={{ marginLeft: 20, marginBottom: 20 }}
          >
            Play Full Progression
          </Button>

          {sectionedProgression.map((section, idx) => (
            <SectionContainer key={idx}>
              <Typography variant="subtitle1" style={{ marginLeft: 20 }}>
                Section {idx + 1}
              </Typography>

              <Row>
                {section.map((chord, i) =>
                  chord ? (
                    <StyledCard key={i} onClick={() => playProgression([chord])}>
                      <CardContent>
                        <Typography>
                          Key: {guitar.notes.sharps[chord.key]}
                        </Typography>
                        <Typography>
                          Quality: {chord.chord}
                        </Typography>
                        <Typography>
                          CAGED: {chord.shape}
                        </Typography>
                      </CardContent>
                    </StyledCard>
                  ) : null
                )}
              </Row>

              <Button
                variant="outlined"
                color="secondary"
                style={{ marginLeft: 20 }}
                onClick={() => playProgression(section.filter(Boolean))}
              >
                Play Section {idx + 1}
              </Button>
            </SectionContainer>
          ))}
        </>
      ) : (
        <>
          <Typography variant="h6" style={{ marginLeft: 20, marginTop: 20 }}>
            Genres
          </Typography>

          <div style={{ marginLeft: 20 }}>
            {uniqueGenres.map((genre, i) => (
              <StyledButton
                key={i}
                variant={selectedGenre === genre ? "contained" : "outlined"}
                onClick={() => handleGenreFilter(genre)}
              >
                {genre}
              </StyledButton>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {filteredSongs.map((song, i) => (
              <StyledCard key={i} onClick={() => handleSongCardClick(i)}>
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
        </>
      )}
    </Root>
  );
};

export default SongsSelector;

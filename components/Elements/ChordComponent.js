import React from 'react';
import MusicApp from '../Containers/MusicApp'; // Adjust the path if needed
import ArticleCard from '../Listing/ArticleCard'; // Adjust the path if needed
import { styled } from '@mui/system';
import Meta from '../Partials/Head';
import { Typography } from '@mui/material';
import { newFretboard } from '../../redux/actions.js';
import { ScoreProvider } from "@/core/editor/ScoreContext";

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const ChordComponent = ({ board, keyIndex, quality, shape, title }) => {
  return (
    <Root>
      <Meta title={title} description="Explore my complete references for musical keys, scales, modes, and arpeggios. Find detailed information and resources for all keys, sharps, scales, modes, and arpeggios to enhance your musical knowledge."></Meta>
      <Typography variant="h6">
        {title}
      </Typography>
      <ScoreProvider>

        <MusicApp
          board={board}
          keyIndex={keyIndex}
          quality={quality}
          shape={shape}
          display="chord"

          showFretboardControls={false}
          showCircleOfFifths={false}
          showFretboard={true}
          showChordComposer={false}
          showProgressor={false}
          showSongsSelector={false}
        />
        <Typography variant="h6">
          Exercice : Guess the chord without looking at the fretboard #1
        </Typography>
        <MusicApp
          board={newFretboard(6, 22, [4, 7, 2, 9, 11, 4], [4, 3, 3, 3, 2, 2], "exercise")}
          keyIndex={keyIndex}
          quality={quality}
          shape={shape}
          display="chord"

          showFretboardControls={false}
          showCircleOfFifths={false}
          showFretboard={true}
          showChordComposer={false}
          showProgressor={false}
          showSongsSelector={false}
        />
      </ScoreProvider>

    </Root>
  );
};

export default ChordComponent;

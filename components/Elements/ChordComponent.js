import React from 'react';
import MusicApp from '../Containers/MusicApp'; // Adjust the path if needed
import ArticleCard from '../Listing/ArticleCard'; // Adjust the path if needed
import { styled } from '@mui/system';
import Meta from '../Partials/Head';
import { Typography } from '@mui/material';

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const ChordComponent = ({ board, keyIndex, quality, shape, articleContent}) => {
  return (
    <Root>
      <Meta title={articleContent.title} description="Explore my complete references for musical keys, scales, modes, and arpeggios. Find detailed information and resources for all keys, sharps, scales, modes, and arpeggios to enhance your musical knowledge."></Meta>
      <Typography variant="h3">
        {articleContent.title}
      </Typography>
      <MusicApp
        board={board}
        keyIndex={keyIndex}
        quality={quality}
        shape={shape}
        display="chord"

        showFretboardControls={false}
        showCircleOfFifths={true}
        showFretboard={true}
        showChordComposer={false}
        showProgressor={false}
        showSongsSelector={false}
      />
      <ArticleCard article={articleContent}></ArticleCard>
    </Root>
  );
};

export default ChordComponent;

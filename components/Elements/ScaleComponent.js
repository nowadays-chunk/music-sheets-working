// components/ScaleComponent.js
import React from 'react';
import MusicApp from '../Containers/MusicApp'; // Adjust the path if needed
import { styled } from '@mui/system';
import ArticleCard from '../Listing/ArticleCard'; // Adjust the path if needed
import Meta from '../Partials/Head';
import { Typography } from '@mui/material';

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const ScaleComponent = ({ board, keyIndex, scale, modeIndex, shape, articleContent }) => {
  return (
    <Root>
      <Meta 
        title={articleContent.title} 
        description="Explore my complete references for musical keys, scales, modes, and arpeggios. Find detailed information and resources for all keys, sharps, scales, modes, and arpeggios to enhance your musical knowledge."></Meta>
      <Typography variant="h3">
        {articleContent.title}
      </Typography>
      <MusicApp
        display="scale"
        board={board}
        keyIndex={keyIndex}
        scale={scale}
        modeIndex={modeIndex}
        shape={shape}
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

export default ScaleComponent;

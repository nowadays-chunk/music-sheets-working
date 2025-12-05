// components/ScaleComponent.js
import React from 'react';
import MusicApp from '../../Containers/MusicApp'; // Adjust the path if needed
import { styled } from '@mui/system';
import ArticleCard from '../../Listing/ArticleCard'; // Adjust the path if needed
import Meta from '../../Partials/Head';
import { Typography } from '@mui/material';
import { ScoreProvider } from "@/core/editor/ScoreContext";

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const ChordComponent = ( props ) => {
  const { boards, title } = props;

    return (
    <Root>
      <Meta 
        title={title} 
        description="Explore my complete references for musical keys, scales, modes, and arpeggios. Find detailed information and resources for all keys, sharps, scales, modes, and arpeggios to enhance your musical knowledge."></Meta>
      <Typography variant="h6">
        {title}
      </Typography>
      <ScoreProvider>
        {
            boards.map((el, index) => {
                return <MusicApp
                        key={index}
                        display="chord"
                        board={el.board}
                        keyIndex={el.keyIndex}
                        quality={el.quality}
                        shape={el.shape}
                        
                        showFretboardControls={false}
                        showCircleOfFifths={false}
                        showFretboard={true}
                        showChordComposer={false}
                        showProgressor={false}
                        showSongsSelector={false}
                    />
            })
        }
      </ScoreProvider>
    </Root>
  );
};

export default ChordComponent;

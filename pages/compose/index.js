import React from 'react';
import MusicApp from '../../components/Containers/MusicApp';
import Meta from '../../components/Partials/Head';

const ComposeAndShare = () => {
  return (
    <div>
      <Meta 
        title="Compose And Share Music"
        description="Compose And Play Guitar Songs ON ALL KEYS, CHORDS, SHAPES, SCALES, MODES, ARPPEGIONS DERIVED FROM A COMPLETE MUSICAL LIBRARY."
      ></Meta>
      <MusicApp 
        board="compose"
        showFretboardControls={false} 
        showCircleOfFifths={true} 
        showFretboard={true} 
        showChordComposer={true} 
        showProgressor={false} />
    </div>
  );
};

export default ComposeAndShare;

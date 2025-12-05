import React from 'react';
import MusicApp from '../../components/Containers/MusicApp';
import Meta from '../../components/Partials/Head';
import AppShell from "@/ui/app/AppShell";

const ComposeAndShare = () => {
  return (
    <div>
      <Meta 
        title="Compose And Share Music"
        description="Compose And Play Guitar Songs ON ALL KEYS, CHORDS, SHAPES, SCALES, MODES, ARPPEGIONS DERIVED FROM A COMPLETE MUSICAL LIBRARY."
      ></Meta>
      <AppShell />
    </div>
  );
};

export default ComposeAndShare;

import React from 'react';
import MusicianNewsMasonry from '../../components/Pages/News/MusicianNewsMasonry';
import Meta from '../../components/Partials/Head';

const LearnSongs = () => {

  return (
    <div>
      <Meta 
        title="Musician News"
        description="Read our musician news that are coming from pre-configured XSS feeds known worldwide and learn guitar as you do it."
      ></Meta>
        <MusicianNewsMasonry></MusicianNewsMasonry>
    </div>
  );
};

export default LearnSongs;

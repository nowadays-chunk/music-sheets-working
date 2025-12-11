import React from 'react';
import MusicianNewsMasonry from '../../components/Pages/News/MusicianNewsMasonry';
import Meta from '../../components/Partials/Head';

const LearnSongs = (props) => {

  return (
    <div style={{marginTop: '100px'}}>
      <Meta 
        title="Musician News"
        description="Read our musician news that are coming from pre-configured XSS feeds known worldwide and learn guitar as you do it."
      ></Meta>
        <MusicianNewsMasonry leftDrawerOpen={props.leftDrawerOpen} leftDrawerWidth={props.leftDrawerWidth}></MusicianNewsMasonry>
    </div>
  );
};

export default LearnSongs;

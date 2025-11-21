import React from 'react';
import MusicApp from '../components/Containers/MusicApp';
import Meta from '../components/Partials/Head';
import ArticleCard from '../components/Listing/ArticleCard';

const firstPage = `# Presentation

Welcome to the **Comprehensive Reference Book for Guitar Music Sheets: Chords, Arpeggios, Modes, and Scales in All Keys and Shapes**. This book is designed to be an exhaustive resource for guitarists of all levels, offering a structured and systematic approach to mastering the intricacies of guitar music theory and technique.

## Purpose of This Book

The primary purpose of this book is to provide guitarists with a complete and organized collection of music sheets that encompass:

- **Chords**: Major, minor, augmented, diminished, suspended, and extended chords in all keys.
- **Arpeggios**: Essential arpeggio patterns for each chord type, facilitating melodic and harmonic playing.
- **Modes**: The seven modes derived from the major scale, along with modes derived from other scales such as harmonic minor and melodic minor.
- **Scales**: Major, minor (natural, harmonic, and melodic), pentatonic, blues, and exotic scales in all keys and positions.

Whether you are a beginner seeking to build a solid foundation or an advanced player aiming to refine your skills and expand your repertoire, this book serves as an invaluable tool to enhance your musical journey.

## How to Use This Book

### Organization

The book is structured into four main sections:

1. **Chords**: Detailed charts for all chord types across all keys, with multiple voicings and positions.
2. **Arpeggios**: Comprehensive arpeggio patterns corresponding to each chord, enabling fluid transitions and improvisation.
3. **Modes**: In-depth coverage of modes, including fingerings, applications, and contextual usage.
4. **Scales**: Extensive scale diagrams for a variety of scales, with emphasis on finger positioning and tonal characteristics.

Each section is meticulously organized to allow for easy reference and progressive learning.`;

const CoverOne = () => {
  return (
    <div>
      <ArticleCard article={{
          content: firstPage
      }}></ArticleCard>
    </div>
  );
};

const PlayAndVisualize = () => {
  return (
    <div>
        <Meta 
          title="Play And Visualize"
          description="Play And Visualize Chords, Scales And Arppegios In A Complete Reference Of Guitar Music Sheets."></Meta>
        <MusicApp 
            board="home"
            showFretboardControls={true} 
            showCircleOfFifths={true} 
            showFretboard={true} 
            showChordComposer={false} 
            showProgressor={false} 
            showSongsSelector={false} />
      </div>
  );
};

export default PlayAndVisualize;

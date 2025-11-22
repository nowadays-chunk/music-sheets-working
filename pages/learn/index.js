import React from 'react';
import MusicApp from '../../components/Containers/MusicApp';
import Meta from '../../components/Partials/Head';
import ArticleCard from '../../components/Listing/ArticleCard';

const secondPage = `
### Practice Tips

To get the most out of this  book, consider the following practice tips:

1. **Consistency**: Practice regularly. Dedicate a specific amount of time each day to work on different sections of the book. Consistency is key to building muscle memory and understanding.

2. **Slow and Steady**: Start slow. When learning new chords, arpeggios, modes, or scales, begin at a slow tempo. Focus on accuracy and clarity before increasing speed.

3. **Visualization**: Visualize the shapes and patterns on the fretboard. Familiarize yourself with how different chords, arpeggios, modes, and scales look and feel under your fingers.

4. **Application**: Apply what you learn. Incorporate new chords, arpeggios, modes, and scales into your playing. Use them in improvisation, composition, and while learning songs.

5. **Variation**: Practice in different keys and positions. This will help you become comfortable navigating the entire fretboard and understanding the relationships between different notes and shapes.

6. **Ear Training**: Develop your ear. Listen to how different chords, arpeggios, modes, and scales sound. Practice playing by ear and identifying the sounds you hear.

7. **Jam Sessions**: Play with others. Join jam sessions, bands, or ensembles. Playing with other musicians will challenge you and help you apply your knowledge in a musical context.

8. **Recording**: Record your practice sessions. Listening back to your recordings can provide insights into areas that need improvement and track your progress over time.

## Final Thoughts

Embarking on the journey to master guitar music theory and technique is a rewarding endeavor that offers endless possibilities for creativity and expression. This book is your companion on this journey, providing the resources and guidance you need to achieve your musical goals. Remember, progress takes time, patience, and dedication. Enjoy the process, celebrate your milestones, and keep pushing your boundaries.

Happy playing!`;

const CoverTwo = () => {
  return (
    <div>
      <ArticleCard article={{
          content: secondPage
      }}></ArticleCard>
    </div>
  );
};

const LearnSongs = () => {

  return (
    <div>
      <Meta 
        title="Learn Songs"
        description="Learn Songs Using Interactive Musical Components Like The Circle Of Fifths, Visual Colored Fretboard And A Chord Progressions Visualizer And Mapper"
      ></Meta>
      <MusicApp 
        board="learn"
        showFretboardControls={false} 
        showCircleOfFifths={false} 
        showFretboard={true} 
        showChordComposer={false} 
        showProgressor={false} 
        showSongsSelector={true} />
    </div>
  );
};

export default LearnSongs;

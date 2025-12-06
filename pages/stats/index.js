import guitar from "@/config/guitar";
import { processFretboard } from "@/config/fretboardProcessor";

import Stats from "@/components/Pages/Stats/Stats";

// ------------------------------------------------------------
// SAFELY SERIALIZE ALL OBJECTS (undefined → null)
// ------------------------------------------------------------
function safeJSON(obj) {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      value === undefined ? null : value
    )
  );
}

// ------------------------------------------------------------
// STATIC GENERATOR
// ------------------------------------------------------------
export async function getStaticProps() {
  const keys = guitar.notes.sharps.map((_, i) => i); // 0–11
  const shapes = guitar.shapes.names;               // ["C","A","G","E","D"]

  const chordNames = Object.keys(guitar.arppegios);
  const arpNames = Object.keys(guitar.arppegios);
  const scaleNames = Object.keys(guitar.scales);

  let chords = [];
  let arpeggios = [];
  let scales = [];

  // ----------------------------------------------------------
  //  CHORDS (key × chordName × shape)
  // ----------------------------------------------------------
  keys.forEach(keyIndex => {
    chordNames.forEach(chordName => {
      shapes.forEach(shape => {
        const fb = processFretboard({
          keyIndex,
          type: "chord",
          chordName,
          shape
        });

        chords.push(
          safeJSON({
            keyIndex,
            chord: chordName,
            shape,
            fretboard: fb
          })
        );
      });
    });
  });

  // ----------------------------------------------------------
  //  ARPEGGIOS (key × arpName × shape)
  // ----------------------------------------------------------
  keys.forEach(keyIndex => {
    arpNames.forEach(arpName => {
      shapes.forEach(shape => {
        const fb = processFretboard({
          keyIndex,
          type: "arppegio",
          arpName,
          shape
        });

        arpeggios.push(
          safeJSON({
            keyIndex,
            arppegio: arpName,
            shape,
            fretboard: fb
          })
        );
      });
    });
  });

  // ----------------------------------------------------------
  //  SCALES (modal & non-modal × shapes × key)
  // ----------------------------------------------------------
  keys.forEach(keyIndex => {
    scaleNames.forEach(scaleName => {
      const scale = guitar.scales[scaleName];

      // ---------- MODAL SCALES ----------
      if (scale.isModal && scale.modes) {
        scale.modes.forEach((mode, modeIndex) => {
          shapes.forEach(shape => {
            const fb = processFretboard({
              keyIndex,
              type: "scale",
              scaleName,
              shape,
              modeIndex
            });

            scales.push(
              safeJSON({
                keyIndex,
                scale: scaleName,
                mode: modeIndex,
                shape,
                fretboard: fb
              })
            );
          });
        });
      }

      // ---------- NON-MODAL ----------
      else {
        shapes.forEach(shape => {
          const fb = processFretboard({
            keyIndex,
            type: "scale",
            scaleName,
            shape
          });

          scales.push(
            safeJSON({
              keyIndex,
              scale: scaleName,
              mode: null,
              shape,
              fretboard: fb
            })
          );
        });
      }
    });
  });

  // ----------------------------------------------------------
  // RETURN ALL DATASETS TO Stats PAGE
  // ----------------------------------------------------------
  return {
    props: {
      chords,
      arpeggios,
      scales
    }
  };
}

export default Stats;
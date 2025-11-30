export const keys = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

export const mostCommonSongs = {
  songs: [
    {
      title: "Autumn Leaves",
      artist: "Joseph Kosma",
      key: "Gm",
      tempo: 120,
      genre: "Jazz",
      sections: [
        {
          name: "Intro",
          repeat: 1,
          bars: [
            {
              chords: [
                { name: "Dm7", degree: "min", key: 2, shape: "A" },
                { name: "G7", degree: "M", key: 7, shape: "E" },
                { name: "Cmaj7", degree: "M", key: 0, shape: "C" },
                { name: "Fmaj7", degree: "M", key: 5, shape: "C" }
              ],
              lyrics: ["", "", "", ""]
            }
          ]
        },
        {
          name: "A Section",
          repeat: 2,
          bars: [
            {
              chords: [
                { name: "Am7", degree: "min", key: 9, shape: "A" },
                { name: "D7", degree: "M", key: 2, shape: "E" },
                { name: "Gmaj7", degree: "M", key: 7, shape: "C" },
                { name: "Cmaj7", degree: "M", key: 0, shape: "C" }
              ],
              lyrics: ["The", "fall-ing", "leaves", "drift by my win-dow"]
            },
            {
              chords: [
                { name: "F#m7b5", degree: "min", key: 6, shape: "D" },
                { name: "B7", degree: "M", key: 11, shape: "E" },
                { name: "Em7", degree: "min", key: 4, shape: "A" },
                { name: "Em7", degree: "min", key: 4, shape: "A" }
              ],
              lyrics: ["The", "au-tumn", "leaves", "of red and gold"]
            }
          ]
        },

        {
          name: "Bridge",
          repeat: 1,
          bars: [
            {
              chords: [
                { name: "Am7", degree: "min", key: 9, shape: "A" },
                { name: "D7", degree: "M", key: 2, shape: "E" },
                { name: "Gmaj7", degree: "M", key: 7, shape: "C" },
                { name: "Cmaj7", degree: "M", key: 0, shape: "C" }
              ],
              lyrics: ["I see", "your lips", "the sum-mer", "kiss-es"]
            },
            {
              chords: [
                { name: "F#m7b5", degree: "min", key: 6, shape: "D" },
                { name: "B7", degree: "M", key: 11, shape: "E" },
                { name: "Em7", degree: "min", key: 4, shape: "A" },
                { name: "Em7", degree: "min", key: 4, shape: "A" }
              ],
              lyrics: ["The", "sun-burned", "hands I", "used to hold"]
            }
          ]
        },

        {
          name: "Outro",
          repeat: 1,
          bars: [
            {
              chords: [
                { name: "Am7", degree: "min", key: 9, shape: "A" },
                { name: "D7", degree: "M", key: 2, shape: "E" },
                { name: "Gmaj7", degree: "M", key: 7, shape: "C" },
                { name: "Cmaj7", degree: "M", key: 0, shape: "C" }
              ],
              lyrics: ["Since", "you went", "a-way the", "days grow long"]
            }
          ]
        }
      ]
    }
  ]
};

import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Card,
  Typography
} from "@mui/material";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend
} from "recharts";

import { styled } from "@mui/system";
import guitar from "@/config/guitar";

const COLORS = ["#1976d2", "#9c27b0", "#ff9800", "#4caf50", "#e91e63", "#009688"];

const StatCard = styled(Card)({
  borderRadius: "16px",
  padding: "16px",
  marginBottom: "20px",
});

/* ----------------------------------------------------------
   SAFE NOTE EXTRACTION
---------------------------------------------------------- */
const extractNotes = (fretboard) => {
  if (!Array.isArray(fretboard)) return [];

  const notes = [];
  fretboard.forEach(string =>
    string?.forEach(fret => {
      if (fret?.show === true && fret.current) {
        notes.push(fret.current);
      }
    })
  );
  return notes;
};

const extractNotesFromItems = (items, getFbPath) => {
  const notes = [];

  items.forEach(board => {
    const fb = getFbPath(board);
    if (fb) notes.push(...extractNotes(fb));
  });

  return notes;
};

const count = (arr) =>
  arr.reduce((acc, item) => {
    if (!item) return acc; // skip undefined/null
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});

const buildPie = (map) =>
  Object.keys(map).map(k => ({ name: k, value: map[k] }));

const countShapes = (items) => {
  const map = {};
  items.forEach(i => {
    const choice = i?.generalSettings?.choice;
    const shape = i?.[choice + "Settings"]?.shape;
    if (shape) map[shape] = (map[shape] || 0) + 1;
  });
  return buildPie(map);
};

const countKeys = (items) => {
  const map = {};
  items.forEach(i => {
    const choice = i?.generalSettings?.choice;
    const keyIndex = i?.keySettings?.[choice];
    if (typeof keyIndex === "number") {
      const note = guitar.notes.sharps[keyIndex];
      if (note) map[note] = (map[note] || 0) + 1;
    }
  });
  return buildPie(map);
};

const PieGraph = ({ data }) => (
  <PieChart width={400} height={300}>
    <Pie data={data} cx="50%" cy="50%" outerRadius={100} label dataKey="value">
      {data.map((entry, i) => (
        <Cell key={i} fill={COLORS[i % COLORS.length]} />
      ))}
    </Pie>
    <Legend />
    <Tooltip />
  </PieChart>
);

const BarGraph = ({ data }) => (
  <BarChart width={500} height={300} data={data}>
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="value" fill="#1976d2" />
  </BarChart>
);

/* ----------------------------------------------------------
   COMPONENT
---------------------------------------------------------- */
export default function Stats({
  boards = [],
  chords = [],
  arpeggios = [],
  scales = []
}) {
  const [tab, setTab] = useState(0);
  const tabs = ["All", "Chords", "Arpeggios", "Scales"];

  /* --------------------------------------------------------
     HOMEPAGE DETECTION FIX
  -------------------------------------------------------- */
  const isHomepage =
    boards.length > 0 &&
    chords.length === 0 &&
    arpeggios.length === 0 &&
    scales.length === 0;

  let boardsChord = [];
  let boardsArp = [];
  let boardsScale = [];
  let boardsAll = [];

  if (isHomepage) {
    boardsAll = boards;

    boards.forEach(b => {
      const choice = b?.generalSettings?.choice;
      if (choice === "chord") boardsChord.push(b);
      if (choice === "arppegio") boardsArp.push(b);
      if (choice === "scale") boardsScale.push(b);
    });

  } else {
    boardsChord = chords;
    boardsArp = arpeggios;
    boardsScale = scales;
    boardsAll = [...chords, ...arpeggios, ...scales];
  }

  /* --------------------------------------------------------
     SAFE DYNAMIC FRETBOARD ACCESS
  -------------------------------------------------------- */

  const getHomepageFb = (board) => {
    try {
      const choice = board.generalSettings.choice;
      return board[choice + "Settings"]?.fretboard;
    } catch {
      return null;
    }
  };

  const getStatsFb = (board) => board.fretboard;

  const fbSelector = isHomepage ? getHomepageFb : getStatsFb;

  /* --------------------------------------------------------
     ANALYTICS COMPUTATION
  -------------------------------------------------------- */

  const allBoardsNotes = useMemo(
    () => extractNotesFromItems(boardsAll, fbSelector),
    [boardsAll, isHomepage]
  );

  const allBoardsCount = count(allBoardsNotes);

  const noteFrequencyChart = Object.entries(allBoardsCount).map(([name, value]) => ({
    name,
    value
  }));

  /* --------------------------------------------------------
     CHORDS
  -------------------------------------------------------- */
  const chordNotes = useMemo(
    () => extractNotesFromItems(boardsChord, fbSelector),
    [boardsChord, isHomepage]
  );

  const chordNoteChart = buildPie(count(chordNotes));
  const chordShapesChart = countShapes(boardsChord);
  const chordKeysChart = countKeys(boardsChord);

  /* --------------------------------------------------------
     ARPEGGIOS
  -------------------------------------------------------- */
  const arpNotes = useMemo(
    () => extractNotesFromItems(boardsArp, fbSelector),
    [boardsArp]
  );

  const arpNoteChart = buildPie(count(arpNotes));
  const arpShapesChart = countShapes(boardsArp);
  const arpKeysChart = countKeys(boardsArp);

  /* --------------------------------------------------------
     SCALES
  -------------------------------------------------------- */
  const scaleNotes = useMemo(
    () => extractNotesFromItems(boardsScale, fbSelector),
    [boardsScale]
  );

  const scaleNoteChart = buildPie(count(scaleNotes));
  const scaleShapesChart = countShapes(boardsScale);
  const scaleKeysChart = countKeys(boardsScale);

  /* --------------------------------------------------------
     RENDER
  -------------------------------------------------------- */
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        🎸 Strum Dot Fun — Analytics Dashboard
      </Typography>

      {/* Tabs */}
      <Box sx={{ display: "flex", mb: 3 }}>
        {tabs.map((label, i) => (
          <Button
            key={i}
            onClick={() => setTab(i)}
            variant={tab === i ? "contained" : "outlined"}
            sx={{ flex: 1, borderRadius: 0 }}
          >
            {label}
          </Button>
        ))}
      </Box>

      {/* ------------------ ALL ------------------ */}
      {tab === 0 && (
        <Grid container spacing={3}>

          <Grid item xs={12} md={6}>
            <StatCard>
              <Typography variant="h6">Note Frequency</Typography>
              <BarGraph data={noteFrequencyChart} />
            </StatCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <StatCard>
              <Typography variant="h6">Notes Proportion</Typography>
              <PieGraph data={noteFrequencyChart} />
            </StatCard>
          </Grid>

        </Grid>
      )}

      {/* ------------------ CHORDS ------------------ */}
      {tab === 1 && (
        <Grid container spacing={3}>

          <Grid item xs={12} md={6}>
            <StatCard>
              <Typography variant="h6">Chord Note Distribution</Typography>
              <PieGraph data={chordNoteChart} />
            </StatCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <StatCard>
              <Typography variant="h6">Chord Shapes</Typography>
              <PieGraph data={chordShapesChart} />
            </StatCard>
          </Grid>

          <Grid item xs={12}>
            <StatCard>
              <Typography variant="h6">Keys Used in Chords</Typography>
              <BarGraph data={chordKeysChart} />
            </StatCard>
          </Grid>

        </Grid>
      )}

      {/* ------------------ ARPEGGIOS ------------------ */}
      {tab === 2 && (
        <Grid container spacing={3}>

          <Grid item xs={12} md={6}>
            <StatCard>
              <Typography variant="h6">Arpeggio Note Distribution</Typography>
              <PieGraph data={arpNoteChart} />
            </StatCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <StatCard>
              <Typography variant="h6">Arpeggio Shapes</Typography>
              <PieGraph data={arpShapesChart} />
            </StatCard>
          </Grid>

          <Grid item xs={12}>
            <StatCard>
              <Typography variant="h6">Keys Used in Arpeggios</Typography>
              <BarGraph data={arpKeysChart} />
            </StatCard>
          </Grid>

        </Grid>
      )}


      {/* ------------------ SCALES ------------------ */}
      {tab === 3 && (
        <Grid container spacing={3}>

          <Grid item xs={12} md={6}>
            <StatCard>
              <Typography variant="h6">Scale Note Distribution</Typography>
              <PieGraph data={scaleNoteChart} />
            </StatCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <StatCard>
              <Typography variant="h6">Scale Shapes</Typography>
              <PieGraph data={scaleShapesChart} />
            </StatCard>
          </Grid>

          <Grid item xs={12}>
            <StatCard>
              <Typography variant="h6">Keys Used in Scales</Typography>
              <BarGraph data={scaleKeysChart} />
            </StatCard>
          </Grid>

        </Grid>
      )}
    </Box>
  );
}

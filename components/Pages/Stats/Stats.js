import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Typography
} from "@mui/material";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend
} from "recharts";

import { styled } from "@mui/system";
import guitar from "@/config/guitar";

const COLORS = ["#1976d2", "#9c27b0", "#ff9800", "#4caf50", "#e91e63", "#009688"];

// Card style
const StatCard = styled(Card)({
  borderRadius: "16px",
  padding: "16px",
  marginBottom: "20px",
});

// Convert undefined → ignore
const extractNotes = (fretboard) => {
  const notes = [];
  fretboard?.forEach(string =>
    string?.forEach(fret => {
      if (fret?.show && fret.current) notes.push(fret.current);
    })
  );
  return notes;
};

// Extract all notes from multiple boards
const extractNotesFromItems = (items, path = "fretboard") => {
  const list = [];
  items.forEach(i => {
    list.push(...extractNotes(i[path]));
  });
  return list;
};

// Count occurrences
const count = (arr) =>
  arr.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});

// Build pie data
const buildPie = (map) =>
  Object.keys(map).map(k => ({ name: k, value: map[k] }));

// Collect shapes
const countShapes = (items, field = "shape") => {
  const map = {};
  items.forEach(i => {
    const v = i[field];
    if (v) map[v] = (map[v] || 0) + 1;
  });
  return buildPie(map);
};

// Count keys (C, C#, …)
const countKeys = (items) => {
  const map = {};
  items.forEach(i => {
    const note = guitar.notes.sharps[i.keyIndex];
    map[note] = (map[note] || 0) + 1;
  });
  return buildPie(map);
};

// Render pie chart
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

// Render bar chart
const BarGraph = ({ data, keyName = "value" }) => (
  <BarChart width={500} height={300} data={data}>
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Bar dataKey={keyName} fill="#1976d2" />
  </BarChart>
);


// ====================================================================
//                               STATS COMPONENT
// ====================================================================
export default function Stats({ boards = [], chords = [], arpeggios = [], scales = [] }) {

  const [tab, setTab] = useState(0);

  const tabs = ["All", "Chords", "Arpeggios", "Scales"];
  const tabWidth = `${100 / tabs.length}%`;


  // ============================================================
  // ------------- GLOBAL NOTE ANALYTICS -------------------------
  // ============================================================
  const allBoardsNotes = useMemo(
    () => extractNotesFromItems(boards, "scaleSettings.fretboard"),
    [boards]
  );

  const allBoardsCount = useMemo(() => count(allBoardsNotes), [allBoardsNotes]);

  const noteFrequencyChart = Object.keys(allBoardsCount).map(n => ({
    name: n,
    value: allBoardsCount[n],
  }));


  // ============================================================
  // ------------- CHORD ANALYTICS ------------------------------
  // ============================================================
  const chordNotes = useMemo(
    () => extractNotesFromItems(chords, "fretboard"),
    [chords]
  );
  const chordNoteCount = useMemo(() => count(chordNotes), [chordNotes]);
  const chordNoteChart = buildPie(chordNoteCount);

  const chordShapes = useMemo(() => countShapes(chords), [chords]);
  const chordKeyDistribution = useMemo(() => countKeys(chords), [chords]);


  // ============================================================
  // ------------- ARPEGGIO ANALYTICS ---------------------------
  // ============================================================
  const arpNotes = useMemo(
    () => extractNotesFromItems(arpeggios, "fretboard"),
    [arpeggios]
  );
  const arpNoteCount = useMemo(() => count(arpNotes), [arpNotes]);
  const arpNoteChart = buildPie(arpNoteCount);

  const arpShapes = useMemo(() => countShapes(arpeggios), [arpeggios]);
  const arpKeys = useMemo(() => countKeys(arpeggios), [arpeggios]);


  // ============================================================
  // ------------- SCALE ANALYTICS ------------------------------
  // ============================================================
  const scaleNotes = useMemo(
    () => extractNotesFromItems(scales, "fretboard"),
    [scales]
  );
  const scaleNoteCount = useMemo(() => count(scaleNotes), [scaleNotes]);
  const scaleNoteChart = buildPie(scaleNoteCount);

  const scaleShapes = useMemo(() => countShapes(scales), [scales]);
  const scaleKeys = useMemo(() => countKeys(scales), [scales]);


  // ============================================================
  // ------------- RENDER ---------------------------------------
  // ============================================================
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        🎸 Strum Dot Fun — Analytics Dashboard
      </Typography>

      {/* ================== TABS ================== */}
      <Box sx={{ display: "flex", mb: 3 }}>
        {tabs.map((label, i) => (
          <Button
            key={i}
            onClick={() => setTab(i)}
            variant={tab === i ? "contained" : "outlined"}
            sx={{
              width: tabWidth,
              borderRadius: 0,
              textTransform: "none",
            }}
          >
            {label}
          </Button>
        ))}
      </Box>

      {/* =====================================================
          ALL / CHORDS / ARPEGGIOS / SCALES RENDER SECTIONS
         ===================================================== */}

      {/* ======================= ALL ======================= */}
      {tab === 0 && (
        <Grid container spacing={3}>

          <Grid item xs={12} md={6}>
            <StatCard>
              <Typography variant="h6">Note Frequency (Boards)</Typography>
              <BarGraph data={noteFrequencyChart} />
            </StatCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <StatCard>
              <Typography variant="h6">Notes Proportion (Boards)</Typography>
              <PieGraph data={noteFrequencyChart} />
            </StatCard>
          </Grid>

        </Grid>
      )}


      {/* ======================= CHORDS ======================= */}
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
              <PieGraph data={chordShapes} />
            </StatCard>
          </Grid>

          <Grid item xs={12}>
            <StatCard>
              <Typography variant="h6">Keys Used in Chords</Typography>
              <BarGraph data={chordKeyDistribution} />
            </StatCard>
          </Grid>
        </Grid>
      )}


      {/* ======================= ARPEGGIOS ======================= */}
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
              <PieGraph data={arpShapes} />
            </StatCard>
          </Grid>

          <Grid item xs={12}>
            <StatCard>
              <Typography variant="h6">Keys Used in Arpeggios</Typography>
              <BarGraph data={arpKeys} />
            </StatCard>
          </Grid>
        </Grid>
      )}


      {/* ======================= SCALES ======================= */}
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
              <PieGraph data={scaleShapes} />
            </StatCard>
          </Grid>

          <Grid item xs={12}>
            <StatCard>
              <Typography variant="h6">Keys Used in Scales</Typography>
              <BarGraph data={scaleKeys} />
            </StatCard>
          </Grid>
        </Grid>
      )}

    </Box>
  );
}

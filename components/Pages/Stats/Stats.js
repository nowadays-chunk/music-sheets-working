// ============================================
// STATS.JSX — FULL MONOLITHIC FILE (PART 1/4)
// ============================================
// Light mode only
// Tabs: All, Chords, Arpeggios, Scales
// 15 data visualizations per tab (60 charts total)
// ============================================

import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter,
  Treemap,
  FunnelChart, Funnel, LabelList,
  RadialBarChart, RadialBar,
  ComposedChart,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
  ZAxis
} from "recharts";

import { styled } from "@mui/system";
import guitar from "@/config/guitar";

// ---------------------------------------------
// CONSTANTS
// ---------------------------------------------
const COLORS = [
  "#1976d2", "#9c27b0", "#ff9800", "#4caf50", "#e91e63",
  "#009688", "#d32f2f", "#303f9f", "#7b1fa2", "#455a64",
  "#f57c00", "#388e3c", "#00838f", "#6d4c41", "#283593"
];

const FRET_COUNT = 25;

// ---------------------------------------------
// BASIC CARD STYLE
// ---------------------------------------------
const StatCard = styled(Card)({
  borderRadius: "14px",
  padding: "16px",
  marginBottom: "24px",
  background: "#ffffff",
});

// ---------------------------------------------
// UTILITY HELPERS
// ---------------------------------------------
const countOccurrences = (arr) =>
  arr.reduce((acc, v) => {
    if (!v) return acc;
    acc[v] = (acc[v] || 0) + 1;
    return acc;
  }, {});

const toPie = (map) =>
  Object.entries(map).map(([name, value]) => ({ name, value }));

const safe = (x) => (x === undefined ? null : x);

// ---------------------------------------------
// FRETBOARD NOTE EXTRACTOR
// ---------------------------------------------
const extractNotes = (board) => {
  if (!Array.isArray(board)) return [];
  const out = [];
  board.forEach((string) =>
    string?.forEach((cell) => {
      if (cell?.show && cell.current) out.push(cell.current);
    })
  );
  return out;
};

const extractIntervals = (board) => {
  if (!Array.isArray(board)) return [];
  const out = [];
  board.forEach((string) =>
    string?.forEach((cell) => {
      if (cell?.show && cell.interval) out.push(cell.interval);
    })
  );
  return out;
};

const extractPositions = (board) => {
  if (!Array.isArray(board)) return [];
  const positions = [];
  board.forEach((string, sIndex) =>
    string?.forEach((cell, fret) => {
      if (cell?.show) {
        positions.push({ string: sIndex + 1, fret });
      }
    })
  );
  return positions;
};

// ---------------------------------------------
// HEATMAP BUILDER
// ---------------------------------------------
const buildFretHeatmap = (boards) => {
  const frets = Array.from({ length: FRET_COUNT }, (_, f) => ({
    fret: f,
    value: 0,
  }));
  boards.forEach((fb) => {
    if (!Array.isArray(fb)) return;
    fb.forEach((string) =>
      string?.forEach((cell, fretIndex) => {
        if (cell?.show) {
          frets[fretIndex].value++;
        }
      })
    );
  });
  return frets;
};

// ---------------------------------------------
// STRING USAGE
// ---------------------------------------------
const buildStringUsage = (boards) => {
  const map = {};
  boards.forEach((fb) => {
    if (!Array.isArray(fb)) return;
    fb.forEach((string, sindex) =>
      string?.forEach((cell) => {
        if (cell?.show) {
          const key = `String ${sindex + 1}`;
          map[key] = (map[key] || 0) + 1;
        }
      })
    );
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
};

// ---------------------------------------------
// NECK ZONE STATS
// ---------------------------------------------
const buildNeckZones = (boards) => {
  const zones = { open: 0, low: 0, mid: 0, high: 0 };
  boards.forEach((fb) => {
    if (!Array.isArray(fb)) return;
    fb.forEach((string) =>
      string?.forEach((cell, fret) => {
        if (cell?.show) {
          if (fret <= 3) zones.open++;
          else if (fret <= 7) zones.low++;
          else if (fret <= 12) zones.mid++;
          else zones.high++;
        }
      })
    );
  });
  return toPie(zones);
};

// ---------------------------------------------
// KEY USAGE
// ---------------------------------------------
const buildKeyUsage = (boards) => {
  const keyCounts = {};
  boards.forEach((b) => {
    if (typeof b.keyIndex === "number") {
      const keyName = guitar.notes.sharps[b.keyIndex];
      keyCounts[keyName] = (keyCounts[keyName] || 0) + 1;
    }
  });
  return toPie(keyCounts);
};

// ---------------------------------------------
// SHAPE USAGE
// ---------------------------------------------
const buildShapeUsage = (boards) => {
  const map = {};
  boards.forEach((b) => {
    if (b.shape) {
      map[b.shape] = (map[b.shape] || 0) + 1;
    } else if (b.generalSettings) {
      const choice = b.generalSettings.choice;
      const shape = b?.[choice + "Settings"]?.shape;
      if (shape) map[shape] = (map[shape] || 0) + 1;
    }
  });
  return toPie(map);
};

// ---------------------------------------------
// MODE USAGE
// ---------------------------------------------
const buildModeUsage = (boards) => {
  const map = {};
  boards.forEach((b) => {
    if (typeof b.mode === "number") {
      const scaleName = b.scale;
      const modeName = guitar.scales[scaleName]?.modes?.[b.mode];
      if (modeName) map[modeName] = (map[modeName] || 0) + 1;
    }
  });
  return toPie(map);
};

// ---------------------------------------------
// INTERVAL USAGE
// ---------------------------------------------
const buildIntervalUsage = (boards) => {
  const intervals = [];
  boards.forEach((b) => {
    const fb = b.fretboard || (b.generalSettings ? b[b.generalSettings.choice + "Settings"]?.fretboard : null);
    if (!fb) return;
    intervals.push(...extractIntervals(fb));
  });
  return toPie(countOccurrences(intervals));
};

// ---------------------------------------------
// NOTE USAGE
// ---------------------------------------------
const buildNoteUsage = (boards) => {
  const notes = [];
  boards.forEach((b) => {
    const fb = b.fretboard ||
      (b.generalSettings
        ? b[b.generalSettings.choice + "Settings"]?.fretboard
        : null);
    if (!fb) return;
    notes.push(...extractNotes(fb));
  });
  return toPie(countOccurrences(notes));
};

// ---------------------------------------------
// DENSITY (HISTOGRAM) — FRETS
// ---------------------------------------------
const buildFretHistogram = (boards) => {
  const map = {};
  boards.forEach((b) => {
    const fb = b.fretboard ||
      (b.generalSettings
        ? b[b.generalSettings.choice + "Settings"]?.fretboard
        : null);
    if (!fb) return;

    fb.forEach((string) =>
      string?.forEach((cell, fret) => {
        if (cell?.show) {
          map[fret] = (map[fret] || 0) + 1;
        }
      })
    );
  });

  return Object.entries(map).map(([fret, value]) => ({
    name: `F${fret}`,
    value,
  }));
};

// ---------------------------------------------
// RANGE STATS (MIN / MAX / AVG FRETS)
// ---------------------------------------------
const buildFretRanges = (boards) => {
  const ranges = boards.map((b) => {
    const fb = b.fretboard ||
      (b.generalSettings
        ? b[b.generalSettings.choice + "Settings"]?.fretboard
        : null);

    if (!fb) return null;

    const frets = [];
    fb.forEach((string) =>
      string?.forEach((cell, fret) => {
        if (cell?.show) frets.push(fret);
      })
    );

    if (frets.length === 0) return null;

    const min = Math.min(...frets);
    const max = Math.max(...frets);
    const avg = frets.reduce((a, b) => a + b, 0) / frets.length;

    return { min, max, avg };
  }).filter(Boolean);

  const minAvg = ranges.reduce((a, r) => a + r.min, 0) / ranges.length;
  const maxAvg = ranges.reduce((a, r) => a + r.max, 0) / ranges.length;
  const avgAvg = ranges.reduce((a, r) => a + r.avg, 0) / ranges.length;

  return [
    { name: "Min Fret Avg", value: Number(minAvg.toFixed(2)) },
    { name: "Max Fret Avg", value: Number(maxAvg.toFixed(2)) },
    { name: "Avg Fret Avg", value: Number(avgAvg.toFixed(2)) },
  ];
};

// ---------------------------------------------
// SCATTER DATA: FRET vs STRING
// ---------------------------------------------
const buildScatterPositions = (boards) => {
  const pts = [];
  boards.forEach((b) => {
    const fb = b.fretboard ||
      (b.generalSettings
        ? b[b.generalSettings.choice + "Settings"]?.fretboard
        : null);
    if (!fb) return;
    pts.push(...extractPositions(fb));
  });
  return pts.map((p, i) => ({
    x: p.fret,
    y: p.string,
    z: 1,
    id: i,
  }));
};

// ---------------------------------------------
// TREEMAP DATA (NOTE GROUPS)
// ---------------------------------------------
const buildTreemapNotes = (boards) => {
  const notes = buildNoteUsage(boards);
  return notes.map((n, i) => ({
    name: n.name,
    size: n.value,
  }));
};

// ---------------------------------------------
// RADAR DATA (String Usage Normalized)
// ---------------------------------------------
const buildRadarStringUsage = (boards) => {
  const items = buildStringUsage(boards);
  const maxVal = Math.max(...items.map((i) => i.value), 1);
  return items.map((i) => ({
    subject: i.name,
    value: (i.value / maxVal) * 100,
    fullMark: 100,
  }));
};

// ---------------------------------------------
// FLOW GRAPH (Chord → Next Chord transitions)
// ---------------------------------------------
const buildChordFlow = (boards) => {
  const transitions = {};

  for (let i = 0; i < boards.length - 1; i++) {
    const c1 = boards[i].chord || boards[i].arpeggio || boards[i].scale || "X";
    const c2 = boards[i + 1].chord || boards[i + 1].arpeggio || boards[i + 1].scale || "X";

    const key = `${c1}→${c2}`;
    transitions[key] = (transitions[key] || 0) + 1;
  }

  return Object.entries(transitions).map(([name, value]) => ({
    name,
    value,
  }));
};

// ========================================================================================
//                           VISUALIZATION COMPONENTS
// ========================================================================================

// ---------------------------------------------
// BAR GRAPH
// ---------------------------------------------
const BarGraph = ({ data, title }) => (
  <StatCard>
    <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
    <BarChart width={500} height={250} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="value" fill="#1976d2" />
    </BarChart>
  </StatCard>
);

// ---------------------------------------------
// PIE GRAPH
// ---------------------------------------------
const PieGraph = ({ data, title }) => (
  <StatCard>
    <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
    <PieChart width={400} height={300}>
      <Pie dataKey="value" data={data} cx="50%" cy="50%" outerRadius={120} label>
        {data.map((entry, index) => (
          <Cell key={index} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  </StatCard>
);

// ---------------------------------------------
// LINE GRAPH
// ---------------------------------------------
const LineGraph = ({ data, title }) => (
  <StatCard>
    <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
    <LineChart width={500} height={250} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="value" stroke="#1976d2" />
    </LineChart>
  </StatCard>
);

// ---------------------------------------------
// AREA GRAPH
// ---------------------------------------------
const AreaGraph = ({ data, title }) => (
  <StatCard>
    <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
    <AreaChart width={500} height={250} data={data}>
      <defs>
        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
        </linearGradient>
      </defs>
      <XAxis dataKey="name" />
      <YAxis />
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip />
      <Area type="monotone" dataKey="value" stroke="#1976d2" fill="url(#colorUv)" />
    </AreaChart>
  </StatCard>
);

// ---------------------------------------------
// SCATTER GRAPH
// ---------------------------------------------
const ScatterGraph = ({ data, title }) => (
  <StatCard>
    <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
    <ScatterChart width={500} height={250}>
      <CartesianGrid />
      <XAxis dataKey="x" name="Fret" />
      <YAxis dataKey="y" name="String" />
      <ZAxis dataKey="z" range={[10, 50]} />
      <Tooltip />
      <Scatter data={data} fill="#1976d2" />
    </ScatterChart>
  </StatCard>
);

// ---------------------------------------------
// TREEMAP
// ---------------------------------------------
const TreemapGraph = ({ data, title }) => (
  <StatCard>
    <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
    <Treemap
      width={500}
      height={250}
      data={data}
      dataKey="size"
      ratio={4 / 3}
      stroke="#fff"
      fill="#1976d2"
    />
  </StatCard>
);

// ---------------------------------------------
// RADAR GRAPH
// ---------------------------------------------
const RadarGraph = ({ data, title }) => (
  <StatCard>
    <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
    <RadarChart cx={250} cy={150} outerRadius={120} width={500} height={300} data={data}>
      <PolarGrid />
      <PolarAngleAxis dataKey="subject" />
      <PolarRadiusAxis angle={30} domain={[0, 100]} />
      <Radar name="Usage" dataKey="value" stroke="#1976d2" fill="#1976d2" fillOpacity={0.6} />
      <Legend />
    </RadarChart>
  </StatCard>
);

// ---------------------------------------------
// RADIAL BAR
// ---------------------------------------------
const RadialBarGraph = ({ data, title }) => (
  <StatCard>
    <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
    <RadialBarChart
      width={400}
      height={300}
      innerRadius="10%"
      outerRadius="80%"
      data={data}
      startAngle={180}
      endAngle={0}
    >
      <RadialBar minAngle={15} background clockWise dataKey="value" />
      <Legend iconSize={10} layout="vertical" verticalAlign="middle" />
      <Tooltip />
    </RadialBarChart>
  </StatCard>
);

// ---------------------------------------------
// FUNNEL GRAPH
// ---------------------------------------------
const FunnelGraph = ({ data, title }) => (
  <StatCard>
    <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
    <FunnelChart width={400} height={300}>
      <Funnel dataKey="value" data={data}>
        <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
      </Funnel>
      <Tooltip />
    </FunnelChart>
  </StatCard>
);

// ---------------------------------------------
// RANGE GRAPH (MIN/MAX/AVG)
// ---------------------------------------------
const RangeGraph = ({ data, title }) => (
  <StatCard>
    <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
    <ComposedChart width={500} height={250} data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value" fill="#1976d2" />
      <Line type="monotone" dataKey="value" stroke="#d32f2f" />
    </ComposedChart>
  </StatCard>
);

// ---------------------------------------------
// HISTOGRAM (FRET COUNT)
// ---------------------------------------------
const HistogramGraph = ({ data, title }) => (
  <StatCard>
    <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
    <BarChart width={500} height={250} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Bar dataKey="value" fill="#1976d2" />
      <Tooltip />
    </BarChart>
  </StatCard>
);

// ---------------------------------------------
// FLOW GRAPH (Chord Sequence)
// ---------------------------------------------
const FlowGraph = ({ data, title }) => (
  <StatCard>
    <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
    <BarChart width={500} height={250} data={data}>
      <XAxis dataKey="name" hide />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value" fill="#1976d2" />
    </BarChart>
  </StatCard>
);

// ---------------------------------------------
// HEATMAP (FRET INTENSITY)
// ---------------------------------------------
const Heatmap = ({ data, title }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <StatCard>
      <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        {data.map((d) => {
          const intensity = d.value / max;
          return (
            <Box
              key={d.fret}
              sx={{
                width: 20,
                height: 80,
                backgroundColor: `rgba(25,118,210,${intensity})`,
                color: intensity > 0.5 ? "#fff" : "#000",
                fontSize: "0.7rem",
                textAlign: "center",
              }}
            >
              {d.fret}
            </Box>
          );
        })}
      </Box>
    </StatCard>
  );
};

// ================================================
// END OF PART 1
// NEXT: TABS AND 60 VISUALIZATIONS
// ================================================

// ==========================================================
// PART 2/4 — TAB 1: ALL DATA (15 VISUALIZATIONS)
// ==========================================================

export default function Stats({
  boards = [],
  chords = [],
  arpeggios = [],
  scales = [],
  usage = null
}) {
  const [tab, setTab] = useState(0);

  // ---------------------------------------------------------
  // DETECT HOMEPAGE
  // ---------------------------------------------------------
  const isHomepage =
    boards.length > 0 &&
    chords.length === 0 &&
    arpeggios.length === 0 &&
    scales.length === 0 &&
    !usage;

  // ---------------------------------------------------------
  // SELECT SOURCE DATA
  // ---------------------------------------------------------
  const sourceBoards = useMemo(() => {
    // Homepage: use boards only
    if (isHomepage) {
      return boards.map((b) => {
        const choice = b.generalSettings.choice;
        const fb = b[choice + "Settings"]?.fretboard || [];
        return {
          fretboard: fb,
          chord: b.chordSettings?.chord || null,
          arpeggio: b.arppegioSettings?.arppegio || null,
          scale: b.scaleSettings?.scale || null,
          keyIndex: b.keySettings?.[choice] ?? null,
          shape: b[choice + "Settings"]?.shape || null,
          mode: b.modeSettings?.mode || null,
          general: b.generalSettings
        };
      });
    }

    // Stats page: merge chords + arpeggios + scales
    return [...chords, ...arpeggios, ...scales];
  }, [boards, chords, arpeggios, scales, isHomepage]);

  // ---------------------------------------------------------
  // PREPARE ALL ANALYTICS FOR TAB 1
  // ---------------------------------------------------------

  const allNoteUsage = useMemo(() => buildNoteUsage(sourceBoards), [sourceBoards]);
  const allIntervalUsage = useMemo(() => buildIntervalUsage(sourceBoards), [sourceBoards]);
  const allKeyUsage = useMemo(() => buildKeyUsage(sourceBoards), [sourceBoards]);
  const allShapeUsage = useMemo(() => buildShapeUsage(sourceBoards), [sourceBoards]);
  const allModeUsage = useMemo(() => buildModeUsage(sourceBoards), [sourceBoards]);
  const allStringUsage = useMemo(() => buildStringUsage(sourceBoards.map(b => b.fretboard)), [sourceBoards]);
  const allNeckZones = useMemo(() => buildNeckZones(sourceBoards.map(b => b.fretboard)), [sourceBoards]);
  const allFretHeatmap = useMemo(() => buildFretHeatmap(sourceBoards.map(b => b.fretboard)), [sourceBoards]);
  const allFretHistogram = useMemo(() => buildFretHistogram(sourceBoards), [sourceBoards]);
  const allFretRanges = useMemo(() => buildFretRanges(sourceBoards), [sourceBoards]);
  const allTreemapNotes = useMemo(() => buildTreemapNotes(sourceBoards), [sourceBoards]);
  const allScatter = useMemo(() => buildScatterPositions(sourceBoards), [sourceBoards]);
  const allRadarStrings = useMemo(() => buildRadarStringUsage(sourceBoards), [sourceBoards]);
  const allFlow = useMemo(() => buildChordFlow(sourceBoards), [sourceBoards]);

  // ---------------------------------------------------------
  // TABS DEFINITION
  // ---------------------------------------------------------
  const tabs = ["All", "Chords", "Arpeggios", "Scales"];

  // -------------------------------------------
  // CHORDS DATA (computed once)
  // -------------------------------------------
  const chordBoards = useMemo(
    () => sourceBoards.filter(b => b.chord || (b.general?.choice === "chord")),
    [sourceBoards]
  );

  const chordNoteUsage = useMemo(
    () => buildNoteUsage(chordBoards),
    [chordBoards]
  );

  const chordIntervalUsage = useMemo(
    () => buildIntervalUsage(chordBoards),
    [chordBoards]
  );

  const chordStringUsage = useMemo(
    () => buildStringUsage(chordBoards.map(b => b.fretboard)),
    [chordBoards]
  );

  const chordNeckZones = useMemo(
    () => buildNeckZones(chordBoards.map(b => b.fretboard)),
    [chordBoards]
  );

  const chordFretHeatmap = useMemo(
    () => buildFretHeatmap(chordBoards.map(b => b.fretboard)),
    [chordBoards]
  );

  const chordFretHistogram = useMemo(
    () => buildFretHistogram(chordBoards),
    [chordBoards]
  );

  const chordFretRanges = useMemo(
    () => buildFretRanges(chordBoards),
    [chordBoards]
  );

  const chordTreemap = useMemo(
    () => buildTreemapNotes(chordBoards),
    [chordBoards]
  );

  const chordScatter = useMemo(
    () => buildScatterPositions(chordBoards),
    [chordBoards]
  );

  const chordKeys = useMemo(
    () => buildKeyUsage(chordBoards),
    [chordBoards]
  );

  const chordShapes = useMemo(
    () => buildShapeUsage(chordBoards),
    [chordBoards]
  );

  const chordFlow = useMemo(
    () => buildChordFlow(chordBoards),
    [chordBoards]
  );

  const chordRadarStrings = useMemo(
    () => buildRadarStringUsage(chordBoards),
    [chordBoards]
  );

  const chordModes = useMemo(
    () => buildModeUsage(chordBoards),
    [chordBoards]
  );

  // -------------------------------------------
  // ARPEGGIOS DATA (computed once)
  // -------------------------------------------
  const arpBoards = useMemo(
    () => sourceBoards.filter(b => b.arpeggio || (b.general?.choice === "arppegio")),
    [sourceBoards]
  );

  const arpNoteUsage = useMemo(
    () => buildNoteUsage(arpBoards),
    [arpBoards]
  );

  const arpIntervalUsage = useMemo(
    () => buildIntervalUsage(arpBoards),
    [arpBoards]
  );

  const arpStringUsage = useMemo(
    () => buildStringUsage(arpBoards.map(b => b.fretboard)),
    [arpBoards]
  );

  const arpNeckZones = useMemo(
    () => buildNeckZones(arpBoards.map(b => b.fretboard)),
    [arpBoards]
  );

  const arpFretHeatmap = useMemo(
    () => buildFretHeatmap(arpBoards.map(b => b.fretboard)),
    [arpBoards]
  );

  const arpFretHistogram = useMemo(
    () => buildFretHistogram(arpBoards),
    [arpBoards]
  );

  const arpFretRanges = useMemo(
    () => buildFretRanges(arpBoards),
    [arpBoards]
  );

  const arpTreemap = useMemo(
    () => buildTreemapNotes(arpBoards),
    [arpBoards]
  );

  const arpScatter = useMemo(
    () => buildScatterPositions(arpBoards),
    [arpBoards]
  );

  const arpKeys = useMemo(
    () => buildKeyUsage(arpBoards),
    [arpBoards]
  );

  const arpShapes = useMemo(
    () => buildShapeUsage(arpBoards),
    [arpBoards]
  );

  const arpFlow = useMemo(
    () => buildChordFlow(arpBoards),
    [arpBoards]
  );

  const arpRadarStrings = useMemo(
    () => buildRadarStringUsage(arpBoards),
    [arpBoards]
  );

  const arpModes = useMemo(
    () => buildModeUsage(arpBoards),
    [arpBoards]
  );

  // -------------------------------------------
  // SCALES DATA (computed once)
  // -------------------------------------------
  const scaleBoards = useMemo(
    () => sourceBoards.filter(b => b.scale || (b.general?.choice === "scale")),
    [sourceBoards]
  );

  const scaleNoteUsage = useMemo(
    () => buildNoteUsage(scaleBoards),
    [scaleBoards]
  );

  const scaleIntervalUsage = useMemo(
    () => buildIntervalUsage(scaleBoards),
    [scaleBoards]
  );

  const scaleStringUsage = useMemo(
    () => buildStringUsage(scaleBoards.map(b => b.fretboard)),
    [scaleBoards]
  );

  const scaleNeckZones = useMemo(
    () => buildNeckZones(scaleBoards.map(b => b.fretboard)),
    [scaleBoards]
  );

  const scaleFretHeatmap = useMemo(
    () => buildFretHeatmap(scaleBoards.map(b => b.fretboard)),
    [scaleBoards]
  );

  const scaleFretHistogram = useMemo(
    () => buildFretHistogram(scaleBoards),
    [scaleBoards]
  );

  const scaleFretRanges = useMemo(
    () => buildFretRanges(scaleBoards),
    [scaleBoards]
  );

  const scaleTreemap = useMemo(
    () => buildTreemapNotes(scaleBoards),
    [scaleBoards]
  );

  const scaleScatter = useMemo(
    () => buildScatterPositions(scaleBoards),
    [scaleBoards]
  );

  const scaleKeys = useMemo(
    () => buildKeyUsage(scaleBoards),
    [scaleBoards]
  );

  const scaleShapes = useMemo(
    () => buildShapeUsage(scaleBoards),
    [scaleBoards]
  );

  const scaleFlow = useMemo(
    () => buildChordFlow(scaleBoards),
    [scaleBoards]
  );

  const scaleRadarStrings = useMemo(
    () => buildRadarStringUsage(scaleBoards),
    [scaleBoards]
  );

  const scaleModes = useMemo(
    () => buildModeUsage(scaleBoards),
    [scaleBoards]
  );

  // ---------------------------------------------------------
  // RENDER SWITCH
  // ---------------------------------------------------------
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        🎸 Strum Dot Fun — Analytics Dashboard
      </Typography>

      {/* Tabs */}
      <Box sx={{ display: "flex", mb: 3 }}>
        {tabs.map((label, idx) => (
          <Button
            key={idx}
            onClick={() => setTab(idx)}
            variant={tab === idx ? "contained" : "outlined"}
            sx={{ flex: 1, borderRadius: 0 }}
          >
            {label}
          </Button>
        ))}
      </Box>

      {tab === 0 && (
        <Grid container spacing={3}>

          {/* 1 — Heatmap (Fret Intensity) */}
          <Grid item xs={12}>
            <Heatmap title="Fretboard Heatmap (All Data)" data={allFretHeatmap} />
          </Grid>

          {/* 2 — Note Frequency */}
          <Grid item xs={12} md={6}>
            <BarGraph title="Global Note Frequency" data={allNoteUsage} />
          </Grid>

          {/* 3 — Intervals */}
          <Grid item xs={12} md={6}>
            <PieGraph title="Interval Usage Ratio" data={allIntervalUsage} />
          </Grid>

          {/* 4 — Key Distribution */}
          <Grid item xs={12} md={6}>
            <BarGraph title="Key Usage Distribution" data={allKeyUsage} />
          </Grid>

          {/* 5 — Shape Distribution */}
          <Grid item xs={12} md={6}>
            <PieGraph title="Shape Preference Distribution" data={allShapeUsage} />
          </Grid>

          {/* 6 — Mode Distribution */}
          <Grid item xs={12}>
            <BarGraph title="Mode Usage" data={allModeUsage} />
          </Grid>

          {/* 7 — String Usage */}
          <Grid item xs={12} md={6}>
            <RadarGraph title="String Usage Radar" data={allRadarStrings} />
          </Grid>

          {/* 8 — Neck Zones */}
          <Grid item xs={12} md={6}>
            <PieGraph title="Neck Zones Heat Distribution" data={allNeckZones} />
          </Grid>

          {/* 9 — Fret Histogram */}
          <Grid item xs={12} md={6}>
            <HistogramGraph title="Fret Density Histogram" data={allFretHistogram} />
          </Grid>

          {/* 10 — Fret Range (min–max–avg) */}
          <Grid item xs={12} md={6}>
            <RangeGraph title="Fret Range Analysis" data={allFretRanges} />
          </Grid>

          {/* 11 — Scatter Plot (positions) */}
          <Grid item xs={12}>
            <ScatterGraph title="Fret vs String Density Map" data={allScatter} />
          </Grid>

          {/* 12 — Treemap Notes */}
          <Grid item xs={12}>
            <TreemapGraph title="Note Importance (Treemap)" data={allTreemapNotes} />
          </Grid>

          {/* 13 — Line Graph Note Frequency */}
          <Grid item xs={12} md={6}>
            <LineGraph title="Notes Trend (Sorted Alphabetically)" data={allNoteUsage} />
          </Grid>

          {/* 14 — Radial Bar Graph */}
          <Grid item xs={12} md={6}>
            <RadialBarGraph title="Radial Distribution of Notes" data={allNoteUsage} />
          </Grid>

          {/* 15 — Flow Graph (Chord → Next) */}
          <Grid item xs={12}>
            <FlowGraph title="Chord / Scale Flow Transitions" data={allFlow} />
          </Grid>

        </Grid>
      )}

      {tab === 1 && (
        <Grid container spacing={3}>

          {/* Prepare CHORDS-ONLY dataset *

          {/* 1 — Chord Heatmap */}
          <Grid item xs={12}>
            <Heatmap title="Chord Heatmap (Fretboard Intensity)" data={chordFretHeatmap} />
          </Grid>

          {/* 2 — Chord Note Frequency */}
          <Grid item xs={12} md={6}>
            <BarGraph title="Chord Note Frequency" data={chordNoteUsage} />
          </Grid>

          {/* 3 — Chord Intervals */}
          <Grid item xs={12} md={6}>
            <PieGraph title="Chord Interval Usage" data={chordIntervalUsage} />
          </Grid>

          {/* 4 — Chord Keys */}
          <Grid item xs={12} md={6}>
            <BarGraph title="Chord Keys Distribution" data={chordKeys} />
          </Grid>

          {/* 5 — Chord Shapes */}
          <Grid item xs={12} md={6}>
            <PieGraph title="Chord Shape Distribution" data={chordShapes} />
          </Grid>

          {/* 6 — Chord Mode Occurrence */}
          <Grid item xs={12} md={6}>
            <BarGraph title="Modal Presence in Chords" data={chordModes} />
          </Grid>

          {/* 7 — Chord String Usage */}
          <Grid item xs={12} md={6}>
            <RadarGraph title="Chord String Usage Radar" data={chordRadarStrings} />
          </Grid>

          {/* 8 — Chord Neck Zones */}
          <Grid item xs={12} md={6}>
            <PieGraph title="Chord Neck Zones" data={chordNeckZones} />
          </Grid>

          {/* 9 — Fret Histogram for Chords */}
          <Grid item xs={12} md={6}>
            <HistogramGraph title="Chord Fret Density Histogram" data={chordFretHistogram} />
          </Grid>

          {/* 10 — Chord Fret Range */}
          <Grid item xs={12} md={6}>
            <RangeGraph title="Chord Fret Range (Min / Max / Avg)" data={chordFretRanges} />
          </Grid>

          {/* 11 — Scatter Plot */}
          <Grid item xs={12}>
            <ScatterGraph title="Chord Fret vs String Scatter Plot" data={chordScatter} />
          </Grid>

          {/* 12 — Treemap */}
          <Grid item xs={12}>
            <TreemapGraph title="Chord Note Weights (Treemap)" data={chordTreemap} />
          </Grid>

          {/* 13 — Line Graph */}
          <Grid item xs={12} md={6}>
            <LineGraph title="Chord Notes Over Representation" data={chordNoteUsage} />
          </Grid>

          {/* 14 — Radial Bar */}
          <Grid item xs={12} md={6}>
            <RadialBarGraph title="Chord Radial Distribution" data={chordNoteUsage} />
          </Grid>

          {/* 15 — Flow Graph of Chord Progression */}
          <Grid item xs={12}>
            <FlowGraph title="Chord Transition Flow (Chord → Next)" data={chordFlow} />
          </Grid>

        </Grid>
      )}

      {tab === 2 && (
        <Grid container spacing={3}>

          {/* 1 — Heatmap */}
          <Grid item xs={12}>
            <Heatmap title="Arpeggio Heatmap" data={arpFretHeatmap} />
          </Grid>

          {/* 2 — Note Frequency */}
          <Grid item xs={12} md={6}>
            <BarGraph title="Arpeggio Note Frequency" data={arpNoteUsage} />
          </Grid>

          {/* 3 — Interval Usage */}
          <Grid item xs={12} md={6}>
            <PieGraph title="Arpeggio Interval Usage" data={arpIntervalUsage} />
          </Grid>

          {/* 4 — Key Usage */}
          <Grid item xs={12} md={6}>
            <BarGraph title="Arpeggio Key Distribution" data={arpKeys} />
          </Grid>

          {/* 5 — Shape Usage */}
          <Grid item xs={12} md={6}>
            <PieGraph title="Arpeggio Shape Usage" data={arpShapes} />
          </Grid>

          {/* 6 — Modes */}
          <Grid item xs={12} md={6}>
            <BarGraph title="Mode Occurrence in Arpeggios" data={arpModes} />
          </Grid>

          {/* 7 — Strings */}
          <Grid item xs={12} md={6}>
            <RadarGraph title="Arpeggio String Usage Radar" data={arpRadarStrings} />
          </Grid>

          {/* 8 — Zones */}
          <Grid item xs={12} md={6}>
            <PieGraph title="Arpeggio Neck Zones" data={arpNeckZones} />
          </Grid>

          {/* 9 — Histogram */}
          <Grid item xs={12} md={6}>
            <HistogramGraph title="Arpeggio Fret Histogram" data={arpFretHistogram} />
          </Grid>

          {/* 10 — Range */}
          <Grid item xs={12} md={6}>
            <RangeGraph title="Arpeggio Fret Range (Min/Max/Avg)" data={arpFretRanges} />
          </Grid>

          {/* 11 — Scatter */}
          <Grid item xs={12}>
            <ScatterGraph title="Arpeggio Fret vs String Scatter" data={arpScatter} />
          </Grid>

          {/* 12 — Treemap */}
          <Grid item xs={12}>
            <TreemapGraph title="Arpeggio Note Treemap" data={arpTreemap} />
          </Grid>

          {/* 13 — Line */}
          <Grid item xs={12} md={6}>
            <LineGraph title="Arpeggio Note Popularity Trend" data={arpNoteUsage} />
          </Grid>

          {/* 14 — Radial Bar */}
          <Grid item xs={12} md={6}>
            <RadialBarGraph title="Arpeggio Radial Note Distribution" data={arpNoteUsage} />
          </Grid>

          {/* 15 — Flow */}
          <Grid item xs={12}>
            <FlowGraph title="Arpeggio Flow (Sequence Map)" data={arpFlow} />
          </Grid>

        </Grid>
      )}

      {tab === 3 && (
        <Grid container spacing={3}>

          {/* 1 — Heatmap */}
          <Grid item xs={12}>
            <Heatmap title="Scale Heatmap" data={scaleFretHeatmap} />
          </Grid>

          {/* 2 — Note Frequency */}
          <Grid item xs={12} md={6}>
            <BarGraph title="Scale Note Frequency" data={scaleNoteUsage} />
          </Grid>

          {/* 3 — Interval Usage */}
          <Grid item xs={12} md={6}>
            <PieGraph title="Scale Interval Distribution" data={scaleIntervalUsage} />
          </Grid>

          {/* 4 — Key Distribution */}
          <Grid item xs={12} md={6}>
            <BarGraph title="Scale Key Distribution" data={scaleKeys} />
          </Grid>

          {/* 5 — Shape Distribution */}
          <Grid item xs={12} md={6}>
            <PieGraph title="Scale Shape Distribution" data={scaleShapes} />
          </Grid>

          {/* 6 — Modes */}
          <Grid item xs={12} md={6}>
            <BarGraph title="Mode Distribution (Scales)" data={scaleModes} />
          </Grid>

          {/* 7 — String Usage */}
          <Grid item xs={12} md={6}>
            <RadarGraph title="Scale String Usage Radar" data={scaleRadarStrings} />
          </Grid>

          {/* 8 — Neck Zones */}
          <Grid item xs={12} md={6}>
            <PieGraph title="Scale Neck Zones Distribution" data={scaleNeckZones} />
          </Grid>

          {/* 9 — Fret Histogram */}
          <Grid item xs={12} md={6}>
            <HistogramGraph title="Scale Fret Histogram" data={scaleFretHistogram} />
          </Grid>

          {/* 10 — Fret Range */}
          <Grid item xs={12} md={6}>
            <RangeGraph title="Scale Fret Range" data={scaleFretRanges} />
          </Grid>

          {/* 11 — Scatter */}
          <Grid item xs={12}>
            <ScatterGraph title="Scale Fret vs String Scatter" data={scaleScatter} />
          </Grid>

          {/* 12 — Treemap */}
          <Grid item xs={12}>
            <TreemapGraph title="Scale Note Treemap" data={scaleTreemap} />
          </Grid>

          {/* 13 — Line */}
          <Grid item xs={12} md={6}>
            <LineGraph title="Scale Note Trend" data={scaleNoteUsage} />
          </Grid>

          {/* 14 — Radial Bar */}
          <Grid item xs={12} md={6}>
            <RadialBarGraph title="Scale Radial Note Distribution" data={scaleNoteUsage} />
          </Grid>

          {/* 15 — Flow */}
          <Grid item xs={12}>
            <FlowGraph title="Scale Flow Pattern" data={scaleFlow} />
          </Grid>

        </Grid>
      )}

    </Box>
  );
}

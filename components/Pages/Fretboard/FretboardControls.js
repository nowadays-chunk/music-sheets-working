import React from "react";
import { Button, Box, Typography, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import CloseIcon from "@mui/icons-material/Close";
import guitar from "../../../config/guitar";

// ---------------------------------------------------------
// SHARED BUTTON STYLE (same as References component)
// ---------------------------------------------------------
const OptionButton = styled(Button)(({ selected }) => ({
  borderRadius: "20px",
  margin: "4px",
  background: selected ? "#1976d2" : "transparent",
  color: selected ? "#fff" : "#1976d2",
  border: "1px solid #1976d2",
  "&:hover": {
    background: selected ? "#11529b" : "rgba(25,118,210,0.1)",
  },
  textTransform: "none",
}));

// Step Title
const StepTitle = ({ children }) => (
  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
    {children}
  </Typography>
);

// Sharps normalizer for URL compatibility
const slugSharp = (s) => (s || "").replace("#", "sharp");

// ---------------------------------------------------------
// MAIN COMPONENT — BUTTON-BASED UI + RESET ICON
// ---------------------------------------------------------
const FretboardControls = ({
  choice,
  handleChoiceChange,
  selectedKey,
  onElementChange,
  scaleModes,
  arppegiosNames,
  onCleanFretboard,
  selectedMode,
  selectedScale,
  selectedChord,
  selectedArppegio,
  selectedShape,
  saveProgression,
  playSelectedNotes,
  progression,
}) => {
  const keysSharps = guitar.notes.sharps;

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // ---------------------------------------------------------
  // RESET EVERYTHING
  // ---------------------------------------------------------
  const resetAll = () => {
    onCleanFretboard();
    onElementChange(-1, "key");
    onElementChange(-1, "scale");
    onElementChange(-1, "mode");
    onElementChange('', "chord");
    onElementChange(-1, "arppegio");
    onElementChange('', "shape");
  };

  // ---------------------------------------------------------
  // BUILD PRINT URL
  // ---------------------------------------------------------
  const buildReferencePath = () => {
    const keyName = guitar.notes.sharps[selectedKey];
    if (!keyName) return null;

    const keySlug = slugSharp(keyName);

    if (choice === "chord") {
      if (!selectedChord) return null;
      return `/spreading/chords/${keySlug}/${slugSharp(selectedChord)}`;
    }

    if (choice === "arppegio") {
      if (!selectedArppegio) return null;
      return `/spreading/arppegios/${keySlug}/${slugSharp(selectedArppegio)}`;
    }

    if (choice === "scale") {
      if (!selectedScale) return null;

      if (guitar.scales[selectedScale]?.isModal) {
        if (selectedMode === "" || selectedMode == null) return null;

        const modeName = scaleModes[Number(selectedMode)]?.name;
        if (!modeName) return null;

        const modeSlug = modeName.toLowerCase().replace(/\s+/g, "-");
        return `/references/scales/${keySlug}/${selectedScale}/modal/${modeSlug}`;
      }

      return `/references/scales/${keySlug}/${selectedScale}/single`;
    }

    return null;
  };

  // PRINTING LOGIC
  const printUrl = (url) => {
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) return;

    const tryPrint = () => {
      try {
        w.focus();
        w.print();
      } catch {}
    };

    w.onload = () => setTimeout(tryPrint, 300);
    setTimeout(tryPrint, 1500);
  };

  const handlePrintTwoPages = () => {
    const refPath = buildReferencePath();
    if (!refPath) return;

    const origin = window.location.origin;
    printUrl(origin + refPath);
  };

  const canPrint = !!buildReferencePath();

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  return (
    <footer style={{ marginTop: "20px", position: "relative" }}>
      {/* RESET EVERYTHING ICON */}
      <Button
        onClick={resetAll}
        sx={{
          position: "absolute",
          right: 0,
          top: -10,
          minWidth: "30px",
          padding: "4px",
          borderRadius: "50%",
          color: "#1976d2",
        }}
      >
        <CloseIcon />
      </Button>

      {/* STEP 1 — CATEGORY */}
      <StepTitle>Category</StepTitle>

      <Box>
        <OptionButton
          selected={choice === "scale"}
          onClick={() => handleChoiceChange("scale")}
        >
          Scales
        </OptionButton>

        <OptionButton
          selected={choice === "chord"}
          onClick={() => handleChoiceChange("chord")}
        >
          Chords
        </OptionButton>

        <OptionButton
          selected={choice === "arppegio"}
          onClick={() => handleChoiceChange("arppegio")}
        >
          Arpeggios
        </OptionButton>
      </Box>

      {/* STEP 2 — KEY */}
      {choice && (
        <>
          <StepTitle>Key</StepTitle>

          <Box>
            {keysSharps.map((k, index) => (
              <OptionButton
                key={index}
                selected={selectedKey === index}
                onClick={() => onElementChange(index, "key")}
              >
                {k}
              </OptionButton>
            ))}
          </Box>
        </>
      )}

      {/* STEP 3 — SCALE TYPE / CHORD TYPE / ARPEGGIO TYPE */}
      {choice === "scale" && selectedKey !== "" && (
        <>
          <StepTitle>Scale Type</StepTitle>

          <Box>
            {Object.keys(guitar.scales).map((scaleName, i) => (
              <OptionButton
                key={i}
                selected={selectedScale === scaleName}
                onClick={() => onElementChange(scaleName, "scale")}
              >
                {capitalize(scaleName)}
              </OptionButton>
            ))}
          </Box>
        </>
      )}

      {choice === "chord" && selectedKey !== "" && (
        <>
          <StepTitle>Chord Type</StepTitle>

          <Box>
            {Object.keys(guitar.arppegios).map((ch, i) => (
              <OptionButton
                key={i}
                selected={selectedChord === ch}
                onClick={() => onElementChange(ch, "chord")}
              >
                {ch}
              </OptionButton>
            ))}
          </Box>
        </>
      )}

      {choice === "arppegio" && selectedKey !== "" && (
        <>
          <StepTitle>Arpeggio Type</StepTitle>

          <Box>
            {arppegiosNames.map((arp, i) => (
              <OptionButton
                key={i}
                selected={selectedArppegio === arp}
                onClick={() => onElementChange(arp, "arppegio")}
              >
                {arp}
              </OptionButton>
            ))}
          </Box>
        </>
      )}

      {/* STEP 4 — MODES */}
      {choice === "scale" &&
        selectedScale &&
        guitar.scales[selectedScale]?.isModal &&
        scaleModes.length > 0 && (
          <>
            <StepTitle>Modes</StepTitle>

            <Box>
              {scaleModes.map((m, i) => (
                <OptionButton
                  key={i}
                  selected={Number(selectedMode) === i}
                  onClick={() => onElementChange(i, "mode")}
                >
                  {m.name}
                </OptionButton>
              ))}
            </Box>
          </>
        )}

      {/* STEP 5 — SHAPE */}
      <StepTitle>Shape</StepTitle>
      <Box>
        {guitar.shapes.names.map((shape, i) => (
          <OptionButton
            key={i}
            selected={selectedShape === shape}
            onClick={() => onElementChange(shape, "shape")}
          >
            {shape}
          </OptionButton>
        ))}
      </Box>

      {/* ACTION BUTTONS */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={6}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={onCleanFretboard}
          >
            Clean
          </Button>
        </Grid>

        <Grid item xs={6}>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={saveProgression}
            disabled={!progression || progression.length === 0}
          >
            Save
          </Button>
        </Grid>

        <Grid item xs={6}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={playSelectedNotes}
          >
            Play Sound
          </Button>
        </Grid>

        <Grid item xs={6}>
          <Button
            fullWidth
            variant="contained"
            color="success"
            onClick={handlePrintTwoPages}
            disabled={!canPrint}
          >
            Read Spreadings
          </Button>
        </Grid>
      </Grid>
    </footer>
  );
};

// ---------------------------------------------------------
// PROP TYPES
// ---------------------------------------------------------
FretboardControls.propTypes = {
  handleChoiceChange: PropTypes.func.isRequired,
  selectedKey: PropTypes.any,
  scaleModes: PropTypes.array.isRequired,
  arppegiosNames: PropTypes.array.isRequired,
  choice: PropTypes.string.isRequired,
  onCleanFretboard: PropTypes.func.isRequired,
  selectedMode: PropTypes.any,
  selectedScale: PropTypes.string,
  selectedChord: PropTypes.string,
  selectedShape: PropTypes.string,
  selectedArppegio: PropTypes.string,
  selectedFret: PropTypes.string,
  saveProgression: PropTypes.func.isRequired,
  progression: PropTypes.array,
  onElementChange: PropTypes.func.isRequired,
  playSelectedNotes: PropTypes.func.isRequired,
};

export default FretboardControls;

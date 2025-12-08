// ============================================================================
// MusicApp.jsx — Flat monolithic version with header-based drawer toggle
// ============================================================================

import React, { useEffect, useCallback, useState } from "react";
import { IconButton } from "@mui/material";
import { styled } from "@mui/system";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { connect, useDispatch } from "react-redux";
import {
  addFretboard,
  updateStateProperty,
  setProgression,
  setProgressionKey,
} from "../../redux/actions";

import withFretboardState from "../../hocs/withFretboardState";

import FretboardDisplay from "../Pages/Fretboard/FretboardDisplay";
import FretboardControls from "../Pages/Fretboard/FretboardControls";
import CircleOfFifths from "../Pages/CircleOfFifths/CircleOfFifths";
import ChordComposer from "../Pages/Composer/ChordComposer";
import Stats from "../Pages/Stats/Stats";

import { useScore } from "@/core/editor/ScoreContext";
import guitar from "../../config/guitar";
import Meta from "../Partials/Head";

// ============================================================================
// CONSTANTS
// ============================================================================
const SIDEBAR_CLOSED = 60; // narrower closed drawer
const SIDEBAR_OPEN = 600;
const HEADER_PADDING = 16; // marginTop = marginLeft when open

const HEADER_HEIGHT_DESKTOP = 43;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================
const AppWrapper = styled("div")({
  display: "flex",
  width: "100%",
  minHeight: "100vh",
  overflow: "hidden",
  position: "relative",
});

// ----------------------------------
// Main Content
// ----------------------------------
const MainContent = styled("div")(({ drawerOpen }) => ({
  position: "relative",
  zIndex: 100,

  marginLeft: drawerOpen ? -SIDEBAR_OPEN : 30,
  marginTop: HEADER_HEIGHT_DESKTOP,
  transition: "margin-left 0.3s ease",

  paddingLeft: 100,
  paddingRight: 100,
  width: "calc(100vw - 200px)",
  minHeight: `calc(100vh - ${HEADER_HEIGHT_DESKTOP}px)`,

  overflowY: "auto",
  boxSizing: "border-box",
  display: "flex",
  justifyContent: "center",

  "@media (max-width: 800px)": {
    width: "100vw",
    paddingLeft: 10,
    paddingRight: 10,
    marginLeft: drawerOpen ? -100 : 0,
  },
}));

const MainInner = styled("div")({
  width: "100%",
  maxWidth: "1400px",
  padding: 0,
});

// ----------------------------------
// Sidebar Drawer
// ----------------------------------
const SideDrawer = styled("div")(({ open }) => ({
  position: "fixed",
  top: HEADER_HEIGHT_DESKTOP,
  right: 0,

  height: `calc(100vh - ${HEADER_HEIGHT_DESKTOP}px)`,
  width: open ? SIDEBAR_OPEN : SIDEBAR_CLOSED,
  minWidth: open ? SIDEBAR_OPEN : SIDEBAR_CLOSED,

  backgroundColor: "#f5f5f5",
  borderLeft: "1px solid #ddd",
  boxSizing: "border-box",
  zIndex: 2000,
  transition: "width 0.3s ease",

  display: "flex",
  flexDirection: "column",

  "@media (max-width: 1200px)": {
    width: open ? "100vw" : SIDEBAR_CLOSED,
    minWidth: open ? "100vw" : SIDEBAR_CLOSED,
  },
}));

// ----------------------------------
// Drawer Header (contains the toggle)
// ----------------------------------
const DrawerHeader = styled("div")(({ open }) => ({
  height: 60,
  boxSizing: "border-box",
  borderBottom: "1px solid #ddd",

  display: "flex",
  alignItems: open ? "flex-start" : "center",
  justifyContent: open ? "flex-start" : "center",

  padding: open ? HEADER_PADDING : 0,
}));

// ----------------------------------
// Sidebar Toggle inside header
// ----------------------------------
const DrawerToggle = styled(IconButton)(({ open }) => ({
  width: 36,
  height: 36,
  background: "#ffffff",
  border: "2px solid #463f4b",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 6,
  marginTop: 10,
  "&:hover": {
    background: "#f0f0f0",
  },
}));

// ----------------------------------
// Drawer Content
// ----------------------------------
const DrawerContent = styled("div")(({ open }) => ({
  flex: 1,
  width: "100%",
  boxSizing: "border-box",

  paddingLeft: open ? 24 : 0,
  paddingRight: open ? 24 : 0,
  paddingTop: open ? 16 : 0,
  paddingBottom: open ? 24 : 0,

  opacity: open ? 1 : 0,
  pointerEvents: open ? "auto" : "none",
  transition: "opacity 0.2s ease",

  overflowY: "auto",
  overflowX: "hidden",

  "&::-webkit-scrollbar": { width: "8px" },
  "&::-webkit-scrollbar-track": { background: "#ededed" },
  "&::-webkit-scrollbar-thumb": { background: "#cfcfcf", borderRadius: "10px" },
}));

// ----------------------------------------------------------------------------
// Root / Fretboard Container
// ----------------------------------------------------------------------------
const Root = styled("div")({ display: "flex", padding: 0, flexDirection: "column", width: "100%" });
const FretboardContainer = styled("div")({ width: "100%", marginTop: 20, marginBottom: 20 });

// ============================================================================
// MAIN COMPONENT — MUSIC APP
// ============================================================================
const MusicApp = (props) => {
  const dispatch = useDispatch();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    boards,
    selectedFretboard,
    selectedFretboardIndex,
    handleFretboardSelect,
    handleChoiceChange,
    createNewBoardDisplay,
    cleanFretboard,
    onElementChange,

    keyIndex,
    scale,
    modeIndex,
    shape,
    quality,
    display,
    updateBoards,

    showFretboardControls,
    showFretboard,
    showChordComposer,
    showCircleOfFifths,
    showStats,
  } = props;

  const { addNoteFromFretboard } = useScore();

  // ==========================================================================
  // UPDATE CURRENT BOARD STATE
  // ==========================================================================
  const updateBoardsCallback = useCallback(() => {
    if (!selectedFretboard?.id) return;

    if (!isNaN(keyIndex))
      dispatch(updateBoards(selectedFretboard.id, "keySettings." + display, keyIndex));

    if (!isNaN(modeIndex))
      dispatch(updateBoards(selectedFretboard.id, "keySettings.mode", modeIndex));

    if (display === "scale") {
      dispatch(updateBoards(selectedFretboard.id, "generalSettings.choice", "scale"));
      dispatch(updateBoards(selectedFretboard.id, "scaleSettings.scale", scale));

      if (guitar.scales[scale]?.isModal) {
        dispatch(
          updateBoards(
            selectedFretboard.id,
            "modeSettings.mode",
            guitar.scales[scale].modes[modeIndex].name
          )
        );

        if (shape !== "") {
          dispatch(updateBoards(selectedFretboard.id, "modeSettings.shape", shape));
          dispatch(updateBoards(selectedFretboard.id, "scaleSettings.shape", shape));
        }
      } else {
        dispatch(updateBoards(selectedFretboard.id, "scaleSettings.shape", shape));
      }
    }

    if (display === "arppegio") {
      dispatch(updateBoards(selectedFretboard.id, "generalSettings.choice", "arppegio"));
      dispatch(updateBoards(selectedFretboard.id, "arppegioSettings.arppegio", quality));
      if (shape !== "") dispatch(updateBoards(selectedFretboard.id, "arppegioSettings.shape", shape));
    }

    if (display === "chord") {
      dispatch(updateBoards(selectedFretboard.id, "generalSettings.choice", "chord"));
      dispatch(updateBoards(selectedFretboard.id, "chordSettings.chord", quality));
      if (shape !== "") dispatch(updateBoards(selectedFretboard.id, "chordSettings.shape", shape));
    }
  }, [
    dispatch,
    display,
    selectedFretboard,
    keyIndex,
    modeIndex,
    scale,
    shape,
    quality,
    updateBoards,
  ]);

  useEffect(() => {
    updateBoardsCallback();
  }, [updateBoardsCallback]);

  if (!selectedFretboard) return <div>Loading...</div>;

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================
  return (
    <AppWrapper>
      <MainContent drawerOpen={drawerOpen}>
        <MainInner>
          <Root>
            <Meta />

            {showFretboard && (
              <FretboardContainer>
                <FretboardDisplay
                  selectedFretboard={selectedFretboard}
                  boards={boards}
                  handleFretboardSelect={(fbIndex) => {
                    handleFretboardSelect(fbIndex);
                    setDrawerOpen(true);
                  }}
                  onElementChange={onElementChange}
                  onNoteClick={(noteObj) => {
                    if (selectedFretboard.generalSettings.page === "compose")
                      addNoteFromFretboard(noteObj);
                  }}
                  visualizerModalIndex={selectedFretboard.modeSettings.mode}
                />
              </FretboardContainer>
            )}

            {showCircleOfFifths && (
              <CircleOfFifths
                tone="C"
                onElementChange={onElementChange}
                selectedFretboardIndex={selectedFretboardIndex}
              />
            )}

            {showChordComposer && (
              <ChordComposer
                onElementChange={onElementChange}
                selectedKey={selectedFretboard.keySettings.key}
                selectedArppegio={selectedFretboard.arppegioSettings.arppegio}
              />
            )}

            {showStats && <Stats boards={boards} />}
          </Root>
        </MainInner>
      </MainContent>

      {/* ====================================================================== */}
      {/* SIDEBAR */}
      {/* ====================================================================== */}
      <SideDrawer open={drawerOpen}>
        <DrawerHeader open={drawerOpen}>
          <DrawerToggle
            open={drawerOpen}
            onClick={() => setDrawerOpen((prev) => !prev)}
            aria-label={drawerOpen ? "Close drawer" : "Open drawer"}
          >
            {drawerOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </DrawerToggle>
        </DrawerHeader>

        <DrawerContent open={drawerOpen}>
          {showFretboardControls && (
            <FretboardControls
              createNewBoardDisplay={createNewBoardDisplay}
              handleChoiceChange={handleChoiceChange}
              onCleanFretboard={cleanFretboard}
              selectedKey={selectedFretboard.keySettings[selectedFretboard.generalSettings.choice]}
              selectedScale={selectedFretboard.scaleSettings.scale}
              selectedChord={selectedFretboard.chordSettings.chord}
              selectedShape={
                selectedFretboard[selectedFretboard.generalSettings.choice + "Settings"].shape
              }
              selectedMode={selectedFretboard.modeSettings.mode}
              onElementChange={onElementChange}
              scaleModes={
                selectedFretboard.scaleSettings.scale
                  ? guitar.scales[selectedFretboard.scaleSettings.scale].modes
                  : []
              }
              arppegiosNames={Object.keys(guitar.arppegios)}
              choice={selectedFretboard.generalSettings.choice}
            />
          )}
        </DrawerContent>
      </SideDrawer>
    </AppWrapper>
  );
};

// ============================================================================
// REDUX CONNECTION
// ============================================================================
const mapStateToProps = (state, ownProps) => {
  const filteredBoards = state.fretboard.components.filter(
    (board) => board.generalSettings.page === ownProps.board
  );

  return {
    boards: filteredBoards,
    progressions: state.partitions,
  };
};

export default connect(mapStateToProps, {
  addFretboard,
  updateBoards: updateStateProperty,
  setProgression,
  setProgressionKey,
})(withFretboardState(MusicApp));

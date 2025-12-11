// ============================================================================
// MusicApp.jsx — FINAL VERSION (Hydration-Safe)
// ============================================================================

import React, { useEffect, useCallback, useState } from "react";
import { IconButton } from "@mui/material";
import { styled } from "@mui/system";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

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
const SIDEBAR_CLOSED = 40;
const SIDEBAR_OPEN = 600;
const HEADER_HEIGHT = 44;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

// Root wrapper
const AppWrapper = styled("div")({
  display: "flex",
  flexDirection: "column",
  maxWidth: "100vw",
  overflowX: "hidden",
  overflowY: "hidden",
  position: "relative",
});

// Main content
const MainContent = styled("div")(({ drawerOpen }) => ({
  position: "relative",
  flex: 1,
  width: "100%",
  overflowY: "auto",
  overflowX: "hidden",
  margin: 0,
  padding: 0,
  transition: "margin-left 0.3s ease",

  ...(drawerOpen && {
    "@media (min-width:1200px)": {
      marginLeft: -SIDEBAR_OPEN,
    },
  }),
}));

const MainInner = styled("div")({
  width: "100%",
  maxWidth: "100vw",
  overflowX: "hidden",
  margin: 0,
  "@media (max-width:1200px)": { padding: "0px 15px" },
  "@media (min-width:1200px)": { padding: "0px 180px" },
  boxSizing: "border-box",
});

// Desktop drawer
const SideDrawer = styled("div")(({ open }) => ({
  position: "fixed",
  top: HEADER_HEIGHT,
  right: 0,
  height: `calc(100vh - ${HEADER_HEIGHT}px)`,
  width: open ? SIDEBAR_OPEN : SIDEBAR_CLOSED,
  minWidth: open ? SIDEBAR_OPEN : SIDEBAR_CLOSED,
  backgroundColor: "#f5f5f5",
  borderLeft: "1px solid #ddd",
  zIndex: 2000,
  transition: "width 0.3s ease",
  display: "flex",
  flexDirection: "column",

  "@media (max-width:1200px)": { display: "none" },
}));

const DrawerHeader = styled("div")(({ open }) => ({
  height: open ? 25 : 45,
  borderBottom: "1px solid #ddd",
  display: "flex",
  padding: open ? 10 : 0,
  alignItems: open ? "flex-start" : "center",
  justifyContent: open ? "flex-start" : "center",
}));

const DrawerToggleDesktop = styled(IconButton)({
  width: 24,
  height: 24,
  border: "2px solid #463f4b",
  borderRadius: "50%",
  background: "#fff",
  padding: 6,
  "&:hover": { background: "#f0f0f0" },
});

const DrawerContent = styled("div")(({ open }) => ({
  flex: 1,
  width: "100%",
  padding: open ? 24 : 0,
  opacity: open ? 1 : 0,
  pointerEvents: open ? "auto" : "none",
  transition: "opacity 0.2s ease",
  overflowY: "auto",
}));

// Mobile drawer
const MobileDrawer = styled("div")(({ open }) => ({
  position: "fixed",
  top: HEADER_HEIGHT,
  left: 0,
  right: 0,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  padding: 0,
  transform: "translateZ(0)",
  WebkitTransform: "translateZ(0)",
  WebkitOverflowScrolling: "touch",
  backgroundColor: "#f5f5f5",
  borderBottom: "1px solid #5a5656ff",
  zIndex: 3000,
  overflowX: "hidden",
  overflowY: open ? "auto" : "hidden",
  maxHeight: open ? "100%" : SIDEBAR_CLOSED,
  transition: "max-height 0.35s ease",

  "@media (min-width:1200px)": { display: "none" },
}));

const MobileDrawerHeader = styled("div")({
  height: 40,
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  borderBottom: "1px solid #ccc",
  paddingRight: 20,
});

const MobileDrawerToggle = styled(IconButton)({
  width: 24,
  height: 24,
  borderRadius: "50%",
  border: "2px solid #463f4b",
  background: "#fff",
});

const MobileDrawerContent = styled("div")({
  width: "100%",
  maxWidth: "100%",
  padding: "0px 40px 50px 30px",
  boxSizing: "border-box",
  overflowX: "hidden",
});

// **HYDRATION-SAFE SCROLL WRAPPER**
const FretboardScroll = styled("div")({
  width: "100%",
  maxWidth: "100%",
  overflowX: "auto",
  overflowY: "hidden",
  WebkitOverflowScrolling: "touch",
  "& > *": {
    maxWidth: "none !important",
  },
});

// Outer fretboard container
const FretboardContainer = styled("div")({
  width: "100%",
  maxWidth: "100%",
  marginBottom: 20,
});

// Root content wrapper
const Root = styled("div")({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  overflowX: "hidden",
});

// ============================================================================
// COMPONENT
// ============================================================================
const MusicApp = (props) => {
  const dispatch = useDispatch();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const {
    board,
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
    leftDrawerOpen,
    leftDrawerWidth,
  } = props;

  const { addNoteFromFretboard } = useScore();

  // UPDATE LOGIC (unchanged)
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
    dispatch, display, selectedFretboard, keyIndex, modeIndex,
    scale, shape, quality, updateBoards
  ]);

  useEffect(() => {
    updateBoardsCallback();
  }, [updateBoardsCallback]);

  if (!selectedFretboard) return <div>Loading...</div>;

  // ========================================================================
  // RENDER
  // ========================================================================
  return (
    <AppWrapper>

      {/* MOBILE DRAWER */}
      {showFretboardControls && (
        <MobileDrawer
          open={mobileDrawerOpen}
          sx={{
            left: leftDrawerOpen ? leftDrawerWidth : 0,
            width: leftDrawerOpen
              ? `calc(100% - ${leftDrawerWidth}px)`
              : "100%",
          }}
        >
          <MobileDrawerHeader>
            <MobileDrawerToggle onClick={() => setMobileDrawerOpen(v => !v)}>
              {mobileDrawerOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </MobileDrawerToggle>
          </MobileDrawerHeader>

          <MobileDrawerContent>
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
          </MobileDrawerContent>
        </MobileDrawer>
      )}

      {/* MAIN CONTENT */}
      <MainContent drawerOpen={drawerOpen}>
        <MainInner sx={{
          "@media (min-width:1200px)": { padding: board === 'compose' ? '20px' : "0px 180px" }
        }}>
          <Root>
            <Meta />

            {showFretboard && (
              <FretboardContainer>
                <FretboardScroll>
                  <FretboardDisplay
                    selectedFretboard={selectedFretboard}
                    boards={boards}
                    handleFretboardSelect={(i) => {
                      handleFretboardSelect(i);
                      // REMOVE auto-open behavior
                      // setMobileDrawerOpen(true);
                      // setDrawerOpen(true);
                    }}
                    onElementChange={onElementChange}
                    onNoteClick={(noteObj) => {
                      if (selectedFretboard.generalSettings.page === "compose"){
                        console.log(noteObj);
                        addNoteFromFretboard(noteObj);
                      }
                    }}
                    visualizerModalIndex={selectedFretboard.modeSettings.mode}
                  />
                </FretboardScroll>
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

      {/* DESKTOP SIDEBAR */}
      {showFretboardControls && (
        <SideDrawer open={drawerOpen}>
          <DrawerHeader open={drawerOpen}>
            <DrawerToggleDesktop onClick={() => setDrawerOpen(v => !v)}>
              {drawerOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </DrawerToggleDesktop>
          </DrawerHeader>

          <DrawerContent open={drawerOpen}>
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
          </DrawerContent>
        </SideDrawer>
      )}

    </AppWrapper>
  );
};

// ============================================================================
// REDUX CONNECTION
// ============================================================================
const mapStateToProps = (state, ownProps) => {
  const filteredBoards = state.fretboard.components.filter(
    (b) => b.generalSettings.page === ownProps.board
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

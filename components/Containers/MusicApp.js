// ============================================================================
// MusicApp.jsx — CSS-only responsive version
// Desktop drawer ≥ 1200px
// Mobile dropdown < 1200px
// NO useMediaQuery → NO hydration issue
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
const HEADER_HEIGHT_MOBILE = 55;
const HEADER_PADDING = 16;

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

// MAIN CONTENT
const MainContent = styled("div")(({ drawerOpen }) => ({
  position: "relative",
  zIndex: 100,
  marginTop: HEADER_HEIGHT,
  transition: "margin-left 0.3s ease",

  paddingLeft: 100,
  paddingRight: 100,
  marginLeft: drawerOpen ? -SIDEBAR_OPEN : 30,

  width: "calc(100vw - 200px)",
  minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
  overflowY: "auto",
  boxSizing: "border-box",
  display: "flex",
  justifyContent: "center",

  // MOBILE / TABLET
  "@media (max-width:1200px)": {
    paddingLeft: 0,
    paddingRight: 20,
    marginLeft: 0,
    width: "100vw",
  },
}));

const MainInner = styled("div")({
  width: "100%",
  maxWidth: "1400px",
});

// ============================================================================
// DESKTOP RIGHT SIDEBAR (≥ 1200px)
// ============================================================================
const SideDrawer = styled("div")(({ open }) => ({
  position: "fixed",
  top: HEADER_HEIGHT,
  right: 0,
  height: `calc(100vh - ${HEADER_HEIGHT}px)`,
  width: open ? SIDEBAR_OPEN : SIDEBAR_CLOSED,
  minWidth: open ? SIDEBAR_OPEN : SIDEBAR_CLOSED,
  backgroundColor: "#f5f5f5",
  borderLeft: "1px solid #ddd",
  boxSizing: "border-box",
  zIndex: 2000,
  transition: "width 0.3s ease",
  display: "flex",
  flexDirection: "column",

  "@media (max-width:1200px)": {
    display: "none",
  },
}));

const DrawerHeader = styled("div")(({ open }) => ({
  height: 60,
  borderBottom: "1px solid #ddd",
  display: "flex",
  alignItems: open ? "flex-start" : "center",
  justifyContent: open ? "flex-start" : "center",
  padding: open ? HEADER_PADDING : 0,
}));

const DrawerToggleDesktop = styled(IconButton)(({ open }) => ({
  width: 24,
  height: 24,
  padding: 6,
  background: "#fff",
  border: "2px solid #463f4b",
  borderRadius: "50%",
  "&:hover": { background: "#f0f0f0" },
}));

const DrawerContent = styled("div")(({ open }) => ({
  flex: 1,
  width: "100%",
  padding: open ? 24 : 0,
  opacity: open ? 1 : 0,
  pointerEvents: open ? "auto" : "none",
  transition: "opacity 0.2s ease",
  overflowY: "auto",
}));

// ============================================================================
// MOBILE/TABLET TOP DRAWER (< 1200px)
// ============================================================================
const MobileDrawer = styled("div")(({ open }) => ({
  position: "fixed",
  top: HEADER_HEIGHT,
  left: 0,
  width: "100vw",
  backgroundColor: "#f5f5f5",
  borderBottom: "1px solid #ddd",

  zIndex: 3000,
  overflow: "hidden",

  // height logic driven by the open prop
  maxHeight: open ? "100vh" : SIDEBAR_CLOSED,
  transition: "max-height 0.35s ease",

  "@media (min-width:1200px)": {
    display: "none",
  },
}));


const MobileDrawerHeader = styled("div")({
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "end",
  paddingRight: 50,
  borderLeft: "1px solid #ccc",
});

const MobileDrawerToggle = styled(IconButton)({
  width: 24,
  height: 24,
  borderRadius: "50%",
  border: "2px solid #463f4b",
  background: "#fff",
  "&:hover": { background: "#f0f0f0" },
});

const MobileDrawerContent = styled("div")({
  overflow: "hidden",
  padding: 20,
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const Root = styled("div")({
  width: "100%",
  display: "flex",
  flexDirection: "column",
});

const FretboardContainer = styled("div")({
  width: "100%",
  marginTop: 20,
  marginBottom: 20,
});

const MusicApp = (props) => {
  const dispatch = useDispatch();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

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

  // STATE UPDATE
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
  // RENDER
  // ==========================================================================
  return (
    <AppWrapper>

      {/* MOBILE DRAWER (<1200px) */}
      <MobileDrawer open={mobileDrawerOpen}>
        <MobileDrawerHeader>
          <MobileDrawerToggle onClick={() => setMobileDrawerOpen(x => !x)}>
            {mobileDrawerOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </MobileDrawerToggle>
        </MobileDrawerHeader>

        <MobileDrawerContent>
          {showFretboardControls && (
            <FretboardControls
              createNewBoardDisplay={createNewBoardDisplay}
              handleChoiceChange={handleChoiceChange}
              onCleanFretboard={cleanFretboard}
              selectedKey={
                selectedFretboard.keySettings[selectedFretboard.generalSettings.choice]
              }
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
        </MobileDrawerContent>
      </MobileDrawer>

      {/* MAIN CONTENT */}
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

                    // Only open drawers — CSS decides which one is visible
                    setMobileDrawerOpen(true);
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

      {/* DESKTOP SIDEBAR (≥1200px) */}
      <SideDrawer open={drawerOpen}>
        <DrawerHeader open={drawerOpen}>
          <DrawerToggleDesktop onClick={() => setDrawerOpen((x) => !x)}>
            {drawerOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </DrawerToggleDesktop>
        </DrawerHeader>

        <DrawerContent open={drawerOpen}>
          {showFretboardControls && (
            <FretboardControls
              createNewBoardDisplay={createNewBoardDisplay}
              handleChoiceChange={handleChoiceChange}
              onCleanFretboard={cleanFretboard}
              selectedKey={
                selectedFretboard.keySettings[selectedFretboard.generalSettings.choice]
              }
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

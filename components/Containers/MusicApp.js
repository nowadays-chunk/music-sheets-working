// MusicApp.jsx
import { IconButton } from "@mui/material";
import { styled } from "@mui/system";
import { useEffect, useCallback, useState } from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { useScore } from "@/core/editor/ScoreContext";

import FretboardControls from "../Pages/Fretboard/FretboardControls";
import CircleOfFifths from "../Pages/CircleOfFifths/CircleOfFifths";
import FretboardDisplay from "../Pages/Fretboard/FretboardDisplay";
import ChordComposer from "../Pages/Composer/ChordComposer";
import Stats from "../Pages/Stats/Stats";

import withFretboardState from "../../hocs/withFretboardState";
import { connect, useDispatch } from "react-redux";
import {
  addFretboard,
  updateStateProperty,
  setProgression,
  setProgressionKey,
} from "../../redux/actions";

import guitar from "../../config/guitar";
import Meta from "../Partials/Head";

// ============================================================================
// FIXED DRAWER LAYOUT — UPDATED WITH ALL REQUIREMENTS
// ============================================================================

const AppWrapper = styled("div")({
  display: "flex",
  width: "100%",
  minHeight: "100vh",
  overflow: "hidden",
  position: "relative",
});

const HEADER_HEIGHT_DESKTOP = 43;
const HEADER_HEIGHT_MOBILE = 59; // adjust to your actual mobile header height

const MainContent = styled("div")(({ drawerOpen }) => ({
  position: "relative",
  zIndex: 100,
  marginLeft: drawerOpen ? -600 : 30,
  marginTop: HEADER_HEIGHT_DESKTOP,
  transition: "margin-left 0.3s ease, margin-top 0.3s ease",
  paddingLeft: 100,
  paddingRight: 100,
  width: "calc(100vw - 200px)",
  minHeight: `calc(100vh - ${HEADER_HEIGHT_DESKTOP}px)`,
  boxSizing: "border-box",
  overflowY: "auto",
  display: "flex",
  justifyContent: "center",
  "@media (max-width: 1200px) and (min-width: 900px)": {
    marginTop: HEADER_HEIGHT_MOBILE,
    minHeight: `calc(100vh - ${HEADER_HEIGHT_MOBILE}px)`,
  }
}));

const SideDrawer = styled("div")(({ open }) => ({
  position: "fixed",
  top: HEADER_HEIGHT_DESKTOP,
  right: 0,
  height: `calc(100vh - ${HEADER_HEIGHT_DESKTOP}px)`,
  paddingLeft: 30,
  paddingRight: 30,
  paddingBottom: 30,
  width: open ? 600 : 80,
  minWidth: open ? 600 : 80,

  transition: "width 0.3s ease",
  backgroundColor: "#f5f5f5",
  borderRight: "1px solid #ddd",
  boxSizing: "border-box",
  zIndex: 2000,

  // 🔥 IMPORTANT FIXES FOR SCROLLING
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  overflowX: "hidden",
  flexShrink: 1,
  minHeight: 0, // ⭐ REQUIRED (otherwise flexbox blocks scroll)

  // Smooth scrolling
  scrollBehavior: "smooth",

  // Custom scrollbar
  "&::-webkit-scrollbar": {
    width: "10px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#ededed",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#cfcfcf",
    borderRadius: "10px",
    border: "2px solid #ededed",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: "#b5b5b5",
  },

  scrollbarColor: "#cfcfcf #ededed",
  scrollbarWidth: "thin",

  "@media (max-width: 1200px) and (min-width: 900px)": {
    top: HEADER_HEIGHT_MOBILE,
    height: `calc(100vh - ${HEADER_HEIGHT_MOBILE}px)`,
  },
}));


const DrawerToggle = styled(IconButton)({
  alignSelf: "flex-start",
  marginBottom: 10,
  marginTop: 20,
  width: 36,
  height: 36,
});

const DrawerContent = styled("div")(({ open }) => ({
  flex: 1,
  overflowY: open ? "auto" : "hidden",
  display: "flex",
  flexDirection: "column",
  gap: open ? 16 : 0,
  opacity: open ? 1 : 0,
  pointerEvents: open ? "auto" : "none",
  transition: "opacity 0.2s ease",
}));

const CircleIconBox = styled("div")({
  width: 60,
  height: 29,
  borderRadius: "50%",
  border: "2px solid #463f4bff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const MainInner = styled("div")({
  width: "100%",
  maxWidth: "1400px",
});

const Root = styled("div")({
  display: "flex",
  flexDirection: "column",
  width: "100%",
});

const FretboardContainer = styled("div")({
  width: "100%",
  marginTop: "20px",
  marginBottom: "20px",
});


// ============================================================================
// MAIN COMPONENT
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
    showFretboardControls,
    showFretboard,
    showChordComposer,
    showCircleOfFifths,
    showStats,

    keyIndex,
    scale,
    modeIndex,
    shape,
    quality,
    display,
    updateBoards,
  } = props;

  const { addNoteFromFretboard } = useScore();


  // ========================================================================
  // UPDATE CURRENT BOARD STATE
  // ========================================================================
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


  // ========================================================================
  // MAIN PAGE CONTENT
  // ========================================================================
  const components = (
    <Root>
      <Meta />

      {showFretboard && (
        <FretboardContainer>
          <FretboardDisplay
            selectedFretboard={selectedFretboard}
            boards={boards}
            handleFretboardSelect={handleFretboardSelect}
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
  );


  // ========================================================================
  // FINAL PAGE LAYOUT
  // ========================================================================
  return (
    <AppWrapper>
        {/* MAIN PAGE CONTENT */}
      <MainContent drawerOpen={drawerOpen}>
        <MainInner>{components}</MainInner>
      </MainContent>

      {/* FIXED DRAWER ALWAYS ON TOP */}
      <SideDrawer open={drawerOpen}>
        <DrawerToggle onClick={() => setDrawerOpen(!drawerOpen)}>
          <CircleIconBox>
              {drawerOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </ CircleIconBox>
        </DrawerToggle>

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


  console.log("filteredBoards ", filteredBoards);
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

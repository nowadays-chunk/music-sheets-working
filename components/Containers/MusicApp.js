// MusicApp.jsx
import { IconButton } from "@mui/material";
import { styled } from "@mui/system";
import { useEffect, useCallback, useState } from "react";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
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

const HEADER_HEIGHT = 45;

const AppWrapper = styled("div")({
  display: "flex",
  width: "100%",
  minHeight: "100vh",
  overflow: "hidden",
  position: "relative",
});

const SideDrawer = styled("div")(({ open }) => ({
  position: "fixed",
  top: HEADER_HEIGHT,
  left: 0,
  height: `calc(100vh - ${HEADER_HEIGHT}px)`,
  width: open ? 600 : 60,
  minWidth: open ? 600 : 60,
  transition: "width 0.3s ease",
  backgroundColor: "#f5f5f5",
  borderRight: "1px solid #ddd",
  display: "flex",
  flexDirection: "column",
  padding: 8,
  boxSizing: "border-box",
  zIndex: 2000,            // drawer ALWAYS stays above content
  overflow: "hidden",
}));

const DrawerToggle = styled(IconButton)({
  alignSelf: "flex-end",
  marginBottom: 10,
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


// ======================
// MAIN CONTENT WRAPPER
// ======================
const MainContent = styled("div")(({ drawerOpen }) => ({
  position: "relative",
  zIndex: 100, // always below drawer
  marginLeft: drawerOpen ? 600 : 60,
  marginTop: HEADER_HEIGHT,
  transition: "margin-left 0.3s ease",
  paddingLeft: 100,
  paddingRight: 100,
  width: "calc(100vw - 200px)",    // ALWAYS 100% - 100px left - 100px right
  minHeight: "calc(100vh - 45px)",
  boxSizing: "border-box",
  overflowY: "auto",
  display: "flex",
  justifyContent: "center",
}));

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
  const [drawerOpen, setDrawerOpen] = useState(true);

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

      {/* FIXED DRAWER ALWAYS ON TOP */}
      <SideDrawer open={drawerOpen}>
        <DrawerToggle onClick={() => setDrawerOpen(!drawerOpen)}>
          {drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
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


      {/* MAIN PAGE CONTENT */}
      <MainContent drawerOpen={drawerOpen}>
        <MainInner>{components}</MainInner>
      </MainContent>

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

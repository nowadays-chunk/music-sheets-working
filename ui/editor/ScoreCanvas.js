import React, { useEffect, useRef, useState } from "react";
import CombinedRenderer from "@/core/music/render/CombinedRenderer";
import { useScore } from "@/core/editor/ScoreContext";

export default function ScoreCanvas() {
  const { score } = useScore();

  const notationRef = useRef(null);
  const tabRef = useRef(null);

  const [activeTab, setActiveTab] = useState("notation");

  // Prevent react from throwing errors on first mount
  const isReady =
    score &&
    typeof window !== "undefined" &&
    notationRef.current &&
    tabRef.current;

  useEffect(() => {
    if (!isReady) return;

    const renderer = new CombinedRenderer({
      notationContainer: notationRef.current,
      tabContainer: tabRef.current,
      score
    });

    renderer.render();
  }, [score, isReady]);

  // Handle loading state to avoid undefined HTML errors
  if (!score) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        Loading score…
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        marginTop: 40,
        paddingBottom: 60,
        overflow: "visible",
      }}
    >
      {/* TOGGLE BUTTONS */}
      <div
        style={{
          display: "flex",
          width: "100%",
          border: "1px solid #ccc",
          overflow: "hidden",
          background: "#fafafa",
          position: "relative",
          zIndex: 10,
        }}
      >
        <button
          onClick={() => setActiveTab("notation")}
          style={{
            width: "50%",
            padding: "12px 0",
            fontSize: 16,
            fontWeight: activeTab === "notation" ? "bold" : "normal",
            background: activeTab === "notation" ? "#1976d2" : "#eaeaea",
            color: activeTab === "notation" ? "#fff" : "#333",
            border: "none",
            cursor: "pointer",
          }}
        >
          SCORE
        </button>

        <button
          onClick={() => setActiveTab("tab")}
          style={{
            width: "50%",
            padding: "12px 0",
            fontSize: 16,
            fontWeight: activeTab === "tab" ? "bold" : "normal",
            background: activeTab === "tab" ? "#1976d2" : "#eaeaea",
            color: activeTab === "tab" ? "#fff" : "#333",
            border: "none",
            cursor: "pointer",
          }}
        >
          TAB
        </button>
      </div>

      {/* SPACING BELOW BUTTONS */}
      <div style={{ height: 40 }}></div>

      {/* SCORE SVG */}
      <div
        ref={notationRef}
        className="notation"
        style={{
          display: activeTab === "notation" ? "block" : "none",
          width: "100%",
          minHeight: 300,
        }}
      ></div>

      {/* TAB SVG */}
      <div
        ref={tabRef}
        className="tablature"
        style={{
          display: activeTab === "tab" ? "block" : "none",
          width: "100%",
          minHeight: 200,
        }}
      ></div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import CombinedRenderer from "@/core/music/render/CombinedRenderer";
import { useScore } from "@/core/editor/ScoreContext";

export default function ScoreCanvas() {
  const notationRef = useRef(null);
  const tabRef = useRef(null);
  const { score } = useScore();

  const [activeTab, setActiveTab] = useState("notation");

  const isReady = score;

  useEffect(() => {
    if (!isReady) return;

    const renderer = new CombinedRenderer({
      notationContainer: notationRef.current,
      tabContainer: tabRef.current,
      score
    });

    renderer.render();
  }, [score, isReady]);

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
        paddingBottom: 60,
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

      {/* SPACING */}
      <div style={{ height: 40 }}></div>

      {/* SCORE SVG */}
      <div
        ref={notationRef}
        className="notation"
        style={{
          width: "100%",
          minHeight: 300,
          visibility: activeTab === "notation" ? "visible" : "hidden",
          position: activeTab === "notation" ? "relative" : "absolute",
          top: 0,
          left: 0,
          opacity: activeTab === "notation" ? 1 : 0,
          pointerEvents: activeTab === "notation" ? "auto" : "none",
        }}
      ></div>

      {/* TAB SVG */}
      <div
        ref={tabRef}
        className="tablature"
        style={{
          width: "100%",
          minHeight: 200,
          visibility: activeTab === "tab" ? "visible" : "hidden",
          position: activeTab === "tab" ? "relative" : "absolute",
          top: 0,
          left: 0,
          opacity: activeTab === "tab" ? 1 : 0,
          pointerEvents: activeTab === "tab" ? "auto" : "none",
        }}
      ></div>
    </div>
  );
}

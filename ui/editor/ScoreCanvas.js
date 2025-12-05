import React, { useEffect, useRef } from "react";
import CombinedRenderer from "@/core/music/render/CombinedRenderer";
import { useScore } from "@/core/editor/ScoreContext";

export default function ScoreCanvas() {
  const { score } = useScore();
  const container = useRef(null);
  const renderer = useRef(null);

  useEffect(() => {
    if (!container.current || !score) return;

    renderer.current = new CombinedRenderer({
      container: container.current,
      score: score,
      layout: {}
    });

    renderer.current.render();
  }, [score]);

  return (
    <div
      ref={container}
      style={{
        width: "100%",
        overflowX: "auto",
        borderBottom: "1px solid #eee",
      }}
    />
  );
}

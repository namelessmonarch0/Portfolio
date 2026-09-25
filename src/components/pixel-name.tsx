import type { CSSProperties } from "react";
import { textToBitmap } from "@/lib/pixel-font";

const WORDS = ["KUDAY", "YURTER"];
const WORD_GAP = 4; // columns between the words
const DRAW_MS = 800;

// Scatters dot start times across DRAW_MS in a fixed order, so server and client markup match.
function dotDelay(index: number, total: number) {
  return Math.round((((index * 37) % total) / total) * DRAW_MS);
}

// Both words laid out left to right in one grid; computed once since the name never changes.
const LAYOUT = (() => {
  const dots: { x: number; y: number }[] = [];
  let offset = 0;
  for (const word of WORDS) {
    const rows = textToBitmap(word);
    rows.forEach((row, y) =>
      [...row].forEach((pixel, x) => {
        if (pixel === "1") dots.push({ x: offset + x, y });
      }),
    );
    offset += rows[0].length + WORD_GAP;
  }
  return { dots, width: offset - WORD_GAP };
})();

/** "KUDAY YURTER" on one line, in a single SVG. */
export function PixelName() {
  const { dots, width } = LAYOUT;

  return (
    <span className="pixel-name" aria-hidden="true">
      <svg viewBox={`0 0 ${width} 7`} fill="currentColor">
        {dots.map(({ x, y }, index) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width=".91"
            height=".91"
            style={
              {
                "--delay": `${dotDelay(index, dots.length)}ms`,
              } as CSSProperties
            }
          />
        ))}
      </svg>
    </span>
  );
}

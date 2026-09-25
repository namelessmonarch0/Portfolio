import type { CSSProperties } from "react";
import { textToBitmap } from "@/lib/pixel-font";

const WORDS = ["KUDAY", "YURTER"];
const DRAW_MS = 800;

// Scatters dot start times across DRAW_MS in a fixed order, so server and client markup match.
function dotDelay(index: number, total: number) {
  return Math.round((((index * 37) % total) / total) * DRAW_MS);
}

export function PixelName() {
  return (
    <span className="pixel-name" aria-hidden="true">
      {WORDS.map((word) => {
        const rows = textToBitmap(word);
        const dots = rows.flatMap((row, y) =>
          [...row].flatMap((pixel, x) => (pixel === "1" ? [{ x, y }] : [])),
        );
        return (
          <svg
            key={word}
            viewBox={`0 0 ${rows[0].length} ${rows.length}`}
            fill="currentColor"
          >
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
        );
      })}
    </span>
  );
}

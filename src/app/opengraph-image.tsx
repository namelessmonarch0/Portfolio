import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { bitmapPath, textToBitmap } from "@/lib/pixel-font";

export const alt = "Kuday Yurter — Software, Data & AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SCALE = 14;

function pixelWord(word: string) {
  const rows = textToBitmap(word);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges"><path fill="#fff" d="${bitmapPath(rows)}"/></svg>`;
  return {
    src: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
    width: rows[0].length * SCALE,
    height: rows.length * SCALE,
  };
}

export default async function OpengraphImage() {
  const portrait = await readFile(
    join(process.cwd(), "src/assets/portrait-og.png"),
  );
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 72px",
        background: "#000",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {["KUDAY", "YURTER"].map((word) => {
          const image = pixelWord(word);
          return <img key={word} alt="" {...image} />;
        })}
        <div
          style={{
            marginTop: 24,
            color: "#a3a3a3",
            fontSize: 28,
            letterSpacing: 4,
          }}
        >
          SOFTWARE · DATA · AI
        </div>
      </div>
      <img
        alt=""
        width={480}
        height={480}
        src={`data:image/png;base64,${portrait.toString("base64")}`}
      />
    </div>,
    size,
  );
}

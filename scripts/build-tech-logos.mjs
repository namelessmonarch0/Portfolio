// Regenerates src/lib/tech-logos.json: each Simple Icons (CC0) logo rasterized
// onto a 24×24 pixel grid. Run: node scripts/build-tech-logos.mjs
// Requires ImageMagick (`magick`) on PATH.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import * as icons from "simple-icons";

const SIZE = 24;
const KEYS = [
  "siPython", "siTypescript", "siJavascript", "siCplusplus", "siRust",
  "siReact", "siNodedotjs", "siFastapi", "siDotnet", "siDatabricks",
  "siApachespark", "siScikitlearn", "siLinux", "siNeovim", "siGit",
  "siDocker",
];

const logos = KEYS.map((key) => {
  const icon = icons[key];
  if (!icon) throw new Error(`simple-icons has no ${key}`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="${icon.path}"/></svg>`;
  // Render large, downsample to the grid, then keep only the alpha channel as raw 8-bit gray.
  const alpha = execFileSync(
    "magick",
    ["-background", "none", "-density", "384", "svg:-", "-resize", `${SIZE}x${SIZE}!`,
     "-alpha", "extract", "-depth", "8", "gray:-"],
    { input: svg },
  );
  const rows = [];
  for (let y = 0; y < SIZE; y++) {
    let row = "";
    for (let x = 0; x < SIZE; x++) row += alpha[y * SIZE + x] >= 128 ? "1" : "0";
    rows.push(row);
  }
  return { slug: icon.slug, title: icon.title, rows };
});

writeFileSync(
  new URL("../src/lib/tech-logos.json", import.meta.url),
  `${JSON.stringify(logos, null, 2)}\n`,
);
console.log(`wrote ${logos.length} logos`);

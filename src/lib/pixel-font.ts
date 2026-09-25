/** A 1-bit image: one string per row, "1" = filled pixel. */
export type Bitmap = readonly string[];

/** 5×7 glyphs for the pixel name and the company/school monograms. */
export const glyphs: Record<string, Bitmap> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "01010", "01010", "00100"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  "-": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
};

/** Lays glyphs out left to right with a one-column gap. */
export function textToBitmap(text: string): string[] {
  const rows: string[] = Array.from({ length: 7 }, () => "");
  [...text].forEach((char, index) => {
    const glyph = glyphs[char];
    if (!glyph) throw new Error(`No pixel glyph for "${char}"`);
    glyph.forEach((row, y) => {
      rows[y] += (index > 0 ? "0" : "") + row;
    });
  });
  return rows;
}

/** One SVG path for a bitmap, merging horizontal runs so large logos stay small in the DOM. */
export function bitmapPath(rows: Bitmap): string {
  let d = "";
  rows.forEach((row, y) => {
    for (const run of row.matchAll(/1+/g)) {
      const x = run.index ?? 0;
      const width = run[0].length;
      d += `M${x} ${y}h${width}v1h-${width}z`;
    }
  });
  return d;
}

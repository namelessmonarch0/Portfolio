import { test, expect } from "@playwright/test";
import { bitmapPath, glyphs, textToBitmap } from "@/lib/pixel-font";

test("every glyph is 5 columns by 7 rows of 0/1", () => {
  for (const [char, rows] of Object.entries(glyphs)) {
    expect(rows, char).toHaveLength(7);
    for (const row of rows) expect(row, char).toMatch(/^[01]{5}$/);
  }
});

test("has glyphs for the name and every monogram", () => {
  for (const char of "KUDAYRTECMNIFV-") {
    expect(glyphs[char], char).toBeDefined();
  }
});

test("textToBitmap joins glyphs with a one-column gap", () => {
  const rows = textToBitmap("IF");
  expect(rows).toHaveLength(7);
  expect(rows[0]).toBe("11111" + "0" + "11111");
  expect(rows[6]).toBe("11111" + "0" + "10000");
});

test("textToBitmap rejects characters without a glyph", () => {
  expect(() => textToBitmap("Q")).toThrow('No pixel glyph for "Q"');
});

test("bitmapPath merges horizontal runs into one rectangle each", () => {
  expect(bitmapPath(["0110", "1001"])).toBe(
    "M1 0h2v1h-2zM0 1h1v1h-1zM3 1h1v1h-1z",
  );
  expect(bitmapPath(["000"])).toBe("");
});

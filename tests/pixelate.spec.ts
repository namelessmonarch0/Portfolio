import { test, expect } from "@playwright/test";
import { wrapText } from "@/lib/pixelate";

// Every character is 10px wide.
const measure = (text: string) => text.length * 10;

test("keeps text that fits on one line", () => {
  expect(wrapText("A builder at heart.", 500, measure)).toEqual([
    "A builder at heart.",
  ]);
});

test("wraps at word boundaries", () => {
  expect(wrapText("Useful things, built.", 150, measure)).toEqual([
    "Useful things,",
    "built.",
  ]);
});

test("puts an over-long word on its own line instead of splitting it", () => {
  expect(wrapText("a extraordinarily b", 50, measure)).toEqual([
    "a",
    "extraordinarily",
    "b",
  ]);
});

test("collapses whitespace and handles empty text", () => {
  expect(wrapText("  Let’s \n make   something. ", 1000, measure)).toEqual([
    "Let’s make something.",
  ]);
  expect(wrapText("   ", 100, measure)).toEqual([]);
});

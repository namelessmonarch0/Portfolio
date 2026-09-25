import { test, expect } from "@playwright/test";
import techLogos from "@/lib/tech-logos.json";

// Approved set from the spec. C#, Power BI, AWS, and Azure are absent from
// Simple Icons 16, so per the spec they are dropped from the grid (their
// names stay in the skills text).
const EXPECTED = [
  "python", "typescript", "javascript", "cplusplus", "rust", "react",
  "nodedotjs", "fastapi", "dotnet", "databricks", "apachespark",
  "scikitlearn", "linux", "neovim", "git", "docker",
];

test("tech logos are the approved set, in order", () => {
  expect(techLogos.map((logo) => logo.slug)).toEqual(EXPECTED);
});

test("each logo is a recognizable 24×24 bitmap", () => {
  for (const logo of techLogos) {
    expect(logo.title, logo.slug).not.toBe("");
    expect(logo.rows, logo.slug).toHaveLength(24);
    for (const row of logo.rows) expect(row, logo.slug).toMatch(/^[01]{24}$/);
    const filled = logo.rows.join("").replaceAll("0", "").length;
    expect(filled, `${logo.slug} filled pixels`).toBeGreaterThan(40);
  }
});

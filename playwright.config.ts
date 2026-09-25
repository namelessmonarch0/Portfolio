import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 20_000,
  webServer: {
    command: "npm run dev -- --webpack --port 3000",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
});

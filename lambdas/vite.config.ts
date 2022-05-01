/// <reference types="vitest" />
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

// Note: This config / vite itself is really only here to enable vitest.
export default defineConfig({
  test: {
    include: ["**/*.test.ts"],
    globals: true,
    passWithNoTests: true,
  },
  plugins: [tsconfigPaths()],
  build: {
    lib: {
      name: "fivebysix",
      entry: path.resolve(__dirname, "src/handler.ts"),
    },
  },
});

import react from "@vitejs/plugin-react";

import Checker from "vite-plugin-checker";
import { resolve } from "path";
import { UserConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

function pathResolve(dir: string) {
  return resolve(__dirname, ".", dir);
}

const shouldAnalyze = process.env.ANALYZE;

const config: UserConfig = {
  resolve: {
    alias: [
      {
        find: /@\//,
        replacement: pathResolve("src") + "/",
      },
      {
        find: /@api\//,
        replacement: pathResolve("../api") + "/",
      },
    ],
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  build: {
    rollupOptions: {
      plugins: shouldAnalyze ? [visualizer({ open: true, filename: "./bundle-size/bundle.html" })] : [],
    },
    sourcemap: !!shouldAnalyze,
  },
  plugins: [
    react(),
    Checker({
      typescript: true,
      overlay: true,
      eslint: {
        lintCommand: "lint",
      },
    }),
  ],
};

const getConfig = () => config;

export default getConfig;

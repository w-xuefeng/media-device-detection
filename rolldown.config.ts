import { defineConfig } from "rolldown";
import terser from "@rollup/plugin-terser";

export default defineConfig([
  {
    input: "src/index.ts",
    output: [
      {
        dir: "lib",
        format: "esm",
        entryFileNames: "[name].esm.js",
        plugins: [terser()],
      },
      {
        dir: "lib",
        format: "cjs",
        entryFileNames: "[name].cjs.js",
        plugins: [terser()],
      },
      {
        dir: "lib",
        format: "umd",
        inlineDynamicImports: true,
        name: "mediaDeviceDetection",
        entryFileNames: "[name].umd.js",
        plugins: [terser()],
      },
    ],
  },
]);

// snowpack.config.mjs
// Example: Using Snowpack's built-in bundling support
export default {
  devOptions: {
    port: 6000
  },
  buildOptions: {
    out: "build"
  },
  optimize: {
    entrypoints: ["mandatum.ts"],
    bundle: true,
    minify: true,
  },
};

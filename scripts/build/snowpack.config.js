export default {
  devOptions: {
    port: 6e3
  },
  buildOptions: {
    out: "build"
  },
  optimize: {
    entrypoints: ["mandatum.ts"],
    bundle: true,
    minify: true
  }
};

const { parsed: localEnv } = require("dotenv").config();

const webpack = require("webpack");
const apiKey = JSON.stringify(process.env.SHOPIFY_API_KEY);
const host = JSON.stringify(process.env.HOST_NO_PRE);
const appHost = JSON.stringify(process.env.HOST);

module.exports = {
  webpack: (config) => {
    const env = { API_KEY: apiKey, HOST_URL: host, APP_HOST: appHost };
    config.plugins.push(new webpack.DefinePlugin(env));

    // Add ESM support for .mjs files in webpack 4
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });

    return config;
  },
};

const { DefinePlugin } = require('webpack');
const path = require('path');

const { SENTRY_DSN1, SENTRY_DSN2 } = process.env;

module.exports = {
  target: 'web',
  devtool: 'cheap-module-eval-source-map',
  mode: 'development',
  entry: {
    bundle: './src/_demo/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'demo'), // eslint-disable-line no-undef
    filename: '[name].js',
  },
  plugins: [
    new DefinePlugin({
      SENTRY_DSN1: JSON.stringify(SENTRY_DSN1),
      SENTRY_DSN2: JSON.stringify(SENTRY_DSN2)
    })
  ],
  module: {
    rules: [
      {
        test: /^((?!\.test\.).)*\.js$/,
        loader: 'babel-loader?cacheDirectory',
      },
    ],
  },
};

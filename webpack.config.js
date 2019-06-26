const path = require('path');
module.exports = {
  target: 'web',
  devtool: 'cheap-module-eval-source-map',
  mode: 'development',
  entry: {
    bundle: './src/reporterManager.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  plugins: [
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


const path = require('path');
const webpack = require('webpack');

const babelLoader = {
  test: /\.(js|tag)$/,
  exclude: /node_modules/,
  loader: 'babel-loader',
};

module.exports = {
  entry: {
    'ui': './src/js/ui.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    loaders: [babelLoader],
  },
  devServer: {
    contentBase: './demo',
  },
};

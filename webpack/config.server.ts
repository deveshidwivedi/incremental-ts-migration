const fs = require('fs');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: {
    server: [
      'regenerator-runtime/runtime',
      path.resolve(__dirname, '../server/server.ts'), // use .ts if migrate previewServer
    ],
    previewServer: [
      'regenerator-runtime/runtime',
      path.resolve(__dirname, '../server/previewServer.ts'), // use .ts if migrate previewServer
    ],
  },
  output: {
    path: path.resolve(__dirname, '../dist/'),
    filename: '[name].bundle.js',
  },

  target: 'node',
  mode: 'production',

  node: {
    __filename: true,
    __dirname: true,
  },
  externals: [nodeExternals()],

  resolve: {
    extensions: ['*', '.js', '.jsx', '.ts', '.tsx'],
    modules: [
      'client',
      'node_modules',
    ],
  },

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          babelrc: true
        }
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
    ],
  },
};
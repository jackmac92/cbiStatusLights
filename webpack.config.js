const path = require('path');
module.exports = {
  devtool: 'eval-cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  },
  target: 'node'
};

const common = require('./webpack.common');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = Object.assign(common, {
  mode: 'production',
  performance: {hints: false},
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      extractComments: false,
      terserOptions: {format: {comments: false}}
    })]
  }
});

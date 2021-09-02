const common = require('./webpack.common');

module.exports = Object.assign(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {historyApiFallback: true},
  module: {
    rules: [{
      test: /\.js$/,
      enforce: "pre",
      use: ["source-map-loader"]
    }]
  }
});

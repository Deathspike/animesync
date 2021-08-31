const TerserPlugin = require('terser-webpack-plugin');

let alias = {
  '@nestjs/swagger': `${__dirname}/webpack/@nestjs/swagger`,
  'class-transformer': `${__dirname}/webpack/class-transformer`,
  'class-validator': `${__dirname}/webpack/class-validator`,
  'node-fetch': `${__dirname}/webpack/node-fetch`
};

module.exports = {
  entry: './dist/client/app',
  output: {filename: 'app.min.js', path: `${__dirname}/public`},
  resolve: {alias},
  optimization: {minimizer: [new TerserPlugin({extractComments: false})]}
};

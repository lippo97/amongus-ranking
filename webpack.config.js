const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './web/index.tsx',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],

  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build', 'web'),
  },
  plugins: [
      new HtmlWebpackPlugin({
          title: 'Among us Ranking',
          template: 'static/index.html'
      }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'CNAME'),
          to: path.resolve(__dirname, 'build', 'web')
        },
      ],
    }),
  ]
};

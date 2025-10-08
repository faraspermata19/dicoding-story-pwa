const path = require('path');
const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const common = require('./webpack.common.js');

module.exports = (env, argv) => {
  // pastikan base config dari webpack.common.js tetap dipakai
  const base = typeof common === 'function' ? common(env, { mode: 'production' }) : common;

  return merge(base, {
    mode: 'production',
    devtool: 'source-map',
    output: {
      publicPath: base.output.publicPath || '/', // fallback aman
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: { presets: ['@babel/preset-env'] },
          },
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
      }),

      // ✅ Tambahan penting agar manifest.json dan aset lain tersalin dengan benar
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'src/public'), // salin seluruh isi public/
            to: path.resolve(__dirname, 'dist'),         // ke folder dist/
          },
        ],
      }),
    ],
  });
};

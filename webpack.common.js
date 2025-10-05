// webpack.common.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'src/scripts/index.js'),
  },
  output: {
    // Sesuaikan agar file utama menggunakan hash untuk caching lebih baik di prod
    filename: '[name].[contenthash].js', 
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    // BARU: Set publicPath agar semua aset dimuat dari sub-path GitHub Pages
    // Repository name: dicoding-story-pwa
    publicPath: process.env.NODE_ENV === 'production' ? '/dicoding-story-pwa/' : '/', 
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i, // Menambahkan svg ke dalam regex
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]', // Menyimpan gambar di folder images
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      filename: 'index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/public/'),
          to: path.resolve(__dirname, 'dist/'),
        },
        // Salin manifest ke root dist
        {
          from: path.resolve(__dirname, 'src/manifest.json'),
          to: path.resolve(__dirname, 'dist/manifest.json'),
        },
      ],
    }),
    // Workbox InjectManifest akan membuat sw.js
    new InjectManifest({
      swSrc: path.resolve(__dirname, 'src/scripts/sw.js'),
      swDest: 'sw.js', 
      exclude: [
        // Abaikan file map saat precaching
        /\.map$/,
      ],
    }),
  ],
};
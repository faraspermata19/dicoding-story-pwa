const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');

module.exports = (env, argv) => {
  // Deteksi apakah mode produksi
  const isProd = argv.mode === 'production';

  // 🔧 Public path otomatis: kalau di localhost tetap '/', kalau di GitHub pakai subfolder
  const PUBLIC_PATH =
    process.env.GITHUB_PAGES === 'true' ? '/dicoding-story-pwa/' : '/';

  return {
    entry: {
      app: path.resolve(__dirname, 'src/scripts/index.js'),
    },

    output: {
      filename: '[name].[contenthash].js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
      publicPath: PUBLIC_PATH,
    },

    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif|svg|webp)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name][ext]',
          },
        },
      ],
    },

    plugins: [
      // ✅ Pastikan script disuntik otomatis ke <body>
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src/index.html'),
        filename: 'index.html',
        inject: 'body',
      }),

      // ✅ Salin semua aset dari folder public
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'src/public'),
            to: '.',
          },
        ],
      }),

      // ✅ Inject service worker
      new InjectManifest({
        swSrc: path.resolve(__dirname, 'src/scripts/sw.js'),
        swDest: 'sw.js',
        exclude: [/\.map$/, /asset-manifest\.json$/],
      }),
    ],
  };
};

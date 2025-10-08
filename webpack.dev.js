const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = (env, argv) => {
  const base = common(env, { mode: 'development' });

  return merge(base, {
    mode: 'development',
    output: {
      publicPath: base.output.publicPath,
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    devServer: {
      static: {
        directory: path.resolve(__dirname, 'dist'),
        publicPath: base.output.publicPath,
      },
      devMiddleware: {
        publicPath: base.output.publicPath,
      },
      historyApiFallback: {
        index: base.output.publicPath.replace(/\/+$/, '') + '/index.html',
      },
      port: 8000,
      client: {
        overlay: { errors: true, warnings: true },
      },
    },
  });
};

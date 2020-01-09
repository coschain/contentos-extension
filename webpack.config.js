const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const { version, title } = require('./package.json');

const htmlPage = (filename, chunks, pageTitle, template) => new HtmlWebpackPlugin({
  title: pageTitle || title,
  hash: true,
  cache: true,
  inject: 'body',
  filename: './pages/' + filename + '.html',
  template: template || (__dirname + '/public/index.html'),
  chunks
});

const entryNames = ['background', 'popup', 'options', 'content'];
const buildEntrys = () => {
  const entry = {};
  entryNames.forEach(name => {
    entry[name] = `./entrys/${name}/index.js`;
  })
  return entry;
};

const config = {
  stats: {
    children: false
  },
  mode: process.env.NODE_ENV,
  context: __dirname + '/src',
  entry: {
    ...buildEntrys(),
    inject: './entrys/content/inject.js'
  },
  output: {
    publicPath: '/',
    path: __dirname + '/dist',
    filename: 'static/js/[name].js'
  },
  resolve: {
    extensions: ['.js', '.vue'],
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [ 'vue-loader', {
          loader: 'style-resources-loader',
          options: {
            patterns: [
              __dirname + '/src/entrys/popup/assets/style/color.less',
            ]
          }
        }]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [ MiniCssExtractPlugin.loader, 'css-loader' ],
      },
      {
        test: /\.less$/,
        use: [ MiniCssExtractPlugin.loader, 'css-loader', 'less-loader', {
          loader: 'style-resources-loader',
          options: {
            patterns: [
              __dirname + '/src/entrys/popup/assets/style/color.less',
            ]
          }
        }],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
        loader: 'file-loader',
        options: {
          name: 'static/images/[name].[ext]?[contenthash:7]',
        },
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: 'static/fonts/[name].[ext]?[contenthash:7]',
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: process.env.NODE_ENV === 'production' ? '"production"' : '"development"',
        VERSION: JSON.stringify(version),
      },
    }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].css',
    }),
    htmlPage('popup', ['popup']),
    htmlPage('options', ['options']),
    new CopyWebpackPlugin([
      { from: __dirname + '/public/_locales', to: '_locales' },
      { from: __dirname + '/public/icons', to: 'icons' },
      {
        from: __dirname + '/public/manifest.json',
        to: 'manifest.json',
        transform: (content) => {
          const jsonContent = JSON.parse(content);
          jsonContent.version = version;
          return JSON.stringify(jsonContent, null, 2);
        },
      },
    ]),
  ],
};

if (process.env.HMR === 'true') {
  config.watch = true;
  config.plugins.push(new ExtensionReloader({
    port: 9090,
    reloadPage: true,
    entries: {
      contentScript: 'inject',
      background: 'background',
      extensionPage: 'popup',
    }
  }));
}

module.exports = config;

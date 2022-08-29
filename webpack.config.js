const path = require('path')
const fs = require('fs')

const PATH_SRC = path.resolve(__dirname, 'src')
const PATH_PAGE = path.resolve(PATH_SRC, 'page')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const setHtmlPlugin = function (dir, from) {
  const files = fs.readdirSync(dir)
  const ret = []
  const pages = files.forEach((file) => {
    const p = path.resolve(dir, file)
    if(fs.lstatSync(p).isDirectory()) {
      const d = setHtmlPlugin(p, from)
      if(d && d.length) {
        ret.push(...d)
      }
    } else if (file.substr(-5) === '.html') {
      // html
      ret.push(new HtmlWebpackPlugin({
        title: file,
        filename: from ? path.relative(from, p) : p,
        template: p,
        minify: false,
        inject: 'body',
        chunks: ['common'],
      }))
    }
  })

  return ret
}

module.exports = {
  entry: {
    common: {
      filename: 'js/common-ui.js',
      import: './src/js/common-ui.js',
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: ['handlebars-loader'],
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        // lib
        {
          from: './src/js/lib/**/*',
          to ({ absoluteFilename }) {
            return path.relative(PATH_SRC, absoluteFilename)
          }
        },
        // img
        {
          from: './src/img/**/*',
          to ({ absoluteFilename }) {
            return path.relative(PATH_SRC, absoluteFilename)
          }
        },
      ]
    }),
    // index.html
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html',
      minify: false,
      inject: false,
    }),
    // page/
    ...setHtmlPlugin(PATH_PAGE, PATH_SRC),
    // new MiniCssExtractPlugin({
    //   filename: 'css/[name].css'
    // }),
    new MiniCssExtractPlugin(),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'src'),
    },
    compress: false,
    port: 9000,
  },
  // devServer: {
  //   open: true,
  //   contentBase: PATH_OUTPUT,
  //   watchContentBase: true,
  //   inline: true,
  // },
}
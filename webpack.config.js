const path = require('path')
const fs = require('fs')

const PATH_SRC = path.resolve(__dirname, 'src')
const PATH_PAGE = path.resolve(PATH_SRC, 'page')
const PATH_DIST = path.resolve(__dirname, 'dist')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const setHtmlPlugin = function (dir, from) {
  const files = fs.readdirSync(dir)
  const ret = []
  const pages = files.forEach((file) => {
    const p = path.resolve(dir, file)
    if (fs.lstatSync(p).isDirectory()) {
      const d = setHtmlPlugin(p, from)
      if (d && d.length) {
        ret.push(...d)
      }
    } else if (file.substr(-5) === '.html') {
      // html
      ret.push(
        new HtmlWebpackPlugin({
          title: file,
          filename: from ? path.relative(from, p) : p,
          template: p,
          minify: false,
          inject: 'body',
          chunks: ['common'],
        })
      )
    }
  })

  return ret
}

module.exports = {
  entry: {
    common: {
      filename: 'js/common-ui.js',
      import: path.resolve(PATH_SRC, 'js/common-ui.js'),
    },
    style: {
      import: path.resolve(PATH_SRC, 'css/common.scss'),
    },
  },
  output: {
    path: PATH_DIST,
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(html|hbs)$/,
        use: [
          {
            loader: 'handlebars-loader',
            options: {
              helperDirs: path.join(__dirname, '_helpers'),
            }
          }
        ],
      },
      {
        test:/\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false
            }
          },
          {
            loader: 'postcss-loader',
            options: {
                postcssOptions: {
                    plugins: [
                        [
                        'autoprefixer',
                        ],
                    ],
                },
            }
          },
          'sass-loader'
        ],
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin ({
      patterns: [
        // lib
        {
          from: './src/js/lib/**/*',
          to({ absoluteFilename }) {
            return path.relative(PATH_SRC, absoluteFilename)
          },
        },
        // img
        {
          from: './src/img/**/*',
          to({ absoluteFilename }) {
            return path.relative(PATH_SRC, absoluteFilename)
          },
        },
        // normalize.css
        {
          from: './src/css/normalize.css',
          to: './css/'
        }
      ],
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
    new MiniCssExtractPlugin({
      linkType: false,
      filename: 'css/[name].css',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'src'),
    },
    compress: false,
    port: 9000,
    hot: true,
    open: true,
  },
}

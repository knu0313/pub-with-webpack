const fs = require("fs");
const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");

class CustomHtmlWebpackPlugin {
  constructor(options) {
    this.options = options;
    this.dir = options.dir;
    this.from = options.dir;
    this.minify = options.minify;
    this.inject = options.inject;
    this.chunks = options.chunks;
  }

  setHtmlPlugin (dir, from) {
    const files = fs.readdirSync(dir)
    const ret = []
    files.forEach((file) => {
      const p = path.resolve(dir, file)
      if (fs.lstatSync(p).isDirectory()) {
        const d = this.setHtmlPlugin(p, from)
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
            minify: this.minify,
            inject: this.inject,
            chunks: this.chunks,
            // inject: 'body',
            // chunks: ['common'],
          })
        )
      }
    })

    return ret
  }

  apply (compiler) {
    this.index = compiler.options.plugins.indexOf(this);

    const htmlList = this.setHtmlPlugin(this.dir, this.from);

    htmlList.forEach(file => compiler.options.plugins.splice(this.index + 1, 0, file));
  }
}

module.exports = CustomHtmlWebpackPlugin;
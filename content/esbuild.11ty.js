const esbuild = require('esbuild')
const process = require('node:process')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = class EsbuildTemplate {
  data() {
    return {
      permalink: false,
      eleventyExcludeFromCollections: true,
    }
  }

  async render() {
    await esbuild.build({
      entryPoints: ['src/js/app.mjs', 'src/css/styles.css'],
      bundle: true,
      minify: isProduction,
      outdir: '_site',
      sourcemap: !isProduction,
      target: isProduction ? 'es6' : 'esnext',
      external: ['*.png'],
    })
  }
}

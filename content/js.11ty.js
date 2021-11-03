const esbuild = require('esbuild')
const { NODE_ENV } = require('../11ty/env')

const isProduction = NODE_ENV === 'production'

module.exports = class {
  data() {
    return {
      permalink: false,
      eleventyExcludeFromCollections: true
    }
  }

  async render() {
    await esbuild.build({
      entryPoints: ['src/js/hi.js'],
      bundle: true,
      minify: isProduction,
      outdir: '_site/js',
      sourcemap: !isProduction,
      target: isProduction ? 'es6' : 'esnext'
    })
  }
}

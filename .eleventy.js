require('dotenv/config')

const pluginRss = require('@11ty/eleventy-plugin-rss')
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')

const shortcodes = require('./11ty/shortcodes')
const filters = require('./11ty/filters')
const { PATH_PREFIX } = require('./11ty/env')
const md = require('./11ty/markdown')

/** @param {import("@11ty/eleventy/src/UserConfig")} eleventyConfig */
module.exports = function (eleventyConfig) {
  eleventyConfig.addWatchTarget('./src/')

  eleventyConfig.setLibrary('md', md)

  eleventyConfig.addPassthroughCopy({
    'node_modules/@robb_j/r0b-design/dist': 'r0b',
    'src/img': 'img',
    'src/video': 'video',
  })

  eleventyConfig.addPlugin(filters)
  eleventyConfig.addPlugin(shortcodes)

  eleventyConfig.addPlugin(pluginRss)
  eleventyConfig.addPlugin(syntaxHighlight)

  return {
    dir: {
      input: 'content',
      includes: '_includes',
      layouts: '_layouts',
    },
    pathPrefix: PATH_PREFIX,
    templateFormats: ['11ty.js', 'njk', 'md', 'html'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
  }
}

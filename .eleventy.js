require('dotenv/config')

const { eleventyAlembic } = require('@openlab/alembic/11ty')
const pluginRss = require('@11ty/eleventy-plugin-rss')
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')

const shortcodes = require('./11ty/shortcodes')
const filters = require('./11ty/filters')
const md = require('./11ty/markdown')

/** @param {import("@11ty/eleventy/src/UserConfig")} eleventyConfig */
module.exports = function (eleventyConfig) {
  eleventyConfig.addWatchTarget('./src/')

  eleventyConfig.setLibrary('md', md)

  eleventyConfig.addPassthroughCopy({
    'src/font': 'font',
    'src/img': 'img',
    'src/video': 'video',
  })

  eleventyConfig.addPlugin(filters)
  eleventyConfig.addPlugin(shortcodes)

  eleventyConfig.addPlugin(eleventyAlembic)
  eleventyConfig.addPlugin(pluginRss)
  eleventyConfig.addPlugin(syntaxHighlight)

  return {
    dir: {
      input: 'content',
      includes: '_includes',
      layouts: '_layouts',
    },
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
  }
}

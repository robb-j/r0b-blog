const { join } = require('path')
const pluginRss = require('@11ty/eleventy-plugin-rss')
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const { DateTime } = require('luxon')

const excerpt = require('eleventy-plugin-excerpt')
const readingTime = require('eleventy-plugin-reading-time')

const { textLinter, htmlTransformer } = require('./text-utils')

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss)
  eleventyConfig.addPlugin(excerpt)
  eleventyConfig.addPlugin(readingTime)
  eleventyConfig.addPlugin(syntaxHighlight)

  eleventyConfig.addPassthroughCopy('node_modules/@robb_j/r0b-design/dist')
  eleventyConfig.addPassthroughCopy('static')
  eleventyConfig.addPassthroughCopy('static')
  eleventyConfig.addPassthroughCopy('static')

  eleventyConfig.addLinter('r0b-retext', textLinter)
  eleventyConfig.addTransform('r0b-retext', htmlTransformer)

  eleventyConfig.addFilter('r0bAsset', value => {
    if (!value) throw new Error('Invalid r0bAsset')
    return join('/node_modules/@robb_j/r0b-design/dist', value)
  })

  eleventyConfig.addFilter('date', (value, format) => {
    return DateTime.fromJSDate(value).toFormat(format)
  })

  eleventyConfig.addFilter('longDate', value =>
    DateTime.fromJSDate(value).toFormat('cccc, d LLLL yyyy')
  )

  eleventyConfig.addFilter('isPublished', value =>
    value.filter(v => v.data.draft !== true)
  )

  eleventyConfig.addFilter('newestFirst', collection => {
    return [...collection].sort((a, b) => b.date - a.date)
  })

  eleventyConfig.addFilter('jsonDate', value => value.toISOString())

  eleventyConfig.addFilter('arrSlice', (value, begin, end) =>
    value.slice(begin, end)
  )

  // Group posts into collections without tags
  eleventyConfig.addCollection('posts', collection =>
    collection.getFilteredByGlob('post/*.md')
  )

  return {
    templateFormats: ['md', 'njk'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk'
  }
}

const { DateTime } = require('luxon')

/** @param {import("@11ty/eleventy/src/UserConfig")} eleventyConfig */
module.exports = function (eleventyConfig) {
  eleventyConfig.addFilter('longDate', (value) =>
    DateTime.fromJSDate(value).toFormat('cccc, d LLLL yyyy'),
  )

  eleventyConfig.addFilter('isPublished', (value) =>
    value.filter(
      (v) => v.data.draft !== true || process.env.NODE_ENV === 'development',
    ),
  )

  eleventyConfig.addFilter('newestFirst', (collection) => {
    return [...collection].sort((a, b) => b.date - a.date)
  })

  eleventyConfig.addFilter('fullUrl', function (path) {
    return new URL(path, this.ctx.site.url).toString()
  })

  eleventyConfig.addFilter('isoDate', (value) => new Date(value).toISOString())
}

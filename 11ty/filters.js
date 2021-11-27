const { DateTime } = require('luxon')

module.exports = function(eleventyConfig) {
  eleventyConfig.addFilter('date', (value, format) => {
    return DateTime.fromJSDate(value).toFormat(format)
  })

  eleventyConfig.addFilter('longDate', value =>
    DateTime.fromJSDate(value).toFormat('cccc, d LLLL yyyy')
  )

  eleventyConfig.addFilter('jsonString', value =>
    value.replace(/\s+/g, ' ').trim()
  )

  eleventyConfig.addFilter('isPublished', value =>
    value.filter(
      v => v.data.draft !== true || process.env.NODE_ENV === 'development'
    )
  )

  eleventyConfig.addFilter('newestFirst', collection => {
    return [...collection].sort((a, b) => b.date - a.date)
  })

  eleventyConfig.addFilter('jsonDate', value => value.toISOString())

  eleventyConfig.addFilter('slice', (value, begin, end) =>
    value.slice(begin, end)
  )

  eleventyConfig.addFilter('fullUrl', function(path) {
    const url = new URL(path.replace(/^\/+/, '/'), this.ctx.site.url)
    return url.toString()
  })
}

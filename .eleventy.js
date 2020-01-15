const { join } = require('path')
const pluginRss = require('@11ty/eleventy-plugin-rss')
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const inclusiveLangPlugin = require('@11ty/eleventy-plugin-inclusive-language')
const { DateTime } = require('luxon')

// const unified = require('unified')
// const parseMarkdown = require('remark-parse')
// const stringify = require('remark-stringify')
// const remark2retext = require('remark-retext')

const excerpt = require('eleventy-plugin-excerpt')
const readingTime = require('eleventy-plugin-reading-time')

// const english = require('retext-english')
// const assuming = require('retext-assuming')
// const contractions = require('retext-contractions')
// const diacritics = require('retext-diacritics')
// const equality = require('retext-equality')
// const indefinteArticle = require('retext-indefinite-article')
// const overuse = require('retext-overuse')
// const passive = require('retext-passive')
// const repeatedWords = require('retext-repeated-words')

// const contentProcessor = unified()
//   .use(parseMarkdown)
//   .use(
//     remark2retext,
//     unified()
//       .use(english)
//       .use(assuming)
//       .use(contractions)
//       .use(diacritics)
//       .use(equality)
//       .use(indefinteArticle)
//       .use(overuse)
//       .use(passive)
//       .use(repeatedWords)
//   )

module.exports = function(config) {
  config.addPlugin(pluginRss)
  config.addPlugin(excerpt)
  config.addPlugin(readingTime)
  config.addPlugin(syntaxHighlight)
  config.addPlugin(inclusiveLangPlugin)

  config.addPassthroughCopy('node_modules/@robb_j/r0b-design/dist')
  config.addPassthroughCopy('static')
  config.addPassthroughCopy('static')
  config.addPassthroughCopy('static')

  // Generate exerpts for pages
  // config.setFrontMatterParsingOptions({ excerpt: true });

  config.addFilter('r0bAsset', value => {
    if (!value) throw new Error('Invalid r0bAsset')
    return join('/node_modules/@robb_j/r0b-design/dist', value)
  })

  config.addFilter('date', (value, format) => {
    return DateTime.fromJSDate(value).toFormat(format)
  })

  config.addFilter('longDate', value =>
    DateTime.fromJSDate(value).toFormat('cccc, d LLLL yyyy')
  )

  config.addFilter('isPublished', value =>
    value.filter(v => v.data.draft !== true)
  )

  config.addFilter('newestFirst', collection => {
    return [...collection].sort((a, b) => b.date - a.date)
  })

  config.addFilter('jsonDate', value => value.toISOString())

  config.addFilter('arrSlice', (value, begin, end) => value.slice(begin, end))

  // Group posts into collections without tags
  config.addCollection('posts', collection =>
    collection.getFilteredByGlob('post/*.md')
  )

  // config.addPlugin(rssPlugin);

  return {
    templateFormats: ['md', 'njk'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk'
  }
}

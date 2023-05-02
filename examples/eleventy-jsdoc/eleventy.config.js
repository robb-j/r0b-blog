const markdownIt = require('markdown-it')
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const slugify = require('slugify')

// Create our own markdown-it instance to be used in a few places
const md = markdownIt({ html: true })
md.disable('code')

// A snippet to generate some HTML for a given API export
const apiDoc = (item) => `
<div class="apiDoc">
<h3>${item.name}</h3>
${md.render(item.content)}
</div>
`

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight)
  eleventyConfig.setLibrary('md', md)

  // Manually watch out API so that
  eleventyConfig.addWatchTarget('./lib.js')

  // NOTE: There is a bit of a hack here in that Eleventy mutates
  // this instance so it magically gets syntax-highlighting applied.
  // This is also exploited in the `apiDoc` shortcode below.
  eleventyConfig.addFilter('md', (content) => md.render(content))

  // A shortcode to render the JSDoc comment for an export from a given entry-point
  eleventyConfig.addShortcode('apiDoc', (api, entrypoint, name) => {
    const item = api?.[entrypoint]?.[name]
    if (!item) {
      throw new Error(`Unknown API item '${name}' in '${entrypoint}'`)
    }
    return apiDoc(item)
  })

  // A filter to generate a URL-friendly slug for a text string
  eleventyConfig.addFilter('slug', (text) => slugify(text))

  // A utility to pretty-print JSON
  eleventyConfig.addFilter('json', (value) => JSON.stringify(value, null, 2))

  // Tell Eleventy to use Nunjucks
  return { markdownTemplateEngine: 'njk', htmlTemplateEngine: 'njk' }
}

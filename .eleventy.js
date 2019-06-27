const { join } = require('path')

module.exports = function(config) {
  config.addPassthroughCopy('node_modules/@robb_j/r0b-design/dist')
  config.addPassthroughCopy('static/img')
  config.addPassthroughCopy('static/css')
  config.addPassthroughCopy('static/js')
  
  config.addFilter('r0bAsset', function(value) {
    if (!value) throw new Error('Invalid r0bAsset')
    return join('/node_modules/@robb_j/r0b-design/dist', value)
  })
  
  // Group posts into collections without tags
  config.addCollection("post", function(collection) {
    return collection.getFilteredByGlob("post/*.md");
  });
  
  // config.addPlugin(rssPlugin);

  return {
    templateFormats: ['md', 'njk'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk'
  }
}

const Image = require('@11ty/eleventy-img')

/** @param {import("@11ty/eleventy/src/UserConfig")} eleventyConfig */
module.exports = function (eleventyConfig) {
  eleventyConfig.addNunjucksAsyncShortcode('figure', async (src, text) => {
    const stats = await Image(src, {
      widths: [1200, 1200],
      formats: ['webp', 'auto'],
      outputDir: './_site/img/',
    })
    const img = Image.generateHTML(stats, { alt: text, loading: 'lazy' })
    const caption = `<figcaption>${text}</figcaption>`
    return `<figure class="figureImage">${img}${caption}</figure>`
  })
}

const path = require('path')
const Image = require('@11ty/eleventy-img')

/** @param {import("@11ty/eleventy/src/UserConfig")} eleventyConfig */
module.exports = function (eleventyConfig) {
  eleventyConfig.addAsyncShortcode('image', async (imageName, text) => {
    const src = path.join('./src/img', imageName)

    const stats = await Image(src, {
      widths: [1200, 1200],
      formats: ['webp', 'auto'],
      outputDir: './_site/img/',
    })
    const img = Image.generateHTML(stats, { alt: text, loading: 'lazy' })
    const caption = `<figcaption>${text}</figcaption>`
    return `<figure class="figureImage">${img}${caption}</figure>`
  })

  eleventyConfig.addAsyncShortcode(
    'video',
    async (videoName, text, type = 'video/mp4') => {
      const src = eleventyConfig.javascriptFunctions.url(
        path.join('/video', videoName)
      )
      const source = `<source src="${src}" type="${type}">`

      const vid = `<video controls loop width="640" height="360">${source}</video>`
      const caption = `<figcaption>${text}</figcaption>`
      return `<figure class="figureVideo">${vid}${caption}</figure>`
    }
  )
}

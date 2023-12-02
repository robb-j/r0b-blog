// TODO: This could be in .eleventy as the shortcode could be the 11ty render plugin

const markdown = require('markdown-it')
const markdownAnchor = require('markdown-it-anchor')

const md = markdown({
  html: true,
  breaks: false,
  linkify: false,
})
md.use(markdownAnchor)

module.exports = md

const markdown = require('markdown-it')
const markdownAnchor = require('markdown-it-anchor')

const md = markdown({
  html: true,
  breaks: false,
  linkify: false,
})
md.disable('code')
md.use(markdownAnchor)

module.exports = md

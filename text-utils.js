const chalk = require('chalk')

const unified = require('unified')

const rehype2retext = require('rehype-retext')
const parseHtml = require('rehype-parse')
const minify = require('rehype-preset-minify')
const stringify = require('rehype-stringify')

const english = require('retext-english')
const assuming = require('retext-assuming')
const diacritics = require('retext-diacritics')
const equality = require('retext-equality')
const indefinteArticle = require('retext-indefinite-article')
const redundantAcronyms = require('retext-redundant-acronyms')
const passive = require('retext-passive')
const repeatedWords = require('retext-repeated-words')
const sentenceSpacing = require('retext-sentence-spacing')
const quotes = require('retext-quotes')

function filterChildren(node, predicate) {
  if (!node.children) return
  node.children = node.children.filter(predicate)
  for (const child of node.children) filterChildren(child, predicate)
}

function filterTag(tagNames) {
  const tagSet = new Set(tagNames)
  return (node, file) => {
    filterChildren(node, n => {
      return n.type !== 'element' || !tagSet.has(n.tagName)
    })
  }
}

const textProcessor = unified()
  .use(parseHtml)
  .use(filterTag, ['pre', 'code'])
  .use(
    rehype2retext,
    unified()
      .use(english)
      .use(assuming)
      .use(diacritics)
      .use(equality)
      .use(indefinteArticle)
      .use(redundantAcronyms)
      .use(passive)
      .use(repeatedWords)
      .use(sentenceSpacing)
      .use(quotes, { preferred: 'straight' })
  )
  .use(minify)
  .use(stringify)

const htmlProcessor = unified()
  .use(parseHtml)
  .use(minify)
  .use(stringify)

async function textLinter(content, inputPath, outputPath) {
  // Only run on html files
  if (!outputPath.endsWith('.html')) return

  const file = await textProcessor.process(content)

  for (const message of file.messages) {
    if (message.fatal) {
      console.error(
        chalk.red(`ERR: ${message.source}(${message.ruleId})`),
        chalk.cyan(`${inputPath}`),
        message.reason,
        `"${message.actual}"`
      )
    } else {
      console.warn(
        chalk.yellow(`WARN: ${message.source}(${message.ruleId})`),
        chalk.cyan(`${inputPath}`),
        `${message.reason} "${message.actual}"`
      )
    }
  }

  if (file.messages.some(m => m.fatal)) {
    throw new Error('There are fatal linter errors (see above)')
  }
}

function htmlTransformer(content, outputPath) {
  // Only run on html files
  if (!outputPath.endsWith('.html')) return

  return htmlProcessor.process(content)
}

module.exports = { textLinter, htmlTransformer }

const path = require('path')
const { Project, Symbol } = require('ts-morph')

const jsDocText = /\/\*\*([\s\S]+)\*\//
const jsDocTag = /^[ \t]*?@.*$/gm

// Which files should be imported and inspected
const entrypoints = ['lib.js']

function api() {
  const project = new Project({ tsConfigFilePath: 'tsconfig.json' })

  // This is where our processed AST is going to get stored and return
  const output = {}

  // Loop through each of our entry-points
  for (const entry of project.getSourceFiles(entrypoints)) {
    // Create a friendly name for the entry-point (by removing the absolute path)
    const entryName = path.relative(process.cwd(), entry.getFilePath())

    // Start compiling the entry-point
    output[entryName] = {}

    // Loop through each symbol that is exported from the file
    // NOTE: these may be export symbols in the entry-point
    // and not the actual code definitions with useful information on them
    for (let symbol of entry.getExportSymbols()) {
      // Skip any symbol marked with @internal
      if (symbol.getJsDocTags().some((t) => t.getName() === 'internal'))
        continue

      // If it is an alias, make sure to get what is aliased instead
      if (symbol.isAlias()) symbol = symbol.getAliasedSymbolOrThrow()

      // Put the export into the entry-point
      // You could do more processing here to capture more information if you like
      output[entryName][symbol.getEscapedName()] = {
        entryPoint: entryName,
        name: symbol.getEscapedName(),
        content: joinDocComments(symbol),
        tags: symbol.getJsDocTags(),
      }
    }
  }

  return output
}

/**
  Compose all doc comments on a Symbol together into one markdown string.
  It gets the text out of a JSDoc comment,
  then strips out the annotations and joins them all as markdown paragraphs
  
  @param {Symbol} symbol
*/
function joinDocComments(symbol) {
  const sections = []

  // Each symbol might have one or more declarations,
  // each of which might have zero or more JSDoc comment regions
  for (const declaration of symbol.getDeclarations()) {
    for (const range of declaration.getLeadingCommentRanges()) {
      const match = jsDocText.exec(range.getText())
      if (!match) continue
      sections.push(match[1].replaceAll(jsDocTag, ''))
    }
  }

  // Join all sections together with two newlines to make sure they are
  // seperate paragraphs in markdown
  return sections.join('\n\n')
}

module.exports = api()

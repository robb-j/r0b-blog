---
title: Bundle JavaScript with Eleventy and esbuild
date: 2021-06-25
draft: true
summary: >
  How to add JavaScript and bundle it together for an Eleventy project plus integration with the development server for automatic reloading.
---

[Static site generators are great...](https://blog.r0b.io/post/compile-sass-with-eleventy/)
as I have previously mentioned.
This is a spiritual second part to that post for JavaScript instead of Sass.

When you're making a website with a static site generator,
you have already chosen to not to create a Single Page App (SPA).
But you might still want to add a little bit of vanilla JavaScript into the mix,
to add an extra bit of interaction.

You can use the same technique as before to bundle up JavaScript into a single backwards-compatible file.
This time using esbuild instead of Sass.
Esbuild is a newer JavaScript bundler written in Go and it's very performant compared to tools like WebPack and Parcel.

> The only downside to esbuild I've found is that it only goes back to es6, so no IE support...

## Setup

Let's start with an empty project to see all that’s required.

```bash
# Create a project folder
mkdir esbuild-eleventy
cd esbuild-eleventy

# Create an npm project
npm init -y

# Install 11ty and esbuild
npm install —save-dev @11ty/eleventy esbuild
```

## Create some JavaScript

Next create **src/js/app.js** using some modern JavaScript features:

```js
async function main() {
  await new Promise((resolve) => setTimeout(1000, resolve))
  console.log('done')
}

main()
```

Then create an Eleventy JavaScript template **scripts.11ty.js**:

```js
const esbuild = require('esbuild')
const { NODE_ENV = 'production' } = process.env

const isProduction = NODE_ENV === 'production'

module.exports = class {
  data() {
    return {
      permalink: false,
      eleventyExcludeFromCollections: true,
    }
  }

  async render() {
    await esbuild.build({
      entryPoints: ['src/js/app.js'],
      bundle: true,
      minify: isProduction,
      outdir: '_site/js',
      sourcemap: !isProduction,
      target: isProduction ? 'es6' : 'esnext',
    })
  }
}
```

<details>
<summary>A Note on JSX</summary>

If you want to use JSX,
like [Using jsx WITHOUT React](https://blog.r0b.io/post/using-jsx-without-react/),
you can configure that above:

```js
{
  '...'
  jsxFactory: 'createElement',
  jsxFragment: "'DomFragment'",
}
```

</details>

Similar to compiling Sass, this is an 11ty class-based JavaScript template,
that exports a class which 11ty will instantiate.
11ty will call the data method first, which is the same as the frontmatter of a markdown file.
We use the [permalink](https://www.11ty.dev/docs/permalinks/)
to tell 11ty not to create a file for this template, as esbuild does this for us.
Eleventy then calls render which is used to call esbuild.

The esbuild js api handles outputting files and we tell it to put it in the same place the Eleventy does. An added benefit to this is that the Eleventy template can be used to bundle multiple JavaScript entry points in one go by adding them to the `entryPoints` option.

> See [esbuild's API docs](https://esbuild.github.io/api/)
> for more information about the options you can pass here,
> like turning on sourcemaps or minifying code.

## Configure 11ty

Finally, configure 11ty to use our JavaScript template.

Create **.eleventy.js**:

```js
module.exports = function eleventyConfig(eleventyConfig) {
  eleventyConfig.addWatchTarget('./src/js/')

  return {
    templateFormats: ['md', '11ty.js'],
  }
}
```

This does two things.
First, it tells 11ty to watch for file changes in the **src/js** folder.
So in development, when you edit a JavaScript file 11ty will rebuild and reload the development server.
Second it tells 11ty to look for our `.11ty.js` templates and load them.

## Build the site

This site doesn't have any markdown, but it will still generate our bundled JavaScript.

```bash
npx eleventy
```

You should see the js generated into the \_site folder now, all done! 🎉

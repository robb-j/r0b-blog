---
title: Bundle JavaScript with Eleventy and esbuild
date: 2021-06-27
draft: false
summary: >
  How to add JavaScript and bundle it together for an Eleventy project plus integration with the development server for automatic reloading.
---

[Static site generators are great...](https://blog.r0b.io/post/compile-sass-with-eleventy/)
as I have previously mentioned,
here is how to bundle JavaScript into your Eleventy site too.

When you're making a website with a static site generator,
you have already chosen to not to create a Single Page App (SPA).
But you might still want to add JavaScript to add dynamic features.

You can use an [Eleventy JavaScript class template](https://www.11ty.dev/docs/languages/javascript/#classes)
to bundle up multiple JavaScript files into a single backwards-compatible file using esbuild.
Esbuild is a newer JavaScript bundler written in Go
and it's very performant compared to tools like WebPack and Parcel.

> The only downside to esbuild I've found is that it only goes back to es6, so no IE support...

## Setup

Let's start with an empty project to see all that’s required.

```bash
# Create a project folder
mkdir esbuild-eleventy
cd esbuild-eleventy

# Create an npm project
npm init -y

# Install Eleventy and esbuild
npm install --save-dev @11ty/eleventy esbuild
```

## Create some JavaScript

Next, create **src/js/app.js** using some modern JavaScript features,
this is the file we want to bundle.

```js
async function main() {
  await new Promise((resolve) => setTimeout(1000, resolve))
  console.log('done')
}

main()
```

Then create an Eleventy JavaScript class template **scripts.11ty.js**,
this is in charge of bundling JavaScript for the website.

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
like in [Using jsx WITHOUT React](https://blog.r0b.io/post/using-jsx-without-react/),
you can add these parameters to the `esbuild.build` call:

```js
{
  jsxFactory: 'createElement',
  jsxFragment: "'fragment'",
}
```

</details>

Similar to compiling Sass, this is an Eleventy class-based JavaScript template,
that exports a class which Eleventy will instantiate.
Eleventy will call the data method first, which is the same as the front-matter of a markdown file.
We use the [permalink](https://www.11ty.dev/docs/permalinks/)
to tell Eleventy not to create a file for this template, as esbuild does this for us.
Eleventy then calls the render method which we use to call esbuild.

The esbuild JavaScript API handles outputting files
and we tell it to put them in the same place the Eleventy does.
A benefit of this is that the Eleventy template can be used to bundle multiple JavaScript entry points in one go, by passing `entryPoints`.

> See [esbuild's API docs](https://esbuild.github.io/api/)
> for more information about the options you can pass here,
> like configuring source-maps or minifying code.

## Configure Eleventy

Finally, configure Eleventy to use our template by creating **.eleventy.js**:

```js
module.exports = function eleventyConfig(eleventyConfig) {
  eleventyConfig.addWatchTarget('./src/js/')

  return {
    templateFormats: ['md', '11ty.js'],
  }
}
```

This does two things.
First, it tells Eleventy to watch for file changes in the **src/js** folder.
So in development, when you edit a JavaScript file Eleventy will rebuild and reload the development server.
Second it tells Eleventy to look for our `.11ty.js` templates and load them.

## Build the site

This site doesn't have any markdown, but it will still generate our bundled JavaScript.

```bash
npx eleventy
```

You should see the JavaScript generated into the \_site folder now, all done! 🎉

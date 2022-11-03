---
title: Compile Sass with eleventy
date: 2021-05-25
draft: false
summary: >
  How to add Sass/Scss to an Eleventy project and integrate it with the development server for automatic reloading.
---

Static site generators are great for generating HTML from markdown files.
Eleventy ([11ty](https://www.11ty.dev)) is a simple JavaScript based generator, named after the 11 templating languages it supports.

Static HTML is great, but websites need CSS too! My go to css preprocessor is Sass,
so I wanted to find a way to compile Sass directly in 11ty projects.
After a bit of experimentation, the best way I found to do this was with
[11ty class templates](https://www.11ty.dev/docs/languages/javascript/#classes).
Using 11ty means there is only one process to worry about
and it auto reload on sass changes.

## Setup

Let's start with an empty project to show what’s required:

```bash
# Create a project folder
mkdir sass-eleventy
cd sass-eleventy

# Create an empty npm project
npm init -y

# Install 11ty and sass
npm install —save-dev @11ty/eleventy sass
```

## Create some sass

Next, create **src/sass/theme.scss**:

```scss
$primary: #096e4f;

h1 {
  color: $primary;
}
```

Then back at the root of the project create **theme.11ty.js**:

```js
const path = require('path')
const Sass = require('sass')

module.exports = class SassTemplate {
  data() {
    return { permalink: '/styles.css' }
  }

  render(data) {
    return Sass.renderSync({
      file: path.join(__dirname, './src/sass/theme.scss'),
      includePaths: [path.join(__dirname, './node_modules')],
      outputStyle: 'compressed',
    }).css
  }
}
```

This is an 11ty [class-based JavaScript template](https://www.11ty.dev/docs/languages/javascript/#classes),
11ty will create an instance of our class and call the data method.
This provides the front matter for the template, similar to the top bit of a markdown file.
We use this to set the
[permalink](https://www.11ty.dev/docs/permalinks/)
value to tell 11ty we want to create a file called `styles.css`.

11ty then calls `render` with the front matter data.
This method returns what we want to put in the file.
Here we use the Sass library to render the input file
and return the css to put into the file.
Pass `includePaths` here if you want to import sass from npm dependencies,
like [bulma](https://bulma.io).

## Configure 11ty

Finally, configure 11ty to use our sass template with an `.eleventy.js`:

```js
module.exports = function eleventyConfig(eleventyConfig) {
  eleventyConfig.addWatchTarget('./sass/')

  return {
    templateFormats: ['md', '11ty.js'],
  }
}
```

This does two things.
First, it tells 11ty to watch for file changes in the `src/sass` folder.
So in development, when you edit a Sass file 11ty will know to rebuild and reload the development server.
Second it tells 11ty to look for our `11ty.js` files, so the sass template gets loaded.

## Build the site

This site doesn't have any markdown, but it will still generate our css.

```bash
npx eleventy
```

You should see the `style.css` file generated into the `_site` folder now, all done! 🎉

---

<details>
<summary>Future improvements</summary>

This setup could be improved, but its a good starting point and fine for lots of setups.

Things to improve:

- Generate sass source maps, this might need Sass to generated in the `data` method
  and using the [pagination](https://www.11ty.dev/docs/pagination/) api to create multiple files.
- It might be improved by using asynchronous `data` / `render` methods,
  rather than using `Sass.renderSync`

</details>

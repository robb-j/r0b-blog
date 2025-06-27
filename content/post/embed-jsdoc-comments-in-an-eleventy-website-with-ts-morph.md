---
title: Embed JSDoc comments in an Eleventy website
date: 2023-05-03
draft: false
summary: >
  How to embed JSDoc comments from an API into an Eleventy site to referecnce it rather than duplicate it.
---

You can use [JSDoc](https://jsdoc.app/) to automatically generate a documentation website to fully describe the contents of your API. This works by adding special comments around your JavaScript or TypeScript code that describe the code in more detail. For JavaScript you can even describe the types to better help the people using your API.

> An example JSDoc comment
>
> ```js
> /**
>   It erm ... adds two numbers together
>   
>   @param {number} a The first number
>   @param {number} b The number to add to the first number
>   @returns {number} The sum of the two numbers
> */
> function add(a, b) {}
> ```

JSDoc can then generate a website to showcase your API for you. Personally, I've found these generated sites hard to navigate and difficult to get to the information I need. You can create your own template but that requires learning the ins and outs of JSDoc and how it's templating works.

For a recent project, I was creating a site to demonstrate and document a design system. I wanted to reference the JSDoc I'd already written in the code, rather than duplicate it. I found the [ts-morph](https://github.com/dsherret/ts-morph) package on GitHub which makes it easier to parse TypeScript's Abstract Syntax Tree (_AST_). My ideal integration was to only pull out the JSDoc comments and embed them as markdown on the site.

> _AST_ is a data structure that represents the code in a file, rather than the raw text string. It allows it to be queried and modified in-place. [AST Explorer](https://astexplorer.net/) is a good tool to play around and inspect the trees generated from code files.

There are a couple of benefits to this general approach:

1. These doc comments only need to be written once. The same comment can be seen in an IDE code completions and on the documentation website. Those comments only need to be updated in one place, so can't get out of sync.
2. The comments are close to the code that they document. So it's easier to update them when the code the document changes. This feels in the vein of **Locality**, from The Unicorn Project's [Five Ideals](https://itrevolution.com/articles/five-ideals-of-devops/).
3. You have complete control of how your documentation site looks and feels. It's important to properly think through documentation. I've sometimes tried "Documentation driven development" where the docs are written before any code to get a feel for how something should work from a consumer's perspective, rather than jumping into the technical implementation.

## How it works

Ok you're sold, or still interested to learn more? To show how it works, we'll create a fresh Eleventy website, along with an "API" to document and hook up. In a terminal, let's scaffold the project and fetch NPM dependencies:

```bash
mkdir eleventy-jsdoc
cd eleventy-jsdoc

npm init -y
npm install @11ty/eleventy typescript ts-morph @11ty/eleventy-plugin-syntaxhighlight markdown-it slugify
```

> All of the code is at [examples/eleventy-jsdoc](https://github.com/robb-j/r0b-blog/tree/main/examples/eleventy-jsdoc) if you want to jump ahead see it all in one place.

Let's make our library, `lib.js`, this is the API we're creating and want to document. We're going to pull these JSDoc comments through into our website:

{% exampleCode 'eleventy-jsdoc/lib.js' %}

Now add an Eleventy configuration file, `eleventy.config.js`, to add some custom logic:

{% exampleCode 'eleventy-jsdoc/eleventy.config.js' %}

Next let's create a HTML base layout for our site, `_includes/html.njk`, which our pages can use:

{% exampleCode 'eleventy-jsdoc/_includes/html.njk', 'html' %}

And now, we can use that layout to add our first page, `index.md`, a basic homepage to link to our other pages:

{% exampleCode 'eleventy-jsdoc/index.md' %}

Now for the first proper page, `guide.md`. This is a page to showcase specific bits of the API.
This uses the `apiDoc` shortcode registered in the Eleventy config to directly embed our JSDoc comments!
The shortcode needs the `api` data object passed to it, more on that later, along with the entry-point and the named export you want to embed.

{% exampleCode 'eleventy-jsdoc/guide.md' %}

To show another use of the integration, we can make a page that enumerates the whole API to document everything, `docs.md`.
This shows how you can do whatever you like with that `api` data object, if you pull in extra information from `ts-morph` you can access that here.
For this example, it loops through each entry-point and their corresponding named exports to dump them all out into the page.

There is also a little "Debug" section so you can see what was put onto that `api` object.

{% exampleCode 'eleventy-jsdoc/docs.njk', 'html' %}

That is the basic site setup, now we need to start linking it up with TypeScript with `ts-morph`. For that we'll need to add a TypeScript config file, `tsconfig.json`:

{% exampleCode 'eleventy-jsdoc/tsconfig.json' %}

To get this `api` object we've seen in the templates, we'll use an Eleventy [global data file](https://www.11ty.dev/docs/data-global/), `_data/api.js`. It runs ones to generate a data object with JavaScript. This is the brunt of the integration, there is quite a bit going on here and the TypeScript _AST_ is quite complex.

It loads the predefined entry-points up and parses their _AST_ nodes into memory. With those nodes we go through and find the code which is exported, i.e. code that uses JavaScript's `export` modifier, and then collect the JSDoc comments from them. This version is setup here to ignore any exports marked with `@internal`, but you could change that check for anything you like.

{% exampleCode 'eleventy-jsdoc/_data/api.js' %}

You should now have a directory structure something like this:

```
.
├── _data
│   └── api.js
├── _includes
│   └── html.njk
├── docs.njk
├── eleventy.config.js
├── guide.md
├── index.md
├── lib.js
├── package-lock.json
├── package.json
└── tsconfig.json
```

With all that setup, we can build and serve our site with `npx eleventy --serve` and open it up in the browser 🥳. It should look like the pictures below:

The first page is a "guide", which shows how to embed specific bits of the API using the `apiDoc` shortcode.

{% image 'eleventy-jsdoc-guide.jpg', 'The guide page with some crafted notes and JSDoc snippets embedded in-between.' %}

The second page is a catch-all "docs" page that dumps the entire API grouped by entry-point.

{% image 'eleventy-jsdoc-docs.jpg', 'The docs page listing out each entry-point and each named export in them.' %}

To recap,

1. There is an API we want to document in `lib.js`
2. That file has JSDoc comments in, documenting the code in-place
3. From `_data/api.js`, we parse the _AST_ of the code and the JSDoc comments to make it available in Eleventy
4. That data is available in templates globally as `api`
5. There is an `apiDoc` shortcode to quickly render a named export from a specific entry-point
6. It all gets built into a nice website with syntax highlighting from [prism](https://prismjs.com/)

## Next steps

My use case was just getting those JSDoc comments out of the code and into the website, but in exploring that there are more things I think you could do.

**better embedding** — I left the `apiDoc` shortcode quite brief on purpose, you might want a url-slug `id` in there or to use a different heading tag.

**Actually use TypeScript** — The example `lib.js` is just JavaScript, you can of course use it with TypeScript too. I was just trying to keep things simple here.

**More TypeScript integration** — There is a load more information in the TypeScript _AST_ that isn't being used, I tried getting it to generate code signatures before but didn't get very far. There are also some cool things that could be done with the "tags" in JSDoc comments, e.g. `@param`, maybe they could be processed more and put into HTML tables or something.

**A library** — with some more iteration, and some interest, there could be a nice library/eleventy-plugin here to make this a lot easier in the future, it's quite a lot of code in this post 🙄.

**Work out the "hack" in eleventy.config.js** — I'm not sure how properly get the syntax highlighting to work without relying on the mutation of my `md` instance in there.

**Configure the Watch Target** — there is only one file in the API here but with multiple you'll want to pass a glob pattern to `eleventyConfig.addWatchTarget` to make it reload when any of your source code changes.

---

Props to [Zach](https://fosstodon.org/@eleventy/110300521096431755) for prompting me to do this.

Hit me up on [Mastodon]({{ site.mastodon }}) if you liked this, have feedback or just want to know more!

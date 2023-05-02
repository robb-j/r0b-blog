---
title: Embed JSDoc comments in an Eleventy website
date: 2023-05-03
draft: true
summary: >
  How to embed JSDoc comments in Eleventy to reference API documentation rather than duplicate it.
---

You can use [JSDoc](https://jsdoc.app/) to automatically generate a documentation website to fully describe the contents of your API. This works by adding special comments around your JavaScript or TypeScript code that describe the code in more detail. For JavaScript you can even describe the types to better help the people using your API.

> An example JSDoc comment
>
> ```js
> /**
>   It ermm ... adds two numbers together
>   
>   @param {number} a The first number
>   @param {number} b The number to add to the first number
>   @returns {number} The sum of the two arguments
> */
> function add(a, b) {}
> ```

Personally, I've found these generated documentation websites hard to navigate and difficult to get to the information I need. You can create your own template but that requires learning the ins and outs of JSDoc and how it's templating works.

For a recent project, a [design system](https://alembic.openlab.dev/) for our lab, I was creating a site to demonstrate and document the system. I wanted to reference the JSDoc I'd already written in the code, rather than duplicating it. I found the [ts-morph](https://github.com/dsherret/ts-morph) package on GitHub which wraps TypeScript's Abstract Syntax Tree (_AST_) parser to make it friendlier amongst other things. The _AST_ was a lot more complex than I expected so I reduced my integration to only pull the JSDoc comments and embed them as markdown on our site.

> _AST_ is a data structure that represents the code in a file, rather than the raw text string. It allows it to be queried and modified in-place. [AST Explorer](https://astexplorer.net/) is a good tool to play around and inspect the trees generated from code files.

There are a couple of benefits to this general approach:

1. The code comments only need to be written once, then they can be viewed in IDEs during hovers and code completion and on the documentation website. Those comments only need to be updated once and can't get out of sync.
2. The comments are close to the code that they document. So it's easier to update when the code itself changes and there is hopefully less chance that you forget to update them. This feels in the vein of **Locality**, from The Unicorn Project's [Five Ideals](https://itrevolution.com/articles/five-ideals-of-devops/)
3. You have complete control of how your documentation site looks and feels. It's important to properly think through documentation, rather than just dump out the types, methods & classes available. I've sometimes tried "Documentation driven development" where the documentation is written before any code to get a feel for how something should work from a consumer's perspective, rather than jumping into the technical implementation.

## How it works

Ok you're sold, or still interested to learn more? To show how it works, we'll create a fresh Eleventy website, along with an API to document and hook up the to site.

```bash
mkdir eleventy-jsdoc
cd eleventy-jsdoc

npm init -y
npm install @11ty/eleventy typescript ts-morph @11ty/eleventy-plugin-syntaxhighlight markdown-it slugify
```

> All of the code is at [examples/eleventy-jsdoc](https://github.com/robb-j/r0b-blog/tree/main/examples/eleventy-jsdoc) if you want to jump ahead see it all in one place.

Lets make our "library", `lib.js`, this is the API we're creating and want to document. We're going to pull these JSDoc comments through into our website:

{% exampleCode 'eleventy-jsdoc/lib.js' %}

Now configure Eleventy with `eleventy.config.js`:

{% exampleCode 'eleventy-jsdoc/eleventy.config.js' %}

Next lets create a HTML base layout for our site, `_includes/html.njk`, which our pages can use:

{% exampleCode 'eleventy-jsdoc/_includes/html.njk', 'html' %}

Now we can use that layout to make a basic homepage, `index.md`:

{% exampleCode 'eleventy-jsdoc/index.md' %}

And create the first page, `guide.md`, to showcase specific bits of our amazing API.
This uses the `apiDoc` shortcode registered in the Eleventy config to directly embed our JSDoc comments!

{% exampleCode 'eleventy-jsdoc/guide.md' %}

Then we can make a page that enumerates the whole API to document everything, `docs.md`.
This shows how you can do whatever you like with that `api` data object, if you put extra information from `ts-morph` you can access that here.
Here it loops through each entry-point and their exports to dump them all out

{% exampleCode 'eleventy-jsdoc/docs.njk', 'html' %}

That is the basic site setup, now we need to start linking it up with TypeScript and ts-morph. For that we'll need a TypeScript config file, `tsconfig.json`:

{% exampleCode 'eleventy-jsdoc/tsconfig.json' %}

To get this `api` object we've seen in the templates, we'll use an Eleventy [global data file](https://www.11ty.dev/docs/data-global/), `_data/api.js`. This is the brunt of the integration, there is quite a bit going on here and the TypeScript _AST_ is quite complicated. It is setup here to ignore any exports marked with `@internal`, but you could change that check for anything you like.

{% exampleCode 'eleventy-jsdoc/_data/api.js' %}

You should have a directory structure something like this:

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

With all that setup, we can build and serve our site with `npx eleventy --serve` and open it up in the browser 🥳.
There are three pages:

1. A home page which just links to the other two pages
2. A "guide" page which embeds specific API usage using the `apiDoc` shortcode
3. A "docs" page which dumps the entire API grouped by entry-point

## Next steps

**better embedding** — I left the `apiDoc` shortcode quite brief on purpose, you might want a url-slug `id` in there or to use a different heading tag.

**More TypeScript integration** — There is a load more information in the TypeScript _AST_ that isn't being used, I tried getting it to generate code signatures before but didn't get very far. There are also some cool things that could be done with the "tags" in JSDoc comments, e.g. `@param`, maybe they could be processed more and put into HTML tables or something.

**A library** — with some more iteration, and some interest, there could be a nice library/eleventy-plugin here to make this a lot easier in the future, it's quite a lot of code in this post 🙄.

**work out the "hack" in eleventy.config.js** — I'm not sure how properly get the syntax highlighting to work without relying on the mutation of my `md` instance in there.

---

Props to [Zach](https://fosstodon.org/@eleventy/110300521096431755) for prompting me to do this.

Hit me up on [Mastodon](https://hyem.tech/@rob) if you liked this, have feedback or just want to know more!

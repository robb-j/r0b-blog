---
title: Eleventy WebC in a nutshell
date: 2023-12-02
draft: false
summary: >
  Quickly get started with WebC in an Eleventy website.
---

I've been learning about WebC recently and I'm pretty sure I'm converted.
So I thought I'd put together a set of notes from my experience of learning it.
To do this, let's create a little project together. From scratch.

## Prerequisites

Before starting, I'm going to assume:

- You are happy to write some JavaScript
- You're familiar Eleventy
- You maybe understand custom elements (a.k.a web components)

```sh
mkdir 11ty-webc-nutshell
cd 11ty-webc-nutshell

npm init -y
npm install @11ty/eleventy @11ty/eleventy-plugin-webc
```

That'll create us a project folder, set it up to use NPM and install our dependencies.

## Configuration

Now we need to configure Eleventy to use WebC. This is pretty simple, we'll add our eleventy config file.
I'm going to use **eleventy.config.cjs**,
but there are [several of other names](https://www.11ty.dev/docs/config/#default-filenames) you can use.

> My current thinking is this is more important than a "dot file" like `.gitignore` and I'd like to be specific this is CommonJS.

```js
const eleventyWebc = require('@11ty/eleventy-plugin-webc')

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(eleventyWebc)
}
```

## Pages

Pretty simple so far. Now lets create our first page. This uses the new `.webc` extension (hint: it's just HTML, so you can tell your editor about that to make it prettier).

**index.webc**

```html
---
layout: html.webc
---

<main>
  <h1>Hello, there</h1>

  <my-first-component></my-first-component>
</main>
```

This all looks familiar so far, if you've used Eleventy before that is. It starts of with Front Matter which is meta-information to tell Eleventy things. Here we say we'd like to use another file as the layout. So this page will be rendered inside the `html.webc` which we'll create a bit later.

After the Front Matter, we create our page. It has a nice big title and it uses a custom element! WebC is based on web standards, it hooks in to [custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_Components/Using_custom_elements) and starts to do it's magic. So let's create our first WebC component!

## Components

By default, WebC will automatically pick up any `.webc` file you put into the `_components` folder. Let's create **\_components/my-first-component.web**:

> You can configure where Eleventy/WebC looks for these components or you can use the default location if you want.

```html
<p class="call">General Kenobi</p>
```

Thats what a WebC component is, it's just HTML. There are lots of other clever things you can do, but at it's purest it can just be HTML. Eleventy will replace `<my-first-component>` in the page with our `<p>` element for you. If you just want a way of reusing HTML code, WebC is a fine way to do that.

So to be a bit more interesting, let's give our component some _style_.

**\_components/my-first-component.web**

```html
<p class="call">General Kenobi</p>
<style>
  .call {
    color: rebeccapurple;
    text-decoration: underline;
  }
  .call::after {
    content: '!';
  }
  .response {
    color: blue;
    text-decoration: underline;
  }
</style>
```

Here we've made the text look cooler with some CSS. By default, WebC will see that we've used a `<style>` tag and will take it out of our template to be bundled up. We'll tell it where to put it later in our layout.

This style is global so we're using a class to make it more specific. You can alternatively add `webc:scoped` to the `<style>` tag to auto-generate a name for you and make it so the style only applies to things inside the WebC file.

By adding CSS (or JavaScript) it changes how WebC behaves a little. Without it, WebC will take the HTML content and straight replace it anywhere it is referenced. This is known as a [html-only component](https://www.11ty.dev/docs/languages/webc/#html-only-components). With scripts or styles, the component remains a web-component so the `<my-first-component>` remains in your HTML and it's contents becomes everything else in your in your `.webc` file.

> You can configure how the content is inserted with a `<slot>` tag, [more info](https://www.11ty.dev/docs/languages/webc/#slots)

So let's add some JavaScript too, add this script tag to the **existing** file, as long as it is at the top-level of the HTML document in your component file.

**\_components/my-first-component.web**

```html
<!--
  previous example code here...
-->
<script>
  class MyFirstComponent extends HTMLElement {
    connectedCallback() {
      setTimeout(() => {
        this.appendMessage('This will make a fine addition to my collection')
      }, 2_000)
    }
    appendMessage(message) {
      const p = document.createElement('p')
      p.textContent = message
      p.classList.add('message')
      this.appendChild(p)
    }
  }
  window.customElements.define('my-first-component', MyFirstComponent)
</script>
```

Because WebC is not in html-only mode, it keeps the `<my-first-component>` element in your rendered HTML and you can attach code to that. We create our client-side custom element, `MyFirstComponent` by subclassing [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement). Then we use `define` on the custom elements registry to get it hooked up. When someone visits the page, the browser attach our code onto the HTML element and call `connectedCallback` to let us know.

As a demonstration, we add another styled message after waiting an extra 2 seconds.

## Layouts

Ok so what happens to these scripts and styles, and how do they fit into a nice HTML document? It's completely up to you! We'll use a layout to add the styles and scripts into our rendered HTML, create **\_includes/layout.webc**:

```html
<!doctype html>
<html>
  <head>
    <title>My first WebC</title>
    <meta charset="utf8" />
    <meta name="viewport" content="width=device-width" />
    <style @raw="getBundle('css')" webc:keep></style>
  </head>
  <body>
    <template @html="this.content" webc:nokeep></template>
    <footer>My first WebC 2023</footer>
    <script type="module" @raw="getBundle('js')" webc:keep></script>
  </body>
</html>
```

There's are a few bits going on here, let's break it down.

As mentioned above, one of the powers of WebC is that it can bundle up your JavaScript and CSS for you. WebC takes out those `<script>` and `<style>` tags from your `.webc` files and we have to get them into to our HTML document. We do this with some familiar `<script>` and `<style>` elements! These ones though have special attributes to the files generated by WebC and insert them into the document. Other brief notes:

- The scripts and styles are per-page so only the resources you need are on each page.
- As WebC removes `<script>` and `<style>` elements, here we need to tell it not to by adding the `webc:keep` attribute.
- Any `webc:` attributes are removed from the HTML you publish.
- The value of `@raw` can actually be anything from Eleventy, e.g. things from the Front Matter or [Data Cascade](https://www.11ty.dev/docs/data-cascade/). In this case it's a shortcode provided by [eleventy-plugin-bundle](https://github.com/11ty/eleventy-plugin-bundle) (which WebC uses under the hood).

The second interesting bit is that we're using a `@html` attribute on a `<template>` element. This takes the HTML generated from processing our page and puts it inside the `<template>` element. There is a special `webc:nokeep` attribute on there too. This tells WebC that we aren't interested in the template itself and to get rid of it, replacing it with whatever our page has rendered.

## Round up

To summerise, we:

- Set up a fresh Eleventy project and added the WebC plugin
- Created a page using WebC as the templating language
- Added the WebC component that the page uses
- Made the component more interesting with styles and scripts
- Laid out the whole page using a WebC layout

If you want to skip to the end, who doesn't, see all the code in one place at [examples/eleventy-webc](https://github.com/robb-j/r0b-blog/tree/master/examples/eleventy-webc).

## Current questions

A few things I've been thinking and don't currently have answers for:

- Can a `webc:setup` access "props"?
- How can you modify the attributes on non-html-component?
- I keep getting a `Uncaught SyntaxError: Identifier '...' has already been declared` & have to restart the 11ty.

## Next steps

My team has a custom-elements based design system, partly using [every-layout](https://every-layout.dev/), and it has an existing [Eleventy plugin](https://alembic.openlab.dev/install/ssg/) to generate styles and scripts. I wonder how I could migrate or provide a way to do this via WebC instead. There are currently some pretty big regexes I'd rather not have to maintain!

Here are some places you could go next:

- [The WebC reference](https://www.11ty.dev/docs/languages/webc/#webc-reference) is the obvious place to look for more information and inspiration. You can do stuff like if statements or for loops or provide slots to describe how WebC will embed content in your component.
- [Props and Attributes](https://www.11ty.dev/docs/languages/webc/#dynamic-attributes-and-properties) are really powerful and let you process Eleventy data into your templated content.
- [11ty/eleventy-plugin-bundle](https://github.com/11ty/eleventy-plugin-bundle) is a good place to look if you're interested in how the script and style bundling works. A big snoop through the code helped me work out what was going on.
- MDN has a good guide on [getting started with custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_Components/Using_custom_elements) if you want to learn more about those.
- I haven't dived into it yet, but [webc:setup](https://www.11ty.dev/docs/languages/webc/#using-javascript-to-setup-your-component) looks really interesting
- I'm working on a "year in review" type thing for a coffee club I'm in and it's using WebC, [robb-j/year-in-rebrew](https://github.com/robb-j/year-in-rebrew) if you're interested.

Found this useful or spotted a mistake? Let me know on [Mastodon]({{ site.mastodon }})!.

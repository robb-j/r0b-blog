---
title: Using jsx WITHOUT React
layout: layouts/post
date: 2020-01-12
draft: false
summary: >
  I wanted to do some lightweight javascript recently and didn't want to use a massive framework.
  Creating all my DOM elements manually was laborious and ugly so I setup jsx to do it for me.
---

From my experience, jsx has always been synonomous with React.
But jsx can in fact be used without React.
Jsx lets you write xml structures in javascript and apply your own meaning to them.
You can see Facebook's [specification here](https://facebook.github.io/jsx/).

Jsx is not meant to be implemented as part of the Ecmascript specification,
but rather used by preprocessors (like [babel](https://babeljs.io/))
to transform jsx code to native javascript code.
Much like typescript is transpilled into javascript.

## What jsx does

Jsx is passed to babel and it converts your xml into javascript function calls.
You pass a `pragma` option to babel which tells it how to process your xml.
For instance if you set pragma to `createElement` and run this script through it:

```jsx
let myDocument = <p id="name">Hello, world</p>
```

Babel would convert your code into:

```js
let myDocument = createElement('p', { id: 'name' }, 'Hello, world')
```

Which has nicely transformed our code into something a browser (or node.js) will understand.
We still have to craft our `createElement` though.
In React this is a method which creates components,
but we can make it do whatever we want.

## Pragma method signature

A pragma method takes two parameters
and a [rest argument](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters),
for example:

```js
createElement(tagNameOrComponent, attributes, ...children)
```

`tagNameOrComponent` is either a string tagName of a native element (like a `<p>` or `<div>`)
or a variable to something in the scope of your jsx.
Maybe you want to pass a function and call it inside you pragma method.

`attributes` is an object of key-value pairs that you passed to the xml element.

`...children` is a rest argument of any xml children that are inside the parent tag.
They have already been processed by your pragma method.

## An example

So now to use this in a real (trivial) example.
First setup a node project and install some dependencies.

```bash
# Create a project folder
mkdir jsx-without-react
cd jsx-without-react

# Create an npm project
npm init -y

# Install babel
npm install @babel/cli @babel/core @babel/plugin-transform-react-jsx
```

Next we'll need a `.babelrc` which will tell babel how to process our jsx.

```json
{
  "plugins": [
    ["@babel/plugin-transform-react-jsx", { "pragma": "createElement" }]
  ],
  "comments": false
}
```

And then add an `index.jsx` file

```jsx
function createElement(tag, attributes, ...children) {
  console.log({ tag, attributes, children })
}

let myDocument = <p>Hello, world</p>
```

Now you can run this command to generate your javascript.

```bash
npx babel index.jsx -d dist
```

Which will create a new `dist/index.js` file with the transpilled code.

## An example with dom elements

For a real world example, lets use jsx to create dom elements and render them.
With the same setup as before, lets change our `index.jsx` to:

```jsx
// A jsx pragma method to create html dom elements (more info below)
function createElement(tagName, attrs = {}, ...children) {
  const elem = Object.assign(document.createElement(tagName), attrs)
  for (const child of children) {
    if (Array.isArray(child)) elem.append(...child)
    else elem.append(child)
  }
  return elem
}

// Setup some data
const name = 'Geoff'
const friends = ['Sarah', 'James', 'Hercule']

// Create some dom elements
const app = (
  <div className="app">
    <h1 className="title"> Hello, world! </h1>
    <p> Welcome back, {name} </p>
    <p>
      <strong>Your friends are:</strong>
    </p>
    <ul>
      {friends.map(name => (
        <li>{name}</li>
      ))}
    </ul>
  </div>
)

// Render our dom elements
window.document.getElementById('app').replaceWith(app)
```

> You can add `// eslint-disable-next-line no-unused-vars` to ignore annoying eslint errors

And to test our code, add an `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>jsx WITHOUT react</title>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/kognise/water.css@latest/dist/light.min.css"
    />
  </head>
  <body>
    <div id="app"></div>
    <script src="dist/index.js"></script>
  </body>
</html>
```

Then run the transpiller again and open your `index.html` in a browser.
I snuck in [water.css](https://github.com/kognise/water.css) to make raw html prettier.

```bash
npx babel index.jsx -d dist
```

## My createElement function

Here is my `createElement` from above, it does a couple of things.

```js
function createElement(tagName, attrs = {}, ...children) {
  const elem = Object.assign(document.createElement(tagName), attrs)
  for (const child of children) {
    if (Array.isArray(child)) elem.append(...child)
    else elem.append(child)
  }
  return elem
}
```

First it creates a dom element with `document.createElement`
and assigns the jsx attributes onto it with `Object.assign`.
This lets you set most element properties like `id` or
[Element#className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className).

Next it loops through the child elements,
which have already been generated into dom elements with this function.
With each element it adds them as a child.
I chose [Window#append](https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/append)
because will it create text nodes for you too.
It checks for arrays children too so it can add any nested children,
like the friend's mapping above:

```jsx
<ul>
  {friends.map(name => (
    <li>{name}</li>
  ))}
</ul>
```

## pragmaFrag

There is another babel option which lets you handle
[jsx short fragments](https://reactjs.org/docs/fragments.html#short-syntax).
You can pass `pragmaFrag` in your `.babelrc` to tells babel how to handle fragments.

If you setup a `.babelrc` like this:

```json
{
  "plugins": [
    [
      "@babel/plugin-transform-react-jsx",
      { "pragma": "createElement", "pragmaFrag": "'fragment'" }
    ]
  ]
}
```

Then you can:

```jsx
function createElement(tagName, attrs = {}, ...children) {
  if (tagName === 'fragment') return children
  // Same as above ...
}

const elements = (
  <>
    <p>Hello,</p>
    <p>world!</p>
  </>
)
```

It will now pass whatever you set `pragmaFrag` to to your pragma method,
which you can handle however you want.
In this case it simply returns the child elements.
This can be useful if you don't want to create too many extra dom elements.

---

That's what I know about using jsx without react.
I've found it useful for tidying up small web apps which just need dom access.

You can find the example at [robb-j/r0b-blog](https://github.com/robb-j/r0b-blog/tree/master/examples/jsx-without-react)

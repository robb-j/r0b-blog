---
title: Trying to make a vanilla web app
date: 2023-01-28
draft: false
summary: >-
  Last year we rebuilt our lab's co-operative coffee system and I didn't use any frameworks
---

At work we have a Coffee Club. It goes back a while but we cooperatively bought a coffee machine and have been trying to work out the best way to organise coffee buying ever since.

<details>
<summary>A brief history of the club</summary>

In our old office we were split on two floors and upstairs had an "official" lab-sanctioned and paid machine and on our floor we had naught. One Black Friday a few of us clubbed together to buy a bean-to-cup machine and a bunch of coffee beans.

We had this brilliant idea that we could ask people who wanted to join to buy 3 bags of beans to be in the club. This solved our need for beans running out and we had more people to talk to on coffee breaks. Yes, we just made a Ponzi scheme.

When we, very quickly, realised that Ponzi schemes don’t work, we set about making a fair system to decide who should be the next person to buy coffee beans. We hooked up a Raspberry Pi and RFID sensor to self-report cups drank to a Google sheet and a Google form to register purchases.

The machine now knew who had bought the least amount of beans for the number of cups they had drank and sent them a nice email to tell them about it.

</details>

Last year we rebuilt the system to be a native piece of software that ran entirely on-device and this included adding a nice 7" touchscreen. One of my goals was to see how feasible it was to build a web app without any frameworks. (Cue the rest of this post)

{% image 'coffee-club.jpeg', 'The home screen of the coffee club, above our bean-to-cup machine.' %}

## How it works

The app is made up of a few pages:

- The **home** page which shows general stats, daily messages and collective usage information.
- A **scan** page which registers a cup drank and shows personal stats, navigated to when you scan your card.
- A **product** page to log a coffee purchase and set the weight if it is a new product, triggered by scanning a barcode when on the **scan** page.
- The **register** page which is shown when a new RFID card is scanned. You can associate with a person on our [group website](https://openlab.ncl.ac.uk/people/) or be anonymous.

> The register somewhat-cheekily pulls down the [search.json](https://openlab.ncl.ac.uk/search.json) from our group website to populate it's list, we need to make this a little more formal.

Each page is a HTML document, CSS stylesheet and a bit of JavaScript. The structure of the page is all in the HTML file and dynamic elements are put in `<template>` tags to be populated when needed.

## Page-based navigation

One of the things that SPAs (Single Page Applications) break is natural browser navigation. With coffee club it had the static html files and some query parameters, so normal page navigation could occur.

The system defaults to the home page (`index.html`) then when someone scans an RFID card it goes to `/scan.html?card=abcdef123456`, all good. You can’t do any fancy url-parameters like `/scan/abcdef123456/` which I was hung up on for a while but it doesn’t really matter does it, no one sees this! The client side javascript can pick up the `URLSearchParams` easily by creating a URL from `location.href`.

```js
const url = new URL(location.href)
```

## Data binding

The first thing I missed was data-binding which _SPA_ frameworks rely heavily upon. I toyed with lightweight ones like [alpine](https://alpinejs.dev/) or [petite-vue](https://github.com/vuejs/petite-vue) but held firm and ended up making my own minimalistic version. It looks like this:

```js
const state = reactive({ profile: null })

bind(state, ".totalCups", (state, elem) => {
  elem.innerText = state.profile?.cups ?? "~"
}
```

Whenever `state.profile` changes it will call the callback with the latest state and the element that matches the query selector. It also calls the callback straight away to render the initial state.

Internally it uses [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) objects, and it was quite a fun exercise to learn how they work and play around with them.

## Kiosk display affordances

Something that was different to design for was that this device was to run in a kiosk-like mode and I put in extra effort to think through the UI components we used so that the app didn’t get stuck anywhere.

The main idea was to make sure it always got back to the home page. This meant each page needed a countdown to either perform an action or cancel. I ended up with buttons with countdowns on them to try to show their relation. I say try because from watching people use the app, they still tend to press the button even when the countdown indicates that it will happen anyway.

## HTML templates

In HTML you can have `<template>` tags which are not shown to viewers and let you start to do things programatically. I used these in the app for dynamic bits of the page which I wanted to control when they were shown without navigating to a new page. For example if you'd scanned your card but didn't want to register a cup so pressed "no coffee", it would stay on the same page but swap out the main element with something different. I created a wrapper to grab a template and fill it in:

```html
<template id="noCoffee">
  <span id="name">…</span>
  <button id="done">Finish</button>
</template>
```

```js
// Create a template hydrator
const noCoffee = hydrateTemplate('#noCoffee', (elem) => {
  const name = elem.querySelector('#name')
  name.innerText = 'Geoff Testington'

  const done = elem.querySelector('#done')
  done.addEventListener('click', () => { /* ... */ }))
})

// Add it to the DOM
rootElement.appendChild(noCoffee())
```

These templates worked pretty well, definitely a bit more verbose than their Vue or React counterparts but pretty serviceable. Being more-specific to implement did make me re-think what needed to be dynamic and what could be built into the page itself which was interesting. In retrospect this is a bit of a precursor to "islands architecture" that tools like [11ty/is-land](https://github.com/11ty/is-land) and [fresh](https://fresh.deno.dev/docs/concepts/islands) are proposing.

## The only dependency

Eventually I did concede and add a client-side dependency. It was for charts because they are just a hard problem and there has been lots of good effort gone into solving that already. Until now everything could be made to work with the browser but charts are a different beast.

I went for [chart.js](https://www.chartjs.org/) to show some nice usage graphs on the home screen, it’s nice to see the average cups for each day of the week compared to the current week. Why are Tuesdays our most popular day?

## Event-driven issues

Another oddity about this interface is that it is not driven by cursor/pointer interactions. As mentioned above it’s designed to work with countdowns so you don’t have to touch the screen very often. The other part is the RFID reader and barcode scanner (used to register purchases of beans).

Because it is not a Single Page App, it’s a bit harder to handle those events and difficult to handle across actual page navigations. The sensors work by emulating a keyboard under-the-hood so you need to keep state to know what’s been typed and that can get lost if the page navigates away.

For the current version the app has a common "Scanner" class that can be easily created to listen and process the raw events then emit specific events like “card scanned” or “barcode detected”. I think this could be better handled with [SharedWorkers](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker) in the future but we haven’t got around to trying them yet.

## Honourable mentions

A few things in modern web dev that make things easier:

- The [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) API
- [URL constructors](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL) (especially that second `base` parameter)
- [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
- [ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Intl.NumberFormatter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)

And a mention to [Dan Jackson](https://danjackson.dev/), who's the main brain behind this system, designed our human-friendly csv-based filesystem and made it easy to talk to the various input devices. Also [EveryLayout](https://every-layout.dev) for taking layout out of the equation.

## Conclusions

I think it’s safe to say you can make a web app without an _SPA_ framework like React or Vue. You definitely loose a bit of developer experience, but all the tools are there for you to try it yourself. The main loss I found was data-binding and I don’t think most people would be interested in creating their own on top of Proxy objects.

This specific app is a bit of an outlier in the whole _SPA_ debate as it’s running on very precise hardware and software. In this case it might have actually made sense to use something like Vue.js to speed up development and avoid those event hang-ups. We have considered this a few times! But in writing this I think it has been useful to explore the space and question the norm.

Thanks for reading, please [let me know]({{ site.mastodon }}) what you think!

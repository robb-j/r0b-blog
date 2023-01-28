---
title: Trying to make a vanilla web app
date: 2023-01-28
draft: true
summary: >
  Last year we rebuilt our lab's fair coffee system and I didnt use any frameworks
---

At work we have a Coffee Club. It goes back a while but we cooperatively bought a coffee machine and have been trying to work out the best way to organise coffee buying ever since.

<details>
<summary>A brief history of the club</summary>
In our old office we were split on two floors and upstairs had an “official” lab-sanctioned and paid machine and on our floor we had naught. One Black Friday a few of us clubbed together to buy a bean-to-cup machine and a bunch of coffee.

We had this brilliant idea that we could ask people who wanted to join to buy 3 bags of beans to be in the club. This solved our need for beans running out and we had more people to talk to on coffee breaks. Yes, we just made a Ponzi scheme. 

When we, very quickly, realised that Ponzi schemes don’t work, we set about making a fair system to decide who should be the next person to buy coffee beans. We hooked up a Raspberry Pi and RFID read to self-report use to a Google sheet and a Google for, to register purchases.

The machine now knew who had bought the least amount of beans for the number of cups they had drank and sent them a nice email to tell them about it.
</details>

Last year we rebuilt the system to be a native piece of software that ran entirely on-device and this included adding a nice 7” touchscreen. One of my goals was to see how feasible it was to build a web app without any frameworks. (Cue the rest of this post)

## Page-based navigation
One of the things that SPAs break is natural browser navigation. With coffee club it ended up be several html files and some with query parameters, so normal page navigation could occur. 

The system defaults to the home page (index.html) then when someone scans an RFID card it goes to /scan.html?card=abcdef123456, all good. You can’t do any fancy url-parameters like /scan/abcdef123456/ which I was hung up on for a while but it doesn’t really matter does it, no one sees this! The client side javascript can pick up the URLSearchParams easily by creating a URL from location.href.

## Data binding
The first thing I missed was data-binding which SPA frameworks rely heavily upon nowadays. I toyed with lightweight ones like alpine or petite-vue but held firm and ended up making my own minimalistic version. It looks like this:

```js
const state = reactive({ profile: null })

bind(state, “.totalCups”, (state, elem) => {
  elem.innerText = state.profile?.cups ?? “~”
}
```

Whenever state.profile changes it will call the callback with the latest state and the element that matches the query selector (in fact each element that matches gets a call). It also calls the callback straight away to render the initial state.

Internally it uses Proxy objects, and it was quite a fun exercise to learn how they work and play around with them.

## EveryLayout / cube-ish
Mid way through making the new app I heard about EveryLayout so naturally pivoted a bit and rewrote it a bit to use these new layouts I’d learned about. It also followed to refactor the remaining css into a cube.fyi - style to try and simplify things more and more.

## Kiosk display affordances
Something that was different to design for was that this device was to run in a kiosk-like mode and I put in extra effort to think through the ui components we used so that the app didn’t get stuck anywhere. 

The main idea was to make sure it always got back to the home page. This meant each page needed a countdown to emitter perform an action or cancel. I ended up with buttons and nearby countdowns to try to show their relation. I say try because from watching people use the app, they still tend to press the button even when the countdown indicates that it will happen anyway.

## The only dependency
Eventually I did concede and add a client-side dependency. It was for charts because they are just a hard problem and there has been lots of good effort gone into solving that already. Until now everything could be made to work with the browser but charts are a different beast.

I went for chart.js to show some nice usage graphs on the Home Screen, it’s minimal but it’s nice to see the average usage per day of the week and the current consumption for the week.

## Event-driven issues

Another oddity about this interface is that it is not driven by cursor/pointer interactions. As mentioned above it’s designed to work with countdowns so you don’t have to touch the screen. The other part is the RFID reader and barcode scanner (used to register purchases of beans) .

Because it is not a single page app, it’s a bit harder to handle those events and difficult to handle across actual page navigations. The sensors work by emulating a keyboard under-the-hood so you need to keep state to know what’s been typed and that can get lost if the page navigates away.

For the current version the app has a common “Scanner” class that can be easily created to listen and process the raw events then emit specific events like “card scanned” or “barcode detected”. I think this could be better handled with SharedWorkers in the future but we haven’t got around to trying them yet.

## Honourable mentions

A few things in modern web dev that make things easier:

* The fetch API
* URL constructors (especially the second base parameter)
* SearchParams
* ESM
* Intl.NumberFormatter

## Conclusions

I think it’s safe to say you can make a web app without an SPA framework like react or vue. You definitely loose a bit of developer experience, but all the tools are there for you to try it yourself. The main loss I’ve found is data-binding and I don’t think most people would be interested in creating their own on top of Proxy objects.

This specific app is a bit of an outlier in the whole SPA debate as it’s running on very precise hardware and software. In this case it might have actually made sense to use something like vue.js to speed up development and avoid event hang-ups. We have considered this a few times! But in writing this i think it has been useful to explore the space and question the norm.

Thanks for reading, let me know what you think on mastodon!

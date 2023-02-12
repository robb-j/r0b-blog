---
title: Regrets of a Research Software Engineer’s tech stacks
date: 2023-02-13
draft: true
summary: >
  I've been thinking about all the JavaScript I've written and deployed recently
---

todo:
- [ ] add links
- [ ] use detail summary for links

Terms/Acronyms 
* SPA - Single Page App
* SSG - Static Site Generation
* SSR - Server Side Rendering
* HCI - Human Computer Interaction

I feel very fortunate to be a Research Software Engineer. Mine is a bit of a unique position, for most of my projects I work alone and have complete control of the technical side of what gets built and how. I work in an HCI lab, Open Lab, with academics from lots of other faculties. We work together to make engagements, digital interventions, tech probs and lots in between. I get to work on lots of projects and most of them don’t stick around very long. So, I get to experiment with lots of new technologies.

I’ve seen a lot of hubbub about different tech stacks and app architectures, mainly focussed on how much JavaScript gets shipped to the people that use the things we make. I’ve been on the SPA bandwagon for a while and am definitely rethinking some of those choices made and things I’ve shipped along the way at the moment. 

> link "rethinking" to BC post

I wanted to share a couple of the tech stacks I’ve deployed, think about my web development journey and talk about some of the decisions I’ve made along the way.

Make Place — this was the first project I got my feet wet with client-side JavaScript. I had until this point been a PHP person and this was a PHP server-rendered app. The main map page of the app eventually got rewritten to be a smallish Vue.js frontend to try and make some cool interactions for visitors and people we wanted to survey. This made sense, you can’t do maps on the server-side and cool interactions were made. There were troubles with routing, shock, as client-side rendering looses the default browser behaviour. A fair chunk of time was spent managing that routing instead of the browser and binding that with the map. 

Iris Msg — this was my next big project after Make Place and working on a team for this one we ended up using a Node.js backend, static website and a Cordova web app with native elements. This was initially a very messy project, hacked together in a week in Athens with some rather lofty goals. These technologies were chosen more out of necessity than proper planning. It was all awful (re-read “1 week”), this was my first time doing JavaScript on the server side and it got me a bit hooked. I remember so many “.then” chains, I’m so glad we have async/await now. The static site is still going strong today, unsurprisingly!

What Futures — this was my first SPA, all in, all JavaScript. This was a Node.js backend and full Vue.js SPA front end. It was my first time separating my concerns and designing an API for both of the components to work together. If I couldn’t say it was because Vue.js was hot and new and exciting, I’d say I chose it because of scalability. It was going to be a deployment to thousands of users and I didn’t know much (read as “anything”) about doing that so I chose something that was claiming to do that by virtue of shifting that computation onto the players of the game. In retrospect, I didn’t think at all about whether the players could run that JavaScript themselves or whether they should. 

Catalyst — this was my first attempt at SSR with Vue and Node.js and it was a bit of a messy one. Looking back it was so complicated to hook it all up and rearchitect how I knew Vue to get it rendering on the server. It was also a bit of a complicated project taking Google Forms’ responses, applying a template to create Trello cards then taking those cards and making them into a website (I still think was pretty cool). Thinking about it, it was better to have it server rendered but having a Node.js and separate Vue SSG massively over complicated things that should have been happening on the same server. I think this was when I first became aware of SPAs could be a bad idea. 

Deconf — this is my codename for various virtual conferences I’ve hosted the infrastructure for, now an external name because other people used it and it stuck, kind of. This is a Vue.js + Node.js special, now with TypeScript, some (not enough) testing and a storybook. After running the first conference, things were rebuilt as a pair of libraries (front and back-end) and these have been used in subsequent conferences (MozFest, PlanetRed,  PDC). Similar to WhatFutures, still riding the SPA wave and it was primarily chosen for scaleability. It was the choice of making a cool interactive experience and it felt like the safest choice to scale for a conference of a couple thousand concurrent visitors. Apart from that time the Redis overloaded on the opening keynote, or unnamed DDoS attacks 🙄. 


## Some thoughts

I’m not sure why Server-Side-Rendering with Node.js never clicked with me. I think I saw SPAs as easier to develop and with better tooling and never really explored it very much. I’ve still not found delightful IDE integration for templating like Handlebars or Nunjucks that spots errors like missing variables or bad expressions.

I don’t currently know the best way to make the interactions I’ve made with SPAs, maybe I should look into Islands Architecture more? If they were to be designed with progressive enhancement, I don’t know what the other levels of them would be or how they could build up to be what I really want the experience to be. 

## Rounding up

Deconf is my active project at the moment I’m feeling the burden of all that javascript I’m shipping at the moment and I’m quite conscious of the accessibility of the conferences I’m making. It’s Vue 2 as well so it’s extra not-as-good. I am planning a next version, to turn into more of a Conference-as-a-service type thing but I’m not sure how I can provide the cool features I’ve made with a more SSG or SSR approach. The design hasn’t scaled very well too, the UI was originally made for a single 36-hour continuous conference and has been patched on for 2 years now. 

I’ve been seeing a lot of negative sentiment for SPAs recently which has got me down a bit knowing what I’ve made and the experiences I’ve put out there. But at the same time, I don’t think I could have done a lot of those things without them so I don’t know really. I’m endeavouring to find a better way forwards. 


Wow that felt like a bit of a rollercoaster, thanks for getting this far! If you thought this was interesting or have a suggestion, @ me on Mastodon! 

---
title: Isomorphic JavaScript, Web Standards and Documentation Driven Design
date: 2024-01-08 22:00:00
draft: false
summary: >
  Documenting a library I haven't even created, and probably won't.
---

I was posting on Mastodon about a documentation driven design process recently 
and thought I'd do a post to share the thing I was thinking about at the time
and dig into the process and design a bit.

## Web Standards

I've been thinking about server-side JavaScript a bit recently
and especially the move towards web-standards on the backend.
My first experience was when Deno came along with a really nice "serve" API.
It is literally just a function that takes a [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) Request 
and you return a Response.

I really like this API for two reasons:

1. It's minimalistic, there is no `res` to mutate, no `next` to call or `ctx` to worry about.
2. It's based on a feature-rich web standard; parse JSON, stream bytes, ready headers. It's all there.

Generally, that got me thinking about other standards but also the promise of them.
Web standards don't come and go every night. 
They're well thought out and don't really get deprecated.

## Background

At work I work on lots of small to medium Node.js projects often by myself and each project is somewhat similar 
but I've often tweaked something or tried out something new.
I love that I can do this and get to explore lots of things. 
But, I have lots of similar but not quite the same code which does make it difficult to go back to projects.

This time I took some time to think about what my ideal common ground for a project would be
and how a common ground could help compose projects together in the future.
If I have added magic link auth to one project, how can I reuse that in another project, for instance.

## Documentation driven design

This all lead me to writing documentation for my ideal library through documentation-driven-design.
There might be a more formal name for it, I'm not sure.
The idea is to design a thing from the perspective of someone first using and learning about it.

It really gets you to think about the APIs and contracts you're creating.
How there could be modules and how those modules could work together.
Then you also need to think about how you explain those concepts
which really gets forces you understand what is important about those features and what isn't.

It is also really freeing.
There is no burden of any code being written.
If you want to change an API to be cleaner or simpler, you can.
Straight away.
You don't have to worry about how that effects your code base or how tests will need to change or be reorganised.

You do still need to ground yourself and remember what is possible.
That's why I think it works best when you have a good idea of what you want to make 
and a rough of idea of how it will work internally.
I think if you went in completely blue sky, you would design something that it wasn't possible to actually make.

## Gruber

So, the thing I was thinking about was a hypothetical server-side JavaScript library. 
Funnily enough, there is some interesting documentation to look at.
Check it out at [robb-j/gruber](https://github.com/robb-j/gruber).

I'd love to know what you think on Mastodon.

→ [Rob](https://hyem.tech/@rob)

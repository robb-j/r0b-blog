---
title: Using URLPattern to add "edit on GitHub" support to my blog
date: 2023-02-18
draft: false
summary: >
  I had a quick idea to add "edit on GitHub" similar to how github.com uses the "." shortcut to open github.dev
---

While wanting to make a quick change to a blog post, I wondered how hard it could be to add a simple "edit on GitHub" shortcut to my site.
On [github.com](https://github.com) while in a repository, you can press "." which opens the same repo on [github.dev](https://github.dev) which is a lightweight vscode web app that lets you edit and commit changes back. I wanted to do something similar with my blog, but I only need to edit one post at a time.

{% video 'edit-on-github-with-peek.mov', 'Here is the whole thing in action, opening on GitHub with Arc\'s Peak' %}

I started off adding an event listener to know when the "." key is pressed:

```js
window.addEventListener('keyup', (event) => {
  if (event.key !== '.') return

  // Code goes here ...
})
```

Next I needed to know if the visitor (me) is on a blog post, luckily I remembered that [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern) is a thing!
Its relatively new thing (in 2023) and there isn't much support for it. As this feature is just for myself and I know what browser I'm running on that isn't an issue, but it should still be implemented with progressive enhancement. So the feature is ignored if the API isn't available:

```js
// If URL pattern doesn't exist, go no further
if (!('URLPattern' in window)) return
```

Now to use the API, you create a `URLPattern` object and use it like a regex to match URLs. There is a string-based and object-based ways of defining a `URLPattern`, I went for object-based. As I only wanted to match the pathname part, with object-based other attributes (like the host or protocol) are treated as wildcards so will not be considered in the matching.

```js
const pattern = new URLPattern({
  pathname: '/post/:slug/',
})
```

This pattern will match when any URL is passed to it that follows that pathname convention AND you can use it to get the "slug" part out too, which is useful soon.

```js
const result = pattern.exec(location.href)
if (!result) return
```

I used the pattern like this, testing the current location of the visitor to see if it matches the pattern. I'm a fan of early-exiting to avoid loads of nesting, so the callback stops here if the current URL does not match.

```js
location.href = `https://github.com/robb-j/r0b-blog/edit/main/content/post/${result.pathname.groups.slug}.md`
```

The final step is to redirect the user to the "edit" page on GitHub, which is templated with the "slug" extracted from the URLPattern. You can use the pattern-matching in any of the components of a URL, here it grabs the `slug` from the matched pathname and uses it to create the edit on GitHub URL.

I wasn't sure if it should open a new tab or redirect the current page. Because of [Arc's new Peek](https://www.youtube.com/watch?v=biPlFWl64ws) I decided to keep it on the same page and it all works very nicely.

I hope this was interesting, let me know what you think on [Mastodon](https://hyem.tech/@rob)!

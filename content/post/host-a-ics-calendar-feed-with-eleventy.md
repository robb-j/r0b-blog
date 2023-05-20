---
title: Host a ics calendar feed with Eleventy
date: 2023-05-21
draft: true
summary: >
  Using Eleventy, you can create a website that hosts an ical feed that people can subscribe to in their calendars of choice.
---

I recently wanted to host an ical feed for some events that I was organising. For the last MozFest, we added a feature to let you subscribe to the events in your MySchedule in your own calendar. People quite liked this feature and I thought it could work nicely in an Eleventy website.

Under the hood a calendar feed is a [ical](https://www.rfc-editor.org/rfc/rfc5545) file that is hosted on the web. In a calendar client, you subscribe to that URL and it will periodically fetch that file, parse out the events in there and show them in your calendar.

You _could_ manually create or template that ical file, but that would be pretty fiddly and rife for mistakes, so lets use the [ical-generator](https://github.com/sebbo2002/ical-generator) package instead.

## Setup

Lets create a fresh Eleventy project to see how this all works. First we'll need an NPM to install Eleventy and `ical-generator`.

```sh
mkdir eleventy-ical
cd eleventy-ical

npm init -y
npm install @11ty/eleventy ical-generator
```

> All of the code is at [examples/eleventy-ical](https://github.com/robb-j/r0b-blog/tree/main/examples/eleventy-ical) if you want to jump ahead see it all in one place.

### Events collection

In this setup, each event will be a page in an [Eleventy collection](https://www.11ty.dev/docs/collections/). In Eleventy you can group pages using tags to later query for them in other pages. We can also tell Eleventy not to render these pages by setting `permalink: false` in their front-matter. We can do both of these easily by setting it using a [directory data file](https://www.11ty.dev/docs/data-template-dir/) which means there is less to configure in each event page.

So let's create the `events/events.json` in a new `events` directory like below:

{% exampleCode 'eleventy-ical/events/events.json' %}

Let's put an event in our new collection. You can name these whatever you want, for my calendar I've numbered them and padded the start so they're nice and alphabetical in my IDE. Each event has a name and location along with the start and end dates. Then the page body can be used for the even description. Here's `events/001.md`:

{% exampleCode 'eleventy-ical/events/001.md' %}

### Calendar metadata

To generate a feed, its useful to define some of the metadata so it can also be used within other Eleventy templates. So let's create `_data/calendar.json`:

{% exampleCode 'eleventy-ical/_data/calendar.json' %}

This isn't necessary just to generate the feed but it is useful to share these values with other Eleventy templates, like pages that showcase the feed.

### Eleventy template

Now we have an event and the metadata, we can finally generate our feed. To do this, we'll use an Eleventy [class-based template](https://www.11ty.dev/docs/languages/javascript/#classes). This means that we can dynamically generate a page with the exact contents we want.

Here's the `feed.11ty.js` to create:

{% exampleCode 'eleventy-ical/feed.11ty.js' %}

There a few bits going on here. The file is exporting a class which is our Eleventy template. Eleventy will create an instance of this class for us and call the methods when it needs to.

Eleventy will first call `data()` on our class to generate the data for the page, similar to the front-matter in a markdown file. We use this to set the `permalink` to tell Eleventy what we want our file to be called.

Next Eleventy will call the `render(data)` method. This takes all the data Eleventy has generated from the cascade and passes it as a parameter for use in JavaScript. Here we destructure the `calendar` field, generated from the data above, and `collections`. It's also useful to remember that you have access to the `this` inside these methods which have extra information, like the page's url.

Inside the render, it first creates a calendar object and sets up the metadata for the feed.

After setting up the calendar it loops through each page in the "events" collection. For each page it creates a corresponding event object and adds it to the calendar. One important point about events is the `id` attribute, this should be unique and persistent so calendar clients know whether to create a new event or update an existing one. To keep this unique it combines the URL of the feed itself and the identifier of the event.

I added a bit of logic here to create a alert on the event 15 minutes before the event starts. This doesn't have to be hardcoded and you could define this on more of a per-page basis if you like.

Finally the render function generates the ics and returns it for Eleventy to create a file using the `cal.toString()` method.

### Timezones

You can set the `timezone` on the calendar object or on the events themselves, but it isn't as simple as that. An ical feed needs a _VTimezone_ object which you need a generator for. This can be provided by a library like [@touch4it/ical-timezones](https://github.com/touch4it/ical-timezones). There are some good docs in the [ical-generator readme](https://github.com/sebbo2002/ical-generator/tree/develop#-date-time--timezones) for more information.

For my use-case I didn't need this. I used a little Node.js script to generate the pages which generates the date objects for me and sets the correct timezone on the date object itself so they properly convert to UTC dates in the feed.

## Generating the feed

Now that everything is setup, you should have a directory structure like this:

```
.
├── _data
│   └── calendar.json
├── events
│   ├── 001.md
│   └── events.json
├── feed.11ty.js
├── node_modules
│   ├── ...
├── package-lock.json
└── package.json
```

We can run Eleventy and it will generate our ical feed for us! This will create `_site/feed.ics` which contains the content of our feed, ready to host on the internet.

```sh
npx eleventy
```

## Next steps

**timezones** — As mentioned above, I didn't really get into timezones, so things could definitely be improved here. The [ical-generator](https://github.com/sebbo2002/ical-generator/tree/develop#-date-time--timezones) docs are the best place to start for this.

**create a site** — You might want to host a little static website alongside your feed. It could simply link to the feed URL with some subscribe instructions or it could pull in event information in a fun dynamic way.

**host the site** — The website needs to be hosted for people to subscribe to your events!

**better event descriptions** — This setup dumps the markdown content into the body of the events but markdown won't work in calendar clients.

**per-event alerts** — You could define an "alerts" section in an event's front-matter and use that to set different alerts on different events.

**generator script** — My feed was Tuesday-based so I created a script to create an event on the next occurring Tuesday and fill in the front-matter for me. You could do something similar or even take arguments for how you want to create the events. If you were feeling fancy you could hook up something like [decap-cms](https://github.com/decaporg/decap-cms) to edit the events using a web UI.

---

Hit me up on [Mastodon](https://hyem.tech/@rob) if you liked this, have feedback or just want to know more!

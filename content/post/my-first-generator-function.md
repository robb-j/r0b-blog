---
title: My first generator function
date: 2020-07-25
draft: false
summary: >
  I finally did it, I found a use for JavaScript's generator functions,
  wrote one and now its deployed!
---

```ts
function* myFirstGenerator() {}
```

I've always strayed away from generator functions, they are foregin, different and generally confusing.
From debugging babel-ified code I've understood that async code gets
transpilled into generator code, but I never understood what it meant or how they worked.
I found my first use of one and was pretty pleased with myself, so I'm going to share what happened.

For context, I was building something to make a git repo into a headless cms.
It uses [netlify-cms](https://www.netlifycms.org) to directly edit a git repo then use node.js to serve that content as API.
The bit I was working on was a command that clones the repo,
reads and validates the files,
then puts them into redis to be served by http.

So why did I use a generator?
The problem I was facing was when reading in files in specific folders
and validating them against a [structure](https://github.com/ianstormtaylor/superstruct#readme).
**But**, I only wanted to write to redis if all the files are valid.
You can write a nice method to read in a folder using a glob,
validate each file's frontmatter against a structure and write to redis.
But to seperate out the logic made the code more complex and much more verbose.

> I also used [superstruct version 0.10.x](https://github.com/ianstormtaylor/superstruct/blob/master/Changelog.md#0100--june-6-2020)
> for the first time and it's really good

Say we have this method, which uses a glob pattern (e.g. `src/pages/*.md`) to match local files,
read in the markdown frontmatter,
validate it against the struct
and return a tuple of validation errors and parsed records.

```ts
async function readAndParse<T>(
  pattern: string,
  struct: Struct<T>
): [Error[], T[]]
```

It would be very easy to add extra arguments so that function could also save the resulting records somewhere,
but it couldn't wait until other calls of the function have also validated.

I wondered if I could define what I want it to do as data, then run it more manually:

```ts
const contentToParse = [
  { pattern: 'pages/*.md', key: 'pages', struct: PageStruct },
  { pattern: 'events/*.md', key: 'events', struct: EventStruct },
  { pattern: 'tags/*.md', key: 'tags', struct: TagStruct },
  { pattern: 'posts/*.md', key: 'posts', struct: PostStruct },
]
```

This is when I wondered about generators, was this what they're useful for?
I had a quick browse through the
[MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*),
then came up with this:

```ts
// Create a generator for each content type
const generators = contentToParse.map(async function* (job) {
  // In the first run, read and validate files that match the pattern
  const [errors, records] = await readAndParse(job.pattern, job.struct)

  // End the first run by yielding the errors
  yield errors

  // In the second run, save the validated records to our redis cache
  await redis.set(job.key, JSON.stringify(records))
})
```

With a generator function you get an object which you can programatically
tell to run up to the next `yield` statement.
This is good for my use case as I can create a generator for each content type
and run each one upto but before saving the records.
From there you can check for errors and then decide to proceed or not.

As code, it looks like this:

```ts
// You can asynchronously run each generator in parallel
const firstRun = await Promise.all(generators.map((gen) => gen.next()))

// Then grab all the errors out and flatten into a single array
const allErrors = firstRun.map((result) => result.value).flat()
```

Now I could exit early if there are any errors,
or if there aren't any continue on:

```ts
// Run the generators again, which will continue on after the `yield` above
await Promise.all(generators.map((gen) => gen.next()))
```

And it works!
I'm sure generators are much more powerful than my little use case,
but I nerdily enjoyed my first encounter with them.

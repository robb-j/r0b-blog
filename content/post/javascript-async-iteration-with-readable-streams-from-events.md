---
title: Async iteration for JavaScript EventTargets using ReadableStreams
date: 2024-06-28 17:00:00
draft: false
summary: >
  I found a neat technique to convert an EventTarget into an async iterable for easier use
---

Working on an [internal app platform](https://hub.openlab.dev/) at work I found a way to iterate a set of events that get fired on an EventTarget. I did a cursory web search and only found some old StackOverflow posts so promptly dived in to try and implement it myself.

An [EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget) is what a lot of JavaScript primitives are based on. It lets you listen to event on [DOM elements](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement), or [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) or [EventSources](https://developer.mozilla.org/en-US/docs/Web/API/EventSource). You'll probably be familiar with the call sign:

```js
something.addEventListener('click', (event) => {
  console.log(event)
})
```

I wanted my code to look more like:

```js
for await (const event of somethingElse) {
  console.log(event)
}
```

I'm sure I've seen something like this before, but I cannot remember where that was.
I've been slowly getting my head around the [Web Streams APIs](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API) for the Hub project and I remembered that a [ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) also implements [Symbol.asyncIterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator).

That symbol allows you to use `for await` with things, so ReadableStream opens the door to use it in a custom way.
A ReadableStream is a definition of an asynchronous stream of data that can be piped somewhere and there is a notion of a buffer/queue of that data so that it doesn't use up all your memory. So we can do this:

```js
const stream = new ReadableStream({
  start(controller) {
    something.addEventListener('click', (event) => {
      controller.enqueue(event)
    })
  },
})

for await (const event of stream) {
  console.log(event)
}
```

I thought this was pretty neat, for EventTarget you could event declare a method that takes a set of event names and creates the generator for you:

```js
function stream(eventNames) {
  return new ReadableStream({
    start(controller) {
      for (const name of eventNames) {
        something.addEventListener('click', (event) => {
          controller.enqueue(event)
        })
      }
    },
  })
}

for await (const event of stream(['click', 'mouseover', '...'])) {
  if (event.type === 'click') {
    console.log('click', event)
  }
}
```

That is a bit over-the-top but you can see it can start to create a friendlier interface over those events while keeping that flow of code. In this case the code will keep listening forever and never exit the for loop.

It isn't quite as simple as above, it should also clean-up after itself and remove those event listeners:

```js
function stream(eventNames) {
  // Store the listeners so they can later be removed
  let listeners = {}

  return new ReadableStream({
    start(controller) {
      // Generate a listener for each event and hook it up
      for (const name of eventNames) {
        listeners[name] = (event) => controller.enqueue(event)
        something.addEventListener('click', (event) => listeners[name])
      }
    },
    cancel() {
      // Remove each of the listeners from the event target
      for (const [name, callback] of Object.entries(listeners)) {
        something.removeEventListener(name, callback)
      }
    },
  })
}

let countdown = 5
for await (const event of stream(['click', 'mouseover', '...'])) {
  if (event.type === 'click') {
    console.log('click')
  }

  // Break out of the loop after 5 events have been listened to
  countdown--
  if (countdown <= 0) break
}

console.log('stop')
```

This time it stores the event listeners when it starts the ReadableStream so they can be removed when the stream is cancelled. That cancel method is called when the stream is no longer being used, in this case it is when we break out of the `for await` loop.

The only thing I'm not sure about this approach is how the internal queuing/buffering works. I think it has an upper limit of things it will buffer and will start to drop things if that limit is reached. I think that is configurable but I will have to read up more on ReadableStreams.

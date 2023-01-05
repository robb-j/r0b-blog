---
title: Creating drag interactions with setPointerCapture in JavaScript
date: 2023-01-10
draft: true
summary: >
  Using "pointer" events and setPointerCapture in JavaScript you can create drag interactions with quite little JavaScript.
---

Pointer events are the web's answer to mouse vs touch interactions, so you can add one event and it will be triggered consistently whether you are touching on mobile or clicking on a computer. I recently played around with some fun cards on my personal website.

{% image './src/img/r0b-io-project-cards.png', 'The project cards on my website. Click to flip over the card or drag to move them about.' %}

The main issue with implementing a drag like this is that as soon as the cursor exits the element you want to control, it stops receiving those events.
This is where `setPointerCapture` comes in.

## How it works

To get this working you listen for `pointer*` events or set the `.onpointer*` methods to your callback.
I've always been one to prefer events over setting the `on` methods but recently I've come to realise that if you only have one exclusive interaction with an element, you might as well use the methods.
Its easier to handle (pun intended) and less to manage in more dynamic environments (you don't end up re-adding the same listener by accident).

So, to create a drag effect, you first need some HTML to manipulate:

```html
<div class="projectBoard">
  <article class="projectCard"></article>
  <article class="projectCard"></article>
  <article class="projectCard"></article>
  <article class="projectCard"></article>
  <article class="projectCard"></article>
  <article class="projectCard"></article>
</div>
```

And a rough style:

```css
.projectBoard {
  min-height: 960px;
  min-width: 1048px;
  position: relative;
}
.projectCard {
  position: absolute;
  width: 320px;
  height: 180px;
  background: royalblue;
  border-radius: 1em;
}
```

Then the JavaScript to listen to those events:

```ts
// Start by iterating through all the cards that we want to add the interaction too
for (const card of document.querySelectorAll('.projectCard')) {
  // Keep track of where interactions started, remember that this is scoped for each card
  let startPosition = null

  card.onpointerdown = (event) => {
    // If you want to stop things like text selection for this interaction
    event.preventDefault()

    // This is the key bit, it binds this pointer event to the element until you tell it to stop
    // So if the pointer leaves the element, it still receives the relevant events.
    card.setPointerCapture(event.pointerId)

    // Lets remember where the card started to track if the pointer moved or not
    startPosition = [event.screenX, event.screenY]

    // Only add the "move" event handler once the interaction has started
    // Using the "on" method means we can easily remove it later
    card.onpointermove = (event) => {
      // In this situation the cards are positioned absolutely in a container
      // so setting the top/left will move them about
      // It adds the "movement" from the event to it's existing offset in that direction
      card.style.left = `${card.offsetLeft + event.movementX}px`
      card.style.top = `${card.offsetTop + event.movementY}px`
    }
  }

  card.onpointerup = (event) => {
    let dx = event.screenX - startPosition[0]
    let dy = event.screenY - startPosition[1]

    // If the pointer didn't move at all since it started, treat it as a click
    // I used css elsewhere to do a flip animation based on the `data-side="front"` vs back property.
    // Ideally it would be a vector distance algorithm (A^2 + B^2 = C^2 stuff)
    if (dx === 0 && dy === 0) {
      card.dataset.side = card.dataset.side === 'front' ? 'back' : 'front'
    }

    // Remove the "move" event now
    card.onpointermove = null

    // Important! remember to release the pointer from the element
    card.releasePointerCapture(event.pointerId)
  }
}
```

Thats an extra verbose implementation, not too many steps!?

You can find the source for my [blog's version here](https://github.com/robb-j/r0b-home/blob/134abc134b6a768056a89bedb4b229b522060b42/src/js/app.ts#L144-L194),
if you want to dig a little deeper.

## Bonus: card-flip animation

I adapted this [w3schools tutorial](https://www.w3schools.com/howto/howto_css_flip_card.asp) to create a nice flip effect for my cards.
Instead of on-hover though, I wanted to be able to toggle the cards with a click.
To store that information I turned to HTML data attributes which can also be styled from CSS.
You could also use a HTML aria attribute for bonus points, as long as the meaning matches up with the interaction you're creating.

The code above will toggle the `data-side` attribute on the card between `front` or `back` when you click on it.
It needs more markup that the above example:

```html
<article class="projectCard" data-side="front">
  <div class="projectCard-inner">
    <div class="projectCard-front">
      <img src="https://example.com/image.png" width="320" height="180" />
    </div>
    <div class="projectCard-back">
      <p>
        My fancy project — it was really cool and goes over at least one line
      </p>
      <p><a href="https://example.com">More info</a></p>
    </div>
  </div>
</article>
```

Then you can style that something like this:

```css
/* You need a container with a width and height set, the "perspective" is needed for the 3d effect */
.projectCard {
  position: absolute;
  width: 320px;
  height: 180px;

  background-color: transparent;
  color: black;
  perspective: 1000px;
  box-shadow: 0 3px 1px rgba(0, 0, 0, 0.05);
  cursor: move;
  opacity: 1;
}
.projectCard-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 500ms ease;
  transform-style: preserve-3d;
  text-align: center;
}
.projectCard[data-side='back'] .projectCard-inner {
  transform: rotateY(180deg);
}
.projectCard-front,
.projectCard-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 1rem;
}
.projectCard-front {
}
.projectCard-back {
}
```

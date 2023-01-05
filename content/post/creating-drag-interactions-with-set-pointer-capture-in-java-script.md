---
title: Creating drag interactions with setPointerCapture in JavaScript
date: 2023-01-10
draft: true
summary: >
  Using "pointer" events and setPointerCapture in JavaScript you can create drag interactions with quite little JavaScript.
---

Pointer events are the web's answer to mouse vs touch interactions, so you can add one event and it will be triggered consistently whether you are touching on mobile or clicking on a computer. I recently played around with some fun cards on my personal website.

{% image './src/img/r0b-io-project-cards.png', 'The project cards on my website. Click to flip over the card or drag to move them about.' %}

The main issue with implementing a drag like this is that as soon as the cursor exits the target element, it stops receiving the events it needs.
This is where `setPointerCapture` comes in.

## How it works

To get this working you listen for `pointer*` events or set the `.onpointer*` methods to your callback.
I've always been one to prefer events over setting the `on` methods but recently I've come to realise that if you only have one exclusive interaction with an element, you might as well use the methods.
Its easier to handle (pun intended) and it's easier to manage in more dynamic environments (you can't re-add the same listener by accident).

So, to create a drag effect, you first need some HTML to manipulate:

```html
<div class="projectBoard">
  <article class="projectCard"></article>
</div>
```

And a rough style:

```css
/* Create a space to move the card about in */
.projectBoard {
  min-height: 960px;
  min-width: 1048px;
  position: relative;
}
/* Give the card a size and something to see */
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

  // Listen for "pointerdown" events, when a touch/click starts on that element
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/pointerdown_event
  card.onpointerdown = (event) => {
    // This stops normal browser' drag behaviour
    // Note: It can cause trouble if you have an anchor on the card
    event.preventDefault()

    // This is the key bit, it binds this `PointerEvent` to the element until you tell it to stop
    // So if the pointer leaves the element, it still receives the relevant events.
    card.setPointerCapture(event.pointerId)

    // Lets remember where the card started to track if the pointer moved or not
    startPosition = [event.screenX, event.screenY]

    // Only add the "move" event handler once the interaction has started
    // Using the "on" method means we can easily remove it later
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/pointermove_event
    card.onpointermove = (event) => {
      // In this setup the cards are positioned absolutely in a container
      // so setting the top/left will move them about in their container
      // It adds the "movement" from the event to it's existing offset in that direction
      card.style.left = `${card.offsetLeft + event.movementX}px`
      card.style.top = `${card.offsetTop + event.movementY}px`
    }
  }

  // Listen for "pointerup" events, when a touch/click that started on the element and was captured ended
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/pointerup_event
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

I adapted this [w3schools tutorial](https://www.w3schools.com/howto/howto_css_flip_card.asp) to create a nice flip effect for my cards. Instead of on-hover though, I wanted to be able to toggle the cards with a click. To store that information I turned to HTML data attributes which can also be styled from CSS. You could also use a HTML aria attribute for bonus points, as long as the meaning matches up with the interaction you're creating.

{% video '/video/r0b-card-flip.mov' | url, 'The card flip animation like a ... card flip. Very skeuomorphic' %}

The code above will toggle the `data-side` attribute on the card between `front` or `back` when you click on it. It needs more markup that the above example:

```html
<!-- The card is now a wrapper that sets up the 3d position -->
<article class="projectCard" data-side="front">
  <!-- There is an inner element that is responsible for animating rotation on the Y axis -->
  <div class="projectCard-inner">
    <!-- The front-side of the card, an image in this case -->
    <div class="projectCard-front">
      <img src="https://example.com/image.png" width="320" height="180" />
    </div>

    <!-- The back-side of the card, more infromation about the project -->
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
/*
  Give the card a size and set the "perspective" 
*/
.projectCard {
  position: absolute;
  width: 320px;
  height: 180px;
  background-color: transparent;
  perspective: 1000px;
  box-shadow: 0 3px 1px rgba(0, 0, 0, 0.05);
}
/*
  Give the inner element position (so the front and back can be absolutely positioned).
  Make sure the inner element fills the card itself and setup a transitions on the "transform" property.
*/
.projectCard-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 500ms ease;
  transform-style: preserve-3d;
  text-align: center;
}
/* Show the backside when that data property is set */
.projectCard[data-side='back'] .projectCard-inner {
  transform: rotateY(180deg);
}
/* Style the front back back of the card the same way */
.projectCard-front,
.projectCard-back {
  aspect-ratio: 16 / 9;
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 6px;
  overflow: hidden;
}
.projectCard-front {
  /* If you want to style the front of the card! */
}
/* Flip the back of the card (relatively to the whole card) */
.projectCard-back {
  transform: rotateY(180deg);

  /* Style the text and surround with a border */
  background-color: white;
  color: black;
  border: 5px solid black;

  /* Center child elements */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: rem;
}
```

This effect needs a few elements to take place, the wrapper (`projectCard`), an `inner` element and the `front` and `back` elements.

The _wrapper_ has `perspective: 1000px;` on it which sets how far the object is away from the user.
A smaller number puts it closer to the user and can create some pretty trippy effects, 1000px looked nice for these size cards. If the number is less than the width of the card, then the animation will clip through the "camera" (where the user is) and look glitchy.

The _inner_ element does the animation by setting up `transition` and `transform-style`. The transition is the standard css animation mechanism. The `transform-style` statement makes child elements exist in their own 3d space which lets the back be rotated 180 degrees away from the front in the 3d world.

When the _inner_ element has the attribute `data-side="back"` it rotates itself (and it's children) 180 degrees on the y axis. Because there is also a transition setup, it animates! These dataset attributes can easily be set from JavaScript using the [dataset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset) field, shown above.

The _back_ element has the final piece of the puzzle, it is rotated away from the visitor. Because both _front_ and _back_ have `backface-visibility: hidden;` set, you cannot see the reverse of the elements and they don't bleed through each other. This rotation is also achieved through the `transform` statement.

## Wrapping up

That's card dragging and a cheeky flip animation too, you can see it on [my homepage]({{ site.homeUrl }}) and I've also attached a [demo]({{ '/hacks/card' | url }}) into the blog too!

Any questions or feedback? Reach out on [Mastodon]({{ site.mastodon }}).

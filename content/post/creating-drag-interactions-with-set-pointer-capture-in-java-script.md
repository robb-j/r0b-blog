---
title: Creating drag interactions with setPointerCapture in JavaScript
date: 2023-01-10
draft: true
summary: >
  Using "pointer" events and setPointerCapture in JavaScript you can create drag interactions with quite little JavaScript.
---

Pointer events are the web's answer to mouse vs touch interactions, so you can add one event and it will be triggered consistently whether you are touching on mobile or clicking on a computer. I recently played around with some fun cards on my personal website.

{% figure './src/img/r0b-io-project-cards.png', 'The project cards on my website. Click to flip over the card or drag to move them about.' %}

---
title: Get to da Terminal
date: 2024-02-23 10:50:00
draft: false
summary: >
  One bored day I decided to make it as easy as possible to open a Terminal on 
  my Mac. Here’s what I did.
---

I wanted a single shortcut to open a new Terminal so first I had to pick one. I had been using `CMD+OPT+C` in VSCode for a while to bring up the terminal pane and while dabbling with Nova I set up the same shortcut to open a new local terminal too. This had worked well for a while, but it was actually overriding the macOS default keyboard shortcut to show the colour picker, so it wouldn’t work as a global shortcut.

I spent a hot minute scanning my keyboard to work out what to use until I landed on the `§/±` key. I’m on a UK ISO macOS keyboard, so that is the button to the left of my `1` and below my `ESC`. To my knowledge `CMD+§` isn’t a well-known shortcut so that’s what I’ve adopted.

First I moved my VSCode + Nova keyboard shortcuts to that new combination and VSCode will sync it between both of my Macs too. Nova I just had to configure it in both.

For a global keyboard shortcut I created a Shortcut in the Shortcuts app. This just runs and opens Terminal.app. You might be able to do something clever so that it gets the “current folder” if available and pass it to the Terminal to open at that location, but I couldn’t work out how to do that. Finally, I assigned that a keyboard shortcut to the Shortcut under the little “info” tab.

With application-specific shortcuts, they take precedence of the global ones so if I use it in Nova or VSCode then it opens a terminal in-app and if I use it in another app it opens the macOS terminal. Perfect.

**Misc**

 - I’ve been trying Prompt 3 for a bit and currently have the Shortcut opening that while I trial it.
 - With my Keycron keyboards, I tried remapping the § button with [Via](https://usevia.app/) to actually just trigger the old CMD+ALT+C keyboard shortcut. That did work for a while but was annoying in laptop mode and where the shortcut wasn’t available.
 - I’m not sure if Terminal.app (or Prompt.app) support opening them at a certain folder, at least through Shortcuts. That would be really cool if it could capture my location in Finder and open the terminal there instead.
 - After setting up the keyboard shortcut in Shortcuts.app, it doesn't seem to take effect in apps that are already open. e.g. If Mail was already open when the shortcut is set, it won't work until Mail has restart.

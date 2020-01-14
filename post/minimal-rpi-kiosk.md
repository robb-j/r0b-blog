---
title: A minimal kiosk mode for a Raspberry Pi
date: 2020-01-20
draft: true
summary: >
  When you need a Raspberry Pi to just display a webpage, you don't really need
  an entire operating system and window manager. This was my solution.
---

When I was making my [Smart mirror](https://twitter.com/Robbb_J/status/834487521442668545?s=20)
I made a webapp to run on the Raspberry pi hidden behind the frame.
From all the tutorials I saw,
they reccomended using a full instillation of the Raspbian desktop,
then installing chrome, then hacking away at it.

I felt this was a waste as all I wanted was to run chrome.
I didn't need a window manager,
or any of the countless pre-installed apps that come with raspbian.
I wanted a minimal footprint on the pi, with hopefully just chrome.

Then I found [this blog post](https://www.sylvaindurand.org/launch-chromium-in-kiosk-mode/),
which promised to do all of that.

## Steps

Start with [Raspbian Lite](https://www.raspberrypi.org/downloads/raspbian/),
you don't need the desktop version.
Then install these packages required to run chromium
and set the pi to boot straight into to the console.

```bash
sudo apt-get install xserver-xorg-video-all xserver-xorg-input-all \
  xserver-xorg-core xinit x11-xserver-utils chromium-browser unclutter

# Go to: Boot Options > Console Autologin
sudo raspi-config
```

Next edit `/home/pi/.bash_profile` to start the gui.
It checks if running from the console first though,
so you don't start chromium whenever you ssh in.

```bash
if [ -z $DISPLAY ] && [ $(tty) = /dev/tty1 ]
then
  startx
fi
```

The last bit is to setup `/home/pi/.xinitrc` to run chromium whenever you run startx.

```bash
#!/usr/bin/env sh
xset -dpms
xset s off
xset s noblank

unclutter &
chromium-browser http://yourfancywebsite.com \
  --window-size=1080,1920 \
  --start-fullscreen \
  --kiosk \
  --incognito \
  --noerrdialogs \
  --disable-translate \
  --no-first-run \
  --fast \
  --fast-start \
  --disable-infobars \
  --disable-features=TranslateUI \
  --disk-cache-dir=/dev/null
```

It disables the cursor and screensaver.
Then runs chromium with \*all\* of the flags.
Notably you'll want to configure the url to load and `--window-size`,
depending on the screen size and orientation.

Now whenever the pi boots up it'll go into the console then on into chromium.
If you want to exit you can hit `Alt+F4`, then enter `startx` to start it up again.

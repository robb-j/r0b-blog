---
title: A minimal kiosk mode for a Raspberry Pi
date: 2020-01-20
draft: false
summary: >
  When you need a Raspberry Pi to just display a webpage, you don't really need
  an entire operating system and window manager. This was my solution.
---

When I was making my [Smart mirror](https://twitter.com/Robbb_J/status/834487521442668545?s=20)
I made a webapp to run on the Raspberry Pi hidden behind the frame.
From all the tutorials I saw,
they reccomended using a full instillation of the Raspbian desktop,
then installing chrome, then hacking away at it.
I didn't like this.

I felt this was a waste as all I wanted was to run chrome.
I didn't need a window manager,
or any of the countless pre-installed apps that come with raspbian.
I wanted a minimal footprint on the pi, with hopefully only chrome.
This means less to manage and a smaller security footprint.

Then I found [this blog post](https://www.sylvaindurand.org/launch-chromium-in-kiosk-mode/),
which promised to do all of that.

## Steps

Start with [Raspbian Lite](https://www.raspberrypi.org/downloads/raspbian/)
(**not** the desktop version).
Then install the packages required to run chromium
and set the pi to boot straight into to the console.

```bash
sudo apt-get update -qq

sudo apt-get install --no-install-recommends xserver-xorg-video-all \
  xserver-xorg-input-all xserver-xorg-core xinit x11-xserver-utils \
  chromium-browser unclutter

# Go to: Boot Options > Console Autologin
sudo raspi-config
```

Next edit `/home/pi/.bash_profile` to automatically start the gui.
There's a check for the bash context first,
so you don't accidentally start chromium whenever you ssh in.

```bash
if [ -z $DISPLAY ] && [ $(tty) = /dev/tty1 ]
then
  startx
fi
```

The last bit is to setup `/home/pi/.xinitrc` to run chromium whenever you run startx.
Here's the full list of [chromium arguments](https://peter.sh/experiments/chromium-command-line-switches/).

```bash
#!/usr/bin/env sh
xset -dpms
xset s off
xset s noblank

unclutter &
chromium-browser https://yourfancywebsite.com \
  --window-size=1920,1080 \
  --window-position=0,0 \
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
  --disk-cache-dir=/dev/null \
  --overscroll-history-navigation=0 \
  --disable-pinch
```

It disables the cursor and screensaver.
Then runs chromium with \*all\* of the flags.
Set `https://yourfancywebsite.com` to the website which you want to display.
And set `--window-size` to the size of your display (it's horizontal first and vertical after the comma).

> You may also want to uncomment `disable_overscan=1` in `/boot/config.txt`
> so that the pi boots up using the full display.

Now whenever the pi boots up it'll go into the console then on into chromium.
If you want to exit you can hit `Alt+F4`, then enter `startx` to start up the browser again.

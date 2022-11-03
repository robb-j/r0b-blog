---
title: Deploy ESP32 with spiffs using github actions
date: 2022-11-02
draft: true
summary: >
  I've been working on my GitOps for a while now and wanted to document 
  it all in one place.
---

Generating and flashing firmware onto an ESP32 can be a bit difficult.
I've been using one for a new project I'm working on and here is what I've learned.

## Background

This is my first time developing firmware for a chip like the ESP32 so my approach
may be a little different from firmware veterans.
My goal is to automate as much of the process as possible
and have the entire pipeline codified for reproducable builds.

I've not got on well with [Arduino IDE](https://www.arduino.cc/en/software)
and the recent v2 that broke a few needed plugins didn't help.
I also didn't like the global nature of library dependencies and lack of manifest to define them.
I opted instead for a command line based approach that could run on my computer or on GitHub Actions.

## The pipeline

The pipeline I eventually setup looked like this:

1. A new version is pushed to GitHub, like `v1.2.3`
2. In response to that, it builds the firmware
3. Generate some static files that are bundled into a SPIFFS partition
4. Create a static website that can be used to flash the device using web serial
5. Deploy the flash website to GitHub pages

**1. create a release**

A release is triggered using the "npm version" command locally,
which bumps the version in `package.json`, commits the change as `x.y.x`
and tags the commit as `vx.y.z`.

**2. setup GitHub actions**

When a tag with a `v` prefix is pushed to GitHub it runs an action to build and publish the release.
It first sets up the environment, with a recursive git checkout.
3rd party libraries are added as git submodules so they can be kept track of an upgraded dependably.
It then installs and sets up `arduino-cli` and `node.js` and installs npm dependencies.
`arduino-cli` is then used to install published libraries and add the ESP32 package.

**3. Generate the firmware**

The ESP32 I'm using is a captive portal that serves a web app, so next it builds the web-app using [parcel](https://parceljs.org).
This packages everything up nicely, minifies the code and makes it compatable with older browsers.
The it uses ESP32's `mkspiff` tool wrap all those files up into a `spiffs.bin` partition.

**4. Generate flashing app**

Next it creates another website, this one uses [esp-web-tools](https://esphome.github.io/esp-web-tools/)
to create an interface to flash the ESP32 from a browser. Sadly only Chrome is supported at this time.
This is a little html file which loads the tool and has the firmware binaries adjacent to it for the tool to load them in.
It's all joined together with a manifest file, which specifies the firmare partitions and where to put each binary.

**5. Deploy flash tool**

With the flash tool built, a GitHub action takes those html, js, css, json and binaries and deploys them to GitHub pages,
so you can access the tool or directly download the firmware and `manifest.json`.

## Hurdles

### Creating a spiff partition

The first hurdle was generating a SPIFFS file...

### Flashing from the CLI

Another hurdle was getting a consistent flash from the CLI, to quickly develop the firmware and try different fixes...

### Getting the spiff onto the esp

### Arduino partitions

Arduino defines partitions in csv files within it's own packages...

### Things I wish I'd knew

### Where ESP32 puts things

- $ARDUINO_DIR
- $ESP_VERSION
- $SPIFFS_VERSION
- different places libraries are
- where mkspiff is
- where esptool is

### Misc

`python` vs `python3` on macos

## Next steps

- Generate a GitHub release and attach the firmware binaries.

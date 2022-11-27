---
title: Deploying ESP32 with SPIFFS using github actions
date: 2022-11-25
draft: false
summary: >
  Playing around with ESP32s has led to some interesting automations to make the whole process easier.
---

Generating and flashing firmware onto an ESP32 can be a bit difficult.
I've been using one for a new project and here is what I've learned.
This post is in two parts, the pipeline I ended up creating
and some key things I've learnt that I didn't think was obvious.

## Background

This is my first time developing firmware for a chip like the ESP32 so my approach
may be a little different from firmware veterans.
My goal is to automate as much of the process as possible
and have the entire pipeline codified for reproducible builds that run automatically.

I've not got on well with [Arduino IDE](https://www.arduino.cc/en/software)
and the recent v2 seems to have broken some plugins too.
I also didn't like the global nature of library dependencies and lack of a manifest to define them.
I opted instead for a command line based approach that could run on my computer or on GitHub Actions.

## The pipeline

The pipeline I eventually setup looked like this:

1. A new version is pushed to GitHub, like `v1.2.3`
2. It compiles the Arduino firmware
3. Generate static files that are bundled into a SPIFFS partition
4. Create a static website that can be used to flash the device or download assets
5. Deploy the static website to GitHub pages

**1. Create a release**

A release is triggered using the `npm version` command locally,
which bumps the version in `package.json`, commits the change as `x.y.x`
and tags the commit as `vx.y.z`.

**2. Setup GitHub actions**

When a tag with a `v` prefix is pushed to GitHub it runs an action to build and publish the release.
It first sets up the environment, with a recursive git checkout.
thirdy-party libraries are added as git submodules so they can be kept track of and upgraded dependably.
It then installs and sets up `arduino-cli` and `node.js` and installs NPM dependencies.
`arduino-cli` is then used to install published libraries and add the ESP32 package.

**3. Generate the firmware**

The ESP32 I'm using is a captive portal that serves a web app, so next it builds the web-app using [parcel](https://parceljs.org).
This packages everything up nicely, minifies the code and makes it compatible with older browsers.
Then it uses ESP32's `mkspiff` tool to wrap all those files up into a `spiffs.bin` partition.

**4. Generate flashing app**

Next it creates the flash tool which is a website that uses [esp-web-tools](https://esphome.github.io/esp-web-tools/)
to create an interface to flash the ESP32 from a browser. Sadly only Chrome is supported at this time,
it needs the [Web Serial API](https://caniuse.com/web-serial).
This is a little html file which loads the tool and has the firmware binaries adjacent to it for the tool to load them in.
It's all joined together with a manifest file, which specifies the firmware partitions and where to put each binary.

**5. Deploy flash tool**

With the flash tool built, a GitHub action takes those html, js, css, json and binaries and deploys them to GitHub pages,
so you can access the tool or directly download the firmware and `manifest.json`.

<details>
<summary>Example GitHub workflow</summary>

**workflow.yml**

```yaml
name: Release

on:
  push:
    tags: [v*]

jobs:
  build:
    name: Compile web flash
    runs-on: ubuntu-latest

    permissions:
      pages: write
      id-token: write
      contents: read

    environment:
      name: github-pages
      url: '{{ "${{ steps.deployment.outputs.page_url }}" }}'

    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          submodules: recursive

      - uses: actions/setup-node@v2
        with:
          node-version: '16'

      - name: Install Arduino CLI
        uses: arduino/setup-arduino-cli@v1

      - name: Setup Pages
        uses: actions/configure-pages@v2

      - name: Install dependencies
        run: npm install --no-audit

      - name: Build the app
        run: npm run -w app build

      - name: Setup arduino
        run: ./bin/esp32.sh

      - name: Compile firmware
        run: ./bin/esp32.sh

      - name: Build the flash tool
        run: npm run -w web_flash build
        env:
          NODE_ENV: production

      - name: Upload pages artifacts
        uses: actions/upload-pages-artifact@v1
        with:
          path: web_flash/dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v1
```

</details>

## Hurdles

### What is a sketch

An Arduino sketch is a folder with a same-named file inside it with a `.ino` extension.
So for `MyProject/MyProject.ino`, the sketch is the folder `MyProject`.

The Arduino docs also reference a "sketchbook" which I think is just a folder that has multiple Arduino sketches in it,
but it is a different thing.

### IDE setup

My reccomendation for an IDE is [Visual Studio Code](https://code.visualstudio.com) with these extensions:

- [C++ tools](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools) to get intellisense for Arduino code
- [YAML](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) to validate GitHub workflow or other YAML files
- [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig) to make sure all your indentations match up
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) to auto-format html/css/ts/js/yaml/md files

To get _C++ tools_ working with Arduino, create a `.vscode/c_cpp_properties.json` 
and modify the default configuration to include:

```json
{
  "configurations": [
    {
      ...
      "name": "ESP32",
      "includePath": [
        "${workspaceFolder}/arduino/**",
        "~/Library/Arduino15/packages/esp32/hardware/esp32/**",
        "~/Documents/Arduino/libraries/**"
      ],
      "defines": ["ESP32=1"],
      ...
    }
  ]
}
```

This will set the required hash-defines for ESP32 development
and tell the extension where to load the Arduino libraries.
It's not perfect and not all imports works but it gets most of the way.

### Setting and configuring arduino-cli

The first step in automation was getting the build done from the command line.
[arduino-cli](https://arduino.github.io/arduino-cli/) can be quickly installed
and you can create an `ardunio-cli.yaml` file which will automatically pass parameters for you.
This file has to be in the same directory as you use the cli
and you can use `arduino-cli config dump` to quickly see what is configured.

**ardunio-cli.yaml**

```yaml
board_manager:
  additional_urls:
    - https://dl.espressif.com/dl/package_esp32_index.json
```

The configuration is useful for ESP32 development because you can set `board_manager.additional_urls`
which is needed to install the ESP32 packages.
You can also install the libraries you need to.
I ended up having `bin/setup.sh` to do this one-time config so it can easily be ran locally and on GitHub actions.
It sort-of serves as a definition of the dependencies of the Arduino code.

**bin/setup.sh**

```bash
#!/usr/bin/env sh

arduino-cli core update-index
arduino-cli core install esp32:esp32@1.0.6
arduino-cli lib install ArduinoJson@6.19.4 AnotherPackage@x.y.x
```

> There is a `sketch.yaml` which lets you specify libraries but it didn't work with my custom libraries setup.

### Custom libraries as submodules

The ESP32 library I was using has some third-party dependencies so I wanted to codify those too
I didn't want them installed globally, I wanted them dependably in one place at a specific version.

The best way I found to codify these dependencies was to add them as git submodules to the project,
so a specific version or commit can be pinned within the parent git repository.
It does add an extra step to `git submodule init` during setup and `git submodule update` needs to be run every so often.

I hoped Arduino IDE would automatically load them if they were in `lib`, `libraries` or the `src` folder
which it claims to check and compile, but I couldn't get this working.
It needed an extra argument to the `arduino-cli compile` command instead.
You can pass a `--libraries` option which is a custom folder of libraries,
which worked out well because all the submodules were in a folder together.

> 3/11/22 I've not found a way to get this working with the Arduino IDE yet...

### Arduino partitions

I had to learn how flashing an ESP worked.
You have a set amount of flash storage on the device and several binaries that need placing at specific places in that storage.
These are called partitions and one of the partitions tells the device where the other partitions are.

When you compile with the IDE or `arduino-cli` it creates two binaries `app.bin` and `app.partitions.bin`,
the first is your compiled firmware, the second is the partitions you're going to use.

You can choose different partitions by passing `--build-property build.partitions=scheme`,
where `scheme` is the partition scheme you want to use. More on these below.
You might want to have more space for your app, or a larger spiffs section for example.

The partitions table **must** be flashed at [0x8000](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-guides/partition-tables.html)
and be 0xC00 bytes long, where the other binaries go depends on which partition scheme you use.
By default `arduino-cli` uses the ... "default" schema.

> If you want to use a custom bootloader, it needs to be flashed at [0x1000](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-guides/bootloader.html).

The ESP32 package uses csv files to define the partitions and you can find them in:
`$ARDUINO_DIR/packages/esp32/hardware/esp32/1.0.6/tools/partitions/`.
Below is the contents of `default.csv` in that directory.

```csv
# Name,   Type, SubType, Offset,  Size, Flags
nvs,      data, nvs,     0x9000,  0x5000,
otadata,  data, ota,     0xe000,  0x2000,
app0,     app,  ota_0,   0x10000, 0x140000,
app1,     app,  ota_1,   0x150000,0x140000,
spiffs,   data, spiffs,  0x290000,0x170000,
```

Here we can find that our app should be at 0x10000 and be 0x140000 bytes long
and our spiffs should be at 0x290000 and 0x170000 bytes long.
These numbers become very useful as we [create SPIFFS](#creating-a-spiff-partition)
and [flash them](flashing-from-the-cli) below.

### Creating a SPIFFS partition

[SPIFFS](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/storage/spiffs.html)
is an in-memory filesystem the ESP32 can use to store extra files alongside the app.
For my app it's where web assets (html, js, css and images) go that the ESP serves as a captive portal.

There is a [plugin](https://github.com/me-no-dev/arduino-esp32fs-plugin) for Arduino IDE to generate a SPIFFS partition.
It takes the contents of the `data/` folder inside your sketch, creates a partition for you and flashes it to the ESP.
I couldn't get this working and the manual process didn't fit with my automation goals.

To generate one from the CLI you need need to know a few things.
First, where the ESP32 Arduino package gets installed, this is `$HOME/Library/Arduino15/packages/esp32` on my mac.
You can use `arduino-cli config dump` to see where it looks, the path is under `directories.data`

Next you need to find the `tools` directory in there and find the `mkspiffs` binary.
There are a few hard-coded versions in there so it makes sense to have them as script variables.

> You can get the Arduino directory from the CLI with a little help from [jq](https://stedolan.github.io/jq/).

**bin/build.sh**

```bash
#!/usr/bin/env sh

ESP_VERSION=${ESP_VERSION:-1.0.6}
SPIFFS_VERSION=${SPIFFS_VERSION:-0.2.3}
ARDUINO_DIR=`arduino-cli config dump --format json | jq -r .directories.data`

# Compile firmware
# → My sketch is named `arduino`, not very original
# → Surprisingly you need --export-binaries otherwise it does nothing
# → My custom libraries are submodules in "arduino/libraries"
arduino-cli compile --verbose \
  --fqbn esp32:esp32:esp32 \
  --libraries arduino/libraries \
  --export-binaries \
  arduino

# Generate the spiff
# → "arduino/data" is where my web assets are
# → I chose to put the binary alongside the binaries arduino-cli built
# → Lots of magic numbers here, more below
${ARDUINO_DIR}/packages/esp32/tools/mkspiffs/${SPIFFS_VERSION}/mkspiffs \
  -c arduino/data \
  -b 4096 \
  -p 256 \
  -s 0x170000 \
  arduino/build/esp32.esp32.esp32/arduino.ino.spiffs.bin
```

There are three very-specific numbers here and they have to be exactly right.
So it took a while to find out exactly what these numbers should be.
I found the block-size, `-b` , and page size, `-p` in the
[official docs](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/storage/spiffs.html#mkspiffs).

The size parameter was a little harder to track down.
The size is important, it needs to be the exact size of the `spiffs` partition you want to mount, otherwise it won't work.
More info on this in [Arduino partitions](#arduino-partitions) above.

### Flashing from the CLI

The final hurdle was getting a consistent flash from the CLI, to quickly develop the firmware and try out different fixes.
This took the form of another bash script:

**bin/flash.sh**

```bash
#!/usr/bin/env sh

ESP_VERSION=${ESP_VERSION:-1.0.6}
SPIFFS_VERSION=${SPIFFS_VERSION:-0.2.3}
ESPTOOL_VERSION=${ESPTOOL_VERSION:-3.0.0}
ARDUINO_DIR=`arduino-cli config dump --format json | jq -r .directories.data`

BOOTLOADER="${ARDUINO_DIR}/packages/esp32/hardware/esp32/${ESP_VERSION}/tools/sdk/bin/bootloader_dio_80m.bin"

# You can flash the app, bootloader and partions with arduino-cli,
# but I preferred a single command to do it all
# arduino-cli upload -p "/dev/cu.usb..." --fqbn esp32:esp32:esp32 arduino

$ARDUINO_DIR/packages/esp32/tools/esptool_py/${ESPTOOL_VERSION}/esptool \
  --chip esp32 \
  --before default_reset \
  --after hard_reset \
  write_flash -z \
    0x1000 $BOOTLOADER \
    0x8000 arduino/build/esp32.esp32.esp32/arduino.ino.partitions.bin \
    0x10000 arduino/build/esp32.esp32.esp32/arduino.ino.bin \
    0x290000 arduino/build/esp32.esp32.esp32/arduino.ino.spiffs.bin
```

This is a bit of a monster of hard-coded configuration and more specific numbers are needed again!
`--chip` is simple, I'm building for an ESP32, its not the "board name" (esp32:esp32) though.
`--before` and `--after` run their operations at their respective times,
so it does a regular reset before flashing then a hard reset after flashing.

There is also a new `BOOTLOADER` variable, which is the path to where the ESP32 package has the bootloader I wanted to use. This lets you flash the bootloader onto the ESP too. It makes sure the latest versio of the bootloader is installed and that its compatible with the compilled firmware.

The main chunk of this command is information from the [partitions](#arduino-partitions) file,
namely the address' of where to put the app and spiffs.
The bootloader and partitions go at hardcoded locations for the ESP as previously discussed.

> A nicety of `esptool` over `arduino-cli upload` is that you don't need to specify a USB device, it picks it for you.

### Where is esptool and mkspiffs

When you install the ESP32 package with `arduino-cli` it also installs `esptool` and `mkspiffs`
which are handy CLI tools for ESP32 development.

You can use this little [jq](https://stedolan.github.io/jq) trick to get your `ARDUINO_DIR`
and then find the binaries, as long as you know what versions it installed.

> I only found the versions through trial and error.

```bash
SPIFFS_VERSION=${SPIFFS_VERSION:-0.2.3}
ESPTOOL_VERSION=${ESPTOOL_VERSION:-3.0.0}
ARDUINO_DIR=`arduino-cli config dump --format json | jq -r .directories.data`

# esptool location
${ARDUINO_DIR}/packages/esp32/tools/esptool_py/${ESPTOOL_VERSION}/esptool

# mkspiffs location
${ARDUINO_DIR}/packages/esp32/tools/mkspiffs/${SPIFFS_VERSION}/mkspiffs
```

> [esptool docs →](https://docs.espressif.com/projects/esptool/en/latest/esp32/)


### Misc

One of the commands needed the `python` to be on my `$PATH`, but that is no longer the case on macOS.
So I had to create a symlink to the `python3` binary. On an M1 mac with Homebrew it looked like:

```bash
sudo ln -s /opt/homebrew/bin/python3/opt/homebrew/bin/python
```

It seems the `esp32` package for Arduino CLI has specific versions of `esptool` and `mkspiffs` bundled with it,
but it still makes sense to keep those as variables so the script can be updated at a later date.

### Bonus: monitor serial from the CLI

If you're using the `Serial` within your firmware code you can use the `arduino-cli` to get the serial output
right in your own terminal.
You'll need to know your baud rate, which is the number you pass to `Serial.begin(...)`.

**bin/monitor.sh**

```bash
#!/usr/bin/env sh
set -e

# This is a little hack,
# If you call the command without an argument, it suggests one that is probably an ESP32
if [ -z "$1" ]
then
  echo "Usage:\n  $0 $(echo /dev/cu.usbserial-*)"
  exit 1;
fi

# Put your own chip and baud rate here
arduino-cli monitor -b esp32:esp32:esp32 -p "$1" -c baudrate=115200
```

## Next steps

- Generate a GitHub release and attach the firmware binaries directly to it.
- Explore merging all binaries into one and see if there are any benefits

---
title: Running Node.Js as a systemd service
date: 2020-11-16T09:58:50.658Z
draft: true
summary: >-
  I had a Node.js app that I wanted to run when my Raspberry Pi Zero started up
  in a minimal manor.

  Here's how I created a systemd service to do it.
---
> [systemd](https://en.wikipedia.org/wiki/Systemd)
> is a software suite that provides an array of system components for [Linux](https://en.wikipedia.org/wiki/Linux "Linux") operating systems.

For us, it lets you run services, start them on boot then check and manage the status of them.
To run through this I'll be installing a node.js app called `blinkit`.

## 1 - Installing Node.js

Assuming you're starting from scratch, say from Raspbian lite, you'll need to install node first.

```bash
VERSION=v10.20.1-linux-armv6l

# Create and enter a temporary directory
TMP=`mktemp -d`
cd $TMP

# In the temp dir, get the node binaries and extract them
curl -sLO https://nodejs.org/dist/latest-v10.x/node-$VERSION.tar.gz
tar -xzf node-$VERSION.tar.gz
mv node-$VERSION /usr/src/node

# Link the binaries onto the $PATH
ln -s /usr/src/node/bin/node /usr/bin/node
ln -s /usr/src/node/bin/npm /usr/bin/npm
ln -s /usr/src/node/bin/npx /usr/bin/npx

# Clean the temporary directory
rm -r $TMP
```

Feel free to change the version of course, I used this old one as it supperted armv6 on the Pi Zero I was installing on.

## 2 - Setup a user

We'll need a system user that the app will run as, we'll keep it simple and call them `node`.
Then we'll give them sudo access and gpio access (this is a special group on Pis)
and create a folder for the app to be in.

```bash
# Create the unix user
adduser node

# Add them to groups
usermod -aG sudo node
usermod -aG gpio node

# Create a node-owned folder to put the app in
mkdir -p /usr/src/blinkit
chown -R node:node /usr/src/blinkit
```

## 3 - Checkout the the app's repo

To run the node app, you'll need the code on the device as well,
I chose to checkout the code at `/srv/


```bash
su node

# Clone the repo
git clone git@github.com:robb-j/blinkit.git /usr/src/blinkit
cd /usr/src/blinkit

# Install the app's production dependencies
npm install --production
```

## 4 - Create a systemctl service

To run with systemd we need a file which tells systemd how to run and manage our service ...
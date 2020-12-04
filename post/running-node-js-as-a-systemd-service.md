---
title: Running Node.Js as a systemd service
date: 2020-11-16T09:58:50.658Z
draft: false
summary: >-
  I had a Node.js app that I wanted to run when my Raspberry Pi Zero started up
  in a minimal manor.

  Here's how I created a systemd service to do it.
---

> [systemd](https://en.wikipedia.org/wiki/Systemd)
> is a software suite that provides an array of system components for [Linux](https://en.wikipedia.org/wiki/Linux 'Linux') operating systems.

For us, it lets you run services, start them on boot then check and manage the status of them.
This is useful for making sure a node.js script is running whenever a raspberry pi is running.
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

Feel free to change the version of course, I used this older one as it supports armv6 on the Pi Zero I was installing on.

## 2 - Setup a user

We'll need a system user that the app will run as, we'll keep it simple and call them `node`.
Then we'll give them **sudo** and **gpio** access (this is a special group on Raspberry Pis)
and create a folder for the app to be in.

```bash
# Create the unix user
adduser node

# Add them to groups
usermod -aG sudo node
usermod -aG gpio node

# Create a node-owned folder to put the app in
# You call this whatever you like, probably the name of your application
mkdir -p /usr/src/blinkit
chown -R node:node /usr/src/blinkit
```

## 3 - Checkout the the app's repo

Now you need to get the code that you want to run,
and put it in that new folder.

```bash
# Become our new node user
su node

# Clone the repo
git clone git@github.com:robb-j/blinkit.git /usr/src/blinkit
cd /usr/src/blinkit

# Install the app's production dependencies
# There could be trouble here if any of your dependencies require extra binaries, like python
# You might need to debug you packages and see what they require a bit
npm install --production
```

## 4 - Create a systemctl service

To run with systemd we need a file which tells systemd how to run and manage our service.
For `blinkit` I put this file inside the repo which is pulled down,
so it is available at `/usr/src/blinkit/blinkit.service`

**blinkit.service**

```
[Unit]
Description=blinkit
Documentation=https://github.com/robb-j/blinkit/
After=network.target

[Service]
Type=simple
User=node
ExecStart=/usr/bin/node /usr/src/blinkit/src/cli.js serve
WorkingDirectory=/usr/src/blinkit
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

This service file is what systemd uses to know our application exists and what to do with it.
You should change the `Description`, `Documentation`, `ExecStart`
and `WorkingDirectory` statements to match your application.

Next we need to tell systemd about our new service.
We will symlink the service file into the systemd directory,
then restart the daemon and enable and start the new service.

```bash
# Your service name will be what you set `Description` to above
SERVICE=blinkit

# Link the service file into place
sudo ln -s /usr/src/blinkit/blinkit.service /lib/systemd/system/blinkit.service

# Reload the daemon so it knows about the new file
sudo systemctl daemon-reload

# Enable our new service
sudo systemctl enable $SERVICE

# Start the service
sudo systemctl start $SERVICE
```

Now the new service should be running and doing whatever it does.
You can check its output with:

```bash
# -f follows the logs in real time
# -u reverses the order so its newest first
journalctl -fu $SERVICE
```

If you restart your host, the service should now start up during the boot.
Congratulations! 🎉

---

Useful links:

- [github.com/robb-j/blinkit](https://github.com/robb-j/blinkit/)
- [nodesource.com/blog/running-your-node-js-app-with-systemd-part-1](https://nodesource.com/blog/running-your-node-js-app-with-systemd-part-1/)

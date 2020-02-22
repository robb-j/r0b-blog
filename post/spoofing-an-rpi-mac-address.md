---
title: Spoofing a Raspberry Pi's mac address
date: 2020-02-22
draft: false
summary: >
  Sometimes you just want to fake a raspberry pi's mac address to appear as
  something else on the network. This is how to do that.
---

It's surprisingly simple to make a raspberry pi appear as a different mac address on a network.

Why you want to spoof it isn't important, all you need to do is modify `/boot/cmdline.txt`
by appending:

```
smsc95xx.macaddr=aa:bb:cc:dd:ee:ff
```

Then reboot your pi (`sudo reboot`) and it will force it to appear as that mac address.

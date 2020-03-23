---
title: Useful Raspberry Pi WiFi dommands
date: 2020-03-21
draft: false
summary: >
  I keep needing these commands when doing pi things,
  so I thought I'd put them here in one place
---

I keep needing these commands when doing pi things,
so I thought I'd put them here in one place:

```bash
# Edit the wifi config file
# e.g. to add a new router
sudo nano /etc/wpa_supplicant/wpa_supplicant.conf

# Reconfigure the wifi on the pi, reloading the config
sudo wpa_cli -i wlan0 reconfigure

# Check the status of the wifi connection
sudo wpa_cli -i wlan0 status
```

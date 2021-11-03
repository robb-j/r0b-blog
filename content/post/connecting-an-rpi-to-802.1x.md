---
title: Connecting a Raspberry pi to 802.1x WiFi
date: 2020-02-03
draft: false
summary: >
  I've been playing around with Pis while on University Pi's recently
  so I want to document this non-simple process.
---

First you'll want to connect your pi either via ethernet,
an actual keyboard & monitor
or [ssh-over-usb](https://desertbot.io/blog/ssh-into-pi-zero-over-usb) if you're fancy.
All the wifi config on a pi is setup in `/etc/wpa_supplicant/wpa_supplicant.conf`.

First though, you need to generate a hash of your password,
so your password isn't stored in plaintext on the
[very-hackable](https://www.raspberrypi-spy.co.uk/2014/08/how-to-reset-a-forgotten-raspberry-pi-password/)
pi.

```bash
# ssh you@yourpi.local
read -s -p "Password: " pass && echo -n $pass | iconv -t utf16le | openssl md4 | sed 's/(stdin)= //'

# then type your password and hit enter and you'll get:
# Password: abcdef123abcdef123abcdef123

# From now on $PASSWORD will be this hash
PASSWORD=abcdef123abcdef123abcdef123

# clear the $pass variable if you're paranoid ;)
unset pass
```

Now you can start editing your `wpa_supplicant.conf` file:

```bash
sudo nano /etc/wpa_supplicant/wpa_supplicant.conf
```

First make sure it contains these values at the top,
setting the country code to wherever the pi is.
In newer pis it needs this to be set for wifi to work

```
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=GB
```

Then add a network block for the connection you want to conenct to.
Where `$SSID` is the name of the router,
`$USERNAME` is your username for the wifi
and `$PASSWORD` is the hash from above.
Be careful with the quotes!

```
network = {
	ssid="$SSID"
	proto=RSN
	key_mgmt=WPA-EAP
	pairwise=CCMP
	auth_alg=OPEN
	eap=PEAP
	phase2="auth=MSCHAPV2"
	identity="$USERNAME"
	password=hash:$PASSWORD
}
```

> These work for the 802.1x wifi I'm connecting to

Now you can use the `wpa_cli` to restart the pi's network interface.

```bash
# Tell it to reconfigure itself with the changes from wpa_supplicant.conf
sudo wpa_cli -i wlan0 reconfigure

# You can check on what its doing with this:
sudo wpa_cli -i wlan0 status

# You can also check for an ip with
ifconfig wlan0

# And you can check its working with this
nslookup duck.com
```

Now your pi's on the internet! 🥳

> Credit to [Dan Jackson](https://openlab.ncl.ac.uk/people/dan-jackson/)
> for the required arguments and password hash generator.

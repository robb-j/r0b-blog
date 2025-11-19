---
title: Notes on restoring my iPod Classic
date: 2025-11-19 19:00
draft: false
summary: >-
  I got my old iPod Classic working ... just ... here are some of my notes from it.
---

# Notes on restoring my iPod Classic (4th Generation)  
  
I recently got into iPods again. I wanted to have an mp3 player again, be a bit less reliant on streaming services and add some intentionality to my music listening. I knew my parents had at least one old iPod laying around their house so I got them to dig one out! What they found was an iPod Photo, a “classic” iPod a.k.a the 4th generation.  

{% image 'iPod.jpeg', 'My new old iPod Classic!.' %}
  
After browsing the excellent iFixit guides, I found they have an [entire series](https://www.ifixit.com/Device/iPod_4th_Generation_or_Photo) on this specific iPod so I got to work ordering up some parts and restoring the device. After a fair few hurdles, it’s all working and I’m listening to it right now as I’m writing this. What follows are some of my notes and key points from the process, in the hopes it might help someone else. I won’t go into specifics, I fix it has you covered there.  
  
### What I modified  
I wanted to keep this as “pure” an iPod experience as possible, I avoided flashing [Rockbox](https://www.rockbox.org/). Instead opting to keep the original OS, often referred to as **Pixo**.  
  
The iPod wouldn’t boot or stay charged so I set about changing the battery and it seemed relatively easy to swap the HDD for an SD card so I swapped that too. The device went from a 20GB HDD to a 64GB SD card! I’m also hoping that the SD will be more battery efficient. It’s a slightly convoluted 40 Pin to CF Adapter into a CF card to SD card adapter and finally an SD card to go in that.  
  
For the 40 pin adapter, I missed the iFixit step to trim down one of the nodules to make it fit and it wasn’t obvious that not all the pins are needed, it’s ok for it to overlap on one side. I also bent over a dual jumper header so it fit better inside the reassembled iPod case.  
  
### The boot menu  
I spent a fair while exploring the BIOS-like debug menu to see what was going on with the iPod. I didn’t really learn much here. It was useful to understand how it works.  
  
You hold down **select + menu** to reboot the iPod, then while booting hold down **prev track + select** and you’ll get a glitchy animation into the boot menu. The most useful tool I’ve found here is to look at the battery stats, you can test most bits of the hardware here too. There are lots of commands for testing the hard drive, but as I swapped that for an SD card they weren’t useful to me and didn’t work.  
  
  
### Charging the device  
I followed this [iFixit guide](https://www.ifixit.com/Guide/iPod+4th+Generation+or+Photo+Battery+Replacement/393) and got my battery [from eBay](https://www.ebay.co.uk/itm/305739629649). The main issue I’ve had after replacing the battery and HDD was getting the device to charge. From looking around online, a lot of people claim the iPod doesn’t charge very well over USB and people recommend using a Firewire connection instead. In 2025 firewire doesn’t really seem like a good option!  
  
People also claim the JST connector pins (the one used to plug the battery into the PCB) gets a bit loose and some recommend bending the pins a bit to get a better connection. For me, it helped to arrange the battery wire so it was feeding from “the back”, so the cable loops around the left and comes down into the socket, where “down” is where the 30-pin socket is. Also ensuring a tight bend to keep things together.  
  
The iPod seems fussy about what will charge it. Mine won’t charge on a PC, even though data works, and it won’t charge on many USB power adapters. Definitely try a few combinations before abandoning the iPod/cable. Mine works best from an Anker multi-USB power hub that I use to power my Raspberry Pis, of all things.  
  
  
### Replacing the HDD  
I followed this [iFixit guide](https://www.ifixit.com/Guide/iPod+4th+generation+or+Photo+hard+drive+replacement+by+micro+SD+card/148097) and got this [Compact Flash adapter](https://www.amazon.co.uk/dp/B08JYXNW22) and this [50 pin adapter](https://www.amazon.co.uk/dp/B00S6AK592) from Amazon. It was weird that not all the pins are used, it needs to “overhang” on the left side. If you trace the lines on the circuit you can see that those pins aren’t connected to anything anyway. There is a surprisingly bright LED when the card is being red, but I guess you never really see that. I also bent/folded the jumper so it fit inside the iPod nicely. I do wonder if it affects the battery.  
  
Because the SD card setup is so much smaller, I stuck a bit of anti-static foam to the underside of the 50-pin adapter. This presses the adapters up against the case a bit and stops anything from rattling around. I had some lying around, it was probably 5mm thick and quite compressible.  
  
I think the iPod can handle macOS and Windows formatting of the SD cad, I went with fat 32 because I thought it would be most compatible. I ended up using windows to sync the iPod, more on that below, so fat 32 worked well for that.  
  
  
### Synchronising the device  
I started out using macOS and was pretty surprised to see a neat iPod icon in Finder! The wonder stopped there though, I couldn’t get the integration to work very well. It often struggled to recognise the device or would get into a stuck state where the only way to fix it was to reboot my entire mac. Not ideal.  
  
Once I tried synchronising with Windows and iTunes I never went back. Opening iTunes and installing the “iPod Support” was very simple and I haven’t run into many issues.  
  
The other benefit of using Windows for me was that I’m still in the progress of ripping my old CDs. When I did this on Music on macOS, it very quickly started messing up my streaming albums and it broke a few things on my iPhone. Using windows was a lot cleaner and didn’t interrupt my normal iPhone music streaming through Apple Music. I’m still to decide where to put my developing music collection, it’s currently a big folder in iCloud.  
  
There are a few options when you start synchronising an iPod, and I had no idea what they mean:  
  
***convert bitrate***  
It turns out the iPod will store whatever you throw at it, be it AAC, MP3 or Apple Lossless. You can use this option to transcode audio to AAC at a bitrate at the time of synchronising. I’ve had weird issues where this option would lose album artworks, it might be worth transcoding yourself with something like [ffmpeg](https://www.ffmpeg.org/).  
  
I also started making a script to transcode an entire directory (recursively) of music files into a new directory formatted to AAC 256kbps while preserving metadata & artwork and removing Album Artists (which don’t work on iPods)  
  
***manually manage this iPod***  
This forgoes iTune’s synchronisation UI so you can just drag and drop music onto the device. This is very useful. You can also inspect the tracks on the iPod within iTunes so you can see if the artwork or metadata is set correctly. You don’t even need to have the music in iTunes to do this.  
  
Another note on synchronisation is that iPods, at least mine, don’t support “album artist” which for me makes the Artists menu pretty useless. A track has an Artist and Album Artist field which you can use to set who’s in the song but also how the tracks should be grouped by separately. For example most tracks in [ten days by Fred Again…](https://fredagainagain.bandcamp.com/album/ten-days) feature different artists, so for each track it includes every artist in the “Artist” field but each track just has Fred Again… in the “Album Artist” field. But unfortunately the iPod doesn’t do this grouping so I ended up overwriting all the Artists fields.  
  
***two other options***  
I can’t remember the other to options, I don’t think they were as important.  
  
### Battery Life  
The battery controller on the iPod tries to work out the maximum and minimum charge that can be stored in the battery. It does this when it is charged to the maximum and drained to the minimum. I think it then uses these values to inform the battery level it displays.  
  
When you first put a new battery in, I’d advise continuously charging it up even after it claims it is full. Then use it until it is completely empty and won’t play any more. That way it will get to its true “full” value and “empty” value and the battery indicator will work properly.  
  
I started ripping my music with Apple Lossless (ALAC). I’m not sure if that was a good idea or not yet. It seems that is not best for the iPod and it uses significantly more power to play these tracks. Reddit recommends storing tracks as AAC at 256kbps, I’m still testing this theory but it makes sense to me.  
  
  
### Audio books  
If you want to use audio books, it turns out they are just a regular m4a file but renamed m4b (b for book I guess). I had a CD and wanted to rip each track as a chapter so I made this tool: [m4b Editor](https://m4b.r0b.io/). You drop in your audio files and it’ll generate you a single m4b preserving the metadata and setting each track as a chapter.  
  
It all runs completely in the browser, there’s no server here! It runs ffmpeg using WASM which is pretty cool. It seems significantly slower than running the CLI, but hey you only need to do this a few times.  
  
  
### Apple USB SuperDrive  
If you want to use the SuperDrive with Windows, you’ll need to install the driver for it. You can get them as part of the Bootcamp support package. [Download that](https://support.apple.com/en-us/106378) and install AppleODDInstaller64 and it should work and show up in iTunes.  
  
```
bootcamp{version}\BootCamp\Drivers\Apple\AppleODDInstaller64.exe

```
  
  
  
### Useful links  
Here are some miscellaneous resources that were also useful during this whole process.  
  
* [iPod Photo iFixit guides](https://www.ifixit.com/Device/iPod_4th_Generation_or_Photo)  
* [The iFixit tools I have](https://www.ifixit.com/en-gb/products/essential-electronics-toolkit)  
* [Reddit post on iPod music quality](https://www.reddit.com/r/ipod/comments/j2zaq1/what_is_the_best_music_format_that_the_ipod_can/)  
* [iFlash](https://www.iflash.xyz/) — seems like a good idea but I didn’t try them  
* [iPod won’t charge post](https://www.reddit.com/r/ipod/comments/ut8wmo/ive_done_a_battery_replacement_on_my_4th_gen_ipod/)  
* [iPod gen 4 service guide](https://ia800702.us.archive.org/13/items/iPod_test_procedures/iPod%204th%20gen%20color.pdf)  
* [iPod gen 4 spec](https://everymac.com/systems/apple/ipod/specs/ipod_4thgen.html)  
* [potential C library for talking to iPods](https://github.com/fadingred/libgpod)  
* [iTunes artwork finder](https://bendodson.com/projects/itunes-artwork-finder/)  
* [Apple SuperDrive on Windows](https://discussions.apple.com/thread/254485233?sortBy=rank)  
  
  
Thanks for reading, I hope this was useful! Drop me a line on [Mastodon](https://social.lol/@r0b) if you have any questions.   

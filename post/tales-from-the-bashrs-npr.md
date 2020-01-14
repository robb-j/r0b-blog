---
title: 'Tales from the bashrc: npr'
date: 2020-01-20
draft: true
summary: >
  When you need a Raspberry Pi to just display a webpage, you don't really need
  an entire operating system and window manager. This was my solution.
---

```bash
alias npr='npm run -s --'
```

I added a new alias to my .`bashrc` today.
I was fed up with npm's run command,
it does two things that were annoying me.

## Needlessly noisy

The first thing is that it's noisy.
It spews out lots of information that I've never found useful
and distracts from the real error(s).

For instance, running `npm run lint` in this repo spews out all this:

```
> @robb_j/r0b-blog@1.0.0 lint /Users/rob/dev/r0b/blog
> eslint

sh: eslint: command not found
npm ERR! code ELIFECYCLE
npm ERR! syscall spawn
npm ERR! file sh
npm ERR! errno ENOENT
npm ERR! @robb_j/r0b-blog@1.0.0 lint: `eslint`
npm ERR! spawn ENOENT
npm ERR!
npm ERR! Failed at the @robb_j/r0b-blog@1.0.0 lint script.
npm ERR! This is probably not a problem with npm. There is likely additional logging output above.

npm ERR! A complete log of this run can be found in:
npm ERR!     /Users/rob/.npm/_logs/2020-01-14T20_35_05_835Z-debug.log
```

Whereas `npm run -s lint` goes straight to the error:

```
sh: eslint: command not found
```

## Option stealing

The second annoying thing is that it steals dash-dash options,
which gets infuriating when you're making a command-line tool.

If you ran `npm run cli --help`, the --help doesn't make it to your application,
it instead shows the help for `npm run`.
This is fixed by adding `--` after `run`.

## The alias

So I created npr, which combines these two things into a new smaller command.
It's not going to change the world, but it makes my life a tiny bit easier.

```bash
alias npr='npm run -s --'
```

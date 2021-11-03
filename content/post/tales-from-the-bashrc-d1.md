---
title: 'Tales from the bashrc: d1'
date: 2020-03-28
draft: false
summary: >
  One of my most used bashrc commands, docker-run-once-interactively or d1
---

```
alias d1='docker container run -it --rm'
```

Sometimes you just want to pop into a container to see whats in there,
run an arbitrary command or maybe avoid something entering your bash history.
I made it nice and short and pass a couple of params, from the `--help` page:

```
-i, --interactive    Keep STDIN open even if not attached
-t, --tty            Allocate a pseudo-TTY
```

The first gotcha of `docker container run` is the it doesn't start interactively,
any input you enter after starting a container doesn't get passed to it.
`-i` and `-t` solves this by attaching STDIN of your terminal to the container.

```
--rm                 Automatically remove the container when it exits
```

The second bit is `--rm`, this one is more of a preemtive housecleaning.
If you've been running containers for a while you'll realise how quickly they build up.
If you use `--rm` it automatically removes the container after it finishes,
which is perfect for these little ephemeral containers.

Having this means there are less stopped containers on your system
and also less unused images too.
Images will stick around while they have a container attached to them.

For more maintenannce you can always do a `docker system prune`
which picks up these things too.

## Examples

Here are a couple of things I regularly use this for:

```bash
# Start a node.js repl using node.js version 12 in alpine
d1 node:12-alpine

# Start (b)ash in nginx to inspect the default config / filesystem
d1 nginx:1-alpine ash

# Run an unsecure local mongo database
d1 -p 27017:27017 mongo:3

# Quickly serve a directory using nginx, this could be another alias ;)
d1 -p 80:80 -v `pwd`:/usr/share/nginx/html nginx:1-alpine
```

That's `d1` – a simple alias which I actually use every day.

```
alias d1='docker container run -it --rm'
```

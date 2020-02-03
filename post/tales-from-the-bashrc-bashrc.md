---
title: 'Tales from the bashrc: bashrc'
date: 2020-02-10
draft: true
summary: >
  I added a command to make adding commands easier.
---

```bash
alias bashrc='nano ~/.bashrc && source ~/.bashrc'
```

I'm that lazy, but I'm quite happy with this.
It simply edits my bashrc and automatically reloads the config into the current terminal.
I think I just found it faffy to edit the right file on mac,
only to try the thing I changed and realised I forgot to source the file too.

It also works for zshrc too, although it does take a bit longer to re-source a zshrc.

```bash
alias zshrc='nano ~/.zshrc && source ~/.zshrc'
```

Just be careful editing this alias iteself.
I got into a bad loop when trying this where it would constantly keep opening nano every time I closed it.

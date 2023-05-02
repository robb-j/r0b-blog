---
layout: html.njk
---

[Home](/)

# Getting started

> This page demonstrates pulling specific api exports using the shortcode

This is a detailed guide to using the API, these methods might be useful:

{% apiDoc api, 'lib.js', 'add' %}

Once you've got the hang of that, you can try the `hello` method:

{% apiDoc api, 'lib.js', 'hello' %}

# r0b-blog ![Generate and deploy site](https://github.com/robb-j/r0b-blog/workflows/Generate%20and%20deploy%20site/badge.svg?branch=master)

My personal blog, a static site generated with [11ty](https://www.11ty.dev/)
using [r0b-design](https://github.com/robb-j/r0b-design/)
and pushed to [blog.r0b.io](blog.r0b.io).

## dev scripts

```sh
# Run the generator
# -> .eleventy.js is the entrypoint
# -> Outputs to _site which is git-ignored
npm run build

# Run the dev server
# -> Runs on http://localhost:3000
# -> Reloads on change using BrowserSync
npm run serve

# Deploy the site (WIP)
# -> Need ssh access to r0b.io
npm run deploy

# Manually lint code
npm run lint
```

## dev setup

- prettier.io on git commit
- eslint w/ standard for javascript errors
- editorconfig for indentation management

## future work

- merge style changes back into r0b-design
- add opengraph support for posts

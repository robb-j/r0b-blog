# r0b-blog

My personal blog, a static site generated with [11ty](https://www.11ty.dev/)
using [r0b-design](https://github.com/robb-j/r0b-design/)
and pushed to [blog.r0b.io](blog.r0b.io).

## dev scripts

```bash
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
-

## future work

- Migrate to use https://github.com/robb-j/http-tar-unpacker/
- Merge style changes back into r0b-design
- Spelling / grammer checker plugins for 11ty

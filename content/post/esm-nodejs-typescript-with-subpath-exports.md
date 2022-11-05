---
title: ESM Node.js TypeScript with subpath exports
date: 2022-11-05
draft: false
summary: >
  ES Modules are the future, now you can use them in TypeScript
  and publish them on NPM with subpaths.
---

ES Modules is the future for JavaScript.
TypeScript support has been lagging behind, but it is finally catching up.
Here's what you need to use them with TypeScript:

**src/index.ts**

```ts
export default function main() {
  console.log('This is the main export')
}
```

**src/another-module.ts**

```ts
export default function alternativeMain() {
  console.log('This is an alternative export')
}
```

**tsconfig.json**

```json
{
  "compilerOptions": {
    "outDir": "dist",
    "moduleResolution": "Node16",
    "module": "ES2020"
  },
  "src": ["src"]
}
```

**package.json**

```json
{
  "name": "@robb_j/my-module",
  "version": "1.2.3",
  "type": "module",
  "scripts": {
    "build": "tsc"
  },
  "files": ["dist/*"],
  "exports": {
    ".": {
      "types": "./dist/main.d.ts",
      "import": "./dist/main.js"
    },
    "./*.js": {
      "types": "./dist/*.d.ts",
      "import": "./dist/*.js"
    }
  },
  "devDependencies": {
    "typescript": "^4.8.4"
  }
}
```

`type: module` and `exports` are the key parts here.
The `type` field tells Node.js that this module will use ESM, the obvious first step.

`exports` is a newer field and is used to tell Node.js how to import this module.
It lets you customise which files to load depending on the module-type
and TypeScript uses it to tell it how to load associated types.

The `"."` export is the files that are imported when no subpath is provided, in this case it will load the main.js file.
The `"./*.js"` export is used when a subpath is used that ends with "js", that same wildcard is used to find the file too.
[More info →](https://nodejs.org/api/packages.html#subpath-exports).
If you had commonjs files too, you can link them up here too.

You need to use `.js` when importing files from within TypeScript (even when importing another TypeScript file),
so it makes sense to use the `.js` here too.
It helps to locate the type definitions too.

## Running the example

```bash
# cd to the project

# Install dependencies
npm install

# Build the code to see what happens
npm run build
```

## Full example

To see all the code, see the [examples folder](https://github.com/robb-j/r0b-blog/tree/main/examples/nodejs-typescript-esm).

## Bonus: testing locally

To test a module locally, you can use local relative dependencies.
This work better than the `npm link` method, which I've always struggled with.

In another folder:

**package.json**

```json
{
  "private": true,
  "type": "module"
}
```

Install the module relatively:

```bash
npm i ../relative/path/to/module
```

Then you can test it and you should have types and IDE help too.

**consumer.js**

```ts
import main from '@robb_j/my-module'
import alternativeMain from '@robb_j/my-module/another-module.js'
```

---
title: Creating a Nova Extension with TypeScript
date: 2021-07-25
draft: true
summary: >
  I've been playing a lot with Nova recently, here's my experiences
  and best practices for creating Nove extensions with TypeScript.
---

I've been quite getting into [Nova](https://nova.app) recently, a macOS-only IDE developed by [Panic](https://panic.com). It's a ["Mac-assed"](https://daringfireball.net/linked/2020/03/20/mac-assed-mac-apps) editor and I feel it fits a lot more naturally into my flow.

I've gone far enough into making [a few extensions](https://github.com/robb-j?tab=repositories&q=nova-&type=&language=&sort=) for Nova to make it work for me more. Here I want to share my experiences in doing that, specifically around setting up a project with TypeScript. Writing an Extension with TypeScript requires a few different steps to the [recommended setup](https://library.panic.com/nova/npm-packages-in-extensions/).

## Prerequisites

- Familiarity with TypeScript
- Understanding of terminals, i.e. the Mac's default Terminal.app
- Knowledge of NPM and using packages

> Any time I use **A** → **B** → **C** notation, it means to navigate through macOS menus

## Setup

First, create a folder to put your Extension in, this will be referred to as the _root folder_ going forwards.

```bash
# Create a folder to put the project in
mkdir nova-example
cd nova-example

# Quickly setup NPM
npm init -y

# Install development dependencies
npm install --save-dev esbuild typescript @types/nova-editor-node

# If you have the Nova CLI installed...
nova .
```

Now open this folder in Nova and create a Nova Extension inside of it. The reason for this nesting is to keep TypeScript source-files and development tooling outside of the Extension, then compile JavaScript files into it.

> A Nova Extension is essentially a folder with a `.novaextension` file extension.

In Nova, select **Extensions** → **Create New Extension..**. Then choose the type of extension you want to make, for this tutorial I will choose **Blank**. Make sure to put the new extension inside the folder we created above. Remember to close the new window Nova opened after creating an extension, because we want to have the root folder open in Nova.

If you don't see **Extensions** in the Nova menu, make sure you have enabled development mode in **Nova** → **Preferences** → **General** → **Extension Development**.

## Configure TypeScript

Create **tsconfig.json** in the root folder:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Nova",

  "compilerOptions": {
    "target": "es6",
    "module": "ES2020",
    "moduleResolution": "node",
    "newLine": "lf",
    "strict": true,
    "noEmitOnError": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

A few points to note:

- We're targeting ES6 which lets us use newer JavaScript features and still [support older macs](https://caniuse.com/?search=es6).
  It should support macs from 2016 onwards.
- `noEmit` is set to true because we're using esbuild to bundle things, not TypeScript's compiler, `tsc`.
- The `$schema` section helps JSON Extension to validate and suggest completions
- [typescriptlang.org/tsconfig](https://www.typescriptlang.org/tsconfig) has great info about possible options

<details>
<summary>For improved linting:</summary>

Add these to your `compilerOptions`

```json
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
```

</details>

## Create a build task

Next, create a build Task which will take TypeScript, bundle any imported files together and output JavaScript into the Extension folder. Go to **Project** → **Project Settings...** then create a Task called **Development** (or whatever you want). Then in the **Build** section, enter the script below. Make sure to update `--outfile` with whatever your Extension is called.

```bash
#!/usr/bin/env sh

# Ensure the build fails if TypeScript fails
set -e

# Lint TypeScript source code
npx tsc --noEmit --pretty

# Bundle into JavaScript
npx esbuild \
  --bundle \
  --format=cjs \
  --outfile=Example.novaextension/Scripts/main.dist.js \
  src/Scripts/main.ts
```

> You could put this in a script like `bin/build.sh` if you want to run it outside Nova, then link the script in **Project Settings...** using the `path` option.

Now you can compile TypeScript with a **cmd+B** or by pressing the build button. The output file is called `main.dist.js` so you can add it to your gitignore with a `*.dist.js`.

## Write some TypeScript

Finally we can write some TypeScript, let's create a script which will be the Extension entry point. If you have the TypeScript Extension enabled, you should start seeing the auto suggestions and linting while typing this out.

**src/Scripts/main.ts**

```ts
export function activate() {
  const message = new NotificationRequest('hi')
  message.title = 'Hello, world!'
  message.body = 'Lorem ipsum sil dor amet'
  nova.notifications.add(message)
}

export function deactivate() {
  // ...
}
```

## Configure the Extension

To link everything up, configure your Extension's **extension.json**, to ensure it uses our `main.dist.js`. For the purpose of this tutorial, set `activationEvents` so your code always gets run. In production, you'd want to configure that to only activate the Extension when it is needed, so users aren't running it unnecessarily.

> More information about [activationEvents](https://docs.nova.app/extensions/#activation-events)

**Example.novaextension/extension.json:**

```json
{
  "main": "main.dist.js",
  "activationEvents": ["*"]
}
```

## Run the Extension

Run a build with **cmd+B** and it should generate your code into `Example.novaextension/Scripts/main.dist.js`, providing there are no TypeScript errors.

Run the Extension locally with **Extensions** > **Activate Project as Extension**. This will activate this Extension for any active Nova windows and will automatically reload it when you rebuild (or if any other files inside your Extension folder change).

When activated, you should see a notification in the top right of Nova 🎉 it's all working!

### Notes

- If you change the strings and re-build, you should see the notification again with the new message.
- Esbuild will bundle any `node_modules` that you import, but you should be careful about what those modules do. The JavaScript that Nova run's isn't the same as a Node.js environment and that might break some packages. You only have [Web APIs](https://docs.nova.app/api-reference/web-apis/) and the [nova global](https://docs.nova.app/api-reference/environment/).
- Make sure to update your [activationEvents](https://docs.nova.app/extensions/#activation-events) before publishing.

---

If you found this useful, [Tweet me](https://twitter.com/robbb_j) and let me know!

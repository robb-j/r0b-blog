---
title: Using Explicit Resource Management with TypeScript and Postgres
date: 2025-01-29 12:30:00
draft: false
summary: >
  I wanted to play with the new feature and see how the syntax compares in a 
  real-world scenario
---

## Overview

[Explicit Resource Management](https://github.com/tc39/proposal-explicit-resource-management)
is a newish JavaScript feature that lets you add tear-down functionality to function scopes.
This means if your code sets something up, you can have it automatically clean things when that code completes.

It's available in [Node.js 20.4.0 +](https://nodejs.org/en/blog/release/v20.4.0),
[Deno 1.38+](https://deno.com/blog/v1.38#using-with-deno-apis) and [TypeScript 5.2+](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html), so you should be able to use it on newer projects.

It looks something like this:

```js
using file = openFile('notes.txt')
```

Then `openFile` implements this API to close the file when it is not used anymore.

## My Code

So I had some code, I wanted to see how the footprint changed.
Roughly my code:

```ts
import postgres from 'postgres'
import { getPostgresMigrator } from 'gruber'

export async function runMigrations(direction: string) {
  const sql = postgres('postgres://...')

  const migrator = getPostgresMigrator({ sql, directory })

  try {
    if (direction === 'up') await migrator.up()
    else if (direction === 'down') await migrator.down()
    else throw new Error('Unknown direction <up|down>')
  } finally {
    await sql.end()
  }
}
```

And it turned into this:

```ts
export async function runMigrations(direction: string) {
  await using sql = getPostgresClient('postgres://...')

  const migrator = getPostgresMigrator({ sql, directory })

  if (direction === 'up') await migrator.up()
  else if (direction === 'down') await migrator.down()
  else throw new Error('Unknown direction <up|down>')
}
```

Which needed this magic:

```ts
function getPostgresClient(url) {
  const sql = postgres(url)

  Object.assign(sql, {
    [Symbol.asyncDispose]: async () => {
      await sql.end()
    },
  })

  return sql
}
```

## Notes

- It takes an extra level of nesting out of the code
- I wish TypeScript let you assign symbols to things without complaining
- I could remove the use of `return` to simplify the code
- Synchronous and async are different, one uses `Symbol.dispose` and the other `Symbol.asyncDispose`
  and requires the `await using` keywords.
- It feels like this could be very powerful, especially when all your favourite libraries start using it.

import * as flags from 'https://deno.land/std@0.198.0/flags/mod.ts'

const args = flags.parse(Deno.args, {
  strings: ['url', 'port'],
  collect: ['header'],
})

if (!args.url) throw new Error('--url not specified')

Deno.serve({ port: parseInt(args.port || '8080') }, (request) => {
  const { pathname, search } = new URL(request.url)
  const url = new URL('.' + pathname, args.url)
  url.search = search

  // url.pathname = pathname

  const headers = new Headers(request.headers)
  headers.set('Host', url.hostname)
  for (const h of args.header ?? []) {
    const [key, value] = h.split(':').map((v) => v.trim())
    headers.set(key, value)
  }

  console.debug('proxy %o', url.toString(), headers)

  return fetch(url, {
    method: request.method,
    headers,
    body: request.body,
    redirect: 'manual',
  })
})

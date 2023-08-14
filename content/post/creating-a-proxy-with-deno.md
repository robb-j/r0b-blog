---
title: Creating a HTTP proxy with Deno
date: 2023-08-12
draft: false
summary: >
  Turns out its pretty easy to create a reverse proxy with Deno, here's how.
---

I've been playing around with [Deno](https://deno.land) quite a bit recently. I'm really liking all of the integrated tooling and it's web-standards based approach.

I wanted to create a little proxy so that I could access our Grafana dashboard on a Raspberry Pi-based display in our office. The problem is that Grafana requires authentication, but there was no way to configure the kiosk to provide it.

So I set about to create a proxy server that could inject the authentication needed to access the dashboard. I ran the proxy on the Raspberry Pi and pointed the kiosk to the proxy rather that grafana directly. Now it easily boots up and shows our dashboard.

## The code

_proxy.ts_

```ts
Deno.serve({ port: 8080 }, async (request) => {
  const { pathname, search } = new URL(request.url)
  const url = new URL('.' + pathname, 'https://example.com')
  url.search = search

  const headers = new Headers(request.headers)
  headers.set('Host', url.hostname)
  headers.set('Authorization', Deno.env.get('PROXY_AUTHORIZATION'))

  return fetch(url, {
    method: request.method,
    headers,
    body: request.body,
    redirect: 'manual',
  })
})
```

That's all you need. I'll break it down and talk about some of the nice Deno things I found along the way.

First, we're using the new `Deno.serve` API which I really like. It's nicely based on web-standards and uses the same `Request` and `Response` objects that the [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) uses. This is really useful later.

The API is pretty minimal too. You say what port you want to run on and provide a callback to process the request and return a response.
One gripe is the `request.url` is not a URL object but just a string representation of the URL.

```ts
const { pathname, search } = new URL(request.url)
const url = new URL('.' + pathname, 'https://example.com')
url.search = search
```

This bit grabs the pathname from the request being made, e.g. `/some/path`, and combines it with the target URL to decide where to proxy to. There is a little hack here, because we know the `pathname` on the URL will always start with a `/`, we can prefix it with a `.` to make it a relative pathname. So if the target URL also has a pathname in it, they will be combined together.

It also copies the URL search parameters across to the new URL too, so they are preserved.

```ts
const headers = new Headers(request.headers)
headers.set('Host', url.hostname)
headers.set('Authorization', Deno.env.get('PROXY_AUTHORIZATION'))
```

One key part of the proxy is that it needs to force the `Host` header to be set to the host being proxied to. If the server at the other end of the proxy uses a reverse proxy, this needs to be set so it knows how to handle the request. If we didn't do this, the host would be set to `localhost` and that would confuse the target server.

The other bit here is that it injects the `Authorization` header, which is what we wanted to do all along. It grabs the value from an environment variable and puts it onto the headers, ready to be part of the proxy request.

```ts
return fetch(url, {
  method: request.method,
  headers,
  body: request.body,
  redirect: 'manual',
})
```

The final bit is to return a new `Response` (or promise of one) to the `Deno.serve` handler. Because the API uses exactly the same objects as the fetch API we can do this directly without any custom processing needed. Here it returns a promise for a request that shares the same HTTP method, uses the customised headers, streams the request body and tweaks the redirection logic.

That's it, all you need to do is run it with a deno command:

```sh
deno run --allow-net proxy.ts
```

I hope you found this interesting. I've been quite liking Deno recently, I think it's worth a try. I've also been playing around more in-depth with a little proxy server for some work and personal infrastructure, [goldiprox](https://r.r0b.io/goldiprox), if you're interested to see some more Deno proxy stuff. There is also a more fleshed out example in [examples/proxy.ts](https://github.com/robb-j/r0b-blog/blob/main/examples/proxy.ts) to check out.

---

Spotted a mistake or have some feedback, [let me know on Mastodon!](https://hyem.tech/@rob).

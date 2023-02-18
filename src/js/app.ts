window.addEventListener('keyup', (event) => {
  if (event.key !== '.') return
  if (!('URLPattern' in window)) return

  const pattern = new URLPattern({
    pathname: '/post/:slug/',
  })

  const result = pattern.exec(location.href)
  if (!result) return

  location.href = `https://github.com/robb-j/r0b-blog/edit/main/content/post/${result.pathname.groups.slug}.md`
})

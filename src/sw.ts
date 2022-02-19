import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { registerRoute } from 'workbox-routing'
import type { RouteHandlerCallback } from 'workbox-core/types'

declare let self: ServiceWorkerGlobalScope

self.skipWaiting()
clientsClaim()

// self.__WB_MANIFEST is default injection point
const entries = self.__WB_MANIFEST

// we should pre-cache first
precacheAndRoute(entries)

// if we create the handlers before the precache is initialized you'll get errors about missing html on the precache
const dynamicPagesHandlers = entries.reduce((acc, e) => {
  if (typeof e === 'string')
    return acc

  const idx = e.url.endsWith('.html') ? e.url.lastIndexOf('/') : -1
  if (idx > -1) {
    let name = e.url.slice(idx + 1)
    if (name.startsWith('_')) {
      name = e.url.slice(0, idx)
      if (!name.startsWith('/'))
        name = `/${name}`

      acc.push([
        new RegExp(`^${name}/`),
        createHandlerBoundToURL(e.url),
      ])
    }
  }

  return acc
}, [] as [RegExp, RouteHandlerCallback][])

cleanupOutdatedCaches()

const indexHandler = createHandlerBoundToURL('index.html')

registerRoute(/./, async(options) => {
  const { url: { pathname } } = options
  for (const [regex, handler] of dynamicPagesHandlers) {
    if (pathname.match(regex))
      return await handler(options)
  }

  return await indexHandler(options)
}, 'GET')

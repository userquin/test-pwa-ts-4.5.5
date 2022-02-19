import { existsSync } from 'fs'
import path from 'path'
// @ts-expect-error there are no types
import createServer from 'https-localhost'
import express from 'express'
import type { Express } from 'express-serve-static-core'

const staticPath = 'dist'
const app = createServer() as Express

const useBase = path.resolve(__dirname, staticPath)
// eslint-disable-next-line no-console
console.log(useBase)
const index = path.resolve(useBase, 'index.html')
// eslint-disable-next-line no-console
console.log(index)
const hi = path.resolve(useBase, 'hi/_name.html')
// eslint-disable-next-line no-console
console.log(hi)
app.use(express.static(useBase, {
  fallthrough: true,
  extensions: ['html'],
}))
// redirect 404 to 404.html or to index.html
app.use((req, res) => {
  // eslint-disable-next-line no-console
  console.log(useBase)
  const requestPath = req.path.startsWith('/hi') ? hi : undefined
  // eslint-disable-next-line no-console
  console.log(`${req.path} => ${requestPath}`)
  // istanbul ignore else: not interesting
  if (requestPath && existsSync(requestPath))
    res.status(200).sendFile(requestPath)
  else if (existsSync(index))
    res.status(200).sendFile(index)
  else
    res.status(404).send(`${req.path} not found.`)
})
// eslint-disable-next-line no-console
console.info(`Serving static path: ${staticPath}`)
;(app as any).redirect(80, 443)
app.listen()

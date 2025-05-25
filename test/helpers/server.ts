import { createServer } from 'http'
import { parse } from 'url'
import { loadNuxt } from 'nuxt'
import { build } from '@nuxt/builder'
import config from '../../nuxt.config'

let server: any
let nuxt: any

export async function startServer() {
  // Create nuxt instance
  nuxt = await loadNuxt({
    rootDir: process.cwd(),
    dev: true,
    config
  })

  // Build only in dev mode
  if (config.dev) {
    await build(nuxt)
  }

  // Create server
  server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    nuxt.render(req, res, parsedUrl)
  })

  // Start listening
  await new Promise((resolve) => {
    server.listen(3000, () => {
      console.log('Test server listening on port 3000')
      resolve(true)
    })
  })

  // Wait for server to be ready
  await new Promise((resolve) => setTimeout(resolve, 1000))
}

export async function stopServer() {
  if (server) {
    await new Promise((resolve) => {
      server.close(() => {
        console.log('Test server stopped')
        resolve(true)
      })
    })
  }
  if (nuxt) {
    await nuxt.close()
  }
} 
import { join } from 'desm'
import { pathToFileURL } from 'node:url'
import { register } from 'node:module'

export function setup (data) {
  register(pathToFileURL(join(import.meta.url, 'loader.js')), {
    data
  })
}

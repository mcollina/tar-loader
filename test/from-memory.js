import { test } from 'node:test'
import tarFs from 'tar-fs'
import { extract } from 'tar-stream'
import bl from 'bl'
import { pipeline } from 'node:stream/promises'
import { register } from 'node:module'
import { pathToFileURL } from 'node:url'
import { strictEqual } from 'node:assert'
import { setup } from '../index.js'
import { join } from 'desm'

const stream = tarFs.pack(join(import.meta.url, '..', 'example'))
const dest = bl()
await pipeline(stream, dest)

setup({
  buffer: dest.slice()
})

const { b } = await import('tar://./hello.js')
strictEqual(b, 'this is b')

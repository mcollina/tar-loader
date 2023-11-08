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
import { mkdtemp } from 'node:fs/promises'
import path from 'node:path'
import { createWriteStream } from 'node:fs'
import { tmpdir } from 'node:os';

const tmp = await mkdtemp(path.join(tmpdir(), 'tar-loader'))

const stream = tarFs.pack(join(import.meta.url, '..', 'example'))
const dest = path.join(tmp, 'example.tar')
await pipeline(stream, createWriteStream(dest))

setup({
  path: dest
})

const { b } = await import('tar://./hello.js')
strictEqual(b, 'this is b')

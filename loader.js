import { extract } from 'tar-stream'
import bl from 'bl'
import { finished } from 'node:stream/promises'
import { once } from 'node:events'
import { createReadStream } from 'node:fs'
import { open } from 'node:fs/promises'

let _buffer 
let _path

let entries = null

export async function initialize({ buffer, path }) {
  _buffer = buffer
  _path = path
}

async function buildIndex () {
  entries = {}
  let toStream
  if (_buffer) {
    toStream = bl()
    toStream.append(_buffer)
  } else if (_path) {
    toStream = createReadStream(_path)
  } else {
    throw new Error('No buffer or path provided')
  }

  const extractStream = extract()

  toStream.pipe(extractStream)
  toStream.on('error', (err) => {
    extractStream.destroy(err)
  })

  for await (const entry of extractStream) {
    if (entry.header.type === 'file') {
      entries[entry.header.name] = {
        offset: entry.offset,
        size: entry.header.size
      }
    }
    entry.resume()
  }
}

export async function load(url, context, nextLoad) {
  if (url.indexOf('tar://') === 0) {
    if (!entries) {
      await buildIndex()
    }
    const asUrl = new URL(url)
    const path = asUrl.pathname.slice(1)
    const entry = entries[path]
    if (!entry) {
      return nextLoad(url, context)
    }
    let source

    if (_buffer) {
      source = _buffer.slice(entry.offset + 512, entry.offset + 512 + entry.size)
    } else {
      source = Buffer.alloc(entry.size)
      const handle = await open(_path)
      await handle.read(source, 0, entry.size, entry.offset + 512)
      await handle.close()
    }

    const res = {
      format: 'module',
      shortCircuit: true,
      source
    }
    return res
  }
  return nextLoad(url, context)
} 

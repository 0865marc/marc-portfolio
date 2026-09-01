import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const directory = dirname(fileURLToPath(import.meta.url))
const vendorDirectory = join(directory, '..', 'vendor', 'sveltia-cms-auth')
const upstream = JSON.parse(await readFile(join(vendorDirectory, 'UPSTREAM.json'), 'utf8'))
const source = await readFile(join(vendorDirectory, upstream.path))
const actual = createHash('sha256').update(source).digest('hex')

if (actual !== upstream.sha256) {
  throw new Error(`Vendored worker checksum mismatch: expected ${upstream.sha256}, received ${actual}`)
}

console.log(`verified ${upstream.repository}@${upstream.commit}:${upstream.path} sha256=${actual}`)

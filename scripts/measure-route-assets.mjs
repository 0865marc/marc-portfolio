import { readFile, readdir, stat } from 'node:fs/promises'
import { gzipSync, brotliCompressSync } from 'node:zlib'
import { join, relative } from 'node:path'

const candidateIndex = process.argv.indexOf('--candidate')
const dist = candidateIndex >= 0 ? process.argv[candidateIndex + 1] : 'dist'
const files = []

async function walk(directory) {
  for (const name of await readdir(directory)) {
    const path = join(directory, name)
    const metadata = await stat(path)
    if (metadata.isDirectory()) await walk(path)
    else files.push(path)
  }
}

await walk(dist)

const compressible = []
for (const path of files.filter(file => /\.(?:css|html|js|svg|txt|xml)$/.test(file))) {
  const bytes = await readFile(path)
  compressible.push({
    file: relative(dist, path),
    raw: bytes.length,
    gzip: gzipSync(bytes).length,
    brotli: brotliCompressSync(bytes).length,
  })
}

const sumGzip = extension => compressible
  .filter(asset => asset.file.endsWith(extension))
  .reduce((total, asset) => total + asset.gzip, 0)
const html = compressible.filter(asset => asset.file.endsWith('.html'))
const firstPartyBinaryBytes = (await Promise.all(
  files.filter(file => /\.(?:png|woff2)$/.test(file)).map(async file => (await stat(file)).size),
)).reduce((total, size) => total + size, 0)

const htmlSources = await Promise.all(html.map(asset => readFile(join(dist, asset.file), 'utf8')))
const remoteMediaReferences = htmlSources.flatMap((source, index) => (
  [...source.matchAll(/<(?:audio|img|source|video)\b[^>]+(?:src|srcset)=["']https?:\/\/[^"']+/gi)]
    .map(match => ({ file: html[index].file, match: match[0] }))
))
const remoteCssReferences = (await Promise.all(
  files.filter(file => file.endsWith('.css')).map(async file => ({ file: relative(dist, file), source: await readFile(file, 'utf8') })),
)).flatMap(({ file, source }) => [...source.matchAll(/url\(["']?https?:\/\//gi)].map(match => ({ file, match: match[0] })))

const result = {
  dist,
  firstPartyJsGzip: sumGzip('.js'),
  firstPartyCssGzip: sumGzip('.css'),
  largestHtmlGzip: Math.max(0, ...html.map(asset => asset.gzip)),
  firstPartyBinaryBytes,
  remoteMediaReferences,
  remoteCssReferences,
  assets: compressible,
}

console.log(JSON.stringify(result, null, 2))

if (result.firstPartyJsGzip > 25 * 1024) process.exitCode = 1
if (result.firstPartyCssGzip > 45 * 1024) process.exitCode = 1
if (result.largestHtmlGzip > 40 * 1024) process.exitCode = 1
if (result.firstPartyBinaryBytes > 750 * 1024) process.exitCode = 1
if (remoteMediaReferences.length || remoteCssReferences.length) process.exitCode = 1

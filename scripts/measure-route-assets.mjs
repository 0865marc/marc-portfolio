import { readFile, readdir, stat } from 'node:fs/promises'; import { gzipSync, brotliCompressSync } from 'node:zlib'; import { join,relative } from 'node:path'
const dist=process.argv.includes('--candidate')?process.argv[process.argv.indexOf('--candidate')+1]:'dist'; const files=[]
async function walk(dir){for(const n of await readdir(dir)){const p=join(dir,n),s=await stat(p);s.isDirectory()?await walk(p):files.push(p)}} await walk(dist)
const assets=[];for(const p of files.filter(p=>/\.(js|css)$/.test(p))){const b=await readFile(p);assets.push({file:relative(dist,p),raw:b.length,gzip:gzipSync(b).length,brotli:brotliCompressSync(b).length})}
const js=assets.filter(a=>a.file.endsWith('.js')).reduce((n,a)=>n+a.gzip,0);console.log(JSON.stringify({dist,firstPartyJsGzip:js,assets},null,2));if(js>25*1024)process.exitCode=1

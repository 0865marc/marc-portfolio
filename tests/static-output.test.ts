import { readFileSync, statSync } from 'node:fs'; import { join } from 'node:path'; import { describe, expect, it } from 'vitest'; import { blogPosts } from '../src/data/blog'
const dist=join(process.cwd(),'dist'); const read=(p:string)=>readFileSync(join(dist,p),'utf8')
describe('static output',()=>{
  it.each(['index.html','blog/index.html','404.html'])(`emits %s`,p=>expect(statSync(join(dist,p)).size).toBeGreaterThan(300))
  it('emits meaningful landing and blog HTML',()=>{expect(read('index.html')).toContain('Sobre mí');expect(read('blog/index.html')).toContain('Buscar artículos');expect(read('index.html')).not.toContain('id="root"')})
  it.each(blogPosts)('emits $id with unique metadata and full body',post=>{const html=read(`blog/${post.id}/index.html`);expect(html).toContain(post.title);expect(html).toContain(post.introduction[0]);expect(html).toContain(`https://portfolio.mybrawl.io/blog/${post.id}/`)})
  it('keeps stable unique IDs',()=>expect(new Set(blogPosts.map(p=>p.id)).size).toBe(blogPosts.length))
})

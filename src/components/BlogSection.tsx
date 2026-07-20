import { blogPosts } from '../data/blog'
import { BLOG_INDEX_HREF } from '../lib/blogRoutes'
import { BlogCard } from './BlogCard'
import { FadeIn } from './FadeIn'

export function BlogSection() {
  return (
    <section
      id="blog"
      className="scroll-mt-6 bg-white px-5 pb-24 text-[#0C0C0C] sm:px-8 sm:pb-28 md:px-10 md:pb-36"
      aria-labelledby="blog-title"
    >
      <FadeIn y={40}>
        <h2
          id="blog-title"
          tabIndex={-1}
          className="text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight focus:outline-none"
        >
          Blog
        </h2>
      </FadeIn>

      <FadeIn delay={0.15} y={24}>
        <p className="mx-auto mb-12 mt-8 max-w-2xl text-center text-[clamp(1rem,1.7vw,1.35rem)] font-light leading-relaxed opacity-60 sm:mb-16">
          Ideas técnicas sobre arquitecturas IoT, procesos asíncronos e infraestructura distribuida para construir productos fiables y una experiencia de usuario sólida.
        </p>
      </FadeIn>

      {blogPosts.slice(0, 3).length > 0 ? (
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.slice(0, 3).map((post, index) => (
            <FadeIn key={post.id} delay={index * 0.1 + 0.25} y={30}>
              <BlogCard post={post} headingLevel={3} source="landing" />
            </FadeIn>
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-2xl rounded-[28px] border border-[rgba(12,12,12,0.15)] px-6 py-10 text-center sm:rounded-[34px] sm:px-8">
          <h3 className="text-2xl font-medium">Aún no hay artículos</h3>
          <p className="mt-4 text-base font-light leading-relaxed opacity-60">
            Cuando haya contenido disponible, aparecerá aquí.
          </p>
        </div>
      )}

      <FadeIn delay={0.55} y={20} className="mt-10 flex justify-center sm:mt-12">
        <a
          href={BLOG_INDEX_HREF}
          className="inline-flex min-h-11 items-center rounded-full bg-[#0C0C0C] px-6 text-sm uppercase tracking-[0.14em] text-[#D7E2EA] transition hover:bg-[#0C0C0C]/75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0C0C0C]"
        >
          Ver todos los artículos
        </a>
      </FadeIn>
    </section>
  )
}

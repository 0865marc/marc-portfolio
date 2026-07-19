import { ArrowUpRight } from 'lucide-react'
import { blogPosts } from '../data/portfolio'
import { FadeIn } from './FadeIn'
import { LiveProjectButton } from './LiveProjectButton'

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
          className="text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight"
        >
          Blog
        </h2>
      </FadeIn>

      <FadeIn delay={0.15} y={24}>
        <p className="mx-auto mb-12 mt-8 max-w-2xl text-center text-[clamp(1rem,1.7vw,1.35rem)] font-light leading-relaxed opacity-60 sm:mb-16">
          Thoughts on frontend, backend, product engineering, automation, and building digital experiences that feel fast, reliable, and memorable.
        </p>
      </FadeIn>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
        {blogPosts.map((post, index) => (
          <FadeIn key={post.title} delay={index * 0.1 + 0.25} y={30}>
            <article className="group flex min-h-[320px] flex-col justify-between rounded-[28px] border border-[rgba(12,12,12,0.15)] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[rgba(12,12,12,0.45)] hover:shadow-[0_16px_35px_rgba(12,12,12,0.08)] sm:rounded-[34px] sm:p-7 md:rounded-[40px] md:p-8">
              <div>
                <div className="flex items-center justify-between gap-3 text-[0.68rem] font-medium uppercase tracking-[0.2em] opacity-[0.55]">
                  <span>{post.category}</span>
                  <time>{post.date}</time>
                </div>
                <h3 className="mt-10 text-[clamp(1.35rem,2.4vw,2rem)] font-medium uppercase leading-tight">
                  {post.title}
                </h3>
                <p className="mt-5 text-sm font-light leading-relaxed opacity-60 sm:text-base">
                  {post.excerpt}
                </p>
              </div>
              <a
                href="#blog"
                className="group/link mt-8 inline-flex w-fit items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] transition-opacity duration-300 hover:opacity-60"
              >
                Read Article
                <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden="true" className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
              </a>
            </article>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.55} y={20} className="mt-12 flex justify-center sm:mt-16">
        <LiveProjectButton href="#blog" label="Read More" light />
      </FadeIn>
    </section>
  )
}

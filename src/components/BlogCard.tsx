import { ArrowUpRight } from 'lucide-react'
import { blogPostHref, type BlogSource } from '../lib/blogRoutes'
import type { BlogPost } from '../data/blog'

type BlogCardProps = {
  post: BlogPost
  headingLevel: 2 | 3
  source: BlogSource
}

export function BlogCard({ post, headingLevel, source }: BlogCardProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'

  return (
    <article className="min-w-0">
      <a
        href={blogPostHref(post.id, source)}
        aria-label={`Leer artículo: ${post.title}. Etiquetas: ${post.tags.join(', ')}`}
        className="group flex h-full min-h-[320px] min-w-0 flex-col justify-between rounded-[28px] border border-[rgba(12,12,12,0.15)] bg-white p-6 text-[#0C0C0C] transition duration-300 hover:-translate-y-1 hover:border-[rgba(12,12,12,0.45)] hover:shadow-[0_16px_35px_rgba(12,12,12,0.08)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0C0C0C] sm:rounded-[34px] sm:p-7 md:rounded-[40px] md:p-8"
      >
        <div className="min-w-0 break-words">
          <p className="min-w-0 break-words text-[0.68rem] font-medium uppercase tracking-[0.2em] opacity-[0.65]">
            {post.category}
          </p>
          <Heading className="mt-10 min-w-0 break-words text-[clamp(1.35rem,2.4vw,2rem)] font-medium uppercase leading-tight">
            {post.title}
          </Heading>
          <p className="mt-5 min-w-0 break-words text-sm font-light leading-relaxed opacity-60 sm:text-base">
            {post.excerpt}
          </p>
          <ul aria-label="Etiquetas" className="mt-6 flex min-w-0 flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li
                key={tag}
                className="max-w-full break-words rounded-full border border-[#0C0C0C]/20 px-3 py-1.5 text-[0.68rem] font-medium uppercase leading-tight tracking-[0.1em]"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>

        <span className="mt-8 inline-flex min-h-11 w-fit items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] transition-opacity duration-300 group-hover:opacity-60">
          Leer artículo
          <ArrowUpRight
            size={17}
            strokeWidth={1.8}
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </a>
    </article>
  )
}

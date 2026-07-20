import { blogPosts, type BlogPost } from '../data/blog'
import { BLOG_INDEX_HREF, LANDING_BLOG_HREF, type BlogSource } from '../lib/blogRoutes'

type BlogPostViewProps = {
  postId: string | null
  source: BlogSource
}

const backLinkClassName =
  'inline-flex min-h-11 items-center rounded-full border border-[#D7E2EA]/40 px-5 text-sm uppercase tracking-[0.14em] transition hover:border-[#D7E2EA] hover:bg-[#D7E2EA] hover:text-[#0C0C0C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D7E2EA]'

const filledBackLinkClassName =
  'inline-flex min-h-11 items-center rounded-full bg-[#0C0C0C] px-5 text-sm uppercase tracking-[0.14em] text-[#D7E2EA] transition hover:bg-[#0C0C0C]/75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0C0C0C]'

function ArticleBackLink({ source, filled = false }: { source: BlogSource; filled?: boolean }) {
  const isLandingSource = source === 'landing'

  return (
    <a
      href={isLandingSource ? LANDING_BLOG_HREF : BLOG_INDEX_HREF}
      className={filled ? filledBackLinkClassName : backLinkClassName}
    >
      {isLandingSource ? 'Volver al Blog del portfolio' : 'Volver al Blog'}
    </a>
  )
}

function NotFoundView({ source }: { source: BlogSource }) {
  return (
    <div className="rounded-[28px] bg-white px-6 py-10 text-[#0C0C0C] sm:rounded-[40px] sm:px-10 sm:py-14 md:px-16 md:py-20">
      <div className="mx-auto min-w-0 max-w-3xl break-words">
        <h1
          id="blog-post-title"
          data-route-heading="true"
          tabIndex={-1}
          className="break-words text-[clamp(2.25rem,5.4vw,4.75rem)] font-black uppercase leading-[0.98] tracking-tight focus:outline-none"
        >
          Artículo no encontrado
        </h1>
        <p className="mt-8 max-w-2xl text-lg font-light leading-relaxed text-[#0C0C0C]/70 sm:text-xl">
          No hemos encontrado el artículo solicitado. Puede que el enlace esté incompleto o que el contenido ya no esté disponible.
        </p>
        <div className="mt-10">
          <ArticleBackLink source={source} filled />
        </div>
      </div>
    </div>
  )
}

function ArticleContent({ post, source }: { post: BlogPost; source: BlogSource }) {
  return (
    <article className="rounded-[28px] bg-white px-5 py-8 text-[#0C0C0C] sm:rounded-[40px] sm:px-10 sm:py-14 md:px-16 md:py-20">
      <div className="mx-auto min-w-0 max-w-3xl break-words">
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-[0.16em] text-[#0C0C0C]/65">
          <span className="min-w-0 break-words">{post.category}</span>
          {post.isSample && <span className="min-w-0 break-words">Artículo de muestra</span>}
        </div>

        <ul aria-label={`Etiquetas de ${post.title}`} className="mt-5 flex min-w-0 flex-wrap gap-2">
          {post.tags.map((tag) => (
            <li
              key={tag}
              className="max-w-full break-words rounded-full border border-[#0C0C0C]/20 px-3 py-1.5 text-[0.68rem] font-medium uppercase leading-tight tracking-[0.1em]"
            >
              {tag}
            </li>
          ))}
        </ul>

        <h1
          id="blog-post-title"
          data-route-heading="true"
          tabIndex={-1}
          className="mt-8 break-words text-[clamp(2.25rem,5.4vw,4.75rem)] font-black uppercase leading-[0.98] tracking-tight focus:outline-none"
        >
          {post.title}
        </h1>
        <p className="mt-8 text-xl font-light leading-relaxed text-[#0C0C0C]/70 sm:text-2xl">
          {post.excerpt}
        </p>

        <div className="mt-12 text-base font-light leading-[1.8] sm:text-lg">
          {post.introduction.map((paragraph) => (
            <p key={paragraph} className="mb-6 last:mb-0">
              {paragraph}
            </p>
          ))}

          {post.sections.map((section) => (
            <section key={section.heading} className="mt-14 first:mt-16">
              <h2 className="break-words text-2xl font-medium leading-tight sm:text-3xl">
                {section.heading}
              </h2>
              <div className="mt-6">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mb-6 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
              {section.points && section.points.length > 0 && (
                <ul className="mt-6 list-disc space-y-3 pl-6">
                  {section.points.map((point) => (
                    <li key={point} className="pl-2">
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section className="mt-14">
            <h2 className="break-words text-2xl font-medium leading-tight sm:text-3xl">Idea final</h2>
            <div className="mt-6">
              {post.takeaway.map((paragraph) => (
                <p key={paragraph} className="mb-6 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-14">
          <ArticleBackLink source={source} filled />
        </div>
      </div>
    </article>
  )
}

export function BlogPostView({ postId, source }: BlogPostViewProps) {
  const post = postId ? blogPosts.find((candidate) => candidate.id === postId) : undefined

  return (
    <main className="min-h-screen min-w-0 overflow-x-clip bg-[#0C0C0C] px-5 py-8 text-[#D7E2EA] sm:px-8 sm:py-12 md:px-10 md:py-16" aria-labelledby="blog-post-title">
      <div className="mx-auto min-w-0 max-w-6xl">
        <div className="mb-8 sm:mb-10">
          <ArticleBackLink source={source} />
        </div>
        {post ? <ArticleContent post={post} source={source} /> : <NotFoundView source={source} />}
      </div>
    </main>
  )
}

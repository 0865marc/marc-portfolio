import { useState } from 'react'
import { blogPosts } from '../data/blog'
import { filterBlogPosts, getBlogTags } from '../lib/blogFilters'
import { LANDING_BLOG_HREF } from '../lib/blogRoutes'
import { BlogCard } from './BlogCard'

const blogTags = getBlogTags(blogPosts)

const tagButtonClassName =
  'min-h-11 max-w-full break-words rounded-full border px-4 py-2 text-center text-xs font-medium uppercase leading-tight tracking-[0.12em] transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D7E2EA]'

export function BlogIndexView() {
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const filteredPosts = filterBlogPosts(blogPosts, query, selectedTag)
  const hasActiveFilters = query.trim().length > 0 || selectedTag !== null

  const clearFilters = () => {
    setQuery('')
    setSelectedTag(null)
  }

  const resultMessage = hasActiveFilters
    ? `Mostrando ${filteredPosts.length} de ${blogPosts.length} ${blogPosts.length === 1 ? 'artículo' : 'artículos'}.`
    : `${blogPosts.length} ${blogPosts.length === 1 ? 'artículo disponible' : 'artículos disponibles'}.`

  return (
    <main className="min-h-screen min-w-0 overflow-x-clip bg-[#0C0C0C] px-5 py-8 text-[#D7E2EA] sm:px-8 sm:py-12 md:px-10 md:py-16" aria-labelledby="blog-index-title">
      <div className="mx-auto min-w-0 max-w-6xl">
        <a
          href={LANDING_BLOG_HREF}
          className="inline-flex min-h-11 items-center rounded-full border border-[#D7E2EA]/40 px-5 text-sm uppercase tracking-[0.14em] transition hover:border-[#D7E2EA] hover:bg-[#D7E2EA] hover:text-[#0C0C0C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D7E2EA]"
        >
          Volver al portfolio
        </a>

        <header className="mt-16 max-w-3xl sm:mt-20">
          <h1
            id="blog-index-title"
            data-route-heading="true"
            tabIndex={-1}
            className="break-words text-[clamp(3.5rem,12vw,9rem)] font-black uppercase leading-[0.9] tracking-tight focus:outline-none"
          >
            Blog
          </h1>
          <p className="mt-8 max-w-2xl text-lg font-light leading-relaxed text-[#D7E2EA]/70 sm:text-xl">
            Ideas técnicas sobre IoT, procesos asíncronos e infraestructura distribuida, reunidas para leerlas con calma.
          </p>
        </header>

        {blogPosts.length > 0 ? (
          <>
            <section
              className="mt-12 min-w-0 rounded-[28px] border border-[#D7E2EA]/20 p-5 sm:mt-16 sm:rounded-[34px] sm:p-7"
              aria-labelledby="blog-filters-title"
            >
              <h2 id="blog-filters-title" className="text-2xl font-medium">
                Buscar artículos
              </h2>

              <div className="mt-6 min-w-0">
                <label htmlFor="blog-search" className="block text-sm font-medium uppercase tracking-[0.12em]">
                  Buscar por título, resumen, categoría o etiqueta
                </label>
                <input
                  id="blog-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ej.: latencia, IoT o Celery"
                  autoComplete="off"
                  className="mt-3 min-h-12 w-full min-w-0 rounded-2xl border border-[#D7E2EA]/35 bg-transparent px-4 py-3 text-base text-[#D7E2EA] placeholder:text-[#D7E2EA]/45 focus:border-[#D7E2EA] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D7E2EA]"
                />
              </div>

              <fieldset className="mt-7 min-w-0">
                <legend className="text-sm font-medium uppercase tracking-[0.12em]">Filtrar por etiqueta</legend>
                <div className="mt-3 flex min-w-0 flex-wrap gap-2">
                  <button
                    type="button"
                    aria-pressed={selectedTag === null}
                    aria-controls="blog-results"
                    onClick={() => setSelectedTag(null)}
                    className={`${tagButtonClassName} ${
                      selectedTag === null
                        ? 'border-[#D7E2EA] bg-[#D7E2EA] text-[#0C0C0C]'
                        : 'border-[#D7E2EA]/35 hover:border-[#D7E2EA]'
                    }`}
                  >
                    Todas
                  </button>
                  {blogTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      aria-pressed={selectedTag === tag}
                      aria-controls="blog-results"
                      onClick={() => setSelectedTag(tag)}
                      className={`${tagButtonClassName} ${
                        selectedTag === tag
                          ? 'border-[#D7E2EA] bg-[#D7E2EA] text-[#0C0C0C]'
                          : 'border-[#D7E2EA]/35 hover:border-[#D7E2EA]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="mt-7 flex min-w-0 flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-sm text-[#D7E2EA]/70" role="status" aria-live="polite">
                  {resultMessage}
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="inline-flex min-h-11 items-center rounded-full border border-[#D7E2EA]/40 px-5 text-sm uppercase tracking-[0.12em] transition hover:border-[#D7E2EA] hover:bg-[#D7E2EA] hover:text-[#0C0C0C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D7E2EA] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#D7E2EA]/40 disabled:hover:bg-transparent disabled:hover:text-[#D7E2EA]"
                >
                  Limpiar filtros
                </button>
              </div>
            </section>

            {filteredPosts.length > 0 ? (
              <div id="blog-results" className="mt-10 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.map((post) => (
                  <BlogCard key={post.id} post={post} headingLevel={2} source="index" />
                ))}
              </div>
            ) : (
              <div id="blog-results" className="mt-10 max-w-2xl rounded-[28px] border border-[#D7E2EA]/20 px-6 py-10 sm:px-8">
                <h2 className="text-2xl font-medium">No hay artículos que coincidan</h2>
                <p className="mt-4 text-base font-light leading-relaxed text-[#D7E2EA]/70">
                  Prueba con otra búsqueda o vuelve a mostrar todas las etiquetas.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[#D7E2EA] px-5 text-sm uppercase tracking-[0.12em] text-[#0C0C0C] transition hover:bg-[#D7E2EA]/75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D7E2EA]"
                >
                  Mostrar todos
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="mt-12 max-w-2xl rounded-[28px] border border-[#D7E2EA]/20 px-6 py-10 sm:mt-16 sm:px-8">
            <h2 className="text-2xl font-medium">Aún no hay artículos</h2>
            <p className="mt-4 text-base font-light leading-relaxed text-[#D7E2EA]/70">
              Cuando haya contenido disponible, aparecerá aquí.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

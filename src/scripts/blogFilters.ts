import { filterBlogPosts, type SearchableBlogPost } from '../lib/blogFilters'

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> }
}

const root = document.querySelector<HTMLElement>('[data-blog-filter-root]')

if (root) {
  const cards = [...root.querySelectorAll<HTMLElement>('[data-blog-card]')]
  const input = root.querySelector<HTMLInputElement>('[data-blog-search]')!
  const status = root.querySelector<HTMLElement>('[data-blog-status]')!
  const clear = root.querySelector<HTMLButtonElement>('[data-blog-clear]')!
  const empty = root.querySelector<HTMLElement>('[data-blog-empty]')!
  const tags = [...root.querySelectorAll<HTMLButtonElement>('[data-blog-tag]')]
  const records = cards.map(card => JSON.parse(card.dataset.search!) as SearchableBlogPost)
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  let selected: string | null = null

  cards.forEach(card => {
    const record = JSON.parse(card.dataset.search!) as SearchableBlogPost
    card.style.viewTransitionName = `article-${record.id}`
  })

  const render = () => {
    const visible = new Set(filterBlogPosts(records, input.value, selected).map(post => post.id))
    cards.forEach(card => {
      const record = JSON.parse(card.dataset.search!) as SearchableBlogPost
      card.hidden = !visible.has(record.id)
    })
    const active = Boolean(input.value.trim()) || selected !== null
    status.textContent = active ? `Mostrando ${visible.size} de ${cards.length} artículos.` : `${cards.length} artículos disponibles.`
    clear.disabled = !active
    empty.hidden = visible.size !== 0
    tags.forEach(button => {
      const pressed = (button.dataset.blogTag || null) === selected
      button.setAttribute('aria-pressed', String(pressed))
      button.classList.toggle('active', pressed)
    })
  }

  const update = (animate = false) => {
    const documentWithTransitions = document as ViewTransitionDocument
    if (animate && !reducedMotion && documentWithTransitions.startViewTransition) {
      documentWithTransitions.startViewTransition(render)
      return
    }
    render()
  }

  const reset = () => {
    input.value = ''
    selected = null
    update(true)
  }

  input.addEventListener('input', () => update())
  tags.forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.blogTag || null
    update(true)
  }))
  clear.addEventListener('click', reset)
  root.querySelector('[data-blog-empty-clear]')?.addEventListener('click', reset)
}

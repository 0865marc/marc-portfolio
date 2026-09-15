import { tokenExamples, bagExamples, attentionTokens, visiblePositions } from '../lib/learningLabs'

const courseMenu = document.querySelector<HTMLDetailsElement>('[data-course-menu]')
if (courseMenu) {
  const wide = matchMedia('(min-width: 1024px)')
  const links = [...courseMenu.querySelectorAll<HTMLAnchorElement>('[data-course-link]')]
  const currentLabel = courseMenu.querySelector<HTMLElement>('[data-current-course]')!
  const syncSelection = () => {
    const current = links.find(link => link.hash === location.hash) ?? links[0]
    links.forEach(link => {
      if (link === current) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    })
    currentLabel.textContent = `${current.querySelector('span')!.textContent} · ${current.lastChild!.textContent}`
    currentLabel.hidden = false
    courseMenu.open = wide.matches
  }
  courseMenu.open = wide.matches
  wide.addEventListener('change', event => { courseMenu.open = event.matches })
  addEventListener('hashchange', syncSelection)
  links.forEach(link => link.addEventListener('click', () => {
    courseMenu.open = wide.matches
    if (link.hash === location.hash) {
      const section = document.getElementById(link.hash.slice(1))!
      section.scrollIntoView()
      section.querySelector('h2')!.focus({ preventScroll: true })
    }
  }))
  courseMenu.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !wide.matches && courseMenu.open) {
      courseMenu.open = false
      courseMenu.querySelector('summary')!.focus()
    }
  })
  syncSelection()
}

const tokenLab = document.querySelector<HTMLElement>('[data-token-lab]')
if (tokenLab) {
  const select = tokenLab.querySelector<HTMLSelectElement>('select')!
  select.addEventListener('change', () => {
    const tokens = tokenExamples[select.value as keyof typeof tokenExamples]
    const items = tokens.map((token, i) => {
      const item = document.createElement('li')
      const label = document.createElement('strong')
      const id = document.createElement('small')
      label.textContent = token
      id.textContent = `ID ${i + 1}`
      item.append(label, id)
      return item
    })
    tokenLab.querySelector('[data-token-output]')!.replaceChildren(...items)
    tokenLab.querySelector('[data-token-result]')!.textContent = `${tokens.length} tokens → ${tokens.length} IDs. Cada ID identifica una pieza en el vocabulario.`
  })
}

const bagLab = document.querySelector<HTMLElement>('[data-bag-lab]')
if (bagLab) {
  const select = bagLab.querySelector<HTMLSelectElement>('select')!
  select.addEventListener('change', () => {
    const text = bagExamples[Number(select.value)]
    const sentence = `${text[0].toUpperCase()}${text.slice(1)}.`
    bagLab.querySelector('[data-bag-sentence]')!.textContent = sentence
    bagLab.querySelector('[data-bag-result]')!.textContent = `${sentence} Cada palabra sigue apareciendo una vez, pero ha cambiado quién persigue a quién.`
  })
}

const attentionLab = document.querySelector<HTMLElement>('[data-attention-lab]')
if (attentionLab) {
  let position = 2
  const select = attentionLab.querySelector<HTMLSelectElement>('select')!
  const buttons = attentionLab.querySelectorAll<HTMLButtonElement>('[data-position]')
  const update = () => {
    const visible = visiblePositions(position, select.value === 'causal')
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === position)))
    attentionLab.querySelectorAll<HTMLElement>('.attention-strip li').forEach((item, i) => {
      item.dataset.visible = String(visible[i])
      item.querySelector('small')!.textContent = visible[i] ? 'Visible' : 'Oculto'
    })
    attentionLab.querySelector('[data-attention-result]')!.textContent = `Desde «${attentionTokens[position]}», el modelo puede usar: ${attentionTokens.filter((_, i) => visible[i]).join(', ')}.`
  }
  select.addEventListener('change', update)
  buttons.forEach((button, i) => button.addEventListener('click', () => { position = i; update() }))
}

document.querySelectorAll<HTMLElement>('[data-lab-controls]').forEach(controls => { controls.hidden = false })

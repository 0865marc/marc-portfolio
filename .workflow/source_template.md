# Marc — Fullstack Developer portfolio landing prompt

Build a Fullstack Developer portfolio landing page for **"Marc"** using React, TypeScript, Tailwind CSS, Framer Motion, and Lucide React. The page has a dark theme (`#0C0C0C` background) with the font **Kanit** (Google Fonts, weights 300-900). The page title is **"Marc -- Fullstack Developer"**.

## GLOBAL STYLES

- Background: `#0C0C0C` on `html`, `body`, `#root`, and the main wrapper.
- Font family: `'Kanit', sans-serif`.
- Global reset: `box-sizing: border-box`, `margin: 0`, `padding: 0`.
- CSS class `.hero-heading`: gradient text using:
  `background: linear-gradient(180deg, #646973 0%, #BBCCD7 100%)`
  with `-webkit-background-clip: text` and `-webkit-text-fill-color: transparent`.
- Main wrapper has `overflowX: 'clip'`.

## SECTION ORDER

1. `HeroSection`
2. `MarqueeSection`
3. `AboutSection`
4. `ServicesSection`
5. `BlogSection`
6. `ProjectsSection`

---

# 1. HERO SECTION

Full viewport height (`h-screen`), flex column layout with `overflowX: clip`.

## Navbar

Horizontal nav bar with 4 links:

- `About`
- `Blog`
- `Projects`
- `Contact`

This replaces the original `Price` navigation item with `Blog`.

Navbar styling:

- Evenly spaced with `justify-between`.
- Text color: `#D7E2EA`.
- `font-medium`, `uppercase`, `tracking-wider`.
- Sizes: `text-sm md:text-lg lg:text-[1.4rem]`.
- Padding: `px-6 md:px-10 pt-6 md:pt-8`.
- Hover: `opacity 70%` with `200ms` transition.

## Hero Heading

Massive `h1` with text:

```text
Hi, i'm marc
```

- Use lowercase `i` and curly apostrophe via `&apos;`.
- Uses `.hero-heading` gradient text class.
- `font-black`, `uppercase`, `tracking-tight`, `leading-none`, `whitespace-nowrap`, `w-full`.
- Font sizes: `text-[14vw] sm:text-[15vw] md:text-[16vw] lg:text-[17.5vw]`.
- Margin top: `mt-6 sm:mt-4 md:-mt-5`.
- Wrapped in an `overflow-hidden` container.

## Bottom bar

Flexbox `justify-between items-end` with `pb-7 sm:pb-8 md:pb-10`.

Left paragraph:

```text
a fullstack developer crafting polished apps, robust systems, and memorable digital products
```

- Color: `#D7E2EA`.
- `font-light`, `uppercase`, `tracking-wide`, `leading-snug`.
- Font size: `clamp(0.75rem, 1.4vw, 1.5rem)`.
- Max-width: `max-w-[160px] sm:max-w-[220px] md:max-w-[260px]`.

Right:

- `ContactButton` component.

## Hero Portrait

Centered absolutely. Uses a `Magnet` component (mouse-following magnetic effect) wrapping an image.

Image URL:

```text
https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png
```

Magnet settings:

- `padding: 150`
- `strength: 3`
- `activeTransition: "transform 0.3s ease-out"`
- `inactiveTransition: "transform 0.6s ease-in-out"`

Positioning:

- `absolute left-1/2 -translate-x-1/2 z-10`
- Width: `w-[280px] sm:w-[360px] md:w-[440px] lg:w-[520px]`
- On mobile: `top-1/2 -translate-y-1/2`
- On `sm+`: `sm:top-auto sm:translate-y-0 sm:bottom-0`

## FadeIn animations

- Navbar: delay `0`, `y -20`.
- Heading: delay `0.15`, `y 40`.
- Left text: delay `0.35`, `y 20`.
- Contact button: delay `0.5`, `y 20`.
- Portrait: delay `0.6`, `y 30`.

---

# 2. MARQUEE SECTION

Two rows of images that scroll horizontally based on page scroll position.

- Background: `#0C0C0C`.
- Padding: `pt-24 sm:pt-32 md:pt-40 pb-10`.

## GIF images

Use these exact 21 GIF images from `motionsites.ai`:

```text
https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif
https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif
https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif
https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif
https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif
https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif
https://motionsites.ai/assets/hero-vitara-preview-Cjz2QYyU.gif
https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif
https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif
https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif
https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif
https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif
https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif
https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif
https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif
https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif
https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif
https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif
https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif
https://motionsites.ai/assets/hero-luminex-preview-CxOP7ce6.gif
https://motionsites.ai/assets/hero-celestia-preview-0yO3jXO8.gif
```

## Row behavior

- Row 1: first 11 images, tripled for seamless scrolling. Moves RIGHT on scroll with:
  `translateX(offset - 200)`.
- Row 2: remaining 10 images, tripled for seamless scrolling. Moves LEFT on scroll with:
  `translateX(-(offset - 200))`.
- Scroll offset calculation:
  `(window.scrollY - sectionTop + window.innerHeight) * 0.3`.
- Each image tile:
  - `420px x 270px`
  - `rounded-2xl`
  - `object-cover`
  - lazy loaded
- Gap between tiles: `gap-3`.
- Gap between rows: `gap-3`.
- Use `willChange: 'transform'` for performance.
- Scroll listener is passive.

---

# 3. ABOUT SECTION

Full-height centered section with:

- `min-h-screen`
- `px-5 sm:px-8 md:px-10 py-20`

## Decorative 3D images

Four decorative 3D images positioned absolutely in corners.

### Top-left: Moon icon

URL:

```text
https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png
```

- Width: `w-[120px] sm:w-[160px] md:w-[210px]`
- Position: `top-[4%] left-[1%] sm:left-[2%] md:left-[4%]`
- FadeIn: delay `0.1`, `x -80`, `y 0`, duration `0.9`

### Bottom-left: 3D object

URL:

```text
https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png
```

- Width: `w-[100px] sm:w-[140px] md:w-[180px]`
- Position: `bottom-[8%] left-[3%] sm:left-[6%] md:left-[10%]`
- FadeIn: delay `0.25`, `x -80`, `y 0`, duration `0.9`

### Top-right: Lego icon

URL:

```text
https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png
```

- Width: `w-[120px] sm:w-[160px] md:w-[210px]`
- Position: `top-[4%] right-[1%] sm:right-[2%] md:right-[4%]`
- FadeIn: delay `0.15`, `x 80`, `y 0`, duration `0.9`

### Bottom-right: 3D group

URL:

```text
https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png
```

- Width: `w-[130px] sm:w-[170px] md:w-[220px]`
- Position: `bottom-[8%] right-[3%] sm:right-[6%] md:right-[10%]`
- FadeIn: delay `0.3`, `x 80`, `y 0`, duration `0.9`

## Heading

Text:

```text
About me
```

- Uses `.hero-heading` gradient text.
- `font-black`, `uppercase`, `leading-none`, `tracking-tight`, centered.
- Font size: `clamp(3rem, 12vw, 160px)`.
- FadeIn: delay `0`, `y 40`.

## Animated paragraph

Use a character-by-character scroll-driven opacity animation.

Text:

```text
I'm Marc, a fullstack developer focused on building fast, polished, and reliable digital products. I work across frontend, backend, integrations, automation, and user experience to turn ideas into scalable web applications. Let's build something incredible together!
```

Styling:

- Color: `#D7E2EA`.
- `font-medium`, centered, `leading-relaxed`.
- `max-w-[560px]`.
- Font size: `clamp(1rem, 2vw, 1.35rem)`.
- Each character animates from opacity `0.2` to `1` based on scroll progress.
- Scroll offset: `['start 0.8', 'end 0.2']`.

## Contact button

- Contact button below the text block.
- Gap between heading/text: `gap-10 sm:gap-14 md:gap-16`.
- Gap between text block and button: `gap-16 sm:gap-20 md:gap-24`.

---

# 4. SERVICES SECTION

White background (`#FFFFFF`) with rounded top corners:

- `rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px]`
- Padding: `px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32`

## Heading

Text:

```text
Services
```

- Color: `#0C0C0C`.
- `font-black`, `uppercase`, centered.
- Font size: `clamp(3rem, 12vw, 160px)`.
- Margin bottom: `mb-16 sm:mb-20 md:mb-28`.

## Service items

5 service items in a vertical list, `max-w-5xl`, centered.

Each item:

- Horizontal layout with number on the left.
- Number: `font-black`, font size `clamp(3rem, 10vw, 140px)`, color `#0C0C0C`.
- Name + description stacked vertically on the right.
- Name: `font-medium`, uppercase, font size `clamp(1rem, 2.2vw, 2.1rem)`.
- Description: `font-light`, `leading-relaxed`, `max-w-2xl`, font size `clamp(0.85rem, 1.6vw, 1.25rem)`, opacity `0.6`.
- Items separated by `1px` borders: `rgba(12, 12, 12, 0.15)`.
- Padding: `py-8 sm:py-10 md:py-12`.
- Staggered FadeIn: each item delays by `i * 0.1`.

Service data:

1. `01` — `Frontend Development`  
   `Building polished, responsive, and accessible interfaces with strong attention to motion, layout, performance, and mobile-first usability.`

2. `02` — `Backend Architecture`  
   `Designing reliable APIs, data models, authentication flows, and server-side systems that keep products stable and scalable.`

3. `03` — `Fullstack Web Apps`  
   `Creating complete web applications from concept to launch, connecting product thinking, frontend quality, backend logic, and deployment.`

4. `04` — `Integrations & Automation`  
   `Connecting services, workflows, APIs, webhooks, and internal tools so businesses can move faster with fewer manual processes.`

5. `05` — `Product UX & Iteration`  
   `Improving flows, dashboards, forms, and user journeys with practical UX decisions grounded in real usage and measurable outcomes.`

---

# 5. BLOG SECTION

This section replaces the original `Price` section. It should feel editorial, premium, and useful: not a pricing table.

Background:

- `#FFFFFF`, continuing naturally after `ServicesSection`.
- Use dark text: `#0C0C0C`.
- Padding: `px-5 sm:px-8 md:px-10 pb-24 sm:pb-28 md:pb-36`.

## Heading

Text:

```text
Blog
```

- Color: `#0C0C0C`.
- `font-black`, `uppercase`, centered.
- Font size: `clamp(3rem, 12vw, 160px)`.
- Margin bottom: `mb-12 sm:mb-16 md:mb-20`.

## Intro copy

Centered paragraph below the heading:

```text
Thoughts on frontend, backend, product engineering, automation, and building digital experiences that feel fast, reliable, and memorable.
```

- Color: `#0C0C0C`.
- Opacity: `0.6`.
- `font-light`, centered.
- `max-w-2xl mx-auto`.
- Font size: `clamp(1rem, 1.7vw, 1.35rem)`.
- Margin bottom: `mb-12 sm:mb-16`.

## Blog cards

Use a responsive 3-card grid:

- Wrapper: `max-w-6xl mx-auto`.
- Grid: `grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4`.
- Each card:
  - `rounded-[28px] sm:rounded-[34px] md:rounded-[40px]`
  - Border: `1px solid rgba(12, 12, 12, 0.15)`
  - Background: `#FFFFFF`
  - Padding: `p-6 sm:p-7 md:p-8`
  - `min-h-[320px]`
  - Flex column, `justify-between`
  - Hover: subtle lift with `-translate-y-1`, shadow, and border opacity change.
  - Transition: `300ms ease`.

Each card has:

- Top meta row: category + date.
- Category: uppercase, tracking-widest, `font-medium`, text size `text-xs`, opacity `0.55`.
- Date: same style, aligned right.
- Title: `font-medium`, uppercase, line-height tight, font size `clamp(1.35rem, 2.4vw, 2rem)`.
- Excerpt: `font-light`, opacity `0.6`, `leading-relaxed`, text size `text-sm sm:text-base`.
- Bottom link: `Read Article`, uppercase, tracking-widest, `font-medium`, with an `ArrowUpRight` Lucide icon.

Blog data:

1. Category: `Frontend`  
   Date: `01 / 2026`  
   Title: `How I turn product ideas into polished interfaces`  
   Excerpt: `A practical look at translating requirements into responsive layouts, accessible components, and interactions that feel fast and natural.`

2. Category: `Backend`  
   Date: `02 / 2026`  
   Title: `The quiet systems behind reliable web products`  
   Excerpt: `APIs, data models, authentication, queues, and integrations are invisible when they work well. That is exactly the point.`

3. Category: `Automation`  
   Date: `03 / 2026`  
   Title: `Building workflows that save teams real time`  
   Excerpt: `How webhooks, dashboards, scripts, and internal tools can remove repetitive work and make operations easier to trust.`

## Blog CTA

Below the grid, centered button after `mt-12 sm:mt-16`:

- Reuse `LiveProjectButton` styling but label it:

```text
Read More
```

- On hover: `bg-[#0C0C0C]/5` because the section is light.
- It may link to `/blog` or `#blog` as a placeholder.

## FadeIn animation

- Heading: delay `0`, `y 40`.
- Intro copy: delay `0.15`, `y 24`.
- Blog cards: stagger delay `i * 0.1 + 0.25`, `y 30`.
- Blog CTA: delay `0.55`, `y 20`.

---

# 6. PROJECTS SECTION

Dark background (`#0C0C0C`), rounded top corners:

- `rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px]`
- Pulled up with `-mt-10 sm:-mt-12 md:-mt-14`
- `z-10`

## Heading

Text:

```text
Project
```

- Singular.
- Uses `.hero-heading` gradient.
- Same styling as other headings.

## Sticky project cards

3 sticky-stacking project cards that scale down as you scroll past them.

Use Framer Motion `useScroll` and `useTransform`.

- Each card is sticky `top-24 md:top-32` inside an `h-[85vh]` container.
- Scale calculation:
  `targetScale = 1 - (totalCards - 1 - index) * 0.03`
- Each card offset by:
  `top: ${index * 28}px`

Each card:

- `rounded-[40px] sm:rounded-[50px] md:rounded-[60px]`
- `border-2 border-[#D7E2EA]`
- Background: `#0C0C0C`
- Padding: `p-4 sm:p-6 md:p-8`

## Card layout

Top row:

- Number, huge, same style as services.
- Category label.
- Project name.
- `LiveProjectButton` ghost button.

Bottom row:

- Two-column image grid.
- Left column: `40%` width, 2 stacked images.
- Right column: `60%` width, 1 tall image.
- All images have heavy border radius: `rounded-[40px] sm:rounded-[50px] md:rounded-[60px]`.
- Left top image height: `clamp(130px, 16vw, 230px)`.
- Left bottom image height: `clamp(160px, 22vw, 340px)`.

## Project data

### Project 01 — `Ainki Learning Platform` (`Client`)

Col1 image 1:

```text
https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db.png&w=1280&q=85
```

Col1 image 2:

```text
https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8.png&w=1280&q=85
```

Col2 image:

```text
https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327.png&w=1280&q=85
```

### Project 02 — `Gym Tracker` (`Personal`)

Col1 image 1:

```text
https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f.png&w=1280&q=85
```

Col1 image 2:

```text
https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1.png&w=1280&q=85
```

Col2 image:

```text
https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea.png&w=1280&q=85
```

### Project 03 — `Automation Systems` (`Client`)

Col1 image 1:

```text
https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f.png&w=1280&q=85
```

Col1 image 2:

```text
https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b.png&w=1280&q=85
```

Col2 image:

```text
https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee.png&w=1280&q=85
```

---

# REUSABLE COMPONENTS

## ContactButton

Rounded-full pill button with gradient background:

```css
linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)
```

- Inner box-shadow:
  - `0px 4px 4px rgba(181, 1, 167, 0.25)`
  - `4px 4px 12px #7721B1 inset`
- White `2px` outline with `-3px` offset.
- Text: white, `font-medium`, uppercase, `tracking-widest`.
- Sizes: `px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4`.
- Text sizes: `text-xs sm:text-sm md:text-base`.
- Label:

```text
Contact Me
```

## LiveProjectButton

Ghost/outline pill button.

- `rounded-full`
- `border-2 border-[#D7E2EA]`
- Text color: `#D7E2EA`
- `font-medium`, uppercase, `tracking-widest`
- Sizes: `px-8 py-3 sm:px-10 sm:py-3.5`
- Text sizes: `text-sm sm:text-base`
- Hover: `bg-[#D7E2EA]/10`
- Label:

```text
Live Project
```

## FadeIn

Framer Motion wrapper using `whileInView` with:

```tsx
viewport={{ once: true, margin: "50px", amount: 0 }}
```

Accepts:

- `delay`
- `duration` default `0.7`
- `x` default `0`
- `y` default `30`

Easing:

```ts
[0.25, 0.1, 0.25, 1]
```

Uses `motion.create()` for dynamic element types.

## Magnet

Mouse-following magnetic hover effect.

- Tracks mouse position relative to element center.
- Applies `translate3d` transform divided by strength factor.
- Activates when cursor is within padding distance of element edge.
- Smooth transition in: `0.3s ease-out`.
- Smooth transition out: `0.6s ease-in-out`.
- Uses `willChange: 'transform'`.

## AnimatedText

Character-by-character scroll-reveal text animation.

- Each character goes from opacity `0.2` to `1` based on its position in the text relative to scroll progress.
- Uses Framer Motion `useScroll` targeting the paragraph element with offset:

```ts
['start 0.8', 'end 0.2']
```

- Each character uses invisible placeholder + absolute positioned animated span.

---

# KEY DEPENDENCIES

- `react`, `react-dom` `^18.3.1`
- `framer-motion` `^12.38.0`
- `lucide-react` `^0.344.0`
- `tailwindcss` `^3.4.1`
- `vite`
- `typescript`

---

# RESPONSIVE BREAKPOINTS

All sections use Tailwind's default breakpoints:

- `sm`: `640px`
- `md`: `768px`
- `lg`: `1024px`

Use a mobile-first approach with heavy use of `clamp()` for fluid typography. The entire design should scale gracefully from mobile to ultra-wide screens.

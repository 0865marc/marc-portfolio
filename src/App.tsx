import { useEffect, useState } from 'react'
import { AboutSection } from './components/AboutSection'
import { BlogSection } from './components/BlogSection'
import { BlogIndexView } from './components/BlogIndexView'
import { BlogPostView } from './components/BlogPostView'
import { HeroSection } from './components/HeroSection'
import { MarqueeSection } from './components/MarqueeSection'
import { ProjectsSection } from './components/ProjectsSection'
import { ServicesSection } from './components/ServicesSection'
import { parseHash, type AppRoute } from './lib/blogRoutes'

function App() {
  const [route, setRoute] = useState<AppRoute>(() => parseHash(window.location.hash))

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash(window.location.hash))
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (route.view === 'landing') {
        if (route.anchor !== 'blog') {
          return
        }

        document.getElementById('blog')?.scrollIntoView({ behavior: 'auto' })
        document.getElementById('blog-title')?.focus({ preventScroll: true })
        return
      }

      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      document.querySelector<HTMLElement>('[data-route-heading="true"]')?.focus({ preventScroll: true })
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [route])

  if (route.view === 'blog-index') {
    return <BlogIndexView />
  }

  if (route.view === 'blog-post') {
    return <BlogPostView postId={route.id} source={route.source} />
  }

  return (
    <div className="app-shell min-h-screen bg-[#0C0C0C]">
      <main>
        <HeroSection />
        <MarqueeSection />
        <AboutSection />
        <ServicesSection />
        <BlogSection />
        <ProjectsSection />
      </main>
    </div>
  )
}

export default App

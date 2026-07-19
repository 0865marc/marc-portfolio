import { AboutSection } from './components/AboutSection'
import { BlogSection } from './components/BlogSection'
import { HeroSection } from './components/HeroSection'
import { MarqueeSection } from './components/MarqueeSection'
import { ProjectsSection } from './components/ProjectsSection'
import { ServicesSection } from './components/ServicesSection'

function App() {
  return (
    <div className="app-shell min-h-screen bg-[#0C0C0C]">
      <HeroSection />
      <MarqueeSection />
      <AboutSection />
      <ServicesSection />
      <BlogSection />
      <ProjectsSection />
    </div>
  )
}

export default App

import { HomeBlog } from './HomeBlog'
import { HomeHero } from './HomeHero'
import { HomeProjects } from './HomeProjects'

export function PublicHomePage() {
  return (
    <main>
      <HomeHero />
      <HomeProjects />
      <HomeBlog />
    </main>
  )
}

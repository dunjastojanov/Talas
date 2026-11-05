import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { loadPublishedProjects, type PublicProjectListRow } from '../lib/loadPublicProjects'
import { ProjectCarousel } from './ProjectCarousel'

export function HomeProjects() {
  const { t } = useTranslation()
  const [projects, setProjects] = useState<PublicProjectListRow[]>([])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const { projects: rows } = await loadPublishedProjects()
      if (!cancelled) setProjects(rows.filter((project) => project.cover_image_path))
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="relative w-full overflow-hidden py-24 sm:py-32 lg:flex lg:min-h-[64rem] lg:items-center lg:justify-center lg:py-0">
      <img
        src="/home/projects_background.png"
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover select-none"
      />
      <div className="relative flex flex-col items-center justify-center px-4">
        <h2 className="flex items-center justify-center gap-2 text-center font-display text-2xl text-white sm:gap-3 sm:text-3xl lg:gap-4 lg:text-4xl">
          <img
            src="/home/sparkles-left.svg"
            alt=""
            aria-hidden
            className="h-6 w-auto shrink-0 sm:h-10 lg:h-16"
          />
          {t('projects')}
          <img
            src="/home/sparkles-right.svg"
            alt=""
            aria-hidden
            className="h-7 w-auto shrink-0 sm:h-12 lg:h-[4.5rem]"
          />
        </h2>
        <ProjectCarousel projects={projects} className="mt-8 sm:mt-10" />
      </div>
    </section>
  )
}

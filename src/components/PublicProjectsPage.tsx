import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { loadPublishedProjects } from '../lib/loadPublicProjects'
import type { PublicProjectListRow } from '../lib/loadPublicProjects'
import { PublicProjectCard } from './PublicProjectCard'
import { Skeleton } from './Skeleton'

function PublicProjectCardSkeleton() {
  return (
    <div className="flex w-full flex-col">
      <Skeleton className="h-9 w-2/3 max-w-md" />
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:gap-12">
        <Skeleton className="aspect-[16/10] w-full rounded-lg lg:flex-[2]" />
        <div className="flex min-w-0 flex-col lg:flex-[3]">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-4/5" />
          <div className="mt-4 flex justify-end lg:mt-auto lg:pt-4">
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function PublicProjectsPage() {
  const { t } = useTranslation()
  const [projects, setProjects] = useState<PublicProjectListRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      setError(null)
      const { projects: rows, error: fetchError } = await loadPublishedProjects()
      if (cancelled) return
      if (fetchError) {
        setError(fetchError)
        setProjects([])
      } else {
        setProjects(rows)
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="public-page-x w-full py-8 sm:py-10">
      <h1 className="font-display text-2xl text-blue-800 sm:text-3xl lg:text-4xl">{t('projects')}</h1>

      <div className="mt-8">
        {loading ? (
          <ul className="flex list-none flex-col gap-12 p-0" aria-busy="true" aria-label={t('loading')}>
            {Array.from({ length: 3 }, (_, i) => (
              <li key={i} className="w-full">
                <PublicProjectCardSkeleton />
              </li>
            ))}
          </ul>
        ) : error ? (
          <p className="text-red-700">{t('projectsLoadError')}</p>
        ) : projects.length === 0 ? (
          <p className="text-black">{t('projectsEmpty')}</p>
        ) : (
          <ul className="flex list-none flex-col gap-12 p-0">
            {projects.map((project) => (
              <li key={project.id} className="w-full">
                <PublicProjectCard project={project} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth-context'
import type { ContentKind } from '../lib/contentKind'
import { contentKindConfig } from '../lib/contentKind'
import { loadAdminContent } from '../lib/loadAdminProjects'
import { loadOwnProfile } from '../lib/profile'
import type { ProjectListRow } from '../lib/projects'
import { DashboardContentCard } from './DashboardContentCard'
import { DashboardContentCardSkeleton } from './DashboardContentCardSkeleton'
import { Skeleton } from './Skeleton'

const LATEST_LIMIT = 6

type SectionState = {
  items: ProjectListRow[]
  error: boolean
}

const emptySection: SectionState = { items: [], error: false }

export function AdminDashboardPage() {
  const { t } = useTranslation()
  const { session } = useAuth()
  const userId = session?.user.id

  const [nameLoading, setNameLoading] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [contentLoading, setContentLoading] = useState(true)
  const [projects, setProjects] = useState<SectionState>(emptySection)
  const [posts, setPosts] = useState<SectionState>(emptySection)

  useEffect(() => {
    if (!userId) return
    const id = userId
    let cancelled = false

    async function loadName() {
      setNameLoading(true)
      const { profile } = await loadOwnProfile(id)
      if (cancelled) return
      setFirstName(profile?.first_name ?? '')
      setLastName(profile?.last_name ?? '')
      setNameLoading(false)
    }

    void loadName()
    return () => {
      cancelled = true
    }
  }, [userId])

  useEffect(() => {
    let cancelled = false

    async function loadLatest() {
      setContentLoading(true)
      const [projectResult, blogResult] = await Promise.all([
        loadAdminContent('project'),
        loadAdminContent('blog'),
      ])
      if (cancelled) return
      setProjects({
        items: projectResult.error ? [] : projectResult.items.slice(0, LATEST_LIMIT),
        error: Boolean(projectResult.error),
      })
      setPosts({
        items: blogResult.error ? [] : blogResult.items.slice(0, LATEST_LIMIT),
        error: Boolean(blogResult.error),
      })
      setContentLoading(false)
    }

    void loadLatest()
    return () => {
      cancelled = true
    }
  }, [])

  const fullName = `${firstName} ${lastName}`.trim()

  return (
    <main className="px-4 py-6 lg:px-12 lg:py-10">
      {nameLoading ? (
        <Skeleton className="h-10 w-72 max-w-full sm:h-12" aria-label={t('loading')} />
      ) : (
        <h1 className="font-display text-3xl text-blue-800 sm:text-4xl">
          {fullName ? t('welcome', { name: fullName }) : t('welcome', { name: '' }).trim()}
        </h1>
      )}

      <DashboardSection
        kind="project"
        title={t('latestProjects')}
        state={projects}
        loading={contentLoading}
      />
      <DashboardSection kind="blog" title={t('latestPosts')} state={posts} loading={contentLoading} />
    </main>
  )
}

function DashboardSection({
  kind,
  title,
  state,
  loading,
}: {
  kind: ContentKind
  title: string
  state: SectionState
  loading: boolean
}) {
  const { t } = useTranslation()
  const copy = contentKindConfig[kind].copy

  return (
    <section className="mt-10">
      <h2 className="mb-4 font-display text-2xl text-blue-800">{title}</h2>
      {loading ? (
        <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label={t('loading')}>
          {Array.from({ length: 3 }, (_, index) => (
            <li key={index}>
              <DashboardContentCardSkeleton />
            </li>
          ))}
        </ul>
      ) : state.error ? (
        <p className="text-red-700">{t(copy.loadError)}</p>
      ) : state.items.length === 0 ? (
        <p className="text-green-800">{t(copy.empty)}</p>
      ) : (
        <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 xl:grid-cols-3">
          {state.items.map((item) => (
            <li key={item.id}>
              <DashboardContentCard kind={kind} item={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

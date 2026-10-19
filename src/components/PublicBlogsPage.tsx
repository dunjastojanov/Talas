import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { loadPublishedBlogs } from '../lib/loadPublicBlogs'
import type { PublicBlogListRow } from '../lib/loadPublicBlogs'
import { PublicBlogCard } from './PublicBlogCard'
import { Skeleton } from './Skeleton'

function PublicBlogCardSkeleton() {
  return (
    <div className="flex w-full flex-col">
      <Skeleton className="h-9 w-2/3 max-w-md" />
      <Skeleton className="mt-2 h-5 w-40" />
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:gap-12">
        <Skeleton className="aspect-[16/10] w-full rounded-lg lg:flex-[2]" />
        <div className="flex min-w-0 flex-col lg:flex-[3]">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-4/5" />
          <div className="mt-4 flex items-center justify-between gap-4 lg:mt-auto lg:pt-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-9 w-28 shrink-0 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function PublicBlogsPage() {
  const { t } = useTranslation()
  const [blogs, setBlogs] = useState<PublicBlogListRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      setError(null)
      const { blogs: rows, error: fetchError } = await loadPublishedBlogs()
      if (cancelled) return
      if (fetchError) {
        setError(fetchError)
        setBlogs([])
      } else {
        setBlogs(rows)
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="public-page-x w-full py-8 sm:py-10">
      <h1 className="font-display text-2xl text-blue-800 sm:text-3xl lg:text-4xl">{t('blog')}</h1>
      <p className="mt-4 text-base text-black">{t('blogSubtitle')}</p>

      <div className="mt-8">
        {loading ? (
          <ul className="flex list-none flex-col gap-12 p-0" aria-busy="true" aria-label={t('loading')}>
            {Array.from({ length: 3 }, (_, i) => (
              <li key={i} className="w-full">
                <PublicBlogCardSkeleton />
              </li>
            ))}
          </ul>
        ) : error ? (
          <p className="text-red-700">{t('blogsLoadError')}</p>
        ) : blogs.length === 0 ? (
          <p className="text-black">{t('blogsEmpty')}</p>
        ) : (
          <ul className="flex list-none flex-col gap-12 p-0">
            {blogs.map((blog) => (
              <li key={blog.id} className="w-full">
                <PublicBlogCard blog={blog} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}

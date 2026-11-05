import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { isLanguage, type Language } from '../i18n'
import { contentImageUrl } from '../lib/contentImages'
import { formatProjectDate } from '../lib/formatDate'
import { loadPublishedBlogs, type PublicBlogListRow } from '../lib/loadPublicBlogs'
import { projectTitle } from '../lib/projects'
import { Skeleton } from './Skeleton'

const HOME_BLOG_LIMIT = 4

const moreButtonClass =
  'inline-flex items-center justify-center rounded-[10px] border-[3px] border-blue-800 bg-white px-4 py-2 text-sm text-blue-800 hover:bg-blue-800/5 sm:text-base'

function HomeBlogCard({ blog }: { blog: PublicBlogListRow }) {
  const { t } = useTranslation()
  const { lang } = useParams()
  const language: Language = isLanguage(lang) ? lang : 'en'
  const title = projectTitle(blog, language)
  const date = formatProjectDate(blog.published_at, language)
  const href = `/${language}/blog/${blog.slug}`

  return (
    <article className="flex min-w-0 flex-col">
      <Link to={href} className="block overflow-hidden rounded-3xl bg-blue-800/10">
        {blog.cover_image_path ? (
          <img
            src={contentImageUrl(blog.cover_image_path)}
            alt=""
            className="aspect-[2/1] w-full object-cover"
          />
        ) : (
          <div className="aspect-[2/1] w-full" aria-hidden />
        )}
      </Link>
      <div className="mt-2 flex items-start justify-between gap-2">
        <h3 className="min-w-0 font-display text-xl leading-tight text-blue-800 sm:text-3xl">
          <Link to={href} className="hover:text-blue-500">
            {title}
          </Link>
        </h3>
        {date ? (
          <time
            dateTime={blog.published_at ?? undefined}
            className="shrink-0 pt-0.5 text-sm text-black"
          >
            {date}
          </time>
        ) : null}
      </div>
      <div className="mt-1 flex justify-end">
        <Link to={href} className={moreButtonClass}>
          {t('homeBlogMore')}
        </Link>
      </div>
    </article>
  )
}

function HomeBlogCardSkeleton() {
  return (
    <div className="flex min-w-0 flex-col">
      <Skeleton className="aspect-[2/1] w-full rounded-3xl" />
      <div className="mt-3 flex items-start justify-between gap-3">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-5 w-16 shrink-0" />
      </div>
      <div className="mt-3 flex justify-end">
        <Skeleton className="h-12 w-36 rounded-[10px]" />
      </div>
    </div>
  )
}

export function HomeBlog() {
  const { t } = useTranslation()
  const [blogs, setBlogs] = useState<PublicBlogListRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const { blogs: rows } = await loadPublishedBlogs()
      if (!cancelled) {
        setBlogs(rows.slice(0, HOME_BLOG_LIMIT))
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="relative">
      <div className="public-page-x relative z-20 overflow-hidden pt-8 sm:pt-12">
        <h2 className="text-left font-display text-2xl text-blue-800 sm:text-3xl lg:text-4xl">
          {t('blog')}
        </h2>
        {loading ? (
          <ul
            className="mt-6 grid w-full list-none grid-cols-1 gap-y-10 p-0 pb-16 sm:mt-8 sm:gap-y-14 sm:pb-24 lg:grid-cols-2 lg:gap-x-20 lg:gap-y-20 lg:pb-0"
            aria-busy="true"
            aria-label={t('loading')}
          >
            {Array.from({ length: HOME_BLOG_LIMIT }, (_, index) => (
              <li key={index}>
                <HomeBlogCardSkeleton />
              </li>
            ))}
          </ul>
        ) : blogs.length === 0 ? (
          <p className="mt-8 text-black">{t('blogsEmpty')}</p>
        ) : (
          <ul className="mt-6 grid w-full list-none grid-cols-1 gap-y-10 p-0 pb-16 sm:mt-8 sm:gap-y-14 sm:pb-24 lg:grid-cols-2 lg:gap-x-20 lg:gap-y-20 lg:pb-0">
            {blogs.map((blog) => (
              <li key={blog.id} className="min-w-0">
                <HomeBlogCard blog={blog} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="relative z-10 -mt-16 overflow-hidden sm:-mt-28">
        <img
          src="/home/footer_top_drawings.png"
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none relative block h-auto w-full select-none"
        />
      </div>
    </section>
  )
}

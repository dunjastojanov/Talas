import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { isLanguage, type Language } from '../i18n'
import { formatProjectDate } from '../lib/formatDate'
import { contentImageUrl } from '../lib/contentImages'
import { loadPublishedBlog } from '../lib/loadPublicBlogs'
import type { PublicBlogDetail } from '../lib/loadPublicBlogs'
import type { PublicContentBlock } from '../lib/projects'
import { authorDisplayName, projectTitle } from '../lib/projects'
import { normalizeTipTapDoc } from '../lib/tiptapDoc'
import { PageBanner } from './PageBanner'
import { RichTextContent } from './RichTextContent'
import { Skeleton } from './Skeleton'

function blockAlt(block: PublicContentBlock, language: Language) {
  return language === 'sr' ? (block.alt_sr ?? '') : (block.alt_en ?? '')
}

function blockBody(block: PublicContentBlock, language: Language) {
  const raw = language === 'sr' ? block.body_sr : block.body_en
  return normalizeTipTapDoc(raw)
}

export function PublicBlogPage() {
  const { t } = useTranslation()
  const { slug } = useParams()
  const { lang } = useParams()
  const language: Language = isLanguage(lang) ? lang : 'en'
  const [blog, setBlog] = useState<PublicBlogDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) {
      setNotFound(true)
      setLoading(false)
      return
    }

    let cancelled = false
    void (async () => {
      setLoading(true)
      setError(null)
      setNotFound(false)
      const { blog: row, error: fetchError } = await loadPublishedBlog(slug)
      if (cancelled) return
      if (fetchError) {
        setError(fetchError)
        setBlog(null)
      } else if (!row) {
        setNotFound(true)
        setBlog(null)
      } else {
        setBlog(row)
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <>
        <PageBanner title={t('blog')} />
        <Skeleton className="h-[40svh] max-h-[40svh] w-full rounded-none" />
        <main className="public-page-x py-8 sm:py-10">
          <Skeleton className="h-5 w-40" />
          <div className="mt-8 space-y-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageBanner title={t('blog')} />
        <main className="public-page-x py-8 sm:py-10">
          <p className="text-red-700">{t('postLoadError')}</p>
        </main>
      </>
    )
  }

  if (notFound || !blog) {
    return (
      <>
        <PageBanner title={t('blog')} />
        <main className="public-page-x py-8 sm:py-10">
          <p className="text-black">{t('postNotFound')}</p>
        </main>
      </>
    )
  }

  const title = projectTitle(blog, language)
  const date = formatProjectDate(blog.published_at, language)
  const author = authorDisplayName(blog.author)

  return (
    <>
      <PageBanner title={title} />
      {blog.cover_image_path ? (
        <div className="w-full max-h-[40svh] overflow-hidden">
          <img
            src={contentImageUrl(blog.cover_image_path)}
            alt=""
            className="block h-full max-h-[40svh] w-full object-cover object-center"
          />
        </div>
      ) : null}
      <main className="public-page-x py-8 sm:py-10">
        {date || author ? (
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-base text-black">
            {date ? (
              <time dateTime={blog.published_at ?? undefined}>{date}</time>
            ) : null}
            {author ? <span>{author}</span> : null}
          </p>
        ) : null}
        <div className="mt-8 flex w-full flex-col gap-8">
          {blog.blocks.map((block) => {
            if (block.block_type === 'text') {
              return (
                <div key={block.id} className="w-full">
                  <RichTextContent
                    content={blockBody(block, language)}
                    className="leading-relaxed"
                  />
                </div>
              )
            }
            if (!block.image_path) return null
            return (
              <figure key={block.id} className="w-full">
                <img
                  src={contentImageUrl(block.image_path)}
                  alt={blockAlt(block, language)}
                  className="block h-auto w-full"
                />
              </figure>
            )
          })}
        </div>
      </main>
    </>
  )
}

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { isLanguage, type Language } from '../i18n'
import { contentImageUrl } from '../lib/contentImages'
import { loadPublishedProject } from '../lib/loadPublicProjects'
import type { PublicProjectDetail } from '../lib/loadPublicProjects'
import type { ContentBlockRow } from '../lib/projects'
import { projectTitle } from '../lib/projects'
import { normalizeTipTapDoc } from '../lib/tiptapDoc'
import { RichTextContent } from './RichTextContent'
import { Skeleton } from './Skeleton'

function blockAlt(block: ContentBlockRow, language: Language) {
  return language === 'sr' ? (block.alt_sr ?? '') : (block.alt_en ?? '')
}

function blockBody(block: ContentBlockRow, language: Language) {
  const raw = language === 'sr' ? block.body_sr : block.body_en
  return normalizeTipTapDoc(raw)
}

export function PublicProjectPage() {
  const { t } = useTranslation()
  const { slug } = useParams()
  const { lang } = useParams()
  const language: Language = isLanguage(lang) ? lang : 'en'
  const [project, setProject] = useState<PublicProjectDetail | null>(null)
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
      const { project: row, error: fetchError } = await loadPublishedProject(slug)
      if (cancelled) return
      if (fetchError) {
        setError(fetchError)
        setProject(null)
      } else if (!row) {
        setNotFound(true)
        setProject(null)
      } else {
        setProject(row)
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
        <Skeleton className="h-[40svh] max-h-[40svh] w-full rounded-none" />
        <main className="public-page-x py-8 sm:py-10">
          <Skeleton className="h-10 w-2/3 max-w-md" />
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
      <main className="public-page-x py-8 sm:py-10">
        <p className="text-red-700">{t('projectLoadError')}</p>
      </main>
    )
  }

  if (notFound || !project) {
    return (
      <main className="public-page-x py-8 sm:py-10">
        <p className="text-black">{t('projectNotFound')}</p>
      </main>
    )
  }

  const title = projectTitle(project, language)

  return (
    <>
      {project.cover_image_path ? (
        <div className="w-full max-h-[40svh] overflow-hidden">
          <img
            src={contentImageUrl(project.cover_image_path)}
            alt=""
            className="block h-full max-h-[40svh] w-full object-cover object-center"
          />
        </div>
      ) : null}
      <main className="public-page-x py-8 sm:py-10">
        <h1 className="font-display text-2xl text-blue-800 sm:text-3xl lg:text-4xl">{title}</h1>
        <div className="mt-8 flex w-full flex-col gap-8">
          {project.blocks.map((block) => {
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

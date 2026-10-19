import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { isLanguage, type Language } from '../i18n'
import { formatProjectDate } from '../lib/formatDate'
import { contentImageUrl } from '../lib/contentImages'
import type { PublicBlogListRow } from '../lib/loadPublicBlogs'
import { authorDisplayName, projectDescription, projectTitle } from '../lib/projects'

type PublicBlogCardProps = {
  blog: PublicBlogListRow
}

const viewMoreClass =
  'inline-block rounded-md bg-gradient-to-r from-blue-800 to-blue-500 px-3 py-2 text-center text-sm text-white hover:opacity-95'

export function PublicBlogCard({ blog }: PublicBlogCardProps) {
  const { t } = useTranslation()
  const { lang } = useParams()
  const language: Language = isLanguage(lang) ? lang : 'en'
  const title = projectTitle(blog, language)
  const description = projectDescription(blog, language)
  const date = formatProjectDate(blog.published_at, language)
  const author = authorDisplayName(blog.author)
  const href = `/${language}/blog/${blog.slug}`

  return (
    <article className="flex w-full flex-col">
      <h2 className="font-display text-xl text-blue-800 sm:text-2xl lg:text-3xl">
        <Link to={href} className="hover:text-blue-500">
          {title}
        </Link>
      </h2>

      {date || author ? (
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-base text-black">
          {date ? (
            <time dateTime={blog.published_at ?? undefined}>{date}</time>
          ) : null}
          {author ? <span>{author}</span> : null}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:gap-12">
        <div className="min-w-0 lg:flex-[2]">
          <div className="overflow-hidden rounded-lg bg-blue-800/10">
            {blog.cover_image_path ? (
              <img
                src={contentImageUrl(blog.cover_image_path)}
                alt=""
                className="block aspect-[16/10] h-auto w-full object-cover"
              />
            ) : (
              <div className="aspect-[16/10] w-full" aria-hidden />
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-col lg:flex-[3]">
          <p className="text-base text-black">{description}</p>
          <div className="mt-4 flex justify-end lg:mt-auto lg:pt-4">
            <Link to={href} className={viewMoreClass}>
              {t('viewMore')}
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

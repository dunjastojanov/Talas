import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { isLanguage, type Language } from '../i18n'
import { contentImageUrl } from '../lib/contentImages'
import type { PublicProjectListRow } from '../lib/loadPublicProjects'
import { projectDescription, projectTitle } from '../lib/projects'

type PublicProjectCardProps = {
  project: PublicProjectListRow
}

const viewMoreClass =
  'inline-block rounded-md bg-gradient-to-r from-blue-800 to-blue-500 px-3 py-2 text-center text-sm text-white hover:opacity-95'

export function PublicProjectCard({ project }: PublicProjectCardProps) {
  const { t } = useTranslation()
  const { lang } = useParams()
  const language: Language = isLanguage(lang) ? lang : 'en'
  const title = projectTitle(project, language)
  const description = projectDescription(project, language)
  const href = `/${language}/projects/${project.slug}`

  return (
    <article className="flex w-full flex-col">
      <h2 className="font-display text-xl text-blue-800 sm:text-2xl lg:text-3xl">
        <Link to={href} className="hover:text-blue-500">
          {title}
        </Link>
      </h2>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:gap-12">
        <div className="min-w-0 lg:flex-[2]">
          <div className="overflow-hidden rounded-lg bg-blue-800/10">
            {project.cover_image_path ? (
              <img
                src={contentImageUrl(project.cover_image_path)}
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

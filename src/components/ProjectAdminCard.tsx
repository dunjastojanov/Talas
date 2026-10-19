import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import type { ContentKind } from '../lib/contentKind'
import { adminEditPath, contentKindConfig } from '../lib/contentKind'
import { isLanguage, type Language } from '../i18n'
import { contentImageUrl } from '../lib/contentImages'
import { projectDescription, projectTitle, type ProjectListRow } from '../lib/projects'
import { Button } from './Button'
import { ButtonIcon, buttonIcons } from './ButtonIcon'
import { ProjectDateReadout } from './ProjectDateReadout'

const deleteBtnClass =
  'border-red-800 text-red-800 hover:bg-red-800/5 text-sm'

type ProjectAdminCardProps = {
  kind: ContentKind
  project: ProjectListRow
  onPublish: (project: ProjectListRow) => void
  onDelete: (project: ProjectListRow) => void
}

function StatusPill({ isPublished, label }: { isPublished: boolean; label: string }) {
  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-base font-semibold ${
        isPublished ? 'bg-green-500 text-white' : 'bg-yellow-600 text-white'
      }`}
    >
      {label}
    </span>
  )
}

export function ProjectAdminCard({ kind, project, onPublish, onDelete }: ProjectAdminCardProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { lang } = useParams()
  const language: Language = isLanguage(lang) ? lang : 'en'
  const copy = contentKindConfig[kind].copy

  const statusKey = project.status === 'published' ? 'statusPublished' : 'statusDraft'
  const isPublished = project.status === 'published'

  const actionButtons = (mobileStretch: boolean) => (
    <>
      <Button
        variant="outline"
        className={`${deleteBtnClass} ${mobileStretch ? 'min-w-0 flex-1' : 'sm:w-auto'}`}
        onClick={() => onDelete(project)}
      >
        <ButtonIcon src={buttonIcons.trash} />
        {t(copy.deleteItem)}
      </Button>
      <Button
        variant="outline"
        className={`text-sm ${mobileStretch ? 'min-w-0 flex-1' : 'sm:w-auto'}`}
        onClick={() => void navigate(`/${language}/${adminEditPath(kind, project.slug)}`)}
      >
        <ButtonIcon src={buttonIcons.edit} />
        {t('edit')}
      </Button>
      {!isPublished ? (
        <Button
          className={`text-sm ${mobileStretch ? 'min-w-0 flex-1' : 'sm:w-auto'}`}
          onClick={() => onPublish(project)}
        >
          {t('publish')}
        </Button>
      ) : null}
    </>
  )

  return (
    <article className="flex w-full flex-col overflow-hidden rounded-lg border border-blue-800/20 bg-white shadow-sm sm:min-h-40 sm:flex-row">
      <div className="h-36 w-full shrink-0 bg-blue-800/10 sm:h-auto sm:w-44 sm:min-h-40 sm:self-stretch md:w-52">
        {project.cover_image_path ? (
          <img
            src={contentImageUrl(project.cover_image_path)}
            alt=""
            className="h-full w-full object-cover sm:min-h-40"
          />
        ) : (
          <div className="h-full min-h-36 w-full sm:min-h-40" aria-hidden />
        )}
      </div>

      <div className="flex flex-col p-4 sm:hidden">
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 flex-1 font-display text-xl text-blue-800">{projectTitle(project, language)}</h2>
          <StatusPill isPublished={isPublished} label={t(statusKey)} />
        </div>
        <p className="mt-2 line-clamp-3 text-sm text-green-800">
          {projectDescription(project, language)}
        </p>
        <div className="mt-3">
          <ProjectDateReadout
            compact
            cardFooter
            author={project.author}
            createdAt={project.created_at}
            publishedAt={project.published_at}
          />
        </div>
        <div className="mt-4 flex flex-row gap-2">{actionButtons(true)}</div>
      </div>

      <div className="hidden min-w-0 flex-1 flex-col p-4 sm:flex">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="line-clamp-1 font-display text-xl text-blue-800">
              {projectTitle(project, language)}
            </h2>
            <p className="mt-1 line-clamp-2 text-sm text-green-800">
              {projectDescription(project, language)}
            </p>
          </div>
          <div className="flex shrink-0 flex-row gap-2">{actionButtons(false)}</div>
        </div>
        <div className="mt-auto flex items-end justify-between gap-4 pt-4">
          <ProjectDateReadout
            compact
            cardFooter
            author={project.author}
            createdAt={project.created_at}
            publishedAt={project.published_at}
          />
          <StatusPill isPublished={isPublished} label={t(statusKey)} />
        </div>
      </div>
    </article>
  )
}

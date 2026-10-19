import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { formatProjectDate } from '../lib/formatDate'
import { authorDisplayName, type ProjectAuthor } from '../lib/projects'
import { isLanguage, type Language } from '../i18n'

type ProjectDateReadoutProps = {
  createdAt: string | null
  updatedAt?: string | null
  publishedAt: string | null
  author?: ProjectAuthor | null
  compact?: boolean
  cardFooter?: boolean
}

export function ProjectDateReadout({
  createdAt,
  updatedAt,
  publishedAt,
  author = null,
  compact = false,
  cardFooter = false,
}: ProjectDateReadoutProps) {
  const { t } = useTranslation()
  const { lang } = useParams()
  const language: Language = isLanguage(lang) ? lang : 'en'

  const dash = t('dateNotSet')
  const created = formatProjectDate(createdAt, language) ?? dash
  const published = formatProjectDate(publishedAt, language) ?? dash
  const updated =
    updatedAt !== undefined ? (formatProjectDate(updatedAt, language) ?? dash) : undefined
  const authorName = authorDisplayName(author) || dash

  const labelClass = cardFooter
    ? 'shrink-0 text-base font-normal text-green-800/65'
    : 'shrink-0 text-sm font-normal text-green-800/65'
  const valueClass = cardFooter
    ? 'font-bold text-base text-green-800'
    : 'font-bold text-sm text-green-800'

  const datePair = (label: string, value: string) => (
    <div className="flex flex-wrap gap-x-2 gap-y-0.5">
      <dt className={labelClass}>{label}:</dt>
      <dd className={valueClass}>{value}</dd>
    </div>
  )

  if (compact) {
    return (
      <dl className="flex flex-wrap gap-x-4 gap-y-1">
        {datePair(t('createdAt'), created)}
        {datePair(t('publishedAt'), published)}
        {datePair(t('filterAuthor'), authorName)}
      </dl>
    )
  }

  const gridCols =
    updated !== undefined ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'

  return (
    <dl className={`grid gap-3 ${gridCols}`}>
      <div>
        <dt className="text-sm font-normal text-green-800/65">{t('createdAt')}</dt>
        <dd className={`mt-1 ${valueClass}`}>{created}</dd>
      </div>
      {updated !== undefined ? (
        <div>
          <dt className="text-sm font-normal text-green-800/65">{t('updatedAt')}</dt>
          <dd className={`mt-1 ${valueClass}`}>{updated}</dd>
        </div>
      ) : null}
      <div>
        <dt className="text-sm font-normal text-green-800/65">{t('publishedAt')}</dt>
        <dd className={`mt-1 ${valueClass}`}>{published}</dd>
      </div>
      <div>
        <dt className="text-sm font-normal text-green-800/65">{t('filterAuthor')}</dt>
        <dd className={`mt-1 ${valueClass}`}>{authorName}</dd>
      </div>
    </dl>
  )
}

import { Link, useParams } from 'react-router'
import { isLanguage, type Language } from '../i18n'
import type { ContentKind } from '../lib/contentKind'
import { adminEditPath } from '../lib/contentKind'
import { contentImageUrl } from '../lib/contentImages'
import { projectTitle, type ProjectListRow } from '../lib/projects'

type DashboardContentCardProps = {
  kind: ContentKind
  item: ProjectListRow
}

export function DashboardContentCard({ kind, item }: DashboardContentCardProps) {
  const { lang } = useParams()
  const language: Language = isLanguage(lang) ? lang : 'en'
  const title = projectTitle(item, language)

  return (
    <Link
      to={`/${language}/${adminEditPath(kind, item.slug)}`}
      className="flex h-full flex-col overflow-hidden rounded-lg border border-blue-800/20 bg-white shadow-sm"
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-blue-800/10">
        {item.cover_image_path ? (
          <img
            src={contentImageUrl(item.cover_image_path)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
      </div>
      <h3 className="line-clamp-2 px-4 py-3 font-display text-xl text-blue-800">{title}</h3>
    </Link>
  )
}

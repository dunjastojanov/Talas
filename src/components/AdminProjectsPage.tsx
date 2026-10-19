import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import type { ContentKind } from '../lib/contentKind'
import { adminNewPath, contentKindConfig } from '../lib/contentKind'
import { isLanguage, type Language } from '../i18n'
import {
  emptyProjectFilters,
  filterProjects,
  type ProjectFiltersState,
} from '../lib/filterProjects'
import { loadAdminContent, loadProjectAuthors } from '../lib/loadAdminProjects'
import { deleteContentById } from '../lib/deleteProject'
import { publishContentById } from '../lib/publishProject'
import { projectTitle } from '../lib/projects'
import type { ProjectListRow } from '../lib/projects'
import { Button } from './Button'
import { ButtonIcon, buttonIcons } from './ButtonIcon'
import { ProjectAdminCard } from './ProjectAdminCard'
import { ProjectAdminCardSkeleton } from './ProjectAdminCardSkeleton'
import { ProjectListFilters } from './ProjectListFilters'
import { DeleteProjectConfirmDialog } from './DeleteProjectConfirmDialog'
import { PublishConfirmDialog } from './PublishConfirmDialog'

type AdminProjectsPageProps = {
  kind: ContentKind
}

export function AdminProjectsPage({ kind }: AdminProjectsPageProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { lang } = useParams()
  const language: Language = isLanguage(lang) ? lang : 'en'
  const copy = contentKindConfig[kind].copy
  const [items, setItems] = useState<ProjectListRow[]>([])
  const [authors, setAuthors] = useState<Awaited<ReturnType<typeof loadProjectAuthors>>>([])
  const [filters, setFilters] = useState<ProjectFiltersState>(emptyProjectFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [publishTarget, setPublishTarget] = useState<ProjectListRow | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ProjectListRow | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(false)

  const filteredItems = useMemo(() => filterProjects(items, filters), [items, filters])

  const loadItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    const [{ items: rows, error: fetchError }, authorRows] = await Promise.all([
      loadAdminContent(kind),
      loadProjectAuthors(),
    ])

    if (fetchError) {
      setError(fetchError)
      setItems([])
    } else {
      setItems(rows)
    }
    setAuthors(authorRows)
    setLoading(false)
  }, [kind])

  useEffect(() => {
    void loadItems()
  }, [loadItems])

  async function confirmPublish() {
    if (!publishTarget) return
    setPublishing(true)
    setPublishError(false)
    const ok = await publishContentById(kind, publishTarget.id)
    setPublishing(false)
    if (!ok) {
      setPublishError(true)
      return
    }
    setPublishTarget(null)
    await loadItems()
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError(false)
    const ok = await deleteContentById(kind, deleteTarget.id)
    setDeleting(false)
    if (!ok) {
      setDeleteError(true)
      return
    }
    setDeleteTarget(null)
    await loadItems()
  }

  return (
    <main className="px-4 py-6 lg:px-12 lg:py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-blue-800 sm:text-4xl">{t(copy.adminListTitle)}</h1>
        <Button
          variant="outline"
          className="shrink-0"
          onClick={() => void navigate(`/${language}/${adminNewPath(kind)}`)}
        >
          <ButtonIcon src={buttonIcons.plus} />
          {t(copy.newItem)}
        </Button>
      </div>

      {!loading && !error ? (
        <ProjectListFilters filters={filters} authors={authors} onChange={setFilters} />
      ) : null}

      {publishError ? (
        <p className="mb-4 text-sm text-red-700">{t(copy.publishFailed)}</p>
      ) : null}
      {deleteError ? (
        <p className="mb-4 text-sm text-red-700">{t(copy.deleteFailed)}</p>
      ) : null}
      {loading ? (
        <ul className="flex list-none flex-col gap-6 p-0" aria-busy="true" aria-label={t('loading')}>
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i}>
              <ProjectAdminCardSkeleton />
            </li>
          ))}
        </ul>
      ) : error ? (
        <p className="text-red-700">{t(copy.loadError)}</p>
      ) : items.length === 0 ? (
        <p className="text-green-800">{t(copy.empty)}</p>
      ) : filteredItems.length === 0 ? (
        <p className="text-green-800">{t(copy.noFilterResults)}</p>
      ) : (
        <ul className="flex list-none flex-col gap-6 p-0">
          {filteredItems.map((item) => (
            <li key={item.id}>
              <ProjectAdminCard
                kind={kind}
                project={item}
                onPublish={setPublishTarget}
                onDelete={setDeleteTarget}
              />
            </li>
          ))}
        </ul>
      )}
      <PublishConfirmDialog
        open={publishTarget !== null}
        willSaveChanges={false}
        publishing={publishing}
        copyKeys={copy}
        onClose={() => {
          if (!publishing) setPublishTarget(null)
        }}
        onConfirm={() => void confirmPublish()}
      />
      <DeleteProjectConfirmDialog
        open={deleteTarget !== null}
        itemTitle={deleteTarget ? projectTitle(deleteTarget, language) : undefined}
        deleting={deleting}
        copyKeys={copy}
        onClose={() => {
          if (!deleting) setDeleteTarget(null)
        }}
        onConfirm={() => void confirmDelete()}
      />
    </main>
  )
}

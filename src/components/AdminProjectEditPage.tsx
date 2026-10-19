import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router'
import { useAuth } from '../auth-context'
import type { ContentKind } from '../lib/contentKind'
import { adminEditPath, contentKindConfig } from '../lib/contentKind'
import { isLanguage, type Language } from '../i18n'
import {
  createEmptyImageBlock,
  createEmptyTextBlock,
  type EditorBlock,
  type ProjectAuthor,
} from '../lib/projects'
import {
  blocksFromRows,
  emptyForm,
  saveProject,
  type ProjectFormState,
} from '../lib/saveProject'
import { deleteContentById } from '../lib/deleteProject'
import { publishContentById } from '../lib/publishProject'
import { slugifyEnglishTitle } from '../lib/slug'
import { supabase } from '../lib/supabase'
import { AutoResizeTextarea } from './AutoResizeTextarea'
import { Button } from './Button'
import { ButtonIcon, buttonIcons } from './ButtonIcon'
import { ContentLocaleTabs } from './ContentLocaleTabs'
import { ProjectContentBlockEditor } from './ProjectContentBlockEditor'
import { ProjectCoverField } from './ProjectCoverField'
import { ProjectDateReadout } from './ProjectDateReadout'
import { AdminProjectEditPageSkeleton } from './AdminProjectEditPageSkeleton'
import { DeleteProjectConfirmDialog } from './DeleteProjectConfirmDialog'
import { PublishConfirmDialog } from './PublishConfirmDialog'

type AdminProjectEditPageProps = {
  kind: ContentKind
}

type UserNameRow = { first_name: string; last_name: string }

function authorFromRow(
  authorId: string,
  users: UserNameRow | UserNameRow[] | null | undefined,
): ProjectAuthor | null {
  const user = Array.isArray(users) ? users[0] : users
  if (!user) return null
  return { id: authorId, first_name: user.first_name, last_name: user.last_name }
}

function formFromContentRow(row: {
  id: string
  slug: string
  title_en: string
  title_sr: string
  description_en: string
  description_sr: string
  cover_image_path: string | null
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
  published_at: string | null
  author_id: string
  users: UserNameRow | UserNameRow[] | null
}): ProjectFormState {
  return {
    id: row.id,
    slug: row.slug,
    title_en: row.title_en,
    title_sr: row.title_sr,
    description_en: row.description_en,
    description_sr: row.description_sr,
    cover_image_path: row.cover_image_path,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    published_at: row.published_at,
    author: authorFromRow(row.author_id, row.users),
  }
}

export function AdminProjectEditPage({ kind }: AdminProjectEditPageProps) {
  const { t } = useTranslation()
  const { lang, id: slugParam } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { session } = useAuth()
  const language: Language = isLanguage(lang) ? lang : 'en'
  const { table, parentIdColumn, adminBasePath } = contentKindConfig[kind]
  const copy = contentKindConfig[kind].copy

  const isNew = location.pathname.endsWith(`/${adminBasePath}/new`)
  const editSlug = isNew ? null : slugParam

  const [contentLocale, setContentLocale] = useState<Language>('sr')
  const [form, setForm] = useState<ProjectFormState>(emptyForm)
  const [blocks, setBlocks] = useState<EditorBlock[]>([])
  const [originalBlockDbIds, setOriginalBlockDbIds] = useState<string[]>([])
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [loadError, setLoadError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(false)
  const initialSlugRef = useRef<string | null>(null)

  const contentSelect = `
    id,
    slug,
    title_en,
    title_sr,
    description_en,
    description_sr,
    cover_image_path,
    status,
    created_at,
    updated_at,
    published_at,
    author_id,
    users ( first_name, last_name )
  `

  async function refreshFromContentId(contentId: string, slug?: string) {
    const { data: refreshed } = await supabase
      .from(table)
      .select(contentSelect)
      .eq('id', contentId)
      .single()

    const { data: blockRows } = await supabase
      .from('content_blocks')
      .select('id, block_type, body_en, body_sr, image_path, alt_en, alt_sr')
      .eq(parentIdColumn, contentId)
      .order('position')

    if (refreshed) {
      setForm(formFromContentRow(refreshed as Parameters<typeof formFromContentRow>[0]))
    }
    const loaded = blocksFromRows(blockRows ?? [])
    setBlocks(loaded)
    setOriginalBlockDbIds(loaded.map((b) => b.dbId).filter((x): x is string => Boolean(x)))
    setPendingCoverFile(null)
    setIsDirty(false)

    const targetSlug = slug ?? refreshed?.slug
    if (targetSlug && (isNew || initialSlugRef.current !== targetSlug)) {
      initialSlugRef.current = targetSlug
      void navigate(`/${language}/${adminEditPath(kind, targetSlug)}`, { replace: true })
    }
  }

  useEffect(() => {
    if (isNew) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setLoadError(false)
      const { data: row, error } = await supabase
        .from(table)
        .select(contentSelect)
        .eq('slug', editSlug)
        .maybeSingle()

      if (cancelled) return

      if (error || !row) {
        setLoadError(true)
        setLoading(false)
        return
      }

      initialSlugRef.current = row.slug
      setForm(formFromContentRow(row as Parameters<typeof formFromContentRow>[0]))
      setSlugTouched(true)
      setIsDirty(false)

      const { data: blockRows, error: blocksError } = await supabase
        .from('content_blocks')
        .select('id, block_type, body_en, body_sr, image_path, alt_en, alt_sr')
        .eq(parentIdColumn, row.id)
        .order('position')

      if (cancelled) return

      if (blocksError) {
        setLoadError(true)
      } else {
        const loaded = blocksFromRows(blockRows ?? [])
        setBlocks(loaded)
        setOriginalBlockDbIds(loaded.map((b) => b.dbId).filter((x): x is string => Boolean(x)))
      }
      setLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [editSlug, isNew, parentIdColumn, table])

  function markDirty() {
    setIsDirty(true)
  }

  function updateTitleEn(value: string) {
    markDirty()
    setForm((prev) => {
      const next = { ...prev, title_en: value }
      if (!slugTouched) {
        next.slug = slugifyEnglishTitle(value)
      }
      return next
    })
  }

  function updateBlock(index: number, block: EditorBlock) {
    markDirty()
    setBlocks((prev) => prev.map((b, i) => (i === index ? block : b)))
  }

  function removeBlock(index: number) {
    markDirty()
    setBlocks((prev) => prev.filter((_, i) => i !== index))
  }

  function moveBlock(index: number, direction: 'up' | 'down') {
    markDirty()
    setSaveError(null)
    setBlocks((prev) => {
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  async function handleSave(): Promise<{ ok: true; contentId: string } | { ok: false }> {
    if (!session) return { ok: false }
    setSaving(true)
    setSaveError(null)

    const result = await saveProject({
      kind,
      session,
      form,
      blocks,
      pendingCoverFile,
      originalBlockDbIds,
    })

    if (!result.ok) {
      setSaving(false)
      setSaveError(result.error)
      return { ok: false }
    }

    await refreshFromContentId(result.contentId, result.slug)
    setSaving(false)
    return { ok: true, contentId: result.contentId }
  }

  async function confirmPublish() {
    if (!session) return
    setPublishing(true)
    setPublishError(false)

    const needsSave = isDirty || isNew || !form.id
    let contentId = form.id
    if (needsSave) {
      const saved = await handleSave()
      if (!saved.ok) {
        setPublishing(false)
        setPublishOpen(false)
        return
      }
      contentId = saved.contentId
    }

    if (!contentId) {
      setPublishing(false)
      setPublishError(true)
      return
    }

    const ok = await publishContentById(kind, contentId)
    if (!ok) {
      setPublishing(false)
      setPublishError(true)
      return
    }

    await refreshFromContentId(contentId)
    setPublishing(false)
    setPublishOpen(false)
  }

  async function confirmDelete() {
    if (!form.id) return
    setDeleting(true)
    setDeleteError(false)
    const ok = await deleteContentById(kind, form.id)
    setDeleting(false)
    if (!ok) {
      setDeleteError(true)
      return
    }
    setDeleteOpen(false)
    void navigate(`/${language}/${adminBasePath}`)
  }

  const willSaveOnPublish = isDirty || isNew || !form.id
  const canDelete = Boolean(form.id) && !isNew
  const showPublish = form.status !== 'published'

  function saveErrorMessage() {
    if (!saveError) return null
    if (saveError === 'saveFailed') return t(copy.saveFailed)
    return t(saveError)
  }

  if (loading) {
    return <AdminProjectEditPageSkeleton showDates={!isNew} />
  }

  if (loadError) {
    return (
      <main className="px-4 py-6">
        <p className="text-red-700">{t(copy.itemLoadError)}</p>
      </main>
    )
  }

  const title = contentLocale === 'en' ? form.title_en : form.title_sr
  const description = contentLocale === 'en' ? form.description_en : form.description_sr

  return (
    <main className="pb-6">
      <ProjectCoverField
        coverPath={form.cover_image_path}
        pendingFile={pendingCoverFile}
        onPendingFileChange={(file) => {
          markDirty()
          setPendingCoverFile(file)
        }}
      />

      <div className="mx-auto mt-4 flex w-full max-w-5xl items-center justify-end px-4">
        <ContentLocaleTabs value={contentLocale} onChange={setContentLocale} />
      </div>

      <div className="mx-auto mt-6 w-full max-w-5xl space-y-4 px-4">
        {!isNew && form.created_at ? (
          <div className="rounded-md border border-blue-800/10 bg-blue-800/5 p-4">
            <ProjectDateReadout
              author={form.author}
              createdAt={form.created_at}
              updatedAt={form.updated_at}
              publishedAt={form.published_at}
            />
          </div>
        ) : null}

        <label className="block text-sm text-green-800">
          {t('projectTitle')}
          <input
            type="text"
            value={title}
            className="mt-1 w-full rounded-md border border-blue-800/30 px-3 py-2"
            onChange={(e) => {
              const value = e.target.value
              if (contentLocale === 'en') {
                updateTitleEn(value)
              } else {
                markDirty()
                setForm((prev) => ({ ...prev, title_sr: value }))
              }
            }}
          />
        </label>

        <label className="block text-sm text-green-800">
          {t('shortDescription')}
          <AutoResizeTextarea
            value={description}
            className="mt-1 w-full rounded-md border border-blue-800/30 px-3 py-2"
            onChange={(e) => {
              const value = e.target.value
              if (contentLocale === 'en') {
                markDirty()
                setForm((prev) => ({ ...prev, description_en: value }))
              } else {
                markDirty()
                setForm((prev) => ({ ...prev, description_sr: value }))
              }
            }}
          />
        </label>

        <label className="block text-sm text-green-800">
          {t('slug')}
          <input
            type="text"
            value={form.slug}
            className="mt-1 w-full rounded-md border border-blue-800/30 px-3 py-2 font-mono text-sm"
            onChange={(e) => {
              setSlugTouched(true)
              markDirty()
              setForm((prev) => ({ ...prev, slug: e.target.value }))
            }}
          />
        </label>
      </div>

      <div className="mx-auto mt-8 w-full max-w-5xl space-y-4 px-4">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              markDirty()
              setBlocks((prev) => [...prev, createEmptyTextBlock()])
            }}
          >
            <ButtonIcon src={buttonIcons.plus} />
            {t('addTextBlock')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              markDirty()
              setBlocks((prev) => [...prev, createEmptyImageBlock()])
            }}
          >
            <ButtonIcon src={buttonIcons.plus} />
            {t('addImageBlock')}
          </Button>
        </div>

        {blocks.map((block, index) => (
          <ProjectContentBlockEditor
            key={block.clientId}
            block={block}
            contentLocale={contentLocale}
            canMoveUp={index > 0}
            canMoveDown={index < blocks.length - 1}
            onMoveUp={() => moveBlock(index, 'up')}
            onMoveDown={() => moveBlock(index, 'down')}
            onChange={(next) => updateBlock(index, next)}
            onRemove={() => removeBlock(index)}
          />
        ))}
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-5xl flex-col gap-2 px-4">
        {saveError ? (
          <p className="text-sm text-red-700">{saveErrorMessage()}</p>
        ) : null}
        {publishError ? (
          <p className="text-sm text-red-700">{t(copy.publishFailed)}</p>
        ) : null}
        {deleteError ? (
          <p className="text-sm text-red-700">{t(copy.deleteFailed)}</p>
        ) : null}
        <div className="flex w-full flex-wrap justify-end gap-2">
          {canDelete ? (
            <Button
              type="button"
              variant="outline"
              className="border-red-800 text-red-800 hover:bg-red-800/5"
              disabled={saving || publishing || deleting}
              onClick={() => setDeleteOpen(true)}
            >
              <ButtonIcon src={buttonIcons.trash} />
              {t(copy.deleteItem)}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            disabled={saving || publishing || deleting}
            onClick={() => void handleSave()}
          >
            {!saving ? <ButtonIcon src={buttonIcons.check} /> : null}
            {saving ? t('saving') : t('save')}
          </Button>
          {showPublish ? (
            <Button
              type="button"
              disabled={saving || publishing || deleting}
              onClick={() => setPublishOpen(true)}
            >
              {t('publish')}
            </Button>
          ) : null}
        </div>
      </div>
      <PublishConfirmDialog
        open={publishOpen}
        willSaveChanges={willSaveOnPublish}
        publishing={publishing}
        copyKeys={copy}
        onClose={() => {
          if (!publishing) setPublishOpen(false)
        }}
        onConfirm={() => void confirmPublish()}
      />
      <DeleteProjectConfirmDialog
        open={deleteOpen}
        itemTitle={
          language === 'sr' ? form.title_sr || form.title_en : form.title_en || form.title_sr
        }
        deleting={deleting}
        copyKeys={copy}
        onClose={() => {
          if (!deleting) setDeleteOpen(false)
        }}
        onConfirm={() => void confirmDelete()}
      />
    </main>
  )
}

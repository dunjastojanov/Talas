import type { Session } from '@supabase/supabase-js'
import type { ContentKind } from './contentKind'
import { contentKindConfig } from './contentKind'
import type { EditorBlock, EditorImageBlock, ProjectAuthor } from './projects'
import { uploadContentImage } from './projectStorage'
import { isValidSlug } from './slug'
import { supabase } from './supabase'
import { normalizeTipTapDoc } from './tiptapDoc'

export type ProjectFormState = {
  id: string | null
  slug: string
  title_en: string
  title_sr: string
  description_en: string
  description_sr: string
  cover_image_path: string | null
  status: 'draft' | 'published'
  created_at: string | null
  updated_at: string | null
  published_at: string | null
  author: ProjectAuthor | null
}

export type SaveProjectInput = {
  kind: ContentKind
  session: Session
  form: ProjectFormState
  blocks: EditorBlock[]
  pendingCoverFile: File | null
  originalBlockDbIds: string[]
}

export type SaveProjectResult =
  | { ok: true; contentId: string; slug: string }
  | { ok: false; error: 'slugInvalid' | 'slugTaken' | 'titlesRequired' | 'imageBlockMissingFile' | 'saveFailed' }

function parentIds(kind: ContentKind, contentId: string) {
  return {
    project_id: kind === 'project' ? contentId : null,
    blog_id: kind === 'blog' ? contentId : null,
  }
}

export async function isSlugTaken(
  kind: ContentKind,
  slug: string,
  excludeContentId: string | null,
) {
  const { table } = contentKindConfig[kind]
  const { data, error } = await supabase.from(table).select('id').eq('slug', slug).maybeSingle()
  if (error) throw error
  if (!data) return false
  if (excludeContentId && data.id === excludeContentId) return false
  return true
}

export async function saveProject(input: SaveProjectInput): Promise<SaveProjectResult> {
  const { kind, session, form, blocks, pendingCoverFile, originalBlockDbIds } = input
  const { table } = contentKindConfig[kind]

  if (!isValidSlug(form.slug)) {
    return { ok: false, error: 'slugInvalid' }
  }
  if (!form.title_en.trim() || !form.title_sr.trim()) {
    return { ok: false, error: 'titlesRequired' }
  }
  if (await isSlugTaken(kind, form.slug, form.id)) {
    return { ok: false, error: 'slugTaken' }
  }

  for (const block of blocks) {
    if (block.blockType === 'image' && !block.image_path && !block.pendingFile) {
      return { ok: false, error: 'imageBlockMissingFile' }
    }
  }

  let contentId = form.id
  const authorId = session.user.id

  const contentPayload = {
    slug: form.slug,
    title_en: form.title_en.trim(),
    title_sr: form.title_sr.trim(),
    description_en: form.description_en.trim(),
    description_sr: form.description_sr.trim(),
    cover_image_path: form.cover_image_path,
  }

  if (!contentId) {
    const { data, error } = await supabase
      .from(table)
      .insert({ ...contentPayload, author_id: authorId, status: 'draft' })
      .select('id')
      .single()
    if (error || !data) return { ok: false, error: 'saveFailed' }
    contentId = data.id as string
  } else {
    const { error } = await supabase
      .from(table)
      .update({ ...contentPayload, status: form.status })
      .eq('id', contentId)
    if (error) return { ok: false, error: 'saveFailed' }
  }

  if (!contentId) return { ok: false, error: 'saveFailed' }

  if (pendingCoverFile) {
    try {
      const coverPath = await uploadContentImage(contentId, pendingCoverFile)
      const { error } = await supabase
        .from(table)
        .update({ cover_image_path: coverPath })
        .eq('id', contentId)
      if (error) return { ok: false, error: 'saveFailed' }
    } catch {
      return { ok: false, error: 'saveFailed' }
    }
  }

  const keptDbIds: string[] = []

  // Avoid unique (parent, position) violations when reordering existing blocks.
  for (let position = 0; position < blocks.length; position++) {
    const block = blocks[position]
    if (!block.dbId) continue
    const { error } = await supabase
      .from('content_blocks')
      .update({ position: 10_000 + position })
      .eq('id', block.dbId)
    if (error) return { ok: false, error: 'saveFailed' }
  }

  for (let position = 0; position < blocks.length; position++) {
    const block = blocks[position]
    if (block.blockType === 'text') {
      const payload = {
        ...parentIds(kind, contentId),
        position,
        block_type: 'text' as const,
        body_en: normalizeTipTapDoc(block.body_en),
        body_sr: normalizeTipTapDoc(block.body_sr),
        image_path: null,
        alt_en: null,
        alt_sr: null,
      }
      if (block.dbId) {
        const { error } = await supabase.from('content_blocks').update(payload).eq('id', block.dbId)
        if (error) return { ok: false, error: 'saveFailed' }
        keptDbIds.push(block.dbId)
      } else {
        const { data, error } = await supabase.from('content_blocks').insert(payload).select('id').single()
        if (error || !data) return { ok: false, error: 'saveFailed' }
        keptDbIds.push(data.id)
      }
    } else {
      const imageBlock = block as EditorImageBlock
      let imagePath = imageBlock.image_path
      if (imageBlock.pendingFile) {
        try {
          imagePath = await uploadContentImage(contentId, imageBlock.pendingFile)
        } catch {
          return { ok: false, error: 'saveFailed' }
        }
      }
      if (!imagePath) continue

      const payload = {
        ...parentIds(kind, contentId),
        position,
        block_type: 'image' as const,
        body_en: null,
        body_sr: null,
        image_path: imagePath,
        alt_en: imageBlock.alt_en.trim() || null,
        alt_sr: imageBlock.alt_sr.trim() || null,
      }
      if (block.dbId) {
        const { error } = await supabase.from('content_blocks').update(payload).eq('id', block.dbId)
        if (error) return { ok: false, error: 'saveFailed' }
        keptDbIds.push(block.dbId)
      } else {
        const { data, error } = await supabase.from('content_blocks').insert(payload).select('id').single()
        if (error || !data) return { ok: false, error: 'saveFailed' }
        keptDbIds.push(data.id)
      }
    }
  }

  const toDelete = originalBlockDbIds.filter((id) => !keptDbIds.includes(id))
  if (toDelete.length > 0) {
    const { error } = await supabase.from('content_blocks').delete().in('id', toDelete)
    if (error) return { ok: false, error: 'saveFailed' }
  }

  return { ok: true, contentId, slug: form.slug }
}

export function blocksFromRows(
  rows: {
    id: string
    block_type: 'text' | 'image'
    body_en: unknown
    body_sr: unknown
    image_path: string | null
    alt_en: string | null
    alt_sr: string | null
  }[],
): EditorBlock[] {
  return rows.map((row) => {
    if (row.block_type === 'text') {
      return {
        clientId: row.id,
        dbId: row.id,
        blockType: 'text' as const,
        body_en: normalizeTipTapDoc(row.body_en),
        body_sr: normalizeTipTapDoc(row.body_sr),
      }
    }
    return {
      clientId: row.id,
      dbId: row.id,
      blockType: 'image' as const,
      image_path: row.image_path,
      pendingFile: null,
      alt_en: row.alt_en ?? '',
      alt_sr: row.alt_sr ?? '',
    }
  })
}

export function emptyForm(): ProjectFormState {
  return {
    id: null,
    slug: '',
    title_en: '',
    title_sr: '',
    description_en: '',
    description_sr: '',
    cover_image_path: null,
    status: 'draft',
    created_at: null,
    updated_at: null,
    published_at: null,
    author: null,
  }
}

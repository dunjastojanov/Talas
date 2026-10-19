import type { ContentKind } from './contentKind'
import { contentKindConfig } from './contentKind'
import { supabase } from './supabase'

export async function deleteContentById(kind: ContentKind, contentId: string): Promise<boolean> {
  const { table, parentIdColumn } = contentKindConfig[kind]

  const { data: row, error: rowError } = await supabase
    .from(table)
    .select('cover_image_path')
    .eq('id', contentId)
    .maybeSingle()

  if (rowError || !row) return false

  const { data: blocks, error: blocksError } = await supabase
    .from('content_blocks')
    .select('image_path')
    .eq(parentIdColumn, contentId)

  if (blocksError) return false

  const paths = new Set<string>()
  if (row.cover_image_path) paths.add(row.cover_image_path)
  for (const block of blocks ?? []) {
    if (block.image_path) paths.add(block.image_path)
  }

  const { data: listed } = await supabase.storage.from('content-images').list(contentId)
  for (const item of listed ?? []) {
    if (item.name) paths.add(`${contentId}/${item.name}`)
  }

  if (paths.size > 0) {
    const { error: storageError } = await supabase.storage
      .from('content-images')
      .remove([...paths])
    if (storageError) return false
  }

  const { error: deleteError } = await supabase.from(table).delete().eq('id', contentId)
  return !deleteError
}

/** @deprecated Use deleteContentById('project', id) */
export async function deleteProjectById(projectId: string): Promise<boolean> {
  return deleteContentById('project', projectId)
}

import type { ContentKind } from './contentKind'
import { contentKindConfig } from './contentKind'
import { supabase } from './supabase'

export async function publishContentById(kind: ContentKind, contentId: string) {
  const { table } = contentKindConfig[kind]
  const { error } = await supabase.from(table).update({ status: 'published' }).eq('id', contentId)
  return !error
}

/** @deprecated Use publishContentById('project', id) */
export async function publishProjectById(projectId: string) {
  return publishContentById('project', projectId)
}

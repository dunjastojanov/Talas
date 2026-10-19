import type { ContentKind } from './contentKind'
import { contentKindConfig } from './contentKind'
import type { ProjectListRow } from './projects'
import { supabase } from './supabase'

type UserNameRow = { first_name: string; last_name: string }

function pickUser(users: UserNameRow | UserNameRow[] | null | undefined): UserNameRow | null {
  if (!users) return null
  return Array.isArray(users) ? (users[0] ?? null) : users
}

export async function loadAdminContent(kind: ContentKind) {
  const { table, copy } = contentKindConfig[kind]
  const { data, error } = await supabase
    .from(table)
    .select(
      `
      id,
      slug,
      title_en,
      title_sr,
      description_en,
      description_sr,
      status,
      cover_image_path,
      created_at,
      published_at,
      author_id,
      users ( first_name, last_name )
    `,
    )
    .order('updated_at', { ascending: false })

  if (error) {
    return { items: [] as ProjectListRow[], error: error.message, loadErrorKey: copy.loadError }
  }

  const items: ProjectListRow[] = (data ?? []).map((row) => {
    const user = pickUser(row.users as UserNameRow | UserNameRow[] | null)
    return {
      id: row.id,
      slug: row.slug,
      title_en: row.title_en,
      title_sr: row.title_sr,
      description_en: row.description_en,
      description_sr: row.description_sr,
      status: row.status,
      cover_image_path: row.cover_image_path,
      created_at: row.created_at,
      published_at: row.published_at,
      author_id: row.author_id,
      author: user
        ? {
            id: row.author_id,
            first_name: user.first_name,
            last_name: user.last_name,
          }
        : null,
    }
  })

  return { items, error: null, loadErrorKey: copy.loadError }
}

/** @deprecated Use loadAdminContent('project') */
export async function loadAdminProjects() {
  const result = await loadAdminContent('project')
  return { projects: result.items, error: result.error }
}

export async function loadProjectAuthors() {
  const { data, error } = await supabase
    .from('user_names')
    .select('id, first_name, last_name')
    .order('last_name')

  if (error) return []
  return data ?? []
}

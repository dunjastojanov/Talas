import type { ProjectAuthor, PublicContentBlock } from './projects'
import type { PublicProjectListRow } from './loadPublicProjects'
import { supabase } from './supabase'

type UserNameRow = { first_name: string; last_name: string }

function pickUser(users: UserNameRow | UserNameRow[] | null | undefined): UserNameRow | null {
  if (!users) return null
  return Array.isArray(users) ? (users[0] ?? null) : users
}

export type PublicBlogListRow = PublicProjectListRow & {
  published_at: string | null
  author_id: string
  author: ProjectAuthor | null
}

export type PublicBlogDetail = PublicBlogListRow & {
  blocks: PublicContentBlock[]
}

const listSelect = `
  id,
  slug,
  title_en,
  title_sr,
  description_en,
  description_sr,
  cover_image_path,
  published_at,
  author_id,
  users ( first_name, last_name )
`

function mapBlogRow(row: {
  id: string
  slug: string
  title_en: string
  title_sr: string
  description_en: string
  description_sr: string
  cover_image_path: string | null
  published_at: string | null
  author_id: string
  users: UserNameRow | UserNameRow[] | null
}): PublicBlogListRow {
  const user = pickUser(row.users)
  return {
    id: row.id,
    slug: row.slug,
    title_en: row.title_en,
    title_sr: row.title_sr,
    description_en: row.description_en,
    description_sr: row.description_sr,
    cover_image_path: row.cover_image_path,
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
}

export async function loadPublishedBlogs() {
  const { data, error } = await supabase
    .from('blogs')
    .select(listSelect)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) {
    return { blogs: [] as PublicBlogListRow[], error: error.message }
  }

  const blogs = (data ?? []).map((row) => mapBlogRow(row as Parameters<typeof mapBlogRow>[0]))
  return { blogs, error: null }
}

export async function loadPublishedBlog(slug: string) {
  const { data: blog, error: blogError } = await supabase
    .from('blogs')
    .select(listSelect)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (blogError) {
    return { blog: null as PublicBlogDetail | null, error: blogError.message }
  }

  if (!blog) {
    return { blog: null, error: null }
  }

  const { data: blocks, error: blocksError } = await supabase
    .from('content_blocks')
    .select(
      'id, position, block_type, body_en, body_sr, image_path, alt_en, alt_sr',
    )
    .eq('blog_id', (blog as { id: string }).id)
    .order('position', { ascending: true })

  if (blocksError) {
    return { blog: null, error: blocksError.message }
  }

  return {
    blog: {
      ...mapBlogRow(blog as Parameters<typeof mapBlogRow>[0]),
      blocks: (blocks ?? []) as PublicContentBlock[],
    },
    error: null,
  }
}

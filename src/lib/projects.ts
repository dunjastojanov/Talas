import type { Language } from '../i18n'
import { emptyTipTapDoc, type TipTapDoc } from './tiptapDoc'

export type ContentStatus = 'draft' | 'published'

export type ProjectAuthor = {
  id: string
  first_name: string
  last_name: string
}

export type ProjectLocalizedFields = {
  title_en: string
  title_sr: string
  description_en: string
  description_sr: string
}

export type ProjectListRow = ProjectLocalizedFields & {
  id: string
  slug: string
  status: ContentStatus
  cover_image_path: string | null
  created_at: string
  published_at: string | null
  author_id: string
  author: ProjectAuthor | null
}

export function projectTitle(project: ProjectLocalizedFields, lang: Language) {
  return lang === 'sr' ? project.title_sr : project.title_en
}

export function projectDescription(project: ProjectLocalizedFields, lang: Language) {
  return lang === 'sr' ? project.description_sr : project.description_en
}

export function authorDisplayName(author: ProjectAuthor | null) {
  if (!author) return ''
  return `${author.first_name} ${author.last_name}`.trim()
}

export type PublicContentBlock = {
  id: string
  position: number
  block_type: 'text' | 'image'
  body_en: unknown | null
  body_sr: unknown | null
  image_path: string | null
  alt_en: string | null
  alt_sr: string | null
}

export type ProjectEditorRow = {
  id: string
  author_id: string
  slug: string
  title_en: string
  title_sr: string
  description_en: string
  description_sr: string
  status: ContentStatus
  cover_image_path: string | null
}

export type ContentBlockRow = {
  id: string
  project_id: string
  position: number
  block_type: 'text' | 'image'
  body_en: unknown | null
  body_sr: unknown | null
  image_path: string | null
  alt_en: string | null
  alt_sr: string | null
}

export type EditorTextBlock = {
  clientId: string
  blockType: 'text'
  dbId?: string
  body_en: TipTapDoc
  body_sr: TipTapDoc
}

export type EditorImageBlock = {
  clientId: string
  blockType: 'image'
  dbId?: string
  image_path: string | null
  pendingFile: File | null
  alt_en: string
  alt_sr: string
}

export type EditorBlock = EditorTextBlock | EditorImageBlock

export function newClientId() {
  return crypto.randomUUID()
}

export function createEmptyTextBlock(): EditorTextBlock {
  return {
    clientId: newClientId(),
    blockType: 'text',
    body_en: emptyTipTapDoc(),
    body_sr: emptyTipTapDoc(),
  }
}

export function createEmptyImageBlock(): EditorImageBlock {
  return {
    clientId: newClientId(),
    blockType: 'image',
    image_path: null,
    pendingFile: null,
    alt_en: '',
    alt_sr: '',
  }
}

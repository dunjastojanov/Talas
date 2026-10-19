import type { ProjectListRow } from './projects'

export type ProjectFiltersState = {
  search: string
  status: '' | 'draft' | 'published'
  authorId: string
  dateFrom: string
  dateTo: string
}

export const emptyProjectFilters: ProjectFiltersState = {
  search: '',
  status: '',
  authorId: '',
  dateFrom: '',
  dateTo: '',
}

function dayStart(isoDate: string) {
  return new Date(`${isoDate}T00:00:00`)
}

function dayEnd(isoDate: string) {
  return new Date(`${isoDate}T23:59:59.999`)
}

export function filterProjects(projects: ProjectListRow[], filters: ProjectFiltersState) {
  const q = filters.search.trim().toLowerCase()

  return projects.filter((project) => {
    if (filters.status && project.status !== filters.status) return false
    if (filters.authorId && project.author_id !== filters.authorId) return false

    if (filters.dateFrom) {
      const from = dayStart(filters.dateFrom)
      if (new Date(project.created_at) < from) return false
    }
    if (filters.dateTo) {
      const to = dayEnd(filters.dateTo)
      if (new Date(project.created_at) > to) return false
    }

    if (!q) return true

    const haystack = [
      project.title_en,
      project.title_sr,
      project.description_en,
      project.description_sr,
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(q)
  })
}

export function authorDisplayName(author: ProjectListRow['author']) {
  if (!author) return ''
  return `${author.first_name} ${author.last_name}`.trim()
}

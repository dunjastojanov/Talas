import { useTranslation } from 'react-i18next'
import type { ProjectAuthor } from '../lib/projects'
import type { ProjectFiltersState } from '../lib/filterProjects'
import { authorDisplayName } from '../lib/filterProjects'
import { DatePickerField } from './DatePickerField'

type ProjectListFiltersProps = {
  filters: ProjectFiltersState
  authors: ProjectAuthor[]
  onChange: (filters: ProjectFiltersState) => void
}

const fieldClass =
  'mt-1 w-full rounded-md border border-blue-800/30 bg-white px-3 py-2 text-green-800'

export function ProjectListFilters({ filters, authors, onChange }: ProjectListFiltersProps) {
  const { t } = useTranslation()

  function patch(partial: Partial<ProjectFiltersState>) {
    onChange({ ...filters, ...partial })
  }

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <label className="block text-sm text-green-800 sm:col-span-2 lg:col-span-3 xl:col-span-2">
        {t('filterSearch')}
        <input
          type="search"
          value={filters.search}
          placeholder={t('filterSearchPlaceholder')}
          className={fieldClass}
          onChange={(e) => patch({ search: e.target.value })}
        />
      </label>
      <label className="block text-sm text-green-800">
        {t('filterStatus')}
        <select
          value={filters.status}
          className={fieldClass}
          onChange={(e) =>
            patch({ status: e.target.value as ProjectFiltersState['status'] })
          }
        >
          <option value="">{t('filterStatusAll')}</option>
          <option value="draft">{t('statusDraft')}</option>
          <option value="published">{t('statusPublished')}</option>
        </select>
      </label>
      <label className="block text-sm text-green-800">
        {t('filterAuthor')}
        <select
          value={filters.authorId}
          className={fieldClass}
          onChange={(e) => patch({ authorId: e.target.value })}
        >
          <option value="">{t('filterAuthorAll')}</option>
          {authors.map((author) => (
            <option key={author.id} value={author.id}>
              {authorDisplayName(author) || author.id}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm text-green-800">
        {t('filterDateFrom')}
        <DatePickerField
          value={filters.dateFrom}
          className={fieldClass}
          onChange={(dateFrom) => patch({ dateFrom })}
        />
      </label>
      <label className="block text-sm text-green-800">
        {t('filterDateTo')}
        <DatePickerField
          value={filters.dateTo}
          className={fieldClass}
          onChange={(dateTo) => patch({ dateTo })}
        />
      </label>
    </div>
  )
}

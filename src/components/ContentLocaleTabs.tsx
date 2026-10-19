import type { Language } from '../i18n'

type ContentLocaleTabsProps = {
  value: Language
  onChange: (lang: Language) => void
}

const base =
  'border border-blue-800 px-3 py-1.5 text-sm transition-colors'
const active = 'bg-gradient-to-r from-blue-800 to-blue-500 text-white'
const inactive = 'bg-transparent text-blue-800 hover:bg-blue-800/5'

export function ContentLocaleTabs({ value, onChange }: ContentLocaleTabsProps) {
  return (
    <div className="inline-flex" role="group" aria-label="Content language">
      <button
        type="button"
        className={`${base} rounded-l-md rounded-r-none border-r-0 ${value === 'sr' ? active : inactive}`}
        onClick={() => onChange('sr')}
      >
        SR
      </button>
      <button
        type="button"
        className={`${base} rounded-l-none rounded-r-md ${value === 'en' ? active : inactive}`}
        onClick={() => onChange('en')}
      >
        EN
      </button>
    </div>
  )
}

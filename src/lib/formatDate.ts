import type { Language } from '../i18n'

export function formatProjectDate(iso: string | null | undefined, lang: Language) {
  if (!iso) return null
  const locale = lang === 'sr' ? 'sr-RS' : 'en-GB'
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(new Date(iso))
}

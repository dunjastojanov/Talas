import { useParams } from 'react-router'
import { isLanguage, type Language } from '../i18n'

type DatePickerFieldProps = {
  value: string
  onChange: (isoDate: string) => void
  className?: string
}

/** Native date picker; `lang` uses day/month/year locales (en-GB, sr-RS). */
function datePickerLocale(lang: Language) {
  return lang === 'sr' ? 'sr-RS' : 'en-GB'
}

export function DatePickerField({ value, onChange, className }: DatePickerFieldProps) {
  const { lang } = useParams()
  const language: Language = isLanguage(lang) ? lang : 'en'

  return (
    <input
      type="date"
      lang={datePickerLocale(language)}
      value={value}
      className={className}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

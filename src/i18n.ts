import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import sr from './locales/sr.json'

export const languages = ['en', 'sr'] as const

export type Language = (typeof languages)[number]

export function isLanguage(value: string | undefined): value is Language {
  return languages.includes(value as Language)
}

const pathLanguage = window.location.pathname.split('/')[1]

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    sr: { translation: sr },
  },
  lng: isLanguage(pathLanguage) ? pathLanguage : 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n

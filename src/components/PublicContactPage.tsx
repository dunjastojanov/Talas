import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'
import { PageBanner } from './PageBanner'

const fieldClass =
  'mt-1 w-full rounded-md border border-blue-800/30 bg-white px-3 py-2 text-green-800'

export function PublicContactPage() {
  const { t } = useTranslation()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  return (
    <>
      <PageBanner title={t('contact')} />
      <main className="public-page-x flex justify-center py-8 sm:py-10">
      <form className="flex w-full max-w-xl flex-col gap-4" onSubmit={onSubmit}>
        <label className="block text-sm text-green-800">
          {t('contactFullName')}
          <input
            type="text"
            name="name"
            autoComplete="name"
            required
            className={fieldClass}
          />
        </label>
        <label className="block text-sm text-green-800">
          {t('email')}
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            className={fieldClass}
          />
        </label>
        <label className="block text-sm text-green-800">
          {t('contactMessage')}
          <textarea name="message" required rows={5} className={`${fieldClass} resize-y`} />
        </label>
        <div className="flex justify-end">
          <Button type="submit">{t('contactSend')}</Button>
        </div>
      </form>
    </main>
    </>
  )
}

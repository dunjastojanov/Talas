import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { Button } from './Button'
import { PageBanner } from './PageBanner'
import { Toast } from './Toast'

const fieldClass =
  'mt-1 w-full rounded-md border border-blue-800/30 bg-white px-3 py-2 text-green-800'

export function PublicContactPage() {
  const { t } = useTranslation()
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const toastTimerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current)
      }
    },
    [],
  )

  function showSentToast() {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current)
    }
    setToastMessage(t('contactSent'))
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null)
      toastTimerRef.current = null
    }, 3500)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) return

    setError(null)
    setSending(true)

    const form = event.currentTarget
    const fd = new FormData(form)
    const name = String(fd.get('name') ?? '').trim()
    const email = String(fd.get('email') ?? '').trim()
    const message = String(fd.get('message') ?? '').trim()

    const { data, error: invokeError } = await supabase.functions.invoke('send-contact', {
      body: { name, email, message },
    })

    setSending(false)

    if (invokeError || !data || (data as { ok?: boolean }).ok !== true) {
      setError(t('contactSendFailed'))
      return
    }

    form.reset()
    showSentToast()
  }

  return (
    <>
      <Toast message={toastMessage} />
      <PageBanner title={t('contact')} />
      <main className="public-page-x flex justify-center py-8 sm:py-10">
        <form
          className="flex w-full max-w-xl flex-col gap-4"
          onSubmit={(e) => void onSubmit(e)}
        >
          <label className="block text-sm text-green-800">
            {t('contactFullName')}
            <input
              type="text"
              name="name"
              autoComplete="name"
              required
              disabled={sending}
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
              disabled={sending}
              className={fieldClass}
            />
          </label>
          <label className="block text-sm text-green-800">
            {t('contactMessage')}
            <textarea
              name="message"
              required
              rows={5}
              disabled={sending}
              className={`${fieldClass} resize-y`}
            />
          </label>
          {error ? (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end">
            <Button type="submit" disabled={sending}>
              {sending ? t('contactSending') : t('contactSend')}
            </Button>
          </div>
        </form>
      </main>
    </>
  )
}

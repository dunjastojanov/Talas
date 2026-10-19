import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'
import { Dialog } from './Dialog'

type LinkInsertDialogProps = {
  open: boolean
  initialText: string
  initialUrl: string
  onClose: () => void
  onConfirm: (text: string, url: string) => void
}

export function LinkInsertDialog({
  open,
  initialText,
  initialUrl,
  onClose,
  onConfirm,
}: LinkInsertDialogProps) {
  const { t } = useTranslation()
  const [text, setText] = useState(initialText)
  const [url, setUrl] = useState(initialUrl)

  useEffect(() => {
    if (open) {
      setText(initialText)
      setUrl(initialUrl)
    }
  }, [open, initialText, initialUrl])

  function handleConfirm() {
    onConfirm(text.trim(), url.trim())
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t('insertLink')}
      className="max-w-2xl"
    >
      <label className="block text-sm text-green-800">
        {t('linkText')}
        <input
          type="text"
          value={text}
          className="mt-1 w-full rounded-md border border-blue-800/30 px-3 py-2"
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <label className="mt-3 block text-sm text-green-800">
        {t('linkUrl')}
        <input
          type="url"
          value={url}
          className="mt-1 w-full rounded-md border border-blue-800/30 px-3 py-2"
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://"
        />
      </label>
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button type="button" onClick={handleConfirm}>
          {t('confirm')}
        </Button>
      </div>
    </Dialog>
  )
}

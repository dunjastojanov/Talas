import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { contentImageUrl } from '../lib/contentImages'
import { Button } from './Button'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'

type ImageBlockFieldProps = {
  imagePath: string | null
  pendingFile: File | null
  onFileChange: (file: File | null) => void
}

export function ImageBlockField({ imagePath, pendingFile, onFileChange }: ImageBlockFieldProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  const pendingPreview = useMemo(
    () => (pendingFile ? URL.createObjectURL(pendingFile) : null),
    [pendingFile],
  )
  useEffect(() => {
    return () => {
      if (pendingPreview) URL.revokeObjectURL(pendingPreview)
    }
  }, [pendingPreview])

  const displayUrl = pendingPreview ?? (imagePath ? contentImageUrl(imagePath) : null)

  function openPicker() {
    inputRef.current?.click()
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          onFileChange(e.target.files?.[0] ?? null)
          e.target.value = ''
        }}
      />
      {displayUrl ? (
        <button
          type="button"
          onClick={openPicker}
          className="group relative h-64 w-full overflow-hidden rounded-lg bg-blue-800/10"
        >
          <img src={displayUrl} alt="" className="h-full w-full object-cover" />
          <span className="absolute inset-0 flex items-center justify-center bg-blue-800/0 px-4 text-center text-sm text-white opacity-0 transition group-hover:bg-blue-800/50 group-hover:opacity-100">
            {t('changeCoverPhoto')}
          </span>
        </button>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="h-64 w-full text-lg"
          onClick={openPicker}
        >
          {t('chooseFile')}
        </Button>
      )}
    </>
  )
}

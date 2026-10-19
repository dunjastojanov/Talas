import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { contentImageUrl } from '../lib/contentImages'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'

type ProjectCoverFieldProps = {
  coverPath: string | null
  pendingFile: File | null
  onPendingFileChange: (file: File | null) => void
}

export function ProjectCoverField({
  coverPath,
  pendingFile,
  onPendingFileChange,
}: ProjectCoverFieldProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  const pendingCoverUrl = useMemo(
    () => (pendingFile ? URL.createObjectURL(pendingFile) : null),
    [pendingFile],
  )
  useEffect(() => {
    return () => {
      if (pendingCoverUrl) URL.revokeObjectURL(pendingCoverUrl)
    }
  }, [pendingCoverUrl])

  const displayUrl =
    pendingCoverUrl ?? (coverPath ? contentImageUrl(coverPath) : null)

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
          onPendingFileChange(e.target.files?.[0] ?? null)
          e.target.value = ''
        }}
      />
      <button
        type="button"
        onClick={openPicker}
        className="group relative h-48 w-full overflow-hidden bg-blue-800/10 sm:h-72"
      >
        {displayUrl ? (
          <img src={displayUrl} alt="" className="h-full w-full object-cover" />
        ) : null}
        <span className="absolute inset-0 flex items-center justify-center bg-blue-800/0 px-4 text-center text-sm text-white opacity-0 transition group-hover:bg-blue-800/50 group-hover:opacity-100">
          {t('changeCoverPhoto')}
        </span>
      </button>
    </>
  )
}

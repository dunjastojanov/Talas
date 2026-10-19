import { useEffect, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

type DialogProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
  centered?: boolean
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  className = '',
  centered = false,
}: DialogProps) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === ref.current) {
      onClose()
    }
  }

  return (
    <dialog
      ref={ref}
      className="fixed inset-0 m-0 hidden h-[100svh] w-full max-h-none max-w-none translate-none items-center justify-center border-0 bg-transparent p-4 shadow-none backdrop:bg-black/40 open:flex"
      onClose={onClose}
      onClick={handleBackdropClick}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
    >
      <div
        role="document"
        className={`w-full max-w-lg rounded-lg border border-blue-800/20 bg-white p-0 shadow-lg ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={`p-4 ${centered ? 'text-center' : ''}`.trim()}>
          <div className="relative flex min-h-8 items-center">
            <h2
              className={`w-full font-display text-xl text-blue-800 ${centered ? 'px-10 text-center' : 'pr-10'}`}
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="absolute right-0 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-blue-800 hover:bg-blue-800/10"
              aria-label={t('close')}
            >
              <img src="/icons/close.svg" alt="" className="size-5" aria-hidden />
            </button>
          </div>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </dialog>
  )
}

type ToastProps = {
  message: string | null
}

export function Toast({ message }: ToastProps) {
  const visible = Boolean(message)

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`pointer-events-none fixed bottom-6 left-1/2 z-[100] max-w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 rounded-md bg-green-800 px-4 py-3 text-center text-sm text-white shadow-lg transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {message ?? ''}
    </div>
  )
}

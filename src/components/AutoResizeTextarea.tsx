import {
  useLayoutEffect,
  useRef,
  type TextareaHTMLAttributes,
} from 'react'

function syncHeight(el: HTMLTextAreaElement) {
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

type AutoResizeTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function AutoResizeTextarea({
  value,
  onChange,
  className = '',
  rows = 1,
  ...rest
}: AutoResizeTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (el) syncHeight(el)
  }, [value])

  return (
    <textarea
      ref={ref}
      rows={rows}
      value={value}
      className={`resize-none overflow-hidden ${className}`.trim()}
      onChange={(e) => {
        syncHeight(e.target)
        onChange?.(e)
      }}
      {...rest}
    />
  )
}

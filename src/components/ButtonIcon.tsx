type ButtonIconProps = {
  src: string
  className?: string
}

/** Renders a public/icons SVG in the current text color (use inside buttons). */
export function ButtonIcon({ src, className = 'size-4' }: ButtonIconProps) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  )
}

export const buttonIcons = {
  plus: '/icons/plus.svg',
  trash: '/icons/trash.svg',
  edit: '/icons/edit.svg',
  chevronUp: '/icons/chevron-up.svg',
  chevronDown: '/icons/chevron-down.svg',
  check: '/icons/check.svg',
} as const

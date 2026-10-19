import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'outline'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'rounded-md bg-gradient-to-r from-blue-800 to-blue-500 px-3 py-2 text-white disabled:opacity-60',
  outline:
    'rounded-md border border-blue-800 bg-transparent px-3 py-2 text-blue-800 hover:bg-blue-800/5 disabled:opacity-60',
}

export function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 ${variantClass[variant]} ${className}`.trim()}
      {...props}
    />
  )
}

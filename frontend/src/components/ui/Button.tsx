import type { ComponentProps } from 'react'

type ButtonVariant = 'primary' | 'secondary'

type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'border-green-900 bg-green-900 text-white hover:bg-green-950 focus-visible:ring-green-100',
  secondary:
    'border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 focus-visible:ring-neutral-200',
}

export default function Button({
  variant = 'primary',
  type = 'button',
  className = '',
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      {...buttonProps}
      type={type}
      className={`
        inline-flex min-h-11 items-center justify-center gap-2
        rounded-lg border px-5 py-2.5 font-semibold transition
        focus-visible:outline-none focus-visible:ring-4
        disabled:cursor-not-allowed disabled:opacity-60
        ${VARIANT_CLASSES[variant]}
        ${className}
      `}
    />
  )
}

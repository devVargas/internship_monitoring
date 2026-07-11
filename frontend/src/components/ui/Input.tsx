import type { ComponentProps } from 'react'

type InputProps = ComponentProps<'input'> & {
  error?: string | null
}

export default function Input({ error, className = '', ...inputProps }: InputProps) {
  const borderClass = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
    : 'border-neutral-300 hover:border-neutral-400 focus:border-green-800 focus:ring-green-100'

  return (
    <input
      {...inputProps}
      aria-invalid={Boolean(error) || undefined}
      className={`
        w-full rounded-lg border bg-white px-3.5 py-3
        text-base text-neutral-900 outline-none transition
        placeholder:text-neutral-400 focus:ring-4
        disabled:cursor-not-allowed disabled:bg-neutral-100
        disabled:text-neutral-500
        ${borderClass}
        ${className}
      `}
    />
  )
}

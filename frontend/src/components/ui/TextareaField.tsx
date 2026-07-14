import type { ComponentProps } from 'react'
import Label from './Label.tsx'

type TextareaFieldProps = ComponentProps<'textarea'> & {
  id: string
  label: string
  error?: string | null
}

export default function TextareaField({
  id,
  label,
  error,
  required = false,
  className = '',
  ...textareaProps
}: TextareaFieldProps) {
  const errorId = `${id}-error`
  const borderClass = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
    : 'border-neutral-300 hover:border-neutral-400 focus:border-green-800 focus:ring-green-100'

  return (
    <div>
      <Label htmlFor={id} text={label} required={required} />

      <textarea
        {...textareaProps}
        id={id}
        rows={4}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? errorId : undefined}
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

      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

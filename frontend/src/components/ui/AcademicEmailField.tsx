import type { ChangeEvent } from 'react'
import {
  ACADEMIC_EMAIL_DOMAIN,
  buildAcademicEmail,
  extractAcademicEmailLocalPart,
} from '../../utils/validation.ts'

type AcademicEmailFieldProps = {
  id: string
  label?: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  required?: boolean
  autoFocus?: boolean
}

export default function AcademicEmailField({
  id,
  label = 'Email acadêmico',
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  autoFocus = false,
}: AcademicEmailFieldProps) {
  const localPart = extractAcademicEmailLocalPart(value)
  const errorId = `${id}-error`

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextLocalPart = event.target.value.replaceAll('@', '')

    onChange(buildAcademicEmail(nextLocalPart))
  }

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-neutral-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-600" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <div
        className={[
          'mt-2 flex overflow-hidden rounded-lg border bg-white',
          'focus-within:ring-2 focus-within:ring-green-700/20',
          error
            ? 'border-red-500 focus-within:border-red-500'
            : 'border-neutral-300 focus-within:border-green-700',
          disabled ? 'bg-neutral-100 opacity-70' : '',
        ].join(' ')}
      >
        <input
          id={id}
          name={id}
          type="text"
          value={localPart}
          onChange={handleChange}
          autoComplete="username"
          autoFocus={autoFocus}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-neutral-950 outline-none placeholder:text-neutral-400"
        />

        <span className="flex shrink-0 items-center border-l border-neutral-300 bg-neutral-50 px-3 text-sm text-neutral-600">
          {ACADEMIC_EMAIL_DOMAIN}
        </span>
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-sm text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  )
}
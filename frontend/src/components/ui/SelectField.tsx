import type { ComponentProps } from 'react'
import Label from './Label.tsx'

type SelectOption = {
  value: string
  label: string
}

type SelectFieldProps = Omit<ComponentProps<'select'>, 'id'> & {
  id: string
  label: string
  options: readonly SelectOption[]
  error?: string | null
  placeholder?: string
}

export default function SelectField({
  id,
  label,
  options,
  error,
  placeholder = 'Selecione',
  required = false,
  className = '',
  ...selectProps
}: SelectFieldProps) {
  const errorId = `${id}-error`
  const borderClass = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
    : 'border-neutral-300 hover:border-neutral-400 focus:border-green-800 focus:ring-green-100'

  return (
    <div>
      <Label htmlFor={id} text={label} required={required} />

      <select
        {...selectProps}
        id={id}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? errorId : undefined}
        className={`
          w-full rounded-lg border bg-white px-3.5 py-3
          text-base text-neutral-900 outline-none transition
          focus:ring-4 disabled:cursor-not-allowed disabled:bg-neutral-100
          disabled:text-neutral-500
          ${borderClass}
          ${className}
        `}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

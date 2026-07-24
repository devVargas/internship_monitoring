import { useEffect, useRef } from 'react'
import type { ChangeEvent } from 'react'
import Label from './Label.tsx'

type FileUploadFieldProps = {
  id: string
  label: string
  required?: boolean
  error?: string | null
  value: File | null
  onChange: (file: File | null) => void
}

export default function FileUploadField({
  id,
  label,
  required = true,
  error,
  value,
  onChange,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const errorId = `${id}-error`

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null

    onChange(file)
  }

  function handleClear() {
    onChange(null)

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  useEffect(() => {
    if (!value && inputRef.current) {
      inputRef.current.value = ''
    }
  }, [value])

  const borderClass = error
    ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-100'
    : 'border-neutral-300 hover:border-neutral-400 focus-within:border-green-800 focus-within:ring-green-100'

  return (
    <div>
      <Label htmlFor={id} text={label} required={required} />

      <div
        className={`
          flex items-center gap-3 rounded-lg border bg-white px-3.5 py-3
          outline-none transition focus-within:ring-4
          ${borderClass}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          onChange={handleChange}
          className="sr-only"
          id={id}
          aria-describedby={error ? errorId : undefined}
        />

        <label
          htmlFor={id}
          className="cursor-pointer whitespace-nowrap rounded-md border border-neutral-300 bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
        >
          Selecionar PDF
        </label>

        <span className="min-w-0 flex-1 truncate text-sm text-neutral-600">
          {value?.name || 'Nenhum arquivo selecionado'}
        </span>

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="whitespace-nowrap rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Remover
          </button>
        )}
      </div>

      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

import type { ComponentProps } from 'react'
import Input from './Input.tsx'
import Label from './Label.tsx'

type FormFieldProps = Omit<ComponentProps<typeof Input>, 'id'> & {
  id: string
  label: string
  error?: string | null
}

export default function FormField({
  id,
  label,
  error,
  required = false,
  ...inputProps
}: FormFieldProps) {
  const errorId = `${id}-error`

  return (
    <div>
      <Label htmlFor={id} text={label} required={required} />

      <Input
        {...inputProps}
        id={id}
        error={error}
        required={required}
        aria-describedby={error ? errorId : undefined}
      />

      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

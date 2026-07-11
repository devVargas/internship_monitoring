import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState, type ComponentProps } from 'react'
import Input from './Input.tsx'
import Label from './Label.tsx'

type PasswordFieldProps = Omit<ComponentProps<typeof Input>, 'id' | 'type'> & {
  id: string
  label: string
  error?: string | null
}

export default function PasswordField({
  id,
  label,
  error,
  required = false,
  ...inputProps
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)
  const errorId = `${id}-error`
  const buttonLabel = isVisible ? 'Ocultar senha' : 'Mostrar senha'

  function toggleVisibility() {
    setIsVisible((visible) => !visible)
  }

  return (
    <div>
      <Label htmlFor={id} text={label} required={required} />

      <div className="relative">
        <Input
          {...inputProps}
          id={id}
          type={isVisible ? 'text' : 'password'}
          error={error}
          required={required}
          aria-describedby={error ? errorId : undefined}
          className="pr-12"
        />

        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-neutral-500 transition hover:text-green-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
          aria-label={buttonLabel}
          title={buttonLabel}
        >
          <FontAwesomeIcon icon={isVisible ? faEyeSlash : faEye} />
        </button>
      </div>

      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

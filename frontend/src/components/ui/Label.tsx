import type { ComponentProps } from 'react'

type LabelProps = ComponentProps<'label'> & {
  text: string
  required?: boolean
}

export default function Label({
  text,
  required = false,
  className = '',
  ...labelProps
}: LabelProps) {
  return (
    <label
      {...labelProps}
      className={`mb-1.5 block text-sm font-medium text-neutral-800 ${className}`}
    >
      {text}

      {required && (
        <span className="ml-1 text-red-600" aria-hidden="true">
          *
        </span>
      )}
    </label>
  )
}

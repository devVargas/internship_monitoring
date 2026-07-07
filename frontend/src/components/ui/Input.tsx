interface InputProps {
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  error?: string | null
}

export default function Input({ type, placeholder, value, onChange, onKeyDown, error }: InputProps) {
  const borderClass = error
    ? 'border-red-500 focus:border-red-500 hover:border-red-500'
    : 'border-input-border focus:border-slate-400 hover:border-neutral-500'

  return (
    <input
      type={type ?? 'text'}
      className={`w-full bg-input-bg font-outfit font-normal placeholder:text-input-text text-neutral-700 text-base rounded-md pl-3 pr-10 px-4 py-3 border ${borderClass} focus:outline-none`}
      placeholder={placeholder}
      onChange={onChange}
      onKeyDown={onKeyDown}
      value={value}
    />
  )
}


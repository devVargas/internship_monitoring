import { selectClass } from './documentFormStyles.ts'

type RatingSelectProps = {
  id: string
  label: string
  value: string
  error?: string | null
  onChange: (value: string) => void
}

export default function RatingSelect({ id, label, value, error, onChange }: RatingSelectProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-neutral-800"
      >
        {label} <span className="text-red-600">*</span>
      </label>

      <select
        id={id}
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
        }}
        className={selectClass(error)}
      >
        <option value="">Selecione...</option>
        <option value="O">Ótimo</option>
        <option value="MB">Muito bom</option>
        <option value="B">Bom</option>
        <option value="R">Regular</option>
        <option value="I">Insuficiente</option>
      </select>

      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

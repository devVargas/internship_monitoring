import { useEffect, useState } from 'react'
import Input from '../ui/Input.tsx'
import Button from '../ui/Button.tsx'
import HideIcon from '../ui/HideIcon.tsx'
import Label from '../ui/Label.tsx'
import { useRegisterSupervisor } from '../../hooks/useRegisterSupervisor.ts'
import {
  validateRequired,
  validateEmail,
  validatePasswordCreation,
  validatePhone,
  validateName,
  formatPhone,
} from '../../utils/validation.ts'

const initialForm = {
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
  companyName: '',
  companyCnpj: '',
  phoneNumber: '',
}

export default function SupervisorForm() {
  const [form, setForm] = useState({ ...initialForm })
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmVisible, setIsConfirmVisible] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const { register, isLoading, error, success } = useRegisterSupervisor()

  useEffect(() => {
    if (success) {
      setForm({ ...initialForm })
      setFieldErrors({})
    }
  }, [success])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    const form = e.currentTarget.closest('form')
    if (!form) return
    const inputs = form.querySelectorAll<HTMLInputElement>('input')
    const idx = Array.from(inputs).indexOf(e.currentTarget)
    if (idx < inputs.length - 1) {
      e.preventDefault()
      inputs[idx + 1].focus()
    }
  }

  function setFieldError(field: string, errorMsg: string | null) {
    setFieldErrors((prev) => {
      if (errorMsg) return { ...prev, [field]: errorMsg }
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function validateField(field: string, value: string) {
    let err: string | null = validateRequired(value)
    if (!err) {
      switch (field) {
        case 'firstName':
        case 'lastName':
          err = validateName(value)
          break
        case 'email':
          err = validateEmail(value)
          break
        case 'password':
          err = validatePasswordCreation(value)
          break
        case 'confirmPassword':
          if (form.password !== value) err = 'As senhas não coincidem'
          break
        case 'phoneNumber':
          err = validatePhone(value)
          break
      }
    }
    setFieldError(field, err)
  }

  function validateAll(): boolean {
    const rules: [string, string][] = [
      ['firstName', form.firstName],
      ['lastName', form.lastName],
      ['email', form.email],
      ['companyName', form.companyName],
      ['companyCnpj', form.companyCnpj],
      ['phoneNumber', form.phoneNumber],
      ['password', form.password],
      ['confirmPassword', form.confirmPassword],
    ]

    setFieldErrors({})
    let valid = true
    for (const [field, value] of rules) {
      let err: string | null = validateRequired(value)
      if (!err) {
        switch (field) {
          case 'firstName':
          case 'lastName':
            err = validateName(value)
            break
          case 'email':
            err = validateEmail(value)
            break
          case 'password':
            err = validatePasswordCreation(value)
            break
          case 'confirmPassword':
            if (form.password !== value) err = 'As senhas não coincidem'
            break
          case 'phoneNumber':
            err = validatePhone(value)
            break
        }
      }
      if (err) {
        setFieldError(field, err)
        valid = false
      }
    }
    return valid
  }

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    validateField(field, value)
  }

  function handlePhoneChange(raw: string) {
    const formatted = formatPhone(raw)
    setForm((prev) => ({ ...prev, phoneNumber: formatted }))
    validateField('phoneNumber', formatted)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setValidationError(null)

    if (!validateAll()) return

    await register({
      email: form.email,
      first_name: form.firstName,
      last_name: form.lastName,
      password: form.password,
      company_name: form.companyName,
      company_cnpj: form.companyCnpj,
      phone_number: form.phoneNumber,
    })
  }

  const displayError = validationError || error

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div>
          <Label text="Nome" />
          <Input
            value={form.firstName}
            onChange={(e) => set('firstName', e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Insira seu nome"
            error={fieldErrors.firstName}
          />
          {fieldErrors.firstName && <p className="text-red-500 text-sm mt-1">{fieldErrors.firstName}</p>}
        </div>

        <div>
          <Label text="Sobrenome" />
          <Input
            value={form.lastName}
            onChange={(e) => set('lastName', e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Insira seu sobrenome"
            error={fieldErrors.lastName}
          />
          {fieldErrors.lastName && <p className="text-red-500 text-sm mt-1">{fieldErrors.lastName}</p>}
        </div>

        <div>
          <Label text="Email" />
          <Input
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Insira seu email"
            error={fieldErrors.email}
          />
          {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
        </div>

        <div>
          <Label text="Empresa" />
          <Input
            value={form.companyName}
            onChange={(e) => set('companyName', e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Insira o nome da empresa"
            error={fieldErrors.companyName}
          />
          {fieldErrors.companyName && <p className="text-red-500 text-sm mt-1">{fieldErrors.companyName}</p>}
        </div>

        <div>
          <Label text="CNPJ" />
          <Input
            value={form.companyCnpj}
            onChange={(e) => set('companyCnpj', e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Insira o CNPJ"
            error={fieldErrors.companyCnpj}
          />
          {fieldErrors.companyCnpj && <p className="text-red-500 text-sm mt-1">{fieldErrors.companyCnpj}</p>}
        </div>

        <div>
          <Label text="Telefone" />
          <Input
            value={form.phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Insira seu telefone"
            error={fieldErrors.phoneNumber}
          />
          {fieldErrors.phoneNumber && <p className="text-red-500 text-sm mt-1">{fieldErrors.phoneNumber}</p>}
        </div>

        <div>
          <Label text="Senha" />
          <div className="relative">
            <Input
              value={form.password}
              type={isPasswordVisible ? 'text' : 'password'}
              onChange={(e) => set('password', e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Insira sua senha"
              error={fieldErrors.password}
            />
            <HideIcon
              visible={isPasswordVisible}
              toggleFunction={() => setIsPasswordVisible(!isPasswordVisible)}
            />
          </div>
          {fieldErrors.password && <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>}
        </div>

        <div>
          <Label text="Confirmar Senha" />
          <div className="relative">
            <Input
              value={form.confirmPassword}
              type={isConfirmVisible ? 'text' : 'password'}
              onChange={(e) => set('confirmPassword', e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Confirme sua senha"
              error={fieldErrors.confirmPassword}
            />
            <HideIcon
              visible={isConfirmVisible}
              toggleFunction={() => setIsConfirmVisible(!isConfirmVisible)}
            />
          </div>
          {fieldErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{fieldErrors.confirmPassword}</p>}
        </div>
      </div>

      <div className="grid mt-2">
        <Button type="submit" text={isLoading ? 'Cadastrando...' : 'Cadastrar'} />
      </div>

      {displayError && (
        <p className="text-red-600 text-center">{displayError}</p>
      )}
    </form>
  )
}

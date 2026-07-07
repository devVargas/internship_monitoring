import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../ui/Input.tsx'
import Button from '../ui/Button.tsx'
import HideIcon from '../ui/HideIcon.tsx'
import Label from '../ui/Label.tsx'
import { useRegisterStudent } from '../../hooks/useRegisterStudent.ts'
import {
  validateRequired,
  validateEmail,
  validatePasswordCreation,
  validatePhone,
  validateName,
  formatPhone,
} from '../../utils/validation.ts'

export default function NewStudent() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [course, setCourse] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [campus, setCampus] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmVisible, setIsConfirmVisible] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const { register, isLoading, error, success } = useRegisterStudent()
  const navigate = useNavigate()

  if (success) {
    navigate('/login')
  }

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
          if (password !== value) err = 'As senhas não coincidem'
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
      ['firstName', firstName],
      ['lastName', lastName],
      ['email', email],
      ['password', password],
      ['confirmPassword', confirmPassword],
      ['registrationNumber', registrationNumber],
      ['campus', campus],
      ['course', course],
      ['phoneNumber', phoneNumber],
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
            if (password !== value) err = 'As senhas não coincidem'
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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setValidationError(null)

    if (!validateAll()) return

    await register({
      email,
      first_name: firstName,
      last_name: lastName,
      password,
      registration_number: registrationNumber,
      campus,
      course,
      phone_number: phoneNumber,
    })
  }

  const displayError = validationError || error

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-900 px-6">
      <form
        onSubmit={handleSubmit}
        className="flex w-full text-left max-w-sm flex-col gap-4 bg-white p-8 rounded-lg"
      >
        <div className="flex flex-col gap-4">
          <div>
            <Label text="Nome" />
            <Input
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value)
                validateField('firstName', e.target.value)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Insira seu nome"
              error={fieldErrors.firstName}
            />
            {fieldErrors.firstName && <p className="text-red-500 text-sm mt-1">{fieldErrors.firstName}</p>}
          </div>

          <div>
            <Label text="Sobrenome" />
            <Input
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value)
                validateField('lastName', e.target.value)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Insira seu sobrenome"
              error={fieldErrors.lastName}
            />
            {fieldErrors.lastName && <p className="text-red-500 text-sm mt-1">{fieldErrors.lastName}</p>}
          </div>

          <div>
            <Label text="Email" />
            <Input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                validateField('email', e.target.value)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Insira seu email"
              error={fieldErrors.email}
            />
            {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <Label text="Senha" />
            <div className="relative">
              <Input
                value={password}
                type={isPasswordVisible ? 'text' : 'password'}
                onChange={(e) => {
                  setPassword(e.target.value)
                  validateField('password', e.target.value)
                }}
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
                value={confirmPassword}
                type={isConfirmVisible ? 'text' : 'password'}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  validateField('confirmPassword', e.target.value)
                }}
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

          <div>
            <Label text="Matrícula" />
            <Input
              value={registrationNumber}
              onChange={(e) => {
                setRegistrationNumber(e.target.value)
                validateField('registrationNumber', e.target.value)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Insira sua matrícula"
              error={fieldErrors.registrationNumber}
            />
            {fieldErrors.registrationNumber && <p className="text-red-500 text-sm mt-1">{fieldErrors.registrationNumber}</p>}
          </div>

          <div>
            <Label text="Campus" />
            <Input
              value={campus}
              onChange={(e) => {
                setCampus(e.target.value)
                validateField('campus', e.target.value)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Insira seu campus"
              error={fieldErrors.campus}
            />
            {fieldErrors.campus && <p className="text-red-500 text-sm mt-1">{fieldErrors.campus}</p>}
          </div>

          <div>
            <Label text="Curso" />
            <Input
              value={course}
              onChange={(e) => {
                setCourse(e.target.value)
                validateField('course', e.target.value)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Insira seu curso"
              error={fieldErrors.course}
            />
            {fieldErrors.course && <p className="text-red-500 text-sm mt-1">{fieldErrors.course}</p>}
          </div>

          <div>
            <Label text="Telefone" />
            <Input
              value={phoneNumber}
              onChange={(e) => {
                const formatted = formatPhone(e.target.value)
                setPhoneNumber(formatted)
                validateField('phoneNumber', formatted)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Insira seu telefone"
              error={fieldErrors.phoneNumber}
            />
            {fieldErrors.phoneNumber && <p className="text-red-500 text-sm mt-1">{fieldErrors.phoneNumber}</p>}
          </div>
        </div>

        <div className="grid mt-2">
          <Button type="submit" text={isLoading ? 'Cadastrando...' : 'Cadastrar'} />
        </div>

        {displayError && (
          <p className="text-red-600 text-center">{displayError}</p>
        )}
      </form>
    </div>
  )
}
import { useState } from 'react'
import Input from './Input.tsx'
import Button from './Button.tsx'
import HideIcon from './HideIcon.tsx'
import Label from './Label.tsx'
import { useNavigate } from 'react-router-dom'
import { validateRequired } from '../../utils/validation.ts'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const navigate = useNavigate()

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible)
  }

  function setFieldError(field: string, errorMsg: string | null) {
    setFieldErrors((prev) => {
      if (errorMsg) return { ...prev, [field]: errorMsg }
      const next = { ...prev }
      delete next[field]
      return next
    })
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

  function validateField(field: string, value: string) {
    const err = validateRequired(value)
    setFieldError(field, err)
  }

  function validateAll(): boolean {
    const uErr = validateRequired(username)
    const pErr = validateRequired(password)
    setFieldErrors({})
    if (uErr) setFieldError('username', uErr)
    if (pErr) setFieldError('password', pErr)
    return !uErr && !pErr
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')

    if (!validateAll()) return

    try {
      const response = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.detail == 'No active account found with the given credentials') {
          throw new Error('Usuário ou senha inválido')
        } else {
          throw new Error(data.message || 'Erro ao tentar fazer login')
        }
      }
      localStorage.setItem('accessToken', data.access)
      localStorage.setItem('refreshToken', data.refresh)
      navigate('/')
    } catch (err) {
            setError((err as Error).message)
        }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3 bg-transparent p-8 ">
      <Label text="Usuário" />
      <Input
        value={username}
        onChange={(e) => {
          setUsername(e.target.value)
          validateField('username', e.target.value)
        }}
        onKeyDown={handleKeyDown}
        placeholder="Insira seu usuário"
        error={fieldErrors.username}
      />
      {fieldErrors.username && <p className="text-red-500 text-sm -mt-2">{fieldErrors.username}</p>}

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
        <HideIcon visible={isPasswordVisible} toggleFunction={togglePasswordVisibility} />
      </div>
      {fieldErrors.password && <p className="text-red-500 text-sm -mt-2">{fieldErrors.password}</p>}

      <br />
      <Button type="submit" text="Entrar" />

      {error && <p className="text-red-600">{error}</p>}
    </form>
  )
}

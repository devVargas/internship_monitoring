import { useEffect, useState } from 'react'
import Input from '../ui/Input.tsx'
import Button from '../ui/Button.tsx'
import HideIcon from '../ui/HideIcon.tsx'
import Label from '../ui/Label.tsx'
import { useRegisterProfessor } from '../../hooks/useRegisterProfessor.ts'

const initialForm = {
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
}

export default function NewProfessor() {
  const [form, setForm] = useState({ ...initialForm })
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmVisible, setIsConfirmVisible] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const { register, isLoading, error, success } = useRegisterProfessor()

  useEffect(() => {
    if (success) {
      setForm({ ...initialForm })
    }
  }, [success])

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setValidationError(null)

    if (form.password !== form.confirmPassword) {
      setValidationError('As senhas não coincidem')
      return
    }

    await register({
      email: form.email,
      first_name: form.firstName,
      last_name: form.lastName,
      password: form.password,
    })
  }

  const displayError = validationError || error

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-900 px-6">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 bg-white p-8 rounded-lg"
      >

        <div className="flex flex-col gap-4">
          <div>
            <Label text="Nome" />
            <Input
              value={form.firstName}
              onChange={(e) => set('firstName', e.target.value)}
              placeholder="Insira seu nome"
            />
          </div>

          <div>
            <Label text="Sobrenome" />
            <Input
              value={form.lastName}
              onChange={(e) => set('lastName', e.target.value)}
              placeholder="Insira seu sobrenome"
            />
          </div>

          <div>
            <Label text="Email" />
            <Input
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="Insira seu email"
            />
          </div>

          <div>
            <Label text="Senha" />
            <div className="relative">
              <Input
                value={form.password}
                type={isPasswordVisible ? 'text' : 'password'}
                onChange={(e) => set('password', e.target.value)}
                placeholder="Insira sua senha"
              />
              <HideIcon
                visible={isPasswordVisible}
                toggleFunction={() => setIsPasswordVisible(!isPasswordVisible)}
              />
            </div>
          </div>

          <div>
            <Label text="Confirmar Senha" />
            <div className="relative">
              <Input
                value={form.confirmPassword}
                type={isConfirmVisible ? 'text' : 'password'}
                onChange={(e) => set('confirmPassword', e.target.value)}
                placeholder="Confirme sua senha"
              />
              <HideIcon
                visible={isConfirmVisible}
                toggleFunction={() => setIsConfirmVisible(!isConfirmVisible)}
              />
            </div>
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

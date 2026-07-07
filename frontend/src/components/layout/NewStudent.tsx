import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../ui/Input.tsx'
import Button from '../ui/Button.tsx'
import HideIcon from '../ui/HideIcon.tsx'
import Label from '../ui/Label.tsx'
import { useRegisterStudent } from '../../hooks/useRegisterStudent.ts'

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
  const { register, isLoading, error, success } = useRegisterStudent()
  const navigate = useNavigate()

  if (success) {
    navigate('/login')
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setValidationError(null)

    if (password !== confirmPassword) {
      setValidationError('As senhas não coincidem')
      return
    }

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
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Insira seu nome"
            />
          </div>

          <div>
            <Label text="Sobrenome" />
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Insira seu sobrenome"
            />
          </div>

          <div>
            <Label text="Email" />
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Insira seu email"
            />
          </div>

          <div>
            <Label text="Senha" />
            <div className="relative">
              <Input
                value={password}
                type={isPasswordVisible ? 'text' : 'password'}
                onChange={(e) => setPassword(e.target.value)}
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
                value={confirmPassword}
                type={isConfirmVisible ? 'text' : 'password'}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua senha"
              />
              <HideIcon
                visible={isConfirmVisible}
                toggleFunction={() => setIsConfirmVisible(!isConfirmVisible)}
              />
            </div>
          </div>

          <div>
            <Label text="Matrícula" />
            <Input
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              placeholder="Insira sua matrícula"
            />
          </div>

          <div>
            <Label text="Campus" />
            <Input
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              placeholder="Insira seu campus"
            />
          </div>

          <div>
            <Label text="Curso" />
            <Input
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Insira seu curso"
            />
          </div>

          <div>
            <Label text="Telefone" />
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Insira seu telefone"
            />
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
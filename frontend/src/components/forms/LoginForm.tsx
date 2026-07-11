import { faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState, type ChangeEvent, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.ts'
import { getErrorMessage } from '../../utils/errors.ts'
import { validateRequired } from '../../utils/validation.ts'
import Button from '../ui/Button.tsx'
import FormField from '../ui/FormField.tsx'
import PasswordField from '../ui/PasswordField.tsx'

type LoginErrors = {
  username?: string
  password?: string
}

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({})
  const [requestError, setRequestError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  function handleUsernameChange(event: ChangeEvent<HTMLInputElement>) {
    setUsername(event.target.value)
    setFieldErrors((errors) => ({ ...errors, username: undefined }))
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value)
    setFieldErrors((errors) => ({ ...errors, password: undefined }))
  }

  function validateForm(): boolean {
    const errors: LoginErrors = {
      username: validateRequired(username) ?? undefined,
      password: validateRequired(password) ?? undefined,
    }

    setFieldErrors(errors)
    return !errors.username && !errors.password
  }

  async function submitLogin(): Promise<void> {
    setRequestError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await login(username.trim(), password)
      navigate('/', { replace: true })
    } catch (error) {
      setRequestError(getErrorMessage(error, 'Erro ao tentar fazer login'))
    } finally {
      setIsLoading(false)
    }
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    void submitLogin()
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-8">
        <p className="text-sm font-semibold text-green-900">Bem-vindo</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
          Entre na sua conta
        </h1>
        <p className="mt-2 text-neutral-600">Informe suas credenciais para acessar o sistema.</p>
      </div>

      <div className="space-y-5">
        <FormField
          id="username"
          name="username"
          label="Usuário"
          value={username}
          onChange={handleUsernameChange}
          placeholder="Digite seu usuário"
          autoComplete="username"
          autoFocus
          required
          disabled={isLoading}
          error={fieldErrors.username}
        />

        <PasswordField
          id="password"
          name="password"
          label="Senha"
          value={password}
          onChange={handlePasswordChange}
          placeholder="Digite sua senha"
          autoComplete="current-password"
          required
          disabled={isLoading}
          error={fieldErrors.password}
        />
      </div>

      {requestError && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {requestError}
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="mt-6 w-full">
        <FontAwesomeIcon icon={faArrowRightToBracket} />
        {isLoading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  )
}

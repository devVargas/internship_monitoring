import { useState } from 'react'
import Input from './Input.tsx'
import Button from './Button.tsx'
import HideIcon from './HideIcon.tsx'
import Label from './Label.tsx'
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    async function handleSubmit(event) {
        event.preventDefault()

        try {
            const response = await fetch('/api/auth/login/', {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                username,
                password,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            if(data.detail == 'No active account found with the given credentials') {
                throw new Error('Usuário ou senha inválido')
            } else {
                throw new Error(data.message || 'Erro ao tentar fazer login')
            }
        }
        console.log(data)
        localStorage.setItem("accessToken", data.access)
        localStorage.setItem("refreshToken", data.refresh)
        navigate('/')

        } catch (err) {
            setError(err.message)
        }
    }

    return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3 bg-transparent p-8 ">
        <Label text="Usuário" />
        <Input value={username} onChange={(e) => {setUsername(e.target.value)}} placeholder="Insira seu usuário"/>

        <Label text="Senha" />
        <div className="relative">
            <Input value={password} type={isPasswordVisible ? "text" : "password" }  onChange={(e) => {setPassword(e.target.value)}} placeholder="Insira sua senha"/>
            <HideIcon visible={isPasswordVisible} toggleFunction={togglePasswordVisibility}/>
        </div>

        <br/>
        <Button type="submit" text="Entrar"/>

      {error && (
        <p className="text-red-600">
          {error}
        </p>
      )}
    </form>
  )
}

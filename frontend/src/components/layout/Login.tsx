import { Link } from 'react-router-dom'
import LoginForm from '../ui/LoginForm.tsx'

export default function Login() {
    return (
    <div className="flex min-h-screen">
        <div className="hidden md:flex flex-1">
            <img src="/src/assets/login.jpg" alt="Login" className="max-h-screen h-full w-full object-cover" />
      </div>

      <div className="flex w-full md:max-w-md items-center justify-center bg-white px-6">
          <div className="w-full">
            <LoginForm />
            <p className="text-center mt-4 font-outfit text-neutral-700">
              Não tem conta?{' '}
              <Link to="/cadastro" className="text-green-900 hover:underline font-semibold">
                Cadastre-se
              </Link>
            </p>
          </div>
      </div>
    </div>
    );
}

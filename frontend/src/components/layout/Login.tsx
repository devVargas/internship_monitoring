import LoginForm from '../ui/LoginForm.tsx'

export default function Login() {
    return (
    <div className="flex min-h-screen">
        <div className="hidden md:flex flex-1">
            <img src="/src/assets/login.jpg" alt="Login" className="max-h-screen h-full w-full object-cover" />
      </div>

      <div className="flex w-full md:max-w-md items-center justify-center bg-white px-6">
          <LoginForm />
      </div>
    </div>
    );
}

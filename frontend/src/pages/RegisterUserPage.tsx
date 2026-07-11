import { useState, type ChangeEvent } from 'react'
import ProfessorForm from '../components/forms/ProfessorForm.tsx'
import SupervisorForm from '../components/forms/SupervisorForm.tsx'
import StaffPageLayout from '../components/layout/StaffPageLayout.tsx'

type UserType = 'professor' | 'supervisor'

export default function RegisterUserPage() {
  const [userType, setUserType] = useState<UserType>('professor')

  function handleUserTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    setUserType(event.target.value as UserType)
  }

  return (
    <StaffPageLayout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-950">Cadastro de usuário</h1>
          <p className="mt-2 text-neutral-600">Crie um novo professor ou supervisor.</p>
        </div>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <label htmlFor="userType" className="mb-1.5 block text-sm font-medium text-neutral-800">
            Tipo de usuário
          </label>
          <select
            id="userType"
            value={userType}
            onChange={handleUserTypeChange}
            className="mb-6 w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-3 text-neutral-900 outline-none transition hover:border-neutral-400 focus:border-green-800 focus:ring-4 focus:ring-green-100"
          >
            <option value="professor">Professor</option>
            <option value="supervisor">Supervisor</option>
          </select>

          {userType === 'professor' ? <ProfessorForm /> : <SupervisorForm />}
        </section>
      </div>
    </StaffPageLayout>
  )
}

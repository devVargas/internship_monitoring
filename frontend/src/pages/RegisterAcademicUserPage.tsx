import { useState, type ChangeEvent } from 'react'
import type { AcademicUserType } from '../api/auth.ts'
import AcademicUserForm from '../components/forms/AcademicUserForm.tsx'
import DashboardLayout from '../components/layout/DashboardLayout.tsx'

export default function RegisterAcademicUserPage() {
  const [userType, setUserType] =
    useState<AcademicUserType>('professor')

  function handleUserTypeChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    const selectedType = event.target.value

    if (
      selectedType === 'professor' ||
      selectedType === 'coordinator'
    ) {
      setUserType(selectedType)
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <p className="text-sm font-semibold text-green-800">
            Gestão acadêmica
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
            Cadastrar usuário acadêmico
          </h1>

          <p className="mt-2 text-neutral-600">
            Cadastre professores e coordenadores.
          </p>
        </header>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <label
              htmlFor="academicUserType"
              className="mb-1.5 block text-sm font-medium text-neutral-800"
            >
              Tipo de usuário{' '}
              <span className="text-red-600">*</span>
            </label>

            <select
              id="academicUserType"
              value={userType}
              onChange={handleUserTypeChange}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-3 text-neutral-900 outline-none transition hover:border-neutral-400 focus:border-green-800 focus:ring-4 focus:ring-green-100"
            >
              <option value="professor">
                Professor
              </option>

              <option value="coordinator">
                Coordenador
              </option>
            </select>
          </div>

          <AcademicUserForm userType={userType} />
        </section>
      </div>
    </DashboardLayout>
  )
}
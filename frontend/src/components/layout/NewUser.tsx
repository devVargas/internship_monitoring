import { useState } from 'react'
import ProfessorBar from '../ui/ProfessorBar.tsx'
import ProfessorForm from './ProfessorForm.tsx'
import SupervisorForm from './SupervisorForm.tsx'

export default function NewUser() {
  const [userType, setUserType] = useState<'professor' | 'supervisor'>('professor')

  return (
    <div className="flex min-h-screen">
      <ProfessorBar />
      <div className="flex-1 flex items-center justify-center bg-green-900 px-6">
        <div className="flex w-full max-w-sm flex-col gap-4 bg-white p-8 rounded-lg">
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value as 'professor' | 'supervisor')}
            className="w-full border border-input-border rounded-md px-4 py-3 bg-input-bg text-neutral-700 font-outfit text-base focus:outline-none focus:border-slate-400 hover:border-neutral-500"
          >
            <option value="professor">Professor</option>
            <option value="supervisor">Supervisor</option>
          </select>

          {userType === 'professor' ? <ProfessorForm /> : <SupervisorForm />}
        </div>
      </div>
    </div>
  )
}
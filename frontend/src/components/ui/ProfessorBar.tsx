import Button from './Button.tsx'

export default function ProfessorBar() {
  return (
    <div className="h-screen w-60 bg-white flex flex-col min-h-screen align-center justify-center gap-4 py-8 shadow-md">
      <div className="grid mt-2 gap-y-4 min-w-[100%]">
        <Button color="white" LinkTo="/cadastro-usuario" text="Cadastro" />
        <Button color="white" LinkTo="/alunos" text="Alunos" />
      </div>
    </div>
  )
}

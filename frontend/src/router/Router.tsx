import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from '../App.tsx'
import ProtectedRoute from '../components/ProtectedRoute.tsx'
import StaffRoute from '../components/StaffRoute.tsx'
import Login from '../components/layout/Login.tsx'
import LoginForm from '../components/ui/LoginForm.tsx'
import NewProfessor from '../components/layout/NewProfessor.tsx'
import NewStudent from '../components/layout/NewStudent.tsx'
import StudentsTable from '../components/layout/StudentsTable.tsx'

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<NewStudent />} />
        <Route
          path="/cadastro-professor"
          element={
            <StaffRoute>
              <NewProfessor />
            </StaffRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alunos"
          element={
            <ProtectedRoute>
              <StudentsTable />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

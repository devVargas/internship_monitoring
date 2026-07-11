import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/routing/ProtectedRoute.tsx'
import StaffRoute from '../components/routing/StaffRoute.tsx'
import HomePage from '../pages/HomePage.tsx'
import LoginPage from '../pages/LoginPage.tsx'
import RegisterStudentPage from '../pages/RegisterStudentPage.tsx'
import RegisterUserPage from '../pages/RegisterUserPage.tsx'
import StudentsPage from '../pages/StudentsPage.tsx'

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterStudentPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cadastro-usuario"
          element={
            <StaffRoute>
              <RegisterUserPage />
            </StaffRoute>
          }
        />

        <Route
          path="/alunos"
          element={
            <StaffRoute>
              <StudentsPage />
            </StaffRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

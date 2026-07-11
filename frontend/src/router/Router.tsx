import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import ProtectedRoute from '../components/routing/ProtectedRoute.tsx'
import StaffRoute from '../components/routing/StaffRoute.tsx'
import HomePage from '../pages/HomePage.tsx'
import LoginPage from '../pages/LoginPage.tsx'
import RegisterProfessorPage from '../pages/RegisterProfessorPage.tsx'
import RegisterStudentPage from '../pages/RegisterStudentPage.tsx'
import RegisterSupervisorPage from '../pages/RegisterSupervisorPage.tsx'
import StudentsPage from '../pages/StudentsPage.tsx'

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/cadastro"
          element={
            <Navigate
              to="/cadastro/aluno"
              replace
            />
          }
        />

        <Route
          path="/cadastro/aluno"
          element={<RegisterStudentPage />}
        />

        <Route
          path="/cadastro/supervisor"
          element={<RegisterSupervisorPage />}
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cadastro-professor"
          element={
            <StaffRoute>
              <RegisterProfessorPage />
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

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
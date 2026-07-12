import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import ProtectedRoute from '../components/routing/ProtectedRoute.tsx'
import RoleProtectedRoute from '../components/routing/RoleProtectedRoute.tsx'
import DashboardPage from '../pages/DashboardPage.tsx'
import LoginPage from '../pages/LoginPage.tsx'
import RegisterProfessorPage from '../pages/RegisterProfessorPage.tsx'
import RegisterStudentPage from '../pages/RegisterStudentPage.tsx'
import RegisterSupervisorPage from '../pages/RegisterSupervisorPage.tsx'
import StudentsPage from '../pages/StudentsPage.tsx'

const MANAGEMENT_GROUPS = [
  'Teacher',
  'Coordinator',
] as const

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
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cadastro-professor"
          element={
            <RoleProtectedRoute
              allowedGroups={MANAGEMENT_GROUPS}
            >
              <RegisterProfessorPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/alunos"
          element={
            <RoleProtectedRoute
              allowedGroups={MANAGEMENT_GROUPS}
            >
              <StudentsPage />
            </RoleProtectedRoute>
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
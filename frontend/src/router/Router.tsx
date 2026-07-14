import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/routing/ProtectedRoute.tsx'
import RoleProtectedRoute from '../components/routing/RoleProtectedRoute.tsx'
import { ACADEMIC_GROUPS } from '../constants/roles.ts'
import DashboardPage from '../pages/DashboardPage.tsx'
import DocumentReviewDetailPage from '../pages/DocumentReviewDetailPage.tsx'
import DocumentReviewPage from '../pages/DocumentReviewPage.tsx'
import LoginPage from '../pages/LoginPage.tsx'
import RegisterAcademicUserPage from '../pages/RegisterAcademicUserPage.tsx'
import RegisterStudentPage from '../pages/RegisterStudentPage.tsx'
import RegisterSupervisorPage from '../pages/RegisterSupervisorPage.tsx'
import StudentsPage from '../pages/StudentsPage.tsx'
import UserProfilePage from '../pages/UserProfilePage.tsx'

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/cadastro" element={<Navigate to="/cadastro/aluno" replace />} />
        <Route path="/cadastro/aluno" element={<RegisterStudentPage />} />
        <Route path="/cadastro/supervisor" element={<RegisterSupervisorPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cadastro-academico"
          element={
            <RoleProtectedRoute allowedGroups={ACADEMIC_GROUPS}>
              <RegisterAcademicUserPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/alunos"
          element={
            <RoleProtectedRoute allowedGroups={ACADEMIC_GROUPS}>
              <StudentsPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/revisao-documentos"
          element={
            <RoleProtectedRoute allowedGroups={ACADEMIC_GROUPS}>
              <DocumentReviewPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/revisao-documentos/:documentId"
          element={
            <RoleProtectedRoute allowedGroups={ACADEMIC_GROUPS}>
              <DocumentReviewDetailPage />
            </RoleProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import ProtectedRoute from '../components/routing/ProtectedRoute.tsx'
import RoleProtectedRoute from '../components/routing/RoleProtectedRoute.tsx'
import DashboardPage from '../pages/DashboardPage.tsx'
import DocumentHistoryPage from '../pages/DocumentHistoryPage.tsx'
import DocumentReviewDetailPage from '../pages/DocumentReviewDetailPage.tsx'
import DocumentReviewPage from '../pages/DocumentReviewPage.tsx'
import LoginPage from '../pages/LoginPage.tsx'
import RegisterAcademicUserPage from '../pages/RegisterAcademicUserPage.tsx'
import RegisterDocumentPage from '../pages/RegisterDocumentPage.tsx'
import RegisterStudentPage from '../pages/RegisterStudentPage.tsx'
import RegisterSupervisorPage from '../pages/RegisterSupervisorPage.tsx'
import StudentsPage from '../pages/StudentsPage.tsx'
import UserProfilePage from '../pages/UserProfilePage.tsx'
import SupervisorEvaluationQueuePage from '../pages/SupervisorEvaluationQueuePage.tsx'

const ACADEMIC_GROUPS = [
  'Teacher',
  'Coordinator',
] as const

const STUDENT_GROUPS = ['Student'] as const

const SUPERVISOR_GROUPS = ['Supervisor'] as const

const COORDINATOR_GROUPS = ['Coordinator'] as const

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
          path="/perfil"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/historico-documentos"
          element={
            <RoleProtectedRoute
              allowedGroups={[...STUDENT_GROUPS, ...SUPERVISOR_GROUPS]}
            >
              <DocumentHistoryPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/enviar-documento"
          element={
            <RoleProtectedRoute
              allowedGroups={STUDENT_GROUPS}
            >
              <RegisterDocumentPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/editar-documento/:document-id"
          element={
            <RoleProtectedRoute
              allowedGroups={[...STUDENT_GROUPS, ...SUPERVISOR_GROUPS]}
            >
              <RegisterDocumentPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/ficha-avaliacao/:related-document-id"
          element={
            <RoleProtectedRoute
              allowedGroups={SUPERVISOR_GROUPS}
            >
              <RegisterDocumentPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/cadastro-academico"
          element={
            <RoleProtectedRoute
              allowedGroups={COORDINATOR_GROUPS}
            >
              <RegisterAcademicUserPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/alunos"
          element={
            <RoleProtectedRoute
              allowedGroups={ACADEMIC_GROUPS}
            >
              <StudentsPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/revisao-documentos"
          element={
            <RoleProtectedRoute
              allowedGroups={ACADEMIC_GROUPS}
            >
              <DocumentReviewPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/revisao-documentos/:documentId"
          element={
            <RoleProtectedRoute
              allowedGroups={ACADEMIC_GROUPS}
            >
              <DocumentReviewDetailPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/avaliacoes-pendentes"
          element={
            <RoleProtectedRoute
              allowedGroups={SUPERVISOR_GROUPS}
            >
              <SupervisorEvaluationQueuePage />
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
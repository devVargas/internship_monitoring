import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from '../App.tsx'
import ProtectedRoute from '../components/ProtectedRoute.tsx'
import Login from '../components/layout/Login.tsx'
import LoginForm from '../components/ui/LoginForm.tsx'

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
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

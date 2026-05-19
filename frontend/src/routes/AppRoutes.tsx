// src/routes/AppRoutes.tsx
// @ts-ignore: ignore missing type declarations for react-router-dom
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import PrivateRoute from '../components/PrivateRoute';
import Login from '../pages/Login';

function AppRoutes() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rota Pública */}
          <Route path="/login" element={<Login />} />

          {/* Rotas Privadas */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<h1>Bem-vindo ao Sistema de Estágio</h1>} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<h1>404 - Página não encontrada</h1>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default AppRoutes;
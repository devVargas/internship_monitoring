// src/components/PrivateRoute.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

type PrivateRouteProps = {
  children: React.ReactNode;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated } = useAuth();

  // Se não estiver autenticado, redireciona para o login
  if (!isAuthenticated) {
    window.location.replace('/login');
    return null;
  }

  // Se estiver autenticado, renderiza as rotas filhas
  return children;
};

export default PrivateRoute;
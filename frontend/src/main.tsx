import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './index.css'
import App from './App.tsx'
import Login from './components/layout/Login.tsx'
import LoginForm from './components/ui/LoginForm.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path='/login' element={<Login />} />
                <Route path='/' element={<ProtectedRoute> <App /> </ProtectedRoute>} />
                <Route path='/teste' element={<ProtectedRoute> <LoginForm /> </ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
  </StrictMode>,
)

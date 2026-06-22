import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { APIProvider } from './context/APIProvider.tsx'
import Router from './router/Router.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <APIProvider>
      <Router />
    </APIProvider>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { APIProvider } from './context/APIProvider.tsx'
import Router from './router/Router.tsx'
import './tailwind.css'
import './index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Elemento root não encontrado')
}

createRoot(rootElement).render(
  <StrictMode>
    <APIProvider>
      <Router />
    </APIProvider>
  </StrictMode>,
)

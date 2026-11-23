import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { EventosProvider } from './context/EventosContext'
import App from './App'
import './assets/styles/global.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <EventosProvider>
          <App />
        </EventosProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

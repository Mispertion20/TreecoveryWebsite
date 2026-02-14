import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { ReactQueryProvider } from './lib/react-query'
import { registerServiceWorker } from './utils/registerServiceWorker'
import './i18n/config'
import './index.css'

// Register service worker for PWA
registerServiceWorker()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ReactQueryProvider>
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </ReactQueryProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

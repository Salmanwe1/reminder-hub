import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeProvider";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider defaultTheme='system' storageKey='vite-ui-theme'>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './components/theme-provider.tsx'
import { CookiesProvider } from "react-cookie";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CookiesProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    </CookiesProvider>
  </StrictMode>,
)

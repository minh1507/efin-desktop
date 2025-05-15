import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './lib/store'
import App from './App.tsx'
import './index.css'
import './font-size.css'
import { ThemeProvider } from './components/theme-provider.tsx'
import { CookiesProvider } from "react-cookie";
import { initializeDatabase } from './services/database'

// Initialize database to ensure user data persists across app versions
initializeDatabase().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <CookiesProvider>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              <App />
            </ThemeProvider>
          </CookiesProvider>
        </PersistGate>
      </Provider>
    </StrictMode>,
  )
}).catch(error => {
  console.error('Failed to initialize database:', error);
  // Still render the app even if database initialization fails
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <CookiesProvider>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              <App />
            </ThemeProvider>
          </CookiesProvider>
        </PersistGate>
      </Provider>
    </StrictMode>,
  )
});

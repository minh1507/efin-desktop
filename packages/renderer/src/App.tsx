import { useEffect, useState, Suspense, lazy } from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { AppSidebar } from './components/app-sidebar';
import { Button } from './components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import './App.css';
import { useCookies } from "react-cookie";

// Lazy-loaded components
const Home = lazy(() => import('./page/home/home'));
const Login = lazy(() => import('./page/auth/login'));
const JsonFormatter = lazy(() => import('./page/format/json/json'));
const JsonComparator = lazy(() => import('./page/diff/json-to-json/json-to-json'));

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cookies] = useCookies(["token"]);

  useEffect(() => {
    setIsAuthenticated(!!cookies.token);
  }, [cookies.token]);

  return (
    <Router>
      <SidebarProvider>
        {isAuthenticated && <AppSidebar setIsAuthenticated={setIsAuthenticated} />}
        <div className="flex flex-col min-h-screen w-full">
          {isAuthenticated && (
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
              <div className="max-w-6xl px-4 sm:px-6">
                <div className="flex h-14 items-center justify-between">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-accent"
                        aria-label="Mở menu"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </Button>
                    </SidebarTrigger>
                    <h1 className="text-lg font-semibold">Rozy</h1>
                  </div>
                </div>
              </div>
            </header>
          )}

          <main className="flex-1">
            <div className="px-4 sm:px-6 py-6">
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/format/json" element={<JsonFormatter />} />
                  <Route path="/compare/json-json" element={<JsonComparator />} />
                </Routes>
              </Suspense>
            </div>
          </main>

          <Toaster />
        </div>
      </SidebarProvider>
    </Router>
  );
}

export default App;

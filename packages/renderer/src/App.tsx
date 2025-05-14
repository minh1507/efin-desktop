import { Suspense, lazy, useState } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { AppSidebar } from './components/app-sidebar';
import { Button } from './components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { useAppSelector, useAppDispatch } from './lib/store/hooks';
import { logout } from './lib/store/slices/authSlice';
import { ProtectedRoute, PublicRoute } from './components/auth/protected-route';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, Search, HelpCircle } from 'lucide-react';
import { APP_NAME } from './lib/constants';
import { ThemeProvider } from './components/theme-provider';
import { TooltipProvider } from './components/ui/tooltip';
import { SearchProvider } from './lib/context/search-context';
import { SearchShortcuts } from './components/search-shortcuts';
import './App.css';

// Lazy-loaded components
const Home = lazy(() => import('./page/home/home'));
const Login = lazy(() => import('./page/auth/login'));
const JsonFormatter = lazy(() => import('./page/format/json/json'));
const JsonCompare = lazy(() => import('./page/format/compare-json/compare-json'));

// Loading component cho Suspense
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Layout cho các trang đã đăng nhập
const AppLayout = () => {
  const { user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <SidebarProvider>
      <AppSidebar handleLogout={handleLogout} />
      <div className="flex flex-col min-h-screen w-full bg-background">
        <header className="app-header">
          <div className="container px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-muted"
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
              <div className="md:hidden">
                <h1 className="text-lg font-semibold">{APP_NAME}</h1>
              </div>
              <div className="hidden md:flex relative w-64">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <Search className="h-4 w-4" />
                </div>
                <input 
                  type="search" 
                  placeholder="Tìm kiếm... (Ctrl+K)" 
                  className="w-full py-2 pl-10 pr-4 text-sm bg-muted/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" 
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setShowShortcuts(!showShortcuts)}
                title="Xem phím tắt"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative text-muted-foreground hover:text-foreground"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
              </Button>

              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border border-muted">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden md:inline-block">
                  {user?.username}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container px-4 sm:px-6 py-6">
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/format/json" element={<JsonFormatter />} />
              <Route path="/format/compare-json" element={<JsonCompare />} />
            </Routes>
          </Suspense>
        </main>
        
        <footer className="border-t py-4 text-center text-sm text-muted-foreground">
          <div className="container px-4 sm:px-6">
            {APP_NAME} &copy; {new Date().getFullYear()} - Phiên bản 1.0.0
          </div>
        </footer>
        
        {showShortcuts && <SearchShortcuts />}
      </div>
    </SidebarProvider>
  );
};

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="app-theme">
      <TooltipProvider>
        <SearchProvider>
          <Router>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                {/* Routes cho người dùng chưa đăng nhập */}
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<Login />} />
                </Route>

                {/* Routes cho người dùng đã đăng nhập */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/*" element={<AppLayout />} />
                </Route>
              </Routes>
            </Suspense>
            <Toaster />
          </Router>
        </SearchProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;

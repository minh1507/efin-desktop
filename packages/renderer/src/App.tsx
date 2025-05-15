import { Suspense, lazy, useState } from 'react';
import { HashRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { AppSidebar } from './components/app-sidebar';
import { Button } from './components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { useAppSelector, useAppDispatch } from './lib/store/hooks';
import { logout } from './lib/store/slices/authSlice';
import { ProtectedRoute, PublicRoute } from './components/auth/protected-route';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, Search, HelpCircle, Settings as SettingsIcon, LogOut, User, Shield, ChevronDown } from 'lucide-react';
import { APP_NAME } from './lib/constants';
import { ThemeProvider } from './components/theme-provider';
import { TooltipProvider } from './components/ui/tooltip';
import { SearchProvider } from './lib/context/search-context';
import { SearchShortcuts } from './components/search-shortcuts';
import { AppBreadcrumb } from './components/app-breadcrumb';
import { LanguageProvider, useLanguage } from './components/language-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import './App.css';

// Lazy-loaded components
const Home = lazy(() => import('./page/home/home'));
const Login = lazy(() => import('./page/auth/login'));
const JsonFormatter = lazy(() => import('./page/format/json/json'));
const JsonCompare = lazy(() => import('./page/format/compare-json/compare-json'));
const Statistics = lazy(() => import('./page/statistics/statistics'));
const Settings = lazy(() => import('./page/settings/settings'));

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
  const { t } = useLanguage();
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  // Get first letter of username for avatar
  const userInitial = user?.username?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarProvider>
        <AppSidebar handleLogout={handleLogout} />
        <div className="flex flex-col w-full bg-background overflow-hidden">
          <header className="app-header">
            <div className="container px-4 sm:px-6 py-2 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:bg-muted"
                    aria-label={t('app.open_menu')}
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
                    placeholder={`${t('app.search')}... (Ctrl+K)`}
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
                  title={t('app.view_shortcuts')}
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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
                      <Avatar className="h-7 w-7 border border-muted">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium hidden md:inline-block">
                        {user?.username}
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground ml-0.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{t('app.my_account')}</DropdownMenuLabel>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuGroup>
                      <DropdownMenuItem className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>{t('app.profile')}</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="flex cursor-pointer items-center">
                          <SettingsIcon className="mr-2 h-4 w-4" />
                          <span>{t('app.settings')}</span>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>{t('app.security')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      className="cursor-pointer text-destructive focus:text-destructive" 
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('app.logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="container px-4 sm:px-6 py-4">
              <AppBreadcrumb />
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/format/json" element={<JsonFormatter />} />
                  <Route path="/format/compare-json" element={<JsonCompare />} />
                  <Route path="/statistics" element={<Statistics />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Suspense>
            </div>
          </main>

          <footer className="app-footer">
            <div className="px-4 sm:px-6">
              {APP_NAME} &copy; {new Date().getFullYear()} - {t('footer.version')} 1.0.0
            </div>
          </footer>
          
          {showShortcuts && <SearchShortcuts />}
        </div>
      </SidebarProvider>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
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
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;

import {useEffect, useState} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {SidebarProvider, SidebarTrigger} from './components/ui/sidebar';
import {AppSidebar} from './components/app-sidebar';
import {Button} from './components/ui/button';
import {Input} from './components/ui/input';
import {Label} from './components/ui/label';
import Home from './page/home/home';
import {Toaster} from '@/components/ui/sonner';
import Popup from './components/ui/popup';
import './App.css';

function App() {
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Kiểm tra token khi khởi động app
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsLoginPopupOpen(true);
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // const response = await fetch('https://api.yourservice.com/login', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(loginData),
      // });
      //
      // const data = await response.json();

      // if (response.ok) {
      localStorage.setItem('authToken', 'data.token');
      localStorage.setItem('user', 'duongdoican@gmail.com');
      setIsLoginPopupOpen(false);
      setLoginData({
        email: '',
        password: '',
      })
      // } else {
      //   setError(data.message || 'Đăng nhập thất bại');
      // }
    } catch (err) {
      setError('Lỗi kết nối đến máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Router>
      <SidebarProvider>
        <AppSidebar setIsLoginPopupOpen={setIsLoginPopupOpen} />
        <div className="flex flex-col min-h-screen w-full">
          <Popup isOpen={isLoginPopupOpen} onClose={() => {
          }}>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Đăng nhập hệ thống</h2>
              <p className="text-sm">Vui lòng nhập thông tin tài khoản để tiếp tục</p>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="Nhập email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-medium">Mật khẩu</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <p className="text-sm font-medium text-destructive">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                </Button>
              </form>
            </div>
          </Popup>


          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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

          <main className="flex-1">
            <div className="max-w-6xl px-4 sm:px-6 py-6">
              <Routes>
                <Route path="/" element={<Home />} />
              </Routes>
            </div>
          </main>

          <Toaster />
        </div>
      </SidebarProvider>
    </Router>
  );
}

export default App;

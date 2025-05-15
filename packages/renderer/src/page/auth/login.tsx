import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LockKeyhole, User, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { loginUser, mockLogin } from '@/lib/store/slices/authSlice';
import { THEME } from '@/lib/theme';
import { APP_NAME } from '@/lib/constants';

const Login = () => {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector(state => state.auth);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  
  // Nếu đã đăng nhập, chuyển hướng về trang chủ - có thể bỏ vì đã có PublicRoute
  // useEffect(() => {
  //   if (user) {
  //     navigate('/');
  //   }
  // }, [user, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Gọi action login
    await dispatch(loginUser({ 
      email: loginData.email, 
      password: loginData.password 
    }));
  };

  // Thêm hàm mock login để test
  const handleMockLogin = () => {
    dispatch(mockLogin());
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ 
        background: THEME.gradient.loginBackground,
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite'
      }}
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-64 h-64 rounded-full bg-primary-500 top-1/4 -left-12 blur-3xl"></div>
        <div className="absolute w-96 h-96 rounded-full bg-secondary-500 bottom-1/4 -right-20 blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <Card className="glass-card overflow-hidden rounded-xl shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-primary-500 to-secondary-400"></div>
          <CardHeader className="space-y-4 text-center pt-8 pb-4">
            <div className="mx-auto bg-primary-500/10 w-16 h-16 flex items-center justify-center rounded-full mb-2">
              <LockKeyhole className="h-8 w-8 text-primary-400" />
            </div>
            <CardTitle className="text-2xl font-semibold text-white">
              Đăng nhập {APP_NAME}
            </CardTitle>
            <p className="text-sm text-gray-400">
              Đăng nhập để truy cập vào hệ thống
            </p>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2"
              >
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-200">
                  {error}
                </div>
              </motion.div>
            )}
            
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Tài khoản</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="Nhập tài khoản"
                  className="h-11 bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus-visible:ring-primary-400 focus-visible:border-primary-400 rounded-lg"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  disabled={status === 'loading'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 flex items-center gap-2">
                  <LockKeyhole className="h-4 w-4" />
                  <span>Mật khẩu</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="h-11 bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus-visible:ring-primary-400 focus-visible:border-primary-400 rounded-lg"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  disabled={status === 'loading'}
                />
              </div>

              <button
                type="submit"
                className="login-button w-full h-12 rounded-lg flex items-center justify-center mt-8"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> 
                ) : (
                  <LockKeyhole className="h-5 w-5 mr-2" />
                )}
                <span>{status === 'loading' ? 'Đang xác thực...' : 'Đăng nhập'}</span>
              </button>
              
              {/* Thêm nút đăng nhập giả */}
              <button
                type="button"
                onClick={handleMockLogin}
                className="w-full h-10 rounded-lg bg-secondary/50 hover:bg-secondary/70 text-white font-medium flex items-center justify-center mt-4"
              >
                <span>Đăng nhập giả lập</span>
              </button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;

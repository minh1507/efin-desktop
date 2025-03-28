import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from "react-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import AuthService from '@/services/auth';
import { IResponse } from '@/services/type/base';
import { ILogin } from './login.type';

const Login = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [cookie, setCookie] = useCookies(["token", "username"]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response: IResponse<ILogin> = await AuthService.login(loginData.email, loginData.password)
      if (response.status.success) {
        setCookie("token", response.data.accessToken, { path: '/' });
        setCookie("username", response.data.username)
        navigate('/');
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false)
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#09203F] via-[#537895] to-[#09203F]">

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="rounded-sm shadow-xl border border-gray-700 bg-[#2E2E2E] p-6">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white">Đăng nhập</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-gray-300">Tài khoản</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="Nhập tài khoản"
                  className="mt-2 w-full bg-[#3A3A3A] border border-gray-600 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 rounded-lg px-4 py-2"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-300">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="mt-2 w-full bg-[#3A3A3A] border border-gray-600 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 rounded-lg px-4 py-2"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold transition-all duration-300 ease-in-out px-4 py-2 rounded-lg flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Xác thực'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;

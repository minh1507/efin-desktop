import { Outlet, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/lib/store/hooks';
import { isTokenValid } from '@/lib/utils/auth';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  redirectPath?: string;
}

/**
 * Component bảo vệ các route yêu cầu đăng nhập
 * Chuyển hướng người dùng chưa đăng nhập về trang login
 */
export const ProtectedRoute = ({ redirectPath = '/login' }: ProtectedRouteProps) => {
  const { user } = useAppSelector(state => state.auth);
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // Kiểm tra user đã đăng nhập và token còn hạn
    const isAuthenticated = user && isTokenValid(user.accessToken);
    
    // Nếu chưa đăng nhập hoặc token hết hạn, chuyển hướng về trang đăng nhập
    if (!isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
    
    setIsChecking(false);
  }, [user, navigate, redirectPath]);

  // Trả về null trong quá trình kiểm tra để tránh render lồng nhau
  if (isChecking) {
    return null;
  }

  // Nếu đã đăng nhập, render các route children
  return <Outlet />;
};

/**
 * Component bảo vệ các route dành cho người dùng chưa đăng nhập
 * Ví dụ: Trang đăng nhập, đăng ký
 */
export const PublicRoute = ({ redirectPath = '/' }: ProtectedRouteProps) => {
  const { user } = useAppSelector(state => state.auth);
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // Kiểm tra user đã đăng nhập và token còn hạn
    const isAuthenticated = user && isTokenValid(user.accessToken);
    
    // Nếu đã đăng nhập, chuyển hướng về trang chủ
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
    
    setIsChecking(false);
  }, [user, navigate, redirectPath]);

  // Trả về null trong quá trình kiểm tra để tránh render lồng nhau
  if (isChecking) {
    return null;
  }
  
  // Nếu chưa đăng nhập, render các route children
  return <Outlet />;
}; 
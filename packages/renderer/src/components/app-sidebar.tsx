import { Link, useLocation } from 'react-router-dom';
import { Home, LogOut } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { useCookies } from "react-cookie";

const items = [
  { title: 'Trang chủ', url: '/', icon: Home },
];

interface AppSidebarProps {
  setIsAuthenticated : (isOpen: boolean) => void;
}

export function AppSidebar({ setIsAuthenticated }: AppSidebarProps) {
  const location = useLocation();
  const [cookies, setCookie, removeCookie] = useCookies(["token", "username"]);

  const handleLogout = () => {
    removeCookie("token")
    removeCookie("username")
    setIsAuthenticated(false);
  };

  return (
    <Sidebar className="h-screen">
      <SidebarHeader className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center text-lg font-bold">
            {cookies.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="text-sm font-medium">{cookies.username}</h4>
            <p className="text-xs text-gray-500">Tài khoản của bạn</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col justify-between h-full">
        <div>
          <SidebarGroup>
            <SidebarGroupLabel>Tiện ích</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.url}
                        className={location.pathname === item.url ? 'bg-accent text-accent-foreground' : ''}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut />
                  <span>Đăng xuất</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

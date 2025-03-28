import { Link, useLocation } from 'react-router-dom';
import { Home, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
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
import { useCookies } from 'react-cookie';

const menuItems = [
  {
    title: 'Trang chủ',
    url: '/',
    icon: Home,
    children: [],
  },
  {
    title: 'Định dạng',
    icon: Home,
    children: [
      { title: 'Json', url: '/format/json' },
    ],
  },
  {
    title: 'So sánh',
    icon: Home,
    children: [
      { title: 'Json với Json', url: '/compare/json-json' },
    ],
  },
];

interface AppSidebarProps {
  setIsAuthenticated: (isOpen: boolean) => void;
}

export function AppSidebar({ setIsAuthenticated }: AppSidebarProps) {
  const location = useLocation();
  const [cookies, , removeCookie] = useCookies(['token', 'username']);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleLogout = () => {
    removeCookie('token');
    removeCookie('username');
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
                {menuItems.map((item) => (
                  <div key={item.title}>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        {item.children.length ? (
                          <button onClick={() => toggleMenu(item.title)} className="flex items-center w-full relative">
                            <item.icon className="mr-2" />
                            <span>{item.title}</span>
                            {openMenus[item.title] ? <ChevronDown className="ml-auto" /> : <ChevronRight className="ml-auto" />}
                          </button>
                        ) : (
                          <Link
                            to={item.url || '#'}
                            className={location.pathname === item.url ? 'bg-accent text-accent-foreground' : ''}
                          >
                            <item.icon className="mr-2" />
                            <span>{item.title}</span>
                          </Link>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: openMenus[item.title] ? 'auto' : 0, opacity: openMenus[item.title] ? 1 : 0 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: openMenus[item.title] ? 0.3 : 0.5, ease: openMenus[item.title] ? 'easeInOut' : 'easeOut' }}
                      className="overflow-hidden relative"
                    >
                      {openMenus[item.title] && item.children.length > 0 && (
                        <div className="pl-6 border-l-2 border-gray-300 ml-3 relative">
                          {item.children.map((child, index) => (
                            <div key={`${child.title}-${index}`} className="relative pl-4 flex items-center">
                              {index > 0 && <div className="absolute -top-3 left-0 w-2 h-6 border-l-2 border-gray-300" />}
                              <div className="absolute left-0 w-2 h-full border-l-2 border-gray-300" />
                              <div className="absolute top-1/2 left-0 w-4 border-b-2 border-gray-300" />
                              <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                  <Link
                                    to={child.url}
                                    className={location.pathname === child.url ? 'bg-accent text-accent-foreground' : ''}
                                  >
                                    <span>{child.title}</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </div>
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

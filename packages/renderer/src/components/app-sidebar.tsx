import { Link, useLocation } from 'react-router-dom';
import { LogOut, ChevronDown, ChevronRight, FileJson, Settings, LayoutDashboard, User, Shield, GitCompare } from 'lucide-react';
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
import { useAppSelector } from '@/lib/store/hooks';
import { APP_NAME } from '@/lib/constants';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const menuItems = [
  {
    title: 'Trang chủ',
    url: '/',
    icon: LayoutDashboard,
    children: [],
  },
  {
    title: 'Định dạng',
    icon: Settings,
    children: [
      { title: 'Json', url: '/format/json', icon: FileJson },
      { title: 'So sánh Json', url: '/format/compare-json', icon: GitCompare },
    ],
  },
];

interface AppSidebarProps {
  handleLogout: () => void;
}

export function AppSidebar({ handleLogout }: AppSidebarProps) {
  const location = useLocation();
  const { user } = useAppSelector(state => state.auth);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    // Mở menu Định dạng mặc định nếu đang ở trang định dạng
    'Định dạng': location.pathname.startsWith('/format')
  });

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  // Lấy chữ cái đầu tiên của tên người dùng cho avatar
  const userInitial = user?.username.charAt(0).toUpperCase() || 'U';

  return (
    <Sidebar className="h-screen border-r bg-card">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-medium text-xl">{APP_NAME.charAt(0)}</span>
            </div>
            <h3 className="font-semibold text-lg">{APP_NAME}</h3>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col justify-between h-[calc(100vh-64px)]">
        <div className="flex-1 py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground ml-4 mb-2">
              MENU CHÍNH
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <div key={item.title} className="mb-1">
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        {item.children.length ? (
                          <button 
                            onClick={() => toggleMenu(item.title)} 
                            className="flex items-center w-full h-10 px-4 rounded-md hover:bg-accent/50 hover:text-accent-foreground"
                          >
                            <item.icon className="mr-2 h-5 w-5" />
                            <span>{item.title}</span>
                            {openMenus[item.title] ? 
                              <ChevronDown className="ml-auto h-4 w-4" /> : 
                              <ChevronRight className="ml-auto h-4 w-4" />
                            }
                          </button>
                        ) : (
                          <Link
                            to={item.url || '#'}
                            className={`flex items-center w-full h-10 px-4 rounded-md ${
                              location.pathname === item.url 
                                ? 'bg-primary/10 text-primary font-medium' 
                                : 'hover:bg-accent/50 hover:text-accent-foreground'
                            }`}
                          >
                            <item.icon className="mr-2 h-5 w-5" />
                            <span>{item.title}</span>
                          </Link>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: openMenus[item.title] ? 'auto' : 0,
                        opacity: openMenus[item.title] ? 1 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {openMenus[item.title] && item.children.length > 0 && (
                        <div className="ml-5 pl-2 border-l border-border/60 space-y-1 my-1">
                          {item.children.map((child) => (
                            <SidebarMenuItem key={child.title}>
                              <SidebarMenuButton asChild>
                                <Link
                                  to={child.url}
                                  className={`flex items-center h-9 rounded-md px-2 ${
                                    location.pathname === child.url 
                                      ? 'bg-primary/10 text-primary font-medium' 
                                      : 'hover:bg-accent/50 hover:text-accent-foreground'
                                  }`}
                                >
                                  {child.icon && <child.icon className="mr-2 h-4 w-4" />}
                                  <span>{child.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
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

        <div className="p-4 mt-auto">
          <Separator className="my-2" />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-accent/30 focus:outline-none">
                <div className="flex items-center">
                  <Avatar className="h-9 w-9 border border-border/30">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-2 text-left">
                    <p className="text-sm font-medium leading-none">{user?.username}</p>
                    <p className="text-xs text-muted-foreground mt-1">Đang hoạt động</p>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Thông tin cá nhân</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Cài đặt</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Bảo mật</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive" 
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

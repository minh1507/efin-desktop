import {Link, useLocation} from 'react-router-dom';
import {Home, LogOut} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const items = [
  {title: 'Trang chủ', url: '/', icon: Home},
  // { title: "Inbox", url: "/inbox", icon: Inbox },
  // { title: "Calendar", url: "/calendar", icon: Calendar },
  // { title: "Search", url: "/search", icon: Search },
  // { title: "Settings", url: "/settings", icon: Settings },
];

interface AppSidebarProps {
  setIsLoginPopupOpen: (isOpen: boolean) => void;
}

export function AppSidebar({ setIsLoginPopupOpen }: AppSidebarProps) {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoginPopupOpen(true);
  };

  return (
    <Sidebar>
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

        {/* Thêm nhóm cho nút đăng xuất ở đáy */}
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

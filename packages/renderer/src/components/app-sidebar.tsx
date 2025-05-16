import { Link, useLocation } from 'react-router-dom';
import { LogOut, ChevronDown, ChevronRight, FileJson, Settings, LayoutDashboard, User, Shield, GitCompare, BarChart, Bot, Server } from 'lucide-react';
import { useState, useEffect } from 'react';
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
import { useLanguage } from '@/components/language-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MenuItem {
  titleKey: string;
  url?: string;
  icon: any;
  children: MenuItem[];
}

interface AppSidebarProps {
  handleLogout: () => void;
}

export function AppSidebar({ handleLogout }: AppSidebarProps) {
  const location = useLocation();
  const { user } = useAppSelector(state => state.auth);
  const { t } = useLanguage();
  
  // Define menu items using translation keys
  const menuItems: MenuItem[] = [
    {
      titleKey: 'sidebar.home',
      url: '/',
      icon: LayoutDashboard,
      children: [],
    },
    {
      titleKey: 'sidebar.formatting',
      icon: Settings,
      children: [
        { titleKey: 'sidebar.json', url: '/format/json', icon: FileJson, children: [] },
        { titleKey: 'sidebar.compare_json', url: '/format/compare-json', icon: GitCompare, children: [] },
      ],
    },
    {
      titleKey: 'sidebar.statistics',
      url: '/statistics',
      icon: BarChart,
      children: [],
    },
    {
      titleKey: 'sidebar.ai',
      icon: Bot,
      children: [
        { titleKey: 'sidebar.ai_chat', url: '/ai/chat', icon: Bot, children: [] },
        { titleKey: 'ai.model_management', url: '/ai/models', icon: Server, children: [] },
      ],
    },
  ];
  
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    // Default open formatting menu if on formatting page
    [t('sidebar.formatting')]: location.pathname.startsWith('/format')
  });

  // useEffect to update open menus when location changes
  useEffect(() => {
    // Open relevant menu based on current URL
    const updatedMenus = { ...openMenus };
    
    if (location.pathname.startsWith('/format') && !openMenus[t('sidebar.formatting')]) {
      updatedMenus[t('sidebar.formatting')] = true;
    }
    
    if (location.pathname.startsWith('/ai') && !openMenus[t('sidebar.ai')]) {
      updatedMenus[t('sidebar.ai')] = true;
    }
    
    setOpenMenus(updatedMenus);
  }, [location.pathname, t]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  // Get first letter of username for avatar
  const userInitial = user?.username.charAt(0).toUpperCase() || 'U';

  return (
    <Sidebar className="h-screen border-r bg-card app-sidebar">
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

      <SidebarContent className="flex flex-col justify-between sidebar-content-wrapper">
        <div className="flex-1 py-4 overflow-y-auto">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground ml-4 mb-2">
              {t('sidebar.tools')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <div key={item.titleKey} className="mb-1">
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        {item.children.length ? (
                          <button 
                            onClick={() => toggleMenu(t(item.titleKey))} 
                            className="flex items-center w-full h-10 px-4 rounded-md hover:bg-accent/50 hover:text-accent-foreground"
                          >
                            <item.icon className="mr-2 h-5 w-5" />
                            <span>{t(item.titleKey)}</span>
                            {openMenus[t(item.titleKey)] ? 
                              <ChevronDown className="ml-auto h-4 w-4" /> : 
                              <ChevronRight className="ml-auto h-4 w-4" />
                            }
                          </button>
                        ) : (
                          <Link
                            to={item.url || '/'}
                            className={`flex items-center w-full h-10 px-4 rounded-md ${
                              location.pathname === item.url 
                                ? 'bg-primary/10 text-primary font-medium' 
                                : 'hover:bg-accent/50 hover:text-accent-foreground'
                            }`}
                          >
                            <item.icon className="mr-2 h-5 w-5" />
                            <span>{t(item.titleKey)}</span>
                          </Link>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: openMenus[t(item.titleKey)] ? 'auto' : 0,
                        opacity: openMenus[t(item.titleKey)] ? 1 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {openMenus[t(item.titleKey)] && item.children.length > 0 && (
                        <div className="ml-5 pl-2 border-l border-border/60 space-y-1 my-1">
                          {item.children.map((child) => (
                            <SidebarMenuItem key={child.titleKey}>
                              <SidebarMenuButton asChild>
                                <Link
                                  to={child.url || '/'}
                                  className={`flex items-center h-9 rounded-md px-2 ${
                                    location.pathname === child.url 
                                      ? 'bg-primary/10 text-primary font-medium' 
                                      : 'hover:bg-accent/50 hover:text-accent-foreground'
                                  }`}
                                >
                                  {child.icon && <child.icon className="mr-2 h-4 w-4" />}
                                  <span>{t(child.titleKey)}</span>
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

        <div className="p-4 mt-auto user-profile-section">
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
                    <p className="text-xs text-muted-foreground mt-1">{t('app.active')}</p>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{t('app.my_account')}</DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('app.profile')}</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
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
      </SidebarContent>
    </Sidebar>
  );
}

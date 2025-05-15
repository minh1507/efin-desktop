import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Định nghĩa các route và tiêu đề tương ứng
const routeConfig: Record<string, { title: string; parent?: string; isFolder?: boolean }> = {
  '/': { title: 'Trang chủ' },
  '/format': { title: 'Định dạng', parent: '/', isFolder: true },
  '/format/json': { title: 'JSON Formatter', parent: '/format' },
  '/format/compare-json': { title: 'So sánh JSON', parent: '/format' },
  '/statistics': { title: 'Thống kê', parent: '/' },
};

export function AppBreadcrumb() {
  const location = useLocation();
  
  // Tạo breadcrumb path dựa trên URL hiện tại
  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbItems: Array<{ path: string; title: string; isFolder: boolean }> = [];
    
    // Nếu không có phần tử nào, chỉ hiển thị Home
    if (pathSegments.length === 0) {
      return breadcrumbItems;
    }
    
    // Xây dựng breadcrumbs từ các phần của đường dẫn
    let currentPath = '';
    for (let i = 0; i < pathSegments.length; i++) {
      currentPath += `/${pathSegments[i]}`;
      
      // Kiểm tra xem đường dẫn có trong cấu hình không
      if (routeConfig[currentPath]) {
        breadcrumbItems.push({
          path: currentPath,
          title: routeConfig[currentPath].title,
          isFolder: routeConfig[currentPath].isFolder || false
        });
      } else {
        // Nếu không có trong cấu hình, sử dụng tên segment với chữ cái đầu viết hoa
        // Giả định rằng nếu không phải phần tử cuối, thì là folder
        breadcrumbItems.push({
          path: currentPath,
          title: pathSegments[i].charAt(0).toUpperCase() + pathSegments[i].slice(1),
          isFolder: i < pathSegments.length - 1
        });
      }
    }
    
    return breadcrumbItems;
  }, [location.pathname]);
  
  // Hiển thị breadcrumb chỉ khi không ở trang chủ
  if (location.pathname === '/') {
    return null;
  }
  
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbHome />
        </BreadcrumbItem>
        
        {breadcrumbs.map((item, index) => (
          <BreadcrumbItem key={item.path}>
            <BreadcrumbSeparator />
            
            {index === breadcrumbs.length - 1 ? (
              <BreadcrumbPage>{item.title}</BreadcrumbPage>
            ) : item.isFolder ? (
              <span className="text-muted-foreground">{item.title}</span>
            ) : (
              <BreadcrumbLink to={item.path}>{item.title}</BreadcrumbLink>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
} 
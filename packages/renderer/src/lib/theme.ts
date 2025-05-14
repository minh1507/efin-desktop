/**
 * Hệ thống màu sắc cho toàn bộ ứng dụng
 */

export const THEME = {
  // Màu chính
  primary: {
    DEFAULT: '#3461FF', // Xanh dương đậm
    hover: '#2950E3',
    light: '#E6ECFF',
    dark: '#1E37A6',
  },
  
  // Màu thứ cấp
  secondary: {
    DEFAULT: '#F9A825', // Vàng
    hover: '#F59E0B',
    light: '#FFF8E1',
    dark: '#E65100',
  },
  
  // Màu nền
  background: {
    DEFAULT: '#F8FAFC', // Trắng xám rất nhẹ
    paper: '#FFFFFF', // Trắng
    dark: '#0F172A', // Xanh đen đậm
    darkPaper: '#1A2234', // Xanh đen nhẹ hơn
  },
  
  // Màu gradient
  gradient: {
    primary: 'linear-gradient(to right, #3461FF, #2950E3)',
    secondary: 'linear-gradient(to right, #F9A825, #E65100)',
    background: 'linear-gradient(to right bottom, #0F172A, #253352)',
    loginBackground: 'linear-gradient(to right bottom, #09203F, #537895, #09203F)',
  },
  
  // Màu text
  text: {
    primary: '#1E293B', // Xanh đen nhạt
    secondary: '#64748B', // Xám
    light: '#CBD5E1', // Xám nhạt
    disabled: '#94A3B8', // Xám đậm
    white: '#FFFFFF', // Trắng
    dark: '#0F172A', // Xanh đen đậm
  },
  
  // Màu trạng thái
  status: {
    success: '#10B981', // Xanh lá
    warning: '#F59E0B', // Cam
    error: '#EF4444', // Đỏ
    info: '#3B82F6', // Xanh dương
  },
  
  // Màu cho dark mode
  dark: {
    background: '#0F172A',
    paper: '#1A2234',
    border: '#334155',
    text: '#F8FAFC',
    muted: '#94A3B8',
  },
  
  // Màu cho light mode
  light: {
    background: '#F8FAFC',
    paper: '#FFFFFF',
    border: '#E2E8F0',
    text: '#1E293B',
    muted: '#64748B',
  },
};

/**
 * Shadow styles
 */
export const SHADOWS = {
  sm: '0 1px 2px rgba(15, 23, 42, 0.1)',
  md: '0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -1px rgba(15, 23, 42, 0.06)',
  lg: '0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -2px rgba(15, 23, 42, 0.05)',
  xl: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 10px 10px -5px rgba(15, 23, 42, 0.04)',
  '2xl': '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
}; 
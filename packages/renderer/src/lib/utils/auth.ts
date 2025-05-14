/**
 * Kiểm tra token có còn hạn hay không
 * @param token JWT token
 * @returns boolean
 */
export function isTokenValid(token: string): boolean {
  if (!token) return false;
  
  try {
    // Kiểm tra cấu trúc JWT token đúng
    if (!token.match(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)) {
      console.warn('Token không đúng định dạng JWT');
      return false;
    }
    
    // Decode JWT token (không xác thực signature)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload;
    
    try {
      jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch (e) {
      console.warn('Không thể decode token:', e);
      return false;
    }

    let payload;
    try {
      payload = JSON.parse(jsonPayload);
    } catch (e) {
      console.warn('Không thể parse JSON payload:', e);
      return false;
    }

    // Token không có trường exp
    if (!payload.exp) {
      console.warn('Token không có trường exp');
      return false;
    }
    
    // Kiểm tra token đã hết hạn chưa
    const currentTime = Math.floor(Date.now() / 1000);
    console.log('Token exp:', new Date(payload.exp * 1000), 'Current time:', new Date(currentTime * 1000));
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Lỗi khi validate token:', error);
    return false; // Token không hợp lệ
  }
}

/**
 * Lấy thời gian hết hạn của token
 * @param token JWT token
 * @returns Date | null
 */
export function getTokenExpiration(token: string): Date | null {
  if (!token) return null;
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const { exp } = JSON.parse(jsonPayload);
    return new Date(exp * 1000);
  } catch (error) {
    return null;
  }
} 
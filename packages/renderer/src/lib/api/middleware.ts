import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';
import { API_URL } from '../constants';

/**
 * Tạo client axios với cấu hình mặc định
 * @param config Cấu hình axios
 * @returns AxiosInstance
 */
export const createApiClient = (config?: AxiosRequestConfig): AxiosInstance => {
  const client = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
    ...config,
  });

  // Interceptor cho request
  client.interceptors.request.use(
    (config) => {
      // Lấy token từ Redux store
      const state = store.getState();
      const token = state.auth.user?.accessToken;

      // Thêm token vào header nếu có
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor cho response
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: AxiosError) => {
      if (error.response) {
        // Xử lý các lỗi HTTP
        const status = error.response.status;

        if (status === 401) {
          // Đăng xuất nếu không có quyền truy cập hoặc token hết hạn
          toast.error('Phiên đăng nhập đã hết hạn', {
            description: 'Vui lòng đăng nhập lại để tiếp tục sử dụng',
          });
          store.dispatch(logout());
        } else if (status === 403) {
          toast.error('Không có quyền truy cập', {
            description: 'Bạn không có quyền thực hiện hành động này',
          });
        } else if (status === 404) {
          toast.error('Không tìm thấy tài nguyên', {
            description: 'Tài nguyên bạn yêu cầu không tồn tại',
          });
        } else if (status === 500) {
          toast.error('Lỗi máy chủ', {
            description: 'Đã xảy ra lỗi trên máy chủ, vui lòng thử lại sau',
          });
        }
      } else if (error.request) {
        // Lỗi không có response
        toast.error('Không thể kết nối đến máy chủ', {
          description: 'Vui lòng kiểm tra kết nối mạng và thử lại',
        });
      } else {
        // Lỗi cấu hình request
        toast.error('Đã xảy ra lỗi', {
          description: error.message,
        });
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// Export instance mặc định
export const apiClient = createApiClient(); 
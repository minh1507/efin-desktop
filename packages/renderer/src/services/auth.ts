import { apiClient } from '@/lib/api/middleware';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { IResponse } from './type/base';
import { ILogin } from '@/page/auth/login.type';

// Biến để xác định có dùng API thật hay không
const USE_MOCK_API = true;

export default class AuthService {
    /**
     * Đăng nhập người dùng
     * @param username Tên đăng nhập
     * @param password Mật khẩu
     * @returns Promise<IResponse<ILogin>>
     */
    static async login(username: string, password: string): Promise<IResponse<ILogin>> {
        // Nếu dùng API giả, luôn trả về thành công
        if (USE_MOCK_API) {
            console.log('Using mock API for login');
            
            // Giả lập độ trễ 
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Tạo mock response
            const mockResponse: IResponse<ILogin> = {
                status: {
                    code: 200,
                    success: true
                },
                message: {
                    failed: ''
                },
                data: {
                    username: 'admin',
                    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxODkwMTM5MDIyfQ.XD-rl5ri9Xd4-GSjjFJ_eYwx32GFJ2C4B1qe5tMXd-Q',
                    refreshToken: 'mock_refresh_token'
                },
                ui: {
                    flag: true
                },
                trace: {
                    id: 'mock-trace-id'
                }
            };
            
            toast.success("Đăng nhập thành công", {
                description: 'Chào mừng bạn quay trở lại',
            });
            
            return mockResponse;
        }
        
        // Sử dụng API thật
        try {
            const response = await apiClient.post<IResponse<ILogin>>("/stc/auth/jwt/login", {
                username,
                password,
            });

            if (response.data.status.success) {
                toast.success("Đăng nhập thành công", {
                    description: 'Chào mừng bạn quay trở lại',
                });
            }

            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status === 400) {
                toast.error("Đăng nhập thất bại", {
                    description: error.response?.data?.message?.failed || 'Sai tên đăng nhập hoặc mật khẩu',
                });
            } else {
                toast.error("Đăng nhập thất bại", {
                    description: 'Đã có lỗi xảy ra, vui lòng thử lại sau',
                });
            }

            throw error;
        }
    }

    /**
     * Lấy thông tin người dùng hiện tại
     * @returns Promise<IResponse<IUserInfo>>
     */
    static async getCurrentUser() {
        // Nếu dùng API giả
        if (USE_MOCK_API) {
            return {
                data: {
                    username: 'admin',
                    email: 'admin@example.com',
                    role: 'admin'
                }
            };
        }
        
        return apiClient.get("auth/users/me");
    }
}

/**
 * Constants file cho ứng dụng
 */

export const APP_NAME = 'Efin';
export const API_URL = 'http://localhost:8000/api/v1/';

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  THEME: 'app_theme',
  USER_SETTINGS: 'user_settings',
};

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: 'auth/jwt/login',
  PROFILE: 'auth/users/me',
  REFRESH_TOKEN: 'auth/jwt/refresh',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  FORMAT_JSON: '/format/json',
  COMPARE_JSON: '/format/compare-json',
};

// Timeouts (ms)
export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  SESSION_IDLE: 1800000, // 30 minutes
  TOKEN_REFRESH: 300000, // 5 minutes before expiry
};

// Notifications
export const NOTIFICATIONS = {
  SESSION_EXPIRING: 'Phiên làm việc sắp hết hạn',
  SESSION_EXPIRED: 'Phiên làm việc đã hết hạn',
}; 
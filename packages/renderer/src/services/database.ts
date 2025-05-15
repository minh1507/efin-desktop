import localforage from 'localforage';

// Khởi tạo localForage để lưu trữ dữ liệu
localforage.config({
  name: 'efin-desktop',
  storeName: 'efin-data',
  description: 'Efin Desktop Storage',
  // Không sử dụng version trong config để tránh reset dữ liệu khi cập nhật ứng dụng
  // Điều này đảm bảo dữ liệu người dùng được giữ nguyên qua các phiên bản
  driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE]
});

// Key để lưu trữ dữ liệu xác thực
const AUTH_KEY = 'auth_data';
const STATS_KEY = 'usage_stats';
const FEATURE_USAGE_KEY = 'feature_usage';

export async function initializeDatabase() {
  try {
    // Kiểm tra phiên bản dữ liệu hiện tại (nếu có)
    const currentVersion = await localforage.getItem('db_version') as string;
    
    // Lấy phiên bản ứng dụng từ package.json (nếu cần cập nhật schema)
    // const appVersion = '1.0.0'; // Cố định giá trị này để không ảnh hưởng dữ liệu khi cập nhật ứng dụng
    
    if (!currentVersion) {
      // Lần đầu sử dụng, ghi phiên bản cơ sở dữ liệu
      await localforage.setItem('db_version', '1.0.0');
    } 
    
    // Chúng ta có thể thêm logic nâng cấp schema dữ liệu ở đây nếu cần
    // Ví dụ: if (currentVersion === '1.0.0') { thực hiện nâng cấp lên 1.0.1 }
    // Điều quan trọng là không bao giờ xóa dữ liệu người dùng, chỉ thực hiện chuyển đổi
    
    console.log('Database initialized with version:', currentVersion || '1.0.0');
    return localforage;
  } catch (error) {
    console.error('Error initializing database:', error);
    return localforage;
  }
}

export async function getAuthData() {
  try {
    const authData = await localforage.getItem(AUTH_KEY);
    return authData as { username: string; accessToken: string } | null;
  } catch (error) {
    console.error('Error getting auth data:', error);
    return null;
  }
}

export async function saveAuthData(username: string, accessToken: string) {
  try {
    await localforage.setItem(AUTH_KEY, { username, accessToken });
  } catch (error) {
    console.error('Error saving auth data:', error);
    throw error;
  }
}

export async function clearAuthData() {
  try {
    await localforage.removeItem(AUTH_KEY);
  } catch (error) {
    console.error('Error clearing auth data:', error);
    throw error;
  }
}

export async function getSetting(key: string) {
  try {
    const value = await localforage.getItem(`setting_${key}`);
    return value as string | null;
  } catch (error) {
    console.error(`Error getting setting for key ${key}:`, error);
    return null;
  }
}

export async function saveSetting(key: string, value: string) {
  try {
    await localforage.setItem(`setting_${key}`, value);
  } catch (error) {
    console.error(`Error saving setting for key ${key}:`, error);
    throw error;
  }
}

// Các hàm liên quan đến thống kê

// Interface cho dữ liệu thống kê
export interface DailyUsage {
  date: string; // ISO date string YYYY-MM-DD
  count: number; // Số lần sử dụng
}

export interface FeatureUsage {
  feature: string;
  timeSpent: number; // tính bằng giây
  lastUsed: string; // ISO datetime string
  count: number;
}

// Lưu lượt truy cập mới
export async function recordAppVisit() {
  try {
    // Lấy dữ liệu hiện có
    const stats = await localforage.getItem(STATS_KEY) as DailyUsage[] || [];
    const today = new Date().toISOString().split('T')[0];
    
    // Tìm bản ghi của ngày hôm nay
    const todayIndex = stats.findIndex(item => item.date === today);
    
    if (todayIndex >= 0) {
      // Cập nhật bản ghi hiện có
      stats[todayIndex] = {
        ...stats[todayIndex],
        count: stats[todayIndex].count + 1
      };
    } else {
      // Tạo bản ghi mới
      stats.push({ date: today, count: 1 });
    }
    
    // Lưu lại dữ liệu
    await localforage.setItem(STATS_KEY, stats);
  } catch (error) {
    console.error('Error recording app visit:', error);
  }
}

// Lấy dữ liệu sử dụng theo ngày
export async function getUsageStats(days: number = 7): Promise<DailyUsage[]> {
  try {
    // Lấy dữ liệu hiện có
    const stats = await localforage.getItem(STATS_KEY) as DailyUsage[] || [];
    
    // Tạo mảng các ngày trong khoảng thời gian
    const result: DailyUsage[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Tìm dữ liệu cho ngày này
      const existingStat = stats.find(item => item.date === dateString);
      
      if (existingStat) {
        result.push(existingStat);
      } else {
        result.push({ date: dateString, count: 0 });
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return [];
  }
}

// Ghi nhận sử dụng tính năng
export async function recordFeatureUsage(feature: string, timeSpent: number) {
  try {
    // Lấy dữ liệu hiện có
    const usageData = await localforage.getItem(FEATURE_USAGE_KEY) as FeatureUsage[] || [];
    const now = new Date().toISOString();
    
    // Tìm bản ghi của tính năng
    const featureIndex = usageData.findIndex(item => item.feature === feature);
    
    if (featureIndex >= 0) {
      // Cập nhật bản ghi hiện có
      usageData[featureIndex] = {
        ...usageData[featureIndex],
        timeSpent: usageData[featureIndex].timeSpent + timeSpent,
        lastUsed: now,
        count: usageData[featureIndex].count + 1
      };
    } else {
      // Tạo bản ghi mới
      usageData.push({
        feature,
        timeSpent,
        lastUsed: now,
        count: 1
      });
    }
    
    // Lưu lại dữ liệu
    await localforage.setItem(FEATURE_USAGE_KEY, usageData);
  } catch (error) {
    console.error('Error recording feature usage:', error);
  }
}

// Lấy dữ liệu sử dụng tính năng
export async function getFeatureUsage(): Promise<FeatureUsage[]> {
  try {
    const usageData = await localforage.getItem(FEATURE_USAGE_KEY) as FeatureUsage[] || [];
    return usageData;
  } catch (error) {
    console.error('Error getting feature usage:', error);
    return [];
  }
}

// Đơn giản hóa ghi lại sử dụng tính năng cho settings
export async function trackFeatureUsage(feature: string) {
  try {
    // Lấy dữ liệu hiện có
    const usageData = await localforage.getItem(FEATURE_USAGE_KEY) as FeatureUsage[] || [];
    const now = new Date().toISOString();
    
    // Tìm bản ghi của tính năng
    const featureIndex = usageData.findIndex(item => item.feature === feature);
    
    if (featureIndex >= 0) {
      // Cập nhật bản ghi hiện có
      usageData[featureIndex] = {
        ...usageData[featureIndex],
        lastUsed: now,
        count: usageData[featureIndex].count + 1
      };
    } else {
      // Tạo bản ghi mới
      usageData.push({
        feature,
        timeSpent: 0,
        lastUsed: now,
        count: 1
      });
    }
    
    // Lưu lại dữ liệu
    await localforage.setItem(FEATURE_USAGE_KEY, usageData);
  } catch (error) {
    console.error('Error tracking feature usage:', error);
    throw error;
  }
}

// Reset tất cả dữ liệu thống kê
export async function resetAllStatistics(): Promise<boolean> {
  try {
    // Xóa dữ liệu lượt truy cập
    await localforage.removeItem(STATS_KEY);
    // Xóa dữ liệu sử dụng tính năng
    await localforage.removeItem(FEATURE_USAGE_KEY);
    console.log('All statistics data reset successfully');
    return true;
  } catch (error) {
    console.error('Error resetting statistics data:', error);
    return false;
  }
} 
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getUsageStats, 
  getFeatureUsage, 
  recordFeatureUsage,
  resetAllStatistics,
  DailyUsage,
  FeatureUsage 
} from '@/services/database';

interface StatsState {
  dailyUsage: DailyUsage[];
  featureUsage: FeatureUsage[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: StatsState = {
  dailyUsage: [],
  featureUsage: [],
  loading: 'idle',
  error: null
};

// Thunk để lấy dữ liệu thống kê
export const fetchStats = createAsyncThunk(
  'stats/fetchStats',
  async (days: number = 7) => {
    // Lấy dữ liệu thống kê
    const dailyUsage = await getUsageStats(days);
    const featureUsage = await getFeatureUsage();
    
    return { dailyUsage, featureUsage };
  }
);

// Thunk để ghi nhận sử dụng tính năng
export const logFeatureUsage = createAsyncThunk(
  'stats/logFeatureUsage',
  async ({ feature, timeSpent }: { feature: string; timeSpent: number }) => {
    await recordFeatureUsage(feature, timeSpent);
    return { feature, timeSpent };
  }
);

// Thunk để reset tất cả dữ liệu thống kê
export const resetStats = createAsyncThunk(
  'stats/resetStats',
  async () => {
    const success = await resetAllStatistics();
    return { success };
  }
);

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.dailyUsage = action.payload.dailyUsage;
        state.featureUsage = action.payload.featureUsage;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Không thể lấy dữ liệu thống kê';
      })
      .addCase(logFeatureUsage.fulfilled, (_state) => {
        // Không cần cập nhật state vì dữ liệu được lưu trong database
        // và sẽ được lấy lại khi fetchStats được gọi
      })
      .addCase(resetStats.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.dailyUsage = [];
          state.featureUsage = [];
        }
      });
  }
});

export default statsSlice.reducer; 
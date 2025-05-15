import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AuthService from '@/services/auth';
import { ILogin } from '@/page/auth/login.type';
import { IResponse } from '@/services/type/base';

interface AuthState {
  user: {
    username: string;
    accessToken: string;
  } | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Giá trị mặc định để auto login trong development
const defaultUser = {
  username: 'testuser',
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxODkwMTM5MDIyfQ.XD-rl5ri9Xd4-GSjjFJ_eYwx32GFJ2C4B1qe5tMXd-Q'
};

const initialState: AuthState = {
  // Auto login cho phát triển
  user: defaultUser,
  status: 'succeeded',
  error: null
};

// Thunk action để xử lý login
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response: IResponse<ILogin> = await AuthService.login(email, password);
      if (response.status.success) {
        return {
          username: response.data.username,
          accessToken: response.data.accessToken
        };
      }
      return rejectWithValue(response.message.failed || 'Login failed');
    } catch (error) {
      return rejectWithValue('An error occurred during login');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ username: string; accessToken: string } | null>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
    mockLogin: (state) => {
      state.status = 'succeeded';
      state.user = defaultUser;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  }
});

export const { setUser, logout, mockLogin } = authSlice.actions;
export default authSlice.reducer; 
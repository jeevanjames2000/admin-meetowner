import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import {jwtDecode} from "jwt-decode";
import axiosIstance from "../../utils/axiosInstance";

interface LoginRequest {
  mobile: string;
  password: string;
}

interface User {
  id: number;
  user_type: number;
  name: string;
  mobile: string;
  alt_mobile: string;
  email: string;
  photo: string;
  status: number;
  created_date: string;
  created_time: string;
  updated_date: string;
  updated_time: string;
  state: string;
  city: string;
  location: number;
  address: string;
  pincode: string;
  from_app: number;
  gst_number: string | null;
  rera_number: string | null;
  uploaded_from_seller_panel: string;
}

interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

interface ErrorResponse {
  message?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  userCounts: UserCount[] | null;
}

interface DecodedToken {
  exp: number; // Expiration time in seconds
  [key: string]: any;
}

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const promise = axiosIstance.post<LoginResponse>(
        "/auth/v1/login",
        credentials
      );
      
      toast.promise(promise, {
        loading: "Logging in...",
        success: "Login successful!",
        error: "Login failed",
      });

      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Login error:", axiosError);
      return rejectWithValue(
        axiosError.response?.data || { message: "Login failed" }
      );
    }
  }
);

interface UserCount {
  user_type: string;
  count: number;
}

export const getAllUsersCount = createAsyncThunk(
  "auth/getAllUsersCount",
  async (_, { rejectWithValue }) => {
    try {
      const promise = axiosIstance.get<UserCount[]>(
        "/user/getAllUsersCount",
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      toast.promise(promise, {
        loading: "Fetching user counts...",
        success: "User counts fetched successfully!",
        error: "Failed to fetch user counts",
      });

      const response = await promise;

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid response format: Expected an array");
      }

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse> | Error;
      console.error("Error fetching user counts:", axiosError);
      return rejectWithValue(
        axiosError instanceof AxiosError
          ? axiosError.response?.data || { message: "Failed to fetch user counts" }
          : { message: axiosError.message }
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null,
    userCounts: null,
  } as AuthState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      state.userCounts = null;
      
      localStorage.removeItem('token');
      localStorage.removeItem('name');
      localStorage.removeItem('userType');
      localStorage.removeItem('email');
      localStorage.removeItem('mobile');
      localStorage.removeItem('city');
      localStorage.removeItem('state');
      
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('name', action.payload.user.name);
        localStorage.setItem('userType', action.payload.user.user_type.toString());
        localStorage.setItem('email', action.payload.user.email);
        localStorage.setItem('mobile',action.payload.user.mobile);
        localStorage.setItem('city',action.payload.user.city);
        localStorage.setItem('state',action.payload.user.state);
       
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getAllUsersCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsersCount.fulfilled, (state, action) => {
        state.loading = false;
        state.userCounts = action.payload;
      })
      .addCase(getAllUsersCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  try {
    const decoded: DecodedToken = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

export const { logout } = authSlice.actions;
export default authSlice.reducer;
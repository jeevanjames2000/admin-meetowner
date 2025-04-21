import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import axiosIstance from "../../utils/axiosInstance";

interface LoginRequest {
  mobile: string;
  password: string;
}

interface User {
  user_id: number;
  mobile: string;
  name: string;
  user_type: number;
  email: string;
  state: string | null; // Allow null
  city: string;
  pincode: string;
  status: number | null; // Allow null
  created_userID: number | null; // Allow null
  created_by: string | null; // Allow null
  photo?: string; // Optional
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
  exp: number;
  [key: string]: any;
}

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const promise = axiosIstance.post<LoginResponse>("/auth/v1/loginAgent", credentials);

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

      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 401:
            return rejectWithValue("Invalid mobile number or password");
          case 404:
            return rejectWithValue("Login service not found (404). Please try again later.");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(
              axiosError.response.data?.message || "An unexpected error occurred"
            );
        }
      }

      if (axiosError.code === "ECONNABORTED" || axiosError.message === "Network Error") {
        return rejectWithValue("Network error. Please check your connection and try again.");
      }

      return rejectWithValue("Login failed. Please try again.");
    }
  }
);

interface UserCount {
  user_type: string;
  count: number;
  trend?: "up" | "down";
  percentage?: number;
}

export const getAllUsersCount = createAsyncThunk(
  "auth/getAllUsersCount",
  async (_, { rejectWithValue }) => {
    try {
      const promise = axiosIstance.get<UserCount[]>("/user/v1/getAllUsersCount");

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

      localStorage.removeItem("token");
      localStorage.removeItem("name");
      localStorage.removeItem("userType");
      localStorage.removeItem("email");
      localStorage.removeItem("mobile");
      localStorage.removeItem("city");
      localStorage.removeItem("state");
      localStorage.removeItem("userId");
      localStorage.removeItem("photo"); // Optional, since photo is optional
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
        state.user = {
          user_id: action.payload.user.user_id,
          mobile: action.payload.user.mobile,
          name: action.payload.user.name,
          user_type: action.payload.user.user_type,
          email: action.payload.user.email || "",
          state: action.payload.user.state || "",
          city: action.payload.user.city || "",
          pincode: action.payload.user.pincode || "",
          status: action.payload.user.status ?? 0,
          created_userID: action.payload.user.created_userID ?? 0,
          created_by: action.payload.user.created_by || "",
          photo: action.payload.user.photo || "",
        };
        state.token = action.payload.token;

        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("name", action.payload.user.name);
        localStorage.setItem("userType", action.payload.user.user_type.toString());
        localStorage.setItem("email", action.payload.user.email || "");
        localStorage.setItem("mobile", action.payload.user.mobile);
        localStorage.setItem("city", action.payload.user.city || "");
        localStorage.setItem("state", action.payload.user.state || "");
        localStorage.setItem("userId", action.payload.user.user_id.toString());
        localStorage.setItem("photo", action.payload.user.photo || "");
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
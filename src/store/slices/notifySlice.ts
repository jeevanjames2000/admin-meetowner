import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

// Interfaces for API responses and payloads
interface User {
  user_id: number;
  push_token: string;
  created_at: string;
  name: string;
}

interface NotifyTicket {
  status: string;
  id: string;
}

interface NotifyAllResponse {
  success: boolean;
  count: number;
  tickets: NotifyTicket[];
}

interface NotifyUserResponse {
  success: boolean;
  tickets: NotifyTicket[];
}

interface ErrorResponse {
  message?: string;
}

export interface NotifyState {
  users: User[];
  loading: boolean;
  error: string | null;
  notifyAllLoading: boolean;
  notifyAllError: string | null;
  notifyUserLoading: boolean;
  notifyUserError: string | null;
}

// Initial state
const initialState: NotifyState = {
  users: [],
  loading: false,
  error: null,
  notifyAllLoading: false,
  notifyAllError: null,
  notifyUserLoading: false,
  notifyUserError: null,
};

// Async thunk for fetching all tokens
export const fetchAllTokens = createAsyncThunk(
  "notify/fetchAllTokens",
  async (_, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.get<User[]>("/user/v1/getAllTokens");
      console.log('all tokens');
      console.log(promise);
      toast.promise(promise, {
        loading: "Fetching users...",
        success: "Users fetched successfully!",
        error: "Failed to fetch users",
      });
      
      const response = await promise;
    
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to fetch users";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for notifying all users
export const notifyAllUsers = createAsyncThunk(
  "notify/notifyAllUsers",
  async ({ title, message }: { title: string; message: string }, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.post<NotifyAllResponse>(
        "/user/v1/notify-all",
        { title, message },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.promise(promise, {
        loading: "Sending notification to all users...",
        success: "Notification sent successfully!",
        error: "Failed to send notification",
      });
      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to send notification";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for notifying a single user
export const notifySingleUser = createAsyncThunk(
  "notify/notifySingleUser",
  async (
    { user_id, title, message }: { user_id: number; title: string; message: string },
    { rejectWithValue }
  ) => {
    try {
      const promise = axiosInstance.post<NotifyUserResponse>(
        "/user/v1/notify-user",
        { user_id, title, message },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.promise(promise, {
        loading: "Sending notification to user...",
        success: "Notification sent successfully!",
        error: "Failed to send notification",
      });
      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to send notification";
      return rejectWithValue(errorMessage);
    }
  }
);

// Notify slice
const notifySlice = createSlice({
  name: "notify",
  initialState,
  reducers: {
    clearNotify: (state) => {
      state.users = [];
      state.error = null;
      state.notifyAllError = null;
      state.notifyUserError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all tokens
    builder
      .addCase(fetchAllTokens.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTokens.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload; // Directly use the array
      })
      .addCase(fetchAllTokens.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Notify all users
      .addCase(notifyAllUsers.pending, (state) => {
        state.notifyAllLoading = true;
        state.notifyAllError = null;
      })
      .addCase(notifyAllUsers.fulfilled, (state) => {
        state.notifyAllLoading = false;
        // No state update needed unless you want to store tickets
      })
      .addCase(notifyAllUsers.rejected, (state, action) => {
        state.notifyAllLoading = false;
        state.notifyAllError = action.payload as string;
      })
      // Notify single user
      .addCase(notifySingleUser.pending, (state) => {
        state.notifyUserLoading = true;
        state.notifyUserError = null;
      })
      .addCase(notifySingleUser.fulfilled, (state) => {
        state.notifyUserLoading = false;
        // No state update needed unless you want to store tickets
      })
      .addCase(notifySingleUser.rejected, (state, action) => {
        state.notifyUserLoading = false;
        state.notifyUserError = action.payload as string;
      });
  },
});

export const { clearNotify } = notifySlice.actions;
export default notifySlice.reducer;
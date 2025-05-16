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

interface Notification {
  id: number;
  user_id: string;
  title: string;
  message: string;
  created_at: string;
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

interface NotificationHistoryResponse {
  notifications: Notification[];
}

interface ErrorResponse {
  message?: string;
}

export interface NotifyState {
  users: User[];
  notifications: Notification[]; // New state for notification history
  loading: boolean;
  error: string | null;
  notifyAllLoading: boolean;
  notifyAllError: string | null;
  notifyUserLoading: boolean;
  notifyUserError: string | null;
  notificationHistoryLoading: boolean; // New loading state
  notificationHistoryError: string | null; // New error state
}

// Initial state
const initialState: NotifyState = {
  users: [],
  notifications: [], // Initialize notifications array
  loading: false,
  error: null,
  notifyAllLoading: false,
  notifyAllError: null,
  notifyUserLoading: false,
  notifyUserError: null,
  notificationHistoryLoading: false,
  notificationHistoryError: null,
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

// Async thunk for fetching notification history
export const fetchNotificationHistory = createAsyncThunk(
  "notify/fetchNotificationHistory",
  async (_, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.get<NotificationHistoryResponse>("/user/v1/getAllNotificationHistory");
      toast.promise(promise, {
        loading: "Fetching notification history...",
        success: "Notification history fetched successfully!",
        error: "Failed to fetch notification history",
      });
      
      const response = await promise;
      return response.data.notifications; // Return the notifications array
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to fetch notification history";
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
      state.notifications = []; // Clear notifications
      state.error = null;
      state.notifyAllError = null;
      state.notifyUserError = null;
      state.notificationHistoryError = null; // Clear notification history error
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
        state.users = action.payload;
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
      })
      .addCase(notifySingleUser.rejected, (state, action) => {
        state.notifyUserLoading = false;
        state.notifyUserError = action.payload as string;
      })
      // Fetch notification history
      .addCase(fetchNotificationHistory.pending, (state) => {
        state.notificationHistoryLoading = true;
        state.notificationHistoryError = null;
      })
      .addCase(fetchNotificationHistory.fulfilled, (state, action) => {
        state.notificationHistoryLoading = false;
        state.notifications = action.payload; // Store notifications array
      })
      .addCase(fetchNotificationHistory.rejected, (state, action) => {
        state.notificationHistoryLoading = false;
        state.notificationHistoryError = action.payload as string;
      });
  },
});

export const { clearNotify } = notifySlice.actions;
export default notifySlice.reducer;
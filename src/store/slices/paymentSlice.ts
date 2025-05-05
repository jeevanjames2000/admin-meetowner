import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

// Interfaces for API responses
interface Subscription {
  id: number;
  name: string;
  mobile: string;
  email: string;
  subscription_package: string;
  subscription_start_date: string;
  subscription_expiry_date: string;
  subscription_status: string;
}

interface ErrorResponse {
  message?: string;
}

export interface PaymentState {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: PaymentState = {
  subscriptions: [],
  loading: false,
  error: null,
};

// Async thunk for fetching all subscriptions
export const fetchAllSubscriptions = createAsyncThunk(
  "payment/fetchAllSubscriptions",
  async (_, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.get<{ data: Subscription[] }>(
        "/packages/v1/getAllSubscriptions"
      );
      toast.promise(promise, {
        loading: "Fetching subscriptions...",
        success: "Subscriptions fetched successfully!",
        error: "Failed to fetch subscriptions",
      });

      const response = await promise;
      return response.data.data; // Extract the 'data' array from the response
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to fetch subscriptions";
      return rejectWithValue(errorMessage);
    }
  }
);

// Payment slice
const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearSubscriptions: (state) => {
      state.subscriptions = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all subscriptions
    builder
      .addCase(fetchAllSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = action.payload;
      })
      .addCase(fetchAllSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSubscriptions } = paymentSlice.actions;
export default paymentSlice.reducer;
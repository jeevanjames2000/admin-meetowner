import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

// Interfaces for API responses
interface Subscription {
  id: number;
  user_id: number;
  name: string;
  mobile: string;
  email: string;
  subscription_package: string;
  subscription_start_date: string;
  subscription_expiry_date: string;
  subscription_status: string;
  payment_status: string;
  payment_amount: string;
  payment_reference: string;
  payment_mode: string;
  payment_gateway: string;
  transaction_time: string;
  created_at: string;
  updated_at: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  actual_amount: string;
  gst: string;
  sgst: string;
  gst_percentage: string;
  gst_number: string;
  rera_number: string;
  invoice_number: string | null; // Nullable field
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

interface SubscriptionFilters {
  payment_status?: string; // Optional payment_status
}

interface SubscriptionsResponse {
  data: Subscription[];
}

interface UpdateSubscriptionResponse {
  success: boolean;
  message: string;
}


// Async thunk for fetching all subscriptions
export const fetchAllSubscriptions = createAsyncThunk<
  Subscription[], // Return type
  SubscriptionFilters, // First argument type
  { rejectValue: string } // ThunkAPI config for rejectWithValue
>(
  "payment/fetchAllSubscriptions",
  async (filters: SubscriptionFilters, { rejectWithValue }) => {
    try {
      const { payment_status } = filters;

      const promise = axiosInstance.get<SubscriptionsResponse>(
        "/packages/v1/getAllSubscriptions",
        {
          params: {
            payment_status, // Automatically omitted if undefined
          },
        }
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

export const updateSubscriptionStatus = createAsyncThunk<
  UpdateSubscriptionResponse,
  { user_id: number; subscription_status: string; payment_status: string },
  { rejectValue: string }>(
  "payment/updateSubscriptionStatus",
  async ({ user_id, subscription_status, payment_status }, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.post<UpdateSubscriptionResponse>(
        "/payments/updateSubscription",
        {
          user_id,
          subscription_status,
          payment_status,
        }
      );

      toast.promise(promise, {
        loading: "Updating subscription status...",
        success: (data ) => data.data.message ,
        error: "Failed to update subscription status",
      });

      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to update subscription status";
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
      })

      builder
      .addCase(updateSubscriptionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubscriptionStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update the subscriptions list if needed
        // For example, you can refetch subscriptions after a successful update
      })
      .addCase(updateSubscriptionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSubscriptions } = paymentSlice.actions;
export default paymentSlice.reducer;
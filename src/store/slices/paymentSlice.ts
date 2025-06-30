import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
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
  leadsCount: number;
  gst_number: string;
  rera_number: string;
  allowedListings:string;
  uploadedCount:string;
  remaining:string;
  invoice_number: string | null;
  invoice_url:string;
  user_type: number;
  city: string;
}
interface ExpiringSoonUser {
  user_id: number;
  name: string;
  email: string;
  subscription_expiry_date: string;
  message: string;
  mobile: string;
  user_type: number; 
  subscription_package: string; 
  payment_id: number; 
  payment_amount: string;
  payment_status: string; 
  city: string; 
  payment_date: string; 
}
interface ErrorResponse {
  message?: string;
}
export interface PaymentState {
  subscriptions: Subscription[];
  subscriptionHistory: Subscription[];
  expiringSoonSubscriptions: ExpiringSoonUser[];
  loading: boolean;
  historyLoading: boolean;
  expiringSoonLoading: boolean;
  error: string | null;
  historyError: string | null;
  expiringSoonError: string | null;
}
const initialState: PaymentState = {
  subscriptions: [],
  subscriptionHistory: [],
  expiringSoonSubscriptions: [],
  loading: false,
  historyLoading: false,
  expiringSoonLoading: false,
  error: null,
  historyError: null,
  expiringSoonError: null,
};
interface SubscriptionHistoryFilters {
  user_id: number;
  city?: string;
}
interface SubscriptionFilters {
  payment_status?: string;
}
interface SubscriptionsResponse {
  data: Subscription[];
}
interface ExpiringSoonResponse {
  success: boolean;
  expiringSoon: boolean;
  total: number;
  users: ExpiringSoonUser[];
}
interface UpdateSubscriptionResponse {
  success: boolean;
  message: string;
}
interface SubscriptionHistoryResponse {
  subscriptions: Subscription[];
}
export const fetchAllSubscriptions = createAsyncThunk<
  Subscription[],
  SubscriptionFilters,
  { rejectValue: string }
>(
  "payment/fetchAllSubscriptions",
  async (filters: SubscriptionFilters, { rejectWithValue }) => {
    try {
      const { payment_status } = filters;
      const promise = axiosInstance.get<SubscriptionsResponse>(
        "/packages/v1/getAllSubscriptions",
        {
          params: {
            payment_status,
            payment_status,
          },
        }
      );
      toast.promise(promise, {
        loading: "Fetching subscriptions...",
        success: "Subscriptions fetched successfully!",
        error: "Failed to fetch subscriptions",
      });
      const response = await promise;
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to fetch subscriptions";
      return rejectWithValue(errorMessage);
    }
  }
);
export const fetchAllSubscriptionsHistory = createAsyncThunk<
  Subscription[],
  SubscriptionHistoryFilters,
  { rejectValue: string }
>(
  "payment/fetchAllSubscriptionsHistory",
  async ({ user_id, city }, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.get<SubscriptionHistoryResponse>(
        "/payments/getAllSubscriptionsHistory",
        {
          params: {
            user_id,
            city,
          },
        }
      );
     
      const response = await promise;
      return response.data.subscriptions;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to fetch subscription history";
      return rejectWithValue(errorMessage);
    }
  }
);
export const fetchExpiringSoonSubscriptions = createAsyncThunk<
  ExpiringSoonUser[],
  void,
  { rejectValue: string }
>(
  "payment/fetchExpiringSoonSubscriptions",
  async (_, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.get<ExpiringSoonResponse>(
        "/payments/getAllExpiringSoon"
      );
      const response = await promise;
      if (response.data.success && response.data.expiringSoon) {
        return response.data.users;
      } else {
        return [];
      }
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "Failed to fetch expiring soon subscriptions";
      return rejectWithValue(errorMessage);
    }
  }
);
export const updateSubscriptionStatus = createAsyncThunk<
  UpdateSubscriptionResponse,
  { user_id: number; subscription_status: string; payment_status: string },
  { rejectValue: string }
>(
  "payment/updateSubscriptionStatus",
  async (
    { user_id, subscription_status, payment_status },
    { rejectWithValue }
  ) => {
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
        success: (data) => data.data.message,
        error: "Failed to update subscription status",
      });
      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "Failed to update subscription status";
      return rejectWithValue(errorMessage);
    }
  }
);
const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearSubscriptions: (state) => {
      state.subscriptions = [];
      state.subscriptionHistory = [];
      state.expiringSoonSubscriptions = [];
      state.error = null;
      state.historyError = null;
      state.expiringSoonError = null;
    },
  },
  extraReducers: (builder) => {
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
        builder
      .addCase(fetchAllSubscriptionsHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchAllSubscriptionsHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.subscriptionHistory = action.payload;
      })
      .addCase(fetchAllSubscriptionsHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload as string;
      });
    builder
      .addCase(fetchExpiringSoonSubscriptions.pending, (state) => {
        state.expiringSoonLoading = true;
        state.expiringSoonError = null;
      })
      .addCase(fetchExpiringSoonSubscriptions.fulfilled, (state, action) => {
        state.expiringSoonLoading = false;
        state.expiringSoonSubscriptions = action.payload;
      })
      .addCase(fetchExpiringSoonSubscriptions.rejected, (state, action) => {
        state.expiringSoonLoading = false;
        state.expiringSoonError = action.payload as string;
      });
    builder
      .addCase(updateSubscriptionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubscriptionStatus.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateSubscriptionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
export const { clearSubscriptions } = paymentSlice.actions;
export default paymentSlice.reducer;
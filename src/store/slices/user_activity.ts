// UserActivitySlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

// Define the UserActivity type based on the API response
interface UserActivity {
  id: number;
  property_id?: string; // Optional, for "Searched" and "Property Viewed"
  user_id: number;
  name?: string; // Optional, for "Searched" and "Property Viewed"
  mobile?: string; // Optional, for "Searched", "Property Viewed", and "Contacted"
  email?: string; // Optional, for "Searched", "Property Viewed", and "Contacted"
  userName?: string; // Optional, for "Liked"
  userMobile?: string; // Optional, for "Liked"
  userEmail?: string; // Optional, for "Liked"
  searched_on_date?: string; // Optional, for "Searched" and "Liked"
  searched_on_time?: string; // Optional, for "Searched" and "Liked"
  interested_status?: number; // Optional, for "Searched"
  property_user_id?: number; // Optional, for "Searched"
  searched_filter_desc?: string | null; // Optional, for "Searched"
  shedule_date?: string | null; // Optional, for "Searched"
  shedule_time?: string | null; // Optional, for "Searched"
  view_status?: number | null; // Optional, for "Searched"
  property_name?: string | null; // Optional, for all activity types
  location_id?: string | null; // Optional, for all activity types
  google_address?: string | null; // Optional, for all activity types
  activityType: string; // e.g., "Searched", "Contacted", "Property Viewed", "Liked"
  created_date?: string; // Optional, for "Contacted" and "Property Viewed"
  updated_date?: string; // Optional, for "Contacted"
  created_time?: string | null; // Optional, for "Contacted"
  unique_property_id?: string; // Optional, for "Contacted" and "Liked"
  fullname?: string | null; // Optional, for "Contacted"
  sub_type?: string; // Optional, for "Liked" (e.g., "Apartment")
  property_for?: string; // Optional, for "Liked" (e.g., "Sell")
  city_id?: string; // Optional, for "Liked" (e.g., "Hyderabad")
  property_cost?: string; // Optional, for "Liked" (e.g., "6748500.00")
}


// Define the User type to include userActivity
interface User {
  id: number;
  user_type: number;
  name: string;
  mobile: string;
  alt_mobile: string | null;
  email: string;
  password: string;
  photo: string;
  status: number;
  created_date: string;
  created_time: string;
  updated_date: string;
  updated_time: string;
  state: string;
  city: string;
  location: string | null;
  address: string;
  pincode: string;
  from_app: string | null;
  gst_number: string | null;
  rera_number: string | null;
  uploaded_from_seller_panel: string;
  designation: string;
  subscription_package: string | null;
  subscription_start_date: string | null;
  subscription_expiry_date: string | null;
  subscription_status: string | null;
  created_by: string;
  created_userID: number;
  company_name: string | null;
  assigned_emp_id: number;
  assigned_emp_type: string;
  assigned_emp_name: string;
  userActivity: UserActivity[];
}

// Define the API response structure
interface UserActivityResponse {
  success: boolean;
  count: number;
  data: User[];
}

// Define the state for the UserActivity slice
interface UserActivityState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Define the error response type
interface ErrorResponse {
  status?: string;
  message?: string;
}

// Async thunk to fetch user activity
export const fetchUserActivity = createAsyncThunk(
  "userActivity/fetchUserActivity",
  async (userId: number, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.get<UserActivityResponse>(
        `/user/v1/getUserCompleteActivity?user_id=${userId}`
      );

      toast.promise(promise, {
        loading: "Fetching user activity...",
        success: "User activity fetched successfully!",
        error: "Failed to fetch user activity",
      });

      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Fetch user activity error:", axiosError);
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to fetch user activity"
      );
    }
  }
);

// Initial state
const initialState: UserActivityState = {
  user: null,
  loading: false,
  error: null,
};

// Create the slice
const userActivitySlice = createSlice({
  name: "userActivity",
  initialState,
  reducers: {
    clearUserActivity: (state) => {
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserActivity.fulfilled, (state, action) => {
        state.loading = false;
        // Since the API returns an array of users, take the first user (as per the response structure)
        state.user = action.payload.data[0] || null;
      })
      .addCase(fetchUserActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { clearUserActivity } = userActivitySlice.actions;
export default userActivitySlice.reducer;


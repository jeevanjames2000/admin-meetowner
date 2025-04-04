import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import  { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import axiosIstance from "../../utils/axiosInstance";

// Define interfaces for the user and API response
interface User {
  id: number;
  user_type: number;
  name: string;
  mobile: string;
  alt_mobile: string;
  email: string;
  password: string;
  photo: string;
  status: number;
  created_date: string;
  created_time: string;
  updated_date: string | null;
  updated_time: string | null;
  state: string;
  city: string;
  location: number;
  address: string;
  pincode: string;
  from_app: number;
  gst_number: string;
  rera_number: string;
  uploaded_from_seller_panel: string;
}

interface UsersResponse {
  success: boolean;
  count: number;
  data: User[];
}

interface ErrorResponse {
  message?: string;
}

// Define the state interface
export interface UsersState {
  users: User[];
  totalCount: number;
  loading: boolean;
  error: string | null;
}

// Define the filter parameters for the API request
interface UserFilter {
  user_type: number;
}

// Create async thunk for fetching users
export const fetchUsersByType = createAsyncThunk(
  "users/fetchUsersByType",
  async (filter: UserFilter, { rejectWithValue }) => {
    try {
      const { user_type } = filter;
      const promise = axiosIstance.get<UsersResponse>(
        "/user/getAllUsersByType",
        {
          params: {
            user_type,
          },
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      toast.promise(promise, {
        loading: "Fetching users...",
        success: "Users fetched successfully!",
        error: "Failed to fetch users",
      });

      const response = await promise;
      console.log(response.data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Fetch users error:", axiosError);
      return rejectWithValue(
        axiosError.response?.data || { message: "Failed to fetch users" }
      );
    }
  }
);

// Create the slice
const usersSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    totalCount: 0,
    loading: false,
    error: null,
  } as UsersState,
  reducers: {
    // Optional: Add any synchronous reducers if needed
    clearUsers: (state) => {
      state.users = [];
      state.totalCount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersByType.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.totalCount = action.payload.count;
      })
      .addCase(fetchUsersByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUsers } = usersSlice.actions;
export default usersSlice.reducer;
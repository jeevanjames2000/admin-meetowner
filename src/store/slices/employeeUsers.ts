// store/slices/employeeUsers.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";

interface User {
  id: number;
  name: string;
  mobile: string;
  user_type: number;
  email?: string;
  city?: string;
  state?: string;
  pincode?: string;
  designation?: string;
  created_date?: string;
  // Add other fields as needed, allowing them to be optional
}

interface UsersResponse {
  success: boolean;
  count: number;
  data: User[];
}

interface EmployeeUsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

interface ErrorResponse {
  message: string;
}

const initialState: EmployeeUsersState = {
  users: [],
  loading: false,
  error: null,
};

interface UserFilter {
  user_type: number;
}

export const fetchEmployeeUsersByType = createAsyncThunk(
  "employeeUsers/fetchEmployeeUsersByType",
  async (filter: UserFilter, { rejectWithValue }) => {
    try {
      const { user_type } = filter;
      const promise = axiosInstance.get<UsersResponse>(
        "/user/v1/getAllUsersByType",
        {
          params: {
            user_type,
          },
        }
      );
      toast.promise(promise, {
        loading: "Fetching users...",
        success: "Users fetched successfully!",
        error: "Failed to fetch users",
      });

      const response = await promise;
      return response.data.data; // Return only the data array
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

const employeeUsersSlice = createSlice({
  name: "employeeUsers",
  initialState,
  reducers: {
    clearEmployeeUsers: (state) => {
      state.users = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeUsersByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeUsersByType.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload; // Store the data array
      })
      .addCase(fetchEmployeeUsersByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; // Set the error message
      });
  },
});

export const { clearEmployeeUsers } = employeeUsersSlice.actions;
export default employeeUsersSlice.reducer;
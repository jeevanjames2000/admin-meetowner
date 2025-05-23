import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";

interface User {
  id: number;
  user_type: number;
  name: string;
  mobile: string;
  alt_mobile?: string | null;
  email?: string;
  password?: string;
  photo?: string | null;
  status?: number;
  created_date?: string;
  created_time?: string;
  updated_date?: string | null;
  updated_time?: string | null;
  state?: string | null;
  city?: string | null;
  location?: string | null;
  address?: string | null;
  pincode?: string | null;
  from_app?: string | null;
  gst_number?: string | null;
  rera_number?: string | null;
  uploaded_from_seller_panel?: string;
  designation?: string;
  created_by?: string;
  created_userID?: number;
  assigned_user_id?: number | null;
  assigned_user_type?: number | null;
  assigned_user_name?: string | null;
  assigned_users?: Array<{
    id: number;
    user_type: number;
    photo: string | null;
    name: string;
    mobile: string;
    email: string;
    city: string | null;
    address: string | null;
    subscription_package: string | null;
    subscription_start_date: string | null;
    subscription_expiry_date: string | null;
    subscription_status: string | null;
    assigned_emp_id: number;
    assigned_emp_type: string;
    assigned_emp_name: string;
    created_date:string;
  }>;
}

interface UsersResponse {
  success: boolean;
  count: number;
  data: User[];
}

interface EmployeeCount {
  user_type: string;
  count: number;
}

type EmployeeCountResponse = EmployeeCount[];

interface EmployeeUsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  employeeCounts: EmployeeCount[] | null;
  countsLoading: boolean;
  countsError: string | null;
}

interface ErrorResponse {
  message: string;
}

const initialState: EmployeeUsersState = {
  users: [],
  loading: false,
  error: null,
  employeeCounts: null,
  countsLoading: false,
  countsError: null,
};

interface UserFilter {
  user_type: number;
}

interface EmployeeIdFilter {
  id: number;
}

export const fetchEmployeeUsersByType = createAsyncThunk(
  "employeeUsers/fetchEmployeeUsersByType",
  async (filter: UserFilter, { rejectWithValue }) => {
    try {
      const { user_type } = filter;
      const promise = axiosInstance.get<UsersResponse>(
        "/user/v1/getAllEmployeesByTypeSearch",
        {
          params: {
            user_type,
          },
        }
      );
      // toast.promise(promise, {
      //   loading: "Fetching users...",
      //   success: "Users fetched successfully!",
      //   error: "Failed to fetch users",
      // });

      const response = await promise;
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Fetch employee users error:", axiosError);

      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 403:
            return rejectWithValue("You don't have permission to view users");
          case 404:
            return rejectWithValue("Users not found");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(
              axiosError.response?.data?.message || "Failed to fetch users"
            );
        }
      }
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const fetchEmployeeById = createAsyncThunk(
  "employeeUsers/fetchEmployeeById",
  async (filter: EmployeeIdFilter, { rejectWithValue }) => {
    try {
      const { id } = filter;
      const promise = axiosInstance.get<UsersResponse>(
        `/user/v1/getAllEmployeesByTypeSearch?id=${id}`
      );
      toast.promise(promise, {
        loading: `Fetching employee with ID ${id}...`,
        success: "Employee fetched successfully!",
        error: "Failed to fetch employee",
      });

      const response = await promise;
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Fetch employee by ID error:", axiosError);

      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 403:
            return rejectWithValue("You don't have permission to view employee");
          case 404:
            return rejectWithValue("Employee not found");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(
              axiosError.response?.data?.message || "Failed to fetch employee"
            );
        }
      }
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const fetchEmployeeCounts = createAsyncThunk(
  "employeeUsers/fetchEmployeeCounts",
  async (_, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.get<EmployeeCountResponse>(
        "/user/v1/getAllEmployeeCount"
      );
      // toast.promise(promise, {
      //   loading: "Fetching employee counts...",
      //   success: "Employee counts fetched successfully!",
      //   error: "Failed to fetch employee counts",
      // });

      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Fetch employee counts error:", axiosError);

      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 403:
            return rejectWithValue("You don't have permission to view employee counts");
          case 404:
            return rejectWithValue("Employee counts not found");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(
              axiosError.response?.data?.message || "Failed to fetch employee counts"
            );
        }
      }
      return rejectWithValue("Network error. Please try again.");
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
      state.employeeCounts = null;
      state.countsLoading = false;
      state.countsError = null;
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
        state.users = action.payload;
      })
      .addCase(fetchEmployeeUsersByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchEmployeeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchEmployeeCounts.pending, (state) => {
        state.countsLoading = true;
        state.countsError = null;
      })
      .addCase(fetchEmployeeCounts.fulfilled, (state, action) => {
        state.countsLoading = false;
        state.employeeCounts = action.payload;
      })
      .addCase(fetchEmployeeCounts.rejected, (state, action) => {
        state.countsLoading = false;
        state.countsError = action.payload as string;
      });
  },
});

export const { clearEmployeeUsers } = employeeUsersSlice.actions;
export default employeeUsersSlice.reducer;
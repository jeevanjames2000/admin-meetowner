import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance"; // Fixed typo: axiosIstance -> axiosInstance

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
}

interface UsersResponse {
  success: boolean;
  count: number;
  data: User[];
}



interface CreateUserResponse {
  status: string;
  message: string;
  user_details?: {
    user_id: string;
    user_type: number;
    name: string;
    mobile: string;
    email: string;
  };
  accessToken?: string;
}

interface CreateUserPayload {
  name: string;
  userType: string;
  mobile: string;
  email: string;
  city: number;
}

interface ErrorResponse {
  status?: string;
  message?: string;
}


export interface UsersState {
  users: User[];
  totalCount: number;
  loading: boolean;
  error: string | null;
}

interface UserFilter {
  user_type: number;
}

export const fetchUsersByType = createAsyncThunk(
  "users/fetchUsersByType",
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
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Fetch users error:", axiosError);
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  "users/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.get<UsersResponse>("/api/v1/getUsers");

      toast.promise(promise, {
        loading: "Fetching all users...",
        success: "All users fetched successfully!",
        error: "Failed to fetch all users",
      });

      const response = await promise;
      console.log(response);
      return response;
    
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Fetch all users error:", axiosError);
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to fetch all users"
      );
    }
  }
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (userData: CreateUserPayload, { rejectWithValue }) => {
    try {
      const payload = {
        name: userData.name,
        userType: userData.userType,
        mobile: userData.mobile,
        email: userData.email,
        city: userData.city,
      };

      const promise = axiosInstance.post<CreateUserResponse>(
        "/auth/registernew",
        payload
      );

      toast.promise(promise, {
        loading: "Creating user...",
        success: "User created successfully!",
        error: "Failed to create user",
      });

      const response = await promise;

      if (response.data.status === "success") {
        return response.data;
      } else {
        return rejectWithValue(response.data.message || "Failed to create user");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Create user error:", axiosError);
      return rejectWithValue(
        axiosError.response?.data?.message ||
          "Failed to create user"
      );
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    totalCount: 0,
    loading: false,
    error: null,
  } as UsersState,
  reducers: {
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
      })
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
       .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUsers } = usersSlice.actions;
export default usersSlice.reducer;
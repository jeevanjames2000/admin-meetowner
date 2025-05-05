import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

// Interfaces for API responses
interface PackageRule {
  name: string;
  included: boolean;
}

interface Package {
  id: string;
  name: string;
  duration_days: number;
  price: string;
  rules: PackageRule[];
}

interface ErrorResponse {
  message?: string;
}

export interface PackageState {
  packages: Package[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: PackageState = {
  packages: [],
  loading: false,
  error: null,
};

// Async thunk for fetching all packages
export const fetchAllPackages = createAsyncThunk(
  "package/fetchAllPackages",
  async (_, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.get<Package[]>("/packages/v1/getAllPackages");
      toast.promise(promise, {
        loading: "Fetching packages...",
        success: "Packages fetched successfully!",
        error: "Failed to fetch packages",
      });
      
      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to fetch packages";
      return rejectWithValue(errorMessage);
    }
  }
);

// Package slice
const packageSlice = createSlice({
  name: "package",
  initialState,
  reducers: {
    clearPackages: (state) => {
      state.packages = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all packages
    builder
      .addCase(fetchAllPackages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPackages.fulfilled, (state, action) => {
        state.loading = false;
        state.packages = action.payload;
      })
      .addCase(fetchAllPackages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPackages } = packageSlice.actions;
export default packageSlice.reducer;
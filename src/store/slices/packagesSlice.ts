import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

interface PackageRule {
  id: number;
  name: string;
  included: boolean;
}

interface Package {
  id: string;
  name: string;
  duration_days: number;
  price: string;
  is_popular: boolean;
  button_text: string;
  actual_amount: string;
  gst: string;
  sgst: string;
  gst_percentage: string;
  gst_number: string;
  rera_number: string;
  package_for: string;
  rules: PackageRule[];
}

interface ErrorResponse {
  message?: string;
}

interface SuccessResponse {
  message: string;
}

export interface PackageState {
  packages: Package[];
  loading: boolean;
  error: string | null;
  insertLoading: boolean;
  insertError: string | null;
  insertSuccess: string | null;
  editLoading: boolean;
  editError: string | null;
  editSuccess: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
  deleteSuccess: string | null;
  editPackageLoading: boolean; // Track editPackage loading
  editPackageError: string | null; // Track editPackage error
  editPackageSuccess: string | null; // Track editPackage success message
}

const initialState: PackageState = {
  packages: [],
  loading: false,
  error: null,
  insertLoading: false,
  insertError: null,
  insertSuccess: null,
  editLoading: false,
  editError: null,
  editSuccess: null,
  deleteLoading: false,
  deleteError: null,
  deleteSuccess: null,
  editPackageLoading: false,
  editPackageError: null,
  editPackageSuccess: null,
};

interface PackageFilters {
  package_for?: string;
  city?: string;
}

interface InsertRulesPayload {
  package_name: string;
  package_id: number;
  package_for: string;
  rules: { name: string; included: boolean }[];
}

export interface EditRulePayload {
  rules: {
    id: string;
    rule_name: string;
    included: boolean;
  }[];
}

export interface EditPackagePayload {
  packageNameId?: number; // Optional
  name?: string; // Optional
  price?: number; // Optional
  duration_days?: number; // Optional
  button_text?: string; // Optional
  actual_amount:number;
  gst:number,
  sgst:number,
  gst_percentage:number;
  gst_number:string;
  rera_number:string;
}

// Async thunk for fetching all packages
export const fetchAllPackages = createAsyncThunk(
  "package/fetchAllPackages",
  async (filters: PackageFilters, { rejectWithValue }) => {
    try {
      const { package_for, city } = filters;
      const promise = axiosInstance.get<Package[]>("/packages/v1/getAllPackages", {
        params: {
          package_for,
          city,
        },
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

// Async thunk for inserting rules
export const insertRules = createAsyncThunk(
  "package/insertRules",
  async (payload: InsertRulesPayload, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.post<SuccessResponse>("/packages/v1/insertRules", payload);
      toast.promise(promise, {
        loading: "Inserting rules...",
        success: "Rules inserted successfully!",
        error: "Failed to insert rules",
      });
      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to insert rules";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for editing a rule
export const editRule = createAsyncThunk(
  'package/editRule',
  async (payload: EditRulePayload, { rejectWithValue }) => {
    try {
      // Send only required fields for rule editing
     
      const promise = axiosInstance.post<SuccessResponse>(`/packages/v1/editRule`, payload);
      toast.promise(promise, {
        loading: 'Updating rule...',
        success: 'Rule updated successfully!',
        error: 'Failed to update rule',
      });
      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to update rule';
      return rejectWithValue(errorMessage);
    }
  }
)

export const editPackage = createAsyncThunk(
  'package/editPackage',
  async (payload: EditPackagePayload, { rejectWithValue }) => {
    try {
      // Send only specified fields for package editing
      const promise = axiosInstance.post<SuccessResponse>(`/packages/v1/editRule`, payload);
      toast.promise(promise, {
        loading: 'Updating package...',
        success: 'Package updated successfully!',
        error: 'Failed to update package',
      });
      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to update package';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for deleting a rule
export const deleteRule = createAsyncThunk(
  "package/deleteRule",
  async (id: number, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.delete<SuccessResponse>(`/packages/v1/deleteRule?id=${id}`);
      toast.promise(promise, {
        loading: "Deleting rule...",
        success: "Rule deleted successfully!",
        error: "Failed to delete rule",
      });
      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to delete rule";
      return rejectWithValue(errorMessage);
    }
  }
);



const packageSlice = createSlice({
  name: "package",
  initialState,
  reducers: {
    clearPackages: (state) => {
      state.packages = [];
      state.error = null;
    },
    clearMessages: (state) => {
      state.insertSuccess = null;
      state.insertError = null;
      state.editSuccess = null;
      state.editError = null;
      state.deleteSuccess = null;
      state.deleteError = null;
      state.editPackageSuccess = null;
      state.editPackageError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Packages
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
      })
      // Insert Rules
      .addCase(insertRules.pending, (state) => {
        state.insertLoading = true;
        state.insertError = null;
        state.insertSuccess = null;
      })
      .addCase(insertRules.fulfilled, (state, action) => {
        state.insertLoading = false;
        state.insertSuccess = action.payload.message;
      })
      .addCase(insertRules.rejected, (state, action) => {
        state.insertLoading = false;
        state.insertError = action.payload as string;
      })
      // Edit Rule
      .addCase(editRule.pending, (state) => {
        state.editLoading = true;
        state.editError = null;
        state.editSuccess = null;
      })
      .addCase(editRule.fulfilled, (state, action) => {
        state.editLoading = false;
        state.editSuccess = action.payload.message;
      })
      .addCase(editRule.rejected, (state, action) => {
        state.editLoading = false;
        state.editError = action.payload as string;
      })
      // Delete Rule
      .addCase(deleteRule.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccess = null;
      })
      .addCase(deleteRule.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess = action.payload.message;
      })
      .addCase(deleteRule.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload as string;
      });
     
  },
});

export const { clearPackages, clearMessages } = packageSlice.actions;
export default packageSlice.reducer;
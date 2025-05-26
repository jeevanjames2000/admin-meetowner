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

// Interface for the custom package based on the API response
interface CustomPackage {
  package_id: number;
  user_id: number;
  user_name: string;
  user_mobile: string;
  name: string;
  price: string;
  duration_days: number;
  button_text: string;
  actual_amount: string;
  gst: string;
  sgst: string;
  gst_percentage: string;
  gst_number: string;
  rera_number: string;
  package_for: string;
  created_by: string;
  created_date: string;
  city: string;
  rules: {
    id: number;
    rule_name: string;
    included: boolean;
  }[];
}

interface ErrorResponse {
  message?: string;
}

interface SuccessResponse {
  message: string;
}

interface InsertCustomPackageResponse {
  message: string;
  package_id: number;
}

export interface PackageState {
  packages: Package[];
  customPackages: CustomPackage[]; // For all custom packages
  userCustomPackages: CustomPackage[]; // For user-specific custom packages
  loading: boolean;
  error: string | null;
  customPackagesLoading: boolean;
  customPackagesError: string | null;
  userCustomPackagesLoading: boolean; // Add loading state for user-specific custom packages
  userCustomPackagesError: string | null; // Add error state for user-specific custom packages
  insertLoading: boolean;
  insertError: string | null;
  insertSuccess: string | null;
  editLoading: boolean;
  editError: string | null;
  editSuccess: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
  deleteSuccess: string | null;
  editPackageLoading: boolean;
  editPackageError: string | null;
  editPackageSuccess: string | null;
}

const initialState: PackageState = {
  packages: [],
  customPackages: [],
  userCustomPackages: [], // Initialize user-specific custom packages array
  loading: false,
  error: null,
  customPackagesLoading: false,
  customPackagesError: null,
  userCustomPackagesLoading: false, // Initialize loading state
  userCustomPackagesError: null, // Initialize error state
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
  packageNameId?: number;
  name?: string;
  price?: number;
  duration_days?: number;
  button_text?: string;
  actual_amount: number;
  gst: number;
  sgst: number;
  gst_percentage: number;
  gst_number: string;
  rera_number: string;
  city:string;
}

interface InsertCustomPackagePayload {
  name: string;
  user_id: number;
  price: number;
  duration_days: number;
  package_for: string;
  button_text: string;
  actual_amount: number;
  gst: number;
  sgst: number;
  gst_percentage: number;
  gst_number: string;
  rera_number: string;
  rules: { name: string; included: boolean }[];
  created_by?: number;
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

// Async thunk for fetching all custom packages
export const fetchAllCustomPackages = createAsyncThunk(
  "package/fetchAllCustomPackages",
  async (_, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.get<{ customPackages: CustomPackage[] }>(
        "/packages/v1/getAllCustomPackages"
      );
      const response = await promise;
      return response.data.customPackages;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to fetch custom packages";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for fetching custom packages by user_id
export const fetchCustomPackagesByUser = createAsyncThunk(
  "package/fetchCustomPackagesByUser",
  async (userId: number, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.get<{ customPackages: CustomPackage[] }>(
        `/packages/v1/getCustomPackages?user_id=${userId}`
      );
      const response = await promise;
      return response.data.customPackages; // Return the customPackages array
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to fetch custom packages for user";
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
  "package/editRule",
  async (payload: EditRulePayload, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.post<SuccessResponse>("/packages/v1/editRule", payload);
      toast.promise(promise, {
        loading: "Updating rule...",
        success: "Rule updated successfully!",
        error: "Failed to update rule",
      });
      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to update rule";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for editing a package
export const editPackage = createAsyncThunk(
  "package/editPackage",
  async (payload: EditPackagePayload, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.post<SuccessResponse>("/packages/v1/editRule", payload);
      toast.promise(promise, {
        loading: "Updating package...",
        success: "Package updated successfully!",
        error: "Failed to update package",
      });
      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to update package";
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

// Async thunk for inserting a custom package with rules
export const insertCustomPackageWithRules = createAsyncThunk(
  "package/insertCustomPackageWithRules",
  async (payload: InsertCustomPackagePayload, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.post<InsertCustomPackageResponse>(
        "/packages/v1/insertCustomPackageWithRules",
        payload
      );
      toast.promise(promise, {
        loading: "Creating custom package...",
        success: "Custom package created successfully!",
        error: "Failed to create custom package",
      });
      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to create custom package";
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
      state.customPackagesError = null;
      state.userCustomPackagesError = null; // Clear user-specific custom packages error
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
      // Fetch All Custom Packages
      .addCase(fetchAllCustomPackages.pending, (state) => {
        state.customPackagesLoading = true;
        state.customPackagesError = null;
      })
      .addCase(fetchAllCustomPackages.fulfilled, (state, action) => {
        state.customPackagesLoading = false;
        state.customPackages = action.payload;
      })
      .addCase(fetchAllCustomPackages.rejected, (state, action) => {
        state.customPackagesLoading = false;
        state.customPackagesError = action.payload as string;
      })
      // Fetch Custom Packages by User
      .addCase(fetchCustomPackagesByUser.pending, (state) => {
        state.userCustomPackagesLoading = true;
        state.userCustomPackagesError = null;
      })
      .addCase(fetchCustomPackagesByUser.fulfilled, (state, action) => {
        state.userCustomPackagesLoading = false;
        state.userCustomPackages = action.payload;
      })
      .addCase(fetchCustomPackagesByUser.rejected, (state, action) => {
        state.userCustomPackagesLoading = false;
        state.userCustomPackagesError = action.payload as string;
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
      })
      // Insert Custom Package with Rules
      .addCase(insertCustomPackageWithRules.pending, (state) => {
        state.insertLoading = true;
        state.insertError = null;
        state.insertSuccess = null;
      })
      .addCase(insertCustomPackageWithRules.fulfilled, (state, action) => {
        state.insertLoading = false;
        state.insertSuccess = action.payload.message;
      })
      .addCase(insertCustomPackageWithRules.rejected, (state, action) => {
        state.insertLoading = false;
        state.insertError = action.payload as string;
      });
  },
});

export const { clearPackages, clearMessages } = packageSlice.actions;
export default packageSlice.reducer;
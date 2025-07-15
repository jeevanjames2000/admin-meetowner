import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

interface PropertyLink {
  id: number;
  link_title: string;
  city: string;
  location: string;
  property_for: string;
  property_in: string;
  sub_type: string | null;
}

interface ErrorResponse {
  message?: string;
}

export interface PropertyLinksState {
  propertyLinks: PropertyLink[];
  loading: boolean;
  error: string | null;
  insertLoading: boolean;
  insertError: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
  updateLoading: boolean;
  updateError: string | null;
}

interface InsertPropertyLinkPayload {
  link_title: string;
  city: string;
  location: string;
  property_for: string;
  property_in: string;
  sub_type: string | null;
}

interface DeletePropertyLinkPayload {
  id: number;
}

interface UpdatePropertyLinkPayload {
  id: number;
  link_title: string;
  city: string;
  location: string;
  property_for: string;
  property_in: string;
  sub_type: string | null;
}

export const fetchPropertyLinks = createAsyncThunk(
  "propertyLinks/fetchPropertyLinks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<PropertyLink[]>("/api/v1/getPropertyLinks");
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to fetch property links"
      );
    }
  }
);

export const insertPropertyLink = createAsyncThunk(
  "propertyLinks/insertPropertyLink",
  async (payload: InsertPropertyLinkPayload, { rejectWithValue }) => {
    try {
      const { link_title, city, location, property_for, property_in, sub_type } = payload;
      const promise = axiosInstance.post("/api/v1/insertPropertyLink", {
        link_title,
        city,
        location,
        property_for,
        property_in,
        sub_type,
      });
      toast.promise(promise, {
        loading: "Adding property link...",
        success: "Property link added successfully!",
        error: "Failed to add property link",
      });
      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to insert property link"
      );
    }
  }
);

export const deletePropertyLink = createAsyncThunk(
  "propertyLinks/deletePropertyLink",
  async (payload: DeletePropertyLinkPayload, { rejectWithValue }) => {
    try {
      const { id } = payload;
      const promise = axiosInstance.post("/api/v1/deletePropertyLink", { id });
      toast.promise(promise, {
        loading: "Deleting property link...",
        success: "Property link deleted successfully!",
        error: "Failed to delete property link",
      });
      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to delete property link"
      );
    }
  }
);

export const updatePropertyLink = createAsyncThunk(
  "propertyLinks/updatePropertyLink",
  async (payload: UpdatePropertyLinkPayload, { rejectWithValue }) => {
    try {
      const { id, link_title, city, location, property_for, property_in, sub_type } = payload;
      const promise = axiosInstance.post("/api/v1/updatePropertyLink", {
        id,
        link_title,
        city,
        location,
        property_for,
        property_in,
        sub_type,
      });
      toast.promise(promise, {
        loading: "Updating property link...",
        success: "Property link updated successfully!",
        error: "Failed to update property link",
      });
      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to update property link"
      );
    }
  }
);

const propertyLinksSlice = createSlice({
  name: "propertyLinks",
  initialState: {
    propertyLinks: [],
    loading: false,
    error: null,
    insertLoading: false,
    insertError: null,
    deleteLoading: false,
    deleteError: null,
    updateLoading: false,
    updateError: null,
  } as PropertyLinksState,
  reducers: {
    clearPropertyLinks: (state) => {
      state.propertyLinks = [];
      state.error = null;
      state.insertError = null;
      state.deleteError = null;
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPropertyLinks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyLinks.fulfilled, (state, action) => {
        state.loading = false;
        state.propertyLinks = action.payload;
      })
      .addCase(fetchPropertyLinks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(insertPropertyLink.pending, (state) => {
        state.insertLoading = true;
        state.insertError = null;
      })
      .addCase(insertPropertyLink.fulfilled, (state) => {
        state.insertLoading = false;
      })
      .addCase(insertPropertyLink.rejected, (state, action) => {
        state.insertLoading = false;
        state.insertError = action.payload as string;
      })
      .addCase(deletePropertyLink.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deletePropertyLink.fulfilled, (state) => {
        state.deleteLoading = false;
      })
      .addCase(deletePropertyLink.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload as string;
      })
      .addCase(updatePropertyLink.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updatePropertyLink.fulfilled, (state) => {
        state.updateLoading = false;
      })
      .addCase(updatePropertyLink.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      });
  },
});

export const { clearPropertyLinks } = propertyLinksSlice.actions;
export default propertyLinksSlice.reducer;
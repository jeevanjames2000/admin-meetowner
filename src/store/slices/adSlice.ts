import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

interface Ad {
  id: number;
  unique_property_id: string;
  property_name: string;
  // ... other fields
}

interface AdResponse {
  results: Ad[];
}

interface CreateAdResponse {
  message: string;
  id: number;
}

interface ErrorResponse {
  message?: string;
}

export interface AdsState {
  ads: Ad[];
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  createError: string | null;
}

export const fetchAds = createAsyncThunk(
  "ads/fetchAllAds",
  async (_, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.get<AdResponse>("/adAssets/v1/getAllAds");
      toast.promise(promise, {
        loading: "Fetching ads...",
        success: "Ads fetched successfully!",
        error: "Failed to fetch ads",
      });
      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to fetch ads";
      return rejectWithValue(errorMessage);
    }
  }
);

export const createAd = createAsyncThunk(
  "ads/createAd",
  async ({ adData, image }: { adData: any; image: File | null }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.entries(adData).forEach(([key, value]) => {
        formData.append(key, value === null ? "" : String(value));
      });
      if (image) {
        formData.append("image", image);
      }

      // Log FormData entries for debugging
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await axiosInstance.post<CreateAdResponse>(
        "/adAssets/v1/postAdDetails",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Ensure correct content type
          },
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to create ad";
      return rejectWithValue(errorMessage);
    }
  }
);

const adSlice = createSlice({
  name: "ads",
  initialState: {
    ads: [],
    loading: false,
    error: null,
    createLoading: false,
    createError: null,
  } as AdsState,
  reducers: {
    clearAds: (state) => {
      state.ads = [];
      state.error = null;
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAds.fulfilled, (state, action) => {
        state.loading = false;
        state.ads = action.payload.results;
      })
      .addCase(fetchAds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createAd.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createAd.fulfilled, (state, action) => {
        state.createLoading = false;
      })
      .addCase(createAd.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      });
  },
});

export const { clearAds } = adSlice.actions;
export default adSlice.reducer;
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
interface Ad {
  id: number;
  ads_page: string;
  ads_order: number;
  start_date: string | null;
  end_date: string | null;
  created_date: string | null;
  created_time: string | null;
  status: number;
  city: string;
  image: string | null;
  display_cities: string;
  ads_title: string;
  ads_button_text: string;
  ads_button_link: string;
  ads_description: string;
  unique_property_id: string | null;
  property_name: string | null;
  user_id: number | null;
  property_type: string | null;
  sub_type: string | null;
  property_for: string | null;
  property_cost: string | null;
  property_in: string | null;
  google_address: string | null;
}
interface AdResponse {
  ads: Ad[];
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
      const promise = axiosInstance.get<AdResponse>("/adAssets/v1/getAdDetails");
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
  async (adData: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<CreateAdResponse>(
        "/adAssets/v1/uploadSliderImages",
        adData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
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
export const deleteAd = createAsyncThunk(
  "ads/deleteAd",
  async (image: string, { rejectWithValue }) => {
    const filename = image.split("/").pop();
    if (!filename) return rejectWithValue("Invalid image filename");
    try {
      const promise = axiosInstance.post(`/adAssets/v1/deleteAdImage/${filename}`);
      toast.promise(promise, {
        loading: "Deleting ad...",
        success: "Ad deleted successfully!",
        error: "Failed to delete ad",
      });
      await promise;
      return image;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to delete ad";
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
        state.ads = action.payload.ads;
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
      })
      .addCase(deleteAd.fulfilled, (state, action) => {
        state.ads = state.ads.filter((ad) => ad.image !== action.payload);
      })
  },
});
export const { clearAds } = adSlice.actions;
export default adSlice.reducer;
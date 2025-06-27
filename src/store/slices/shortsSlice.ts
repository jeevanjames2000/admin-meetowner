import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

// Interfaces for API responses and payloads
interface Short {
  id: number;
  unique_property_id: string;
  property_name: string;
  short_type: string;
  shorts_order: number;
  created_at: string;
  property_name_from_properties: string;
  user_id: number;
  expiry_date: string | null;
  property_type: string | null;
  sub_type: string;
  property_for: string;
  unit_flat_house_no: string | null;
  state_id: string | null;
  city_id: string;
  location_id: string;
  street: string | null;
  address: string | null;
  zipcode: string | null;
  latitude: string | null;
  longitude: string | null;
  bedrooms: string;
  builtup_area: string;
  builtup_unit: string | null;
  additional_amount: string | null;
  property_cost: string;
  bathroom: number;
  balconies: number;
  property_in: string;
  facing: string;
  car_parking: number;
  bike_parking: number;
  facilities: string;
  floors: string;
  furnished_status: string;
  transaction_type: string;
  owner_name: string | null;
  mobile: string | null;
  whatsapp: string | null;
  landline: string | null;
  email: string | null;
  occupancy: string;
  description: string;
  video_link: string | null;
  property_status: number;
  admin_approved_status: string | null;
  posted_by: number;
  paid_details: string | null;
  other_info: string | null;
  created_date: string | null;
  created_time: string | null;
  updated_date: string | null;
  updated_time: string | null;
  admin_approval_date: string | null;
  image: string;
  google_address: string;
  user_type: number;
  total_floors: string;
  open_parking: string;
  carpet_area: string;
  under_construction: string | null;
  ready_to_move: string | null;
  updated_from: string | null;
  property_age: string | null;
  area_units: string;
  pent_house: string | null;
  servant_room: string;
  possession_status: string | null;
  builder_plot: string | null;
  investor_property: string;
  loan_facility: string;
  plot_number: string;
  pantry_room: string | null;
  total_project_area: string;
  uploaded_from_seller_panel: string;
  featured_property: string;
}

interface ErrorResponse {
  message?: string;
}

interface CreateShortResponse {
  message: string;
  id: number;
}

export interface ShortsState {
  shorts: Short[];
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  createError: string | null;
  createSuccess: string | null;
}

// Initial state
const initialState: ShortsState = {
  shorts: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  createSuccess: null,
};

// Async thunk for fetching all shorts
export const fetchShorts = createAsyncThunk(
  "shorts/fetchShorts",
  async (_, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.get<Short[]>("/user/v1/getAllShorts");
    
      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to fetch shorts";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for creating a short
export const createShort = createAsyncThunk(
  "shorts/createShort",
  async (
    { unique_property_id, property_name, short_type, shorts_order }: 
    { unique_property_id: string; property_name: string; short_type: string; shorts_order: number },
    { rejectWithValue }
  ) => {
    try {
      const promise = axiosInstance.post<CreateShortResponse>(
        "/user/v1/createShorts",
        { unique_property_id, property_name, short_type, shorts_order },
        { headers: { "Content-Type": "application/json" } }
      );
      toast.promise(promise, {
        loading: "Creating short...",
        success: "Short created successfully!",
        error: "Failed to create short",
      });
      const response = await promise;
      return {
        id: response.data.id,
        unique_property_id,
        property_name,
        short_type,
        shorts_order,
        created_at: new Date().toISOString(), 
      };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to create short";
      return rejectWithValue(errorMessage);
    }
  }
);

// Shorts slice
const shortsSlice = createSlice({
  name: "shorts",
  initialState,
  reducers: {
    clearShorts: (state) => {
      state.shorts = [];
      state.error = null;
      state.createError = null;
      state.createSuccess = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch shorts
    builder
      .addCase(fetchShorts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShorts.fulfilled, (state, action) => {
        state.loading = false;
        state.shorts = action.payload;
      })
      .addCase(fetchShorts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create short
      .addCase(createShort.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = null;
      })
      .addCase(createShort.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = "Short created successfully!";
      })
      .addCase(createShort.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      });
  },
});

export const { clearShorts } = shortsSlice.actions;
export default shortsSlice.reducer;
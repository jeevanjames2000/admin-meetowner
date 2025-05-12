import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import axiosInstance from "../../utils/axiosInstance";

// Define the PropertyActivity interface based on the provided API response
interface PropertyActivity {
  id: number;
  unique_property_id: string;
  fullname: string | null;
  email: string;
  mobile: string | null;
  created_date: string;
  updated_date: string;
  userDetails: {
    id: number;
    name: string;
    email: string;
    mobile: string;
  };
}

// Update Property interface (unchanged, included for reference)
interface Property {
  id: number;
  unique_property_id: string;
  property_name: string;
  user_id: number;
  expiry_date: string | null;
  property_type: string | null;
  sub_type: string;
  property_for: string;
  unit_flat_house_no: string;
  state_id: number | null;
  city_id: string;
  location_id: string;
  street: string | null;
  address: string | null;
  zipcode: string | null;
  latitude: string | null;
  longitude: string | null;
  bedrooms: string;
  builtup_area: string;
  builtup_unit: string;
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
  updated_date: string;
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
  property_age: string;
  types: string | null;
  available_from: string | null;
  monthly_rent: string | null;
  security_deposit: string | null;
  maintenance: string | null;
  lock_in: string | null;
  brokerage_charge: string | null;
  plot_area: string | null;
  ownership_type: string | null;
  length_area: string | null;
  width_area: string | null;
  zone_types: string | null;
  business_types: string | null;
  rera_approved: number;
  passenger_lifts: string | null;
  service_lifts: string | null;
  stair_cases: string | null;
  private_parking: string | null;
  public_parking: string | null;
  private_washrooms: string | null;
  public_washrooms: string | null;
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

interface PropertiesResponse {
  status?: "success" | "error";
  message?: string;
  count: number;
  properties: Property[];
}

interface PropertyActivityResponse {
  status?: "success" | "error";
  message?: string;
  results: PropertyActivity[];
}

interface ErrorResponse {
  message?: string;
}

interface PropertyState {
  properties: Property[];
  propertyActivities: PropertyActivity[];
  loading: boolean;
  error: string | null;
}

// Async thunk to fetch properties by user ID
export const getPropertyDetailsByUserId = createAsyncThunk(
  "propertyDetails/getPropertyDetailsByUserId",
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<PropertiesResponse>(
        `/listings/v1/getPropertiesByUserID?user_id=${userId}`
      );
      return response.data.properties;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Error fetching properties:", axiosError);
      return rejectWithValue(
        axiosError.response?.data || { message: "Failed to fetch properties" }
      );
    }
  }
);

// New async thunk to fetch property activity
export const getPropertyActivity = createAsyncThunk(
  "propertyDetails/getPropertyActivity",
  async (propertyId: string, { rejectWithValue }) => {
    console.log("call");
    try {
      const response = await axiosInstance.get<PropertyActivityResponse>(
        `/listings/v1/getPropertyActivity?property_id=${propertyId}`
      );
            return response.data.results;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Error fetching property activity:", axiosError);
      return rejectWithValue(
        axiosError.response?.data || { message: "Failed to fetch property activity" }
      );
    }
  }
);

const propertyDetailsByUserSlice = createSlice({
  name: "propertyDetailsByUser",
  initialState: {
    properties: [],
    propertyActivities: [],
    loading: false,
    error: null,
  } as PropertyState,
  reducers: {
    clearProperties: (state) => {
      state.properties = [];
      state.propertyActivities = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle getPropertyDetailsByUserId
      .addCase(getPropertyDetailsByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPropertyDetailsByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload;
      })
      .addCase(getPropertyDetailsByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as ErrorResponse)?.message || "Failed to fetch properties";
      })
      // Handle getPropertyActivity
      .addCase(getPropertyActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPropertyActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.propertyActivities = action.payload;
      })
      .addCase(getPropertyActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as ErrorResponse)?.message || "Failed to fetch property activity";
      });
  },
});

export const { clearProperties } = propertyDetailsByUserSlice.actions;
export default propertyDetailsByUserSlice.reducer;
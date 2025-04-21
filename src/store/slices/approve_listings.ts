import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

interface Property {
  id: number;
  unique_property_id: string;
  property_name: string | null;
  user_id: number;
  expiry_date: string | null;
  property_type: string | null;
  sub_type: string;
  property_for: string;
  unit_flat_house_no: string | null;
  state_id: number | null;
  city_id: number | null;
  location_id: string | null;
  street: string | null;
  address: string | null;
  zipcode: string | null;
  latitude: string | null;
  longitude: string | null;
  bedrooms: string;
  builtup_area: string | null;
  builtup_unit: string | null;
  additional_amount: string | null;
  property_cost: string;
  bathroom: string | null;
  balconies: string | null;
  property_in: string;
  facing: string | null;
  car_parking: string | null;
  bike_parking: string | null;
  facilities: string | null;
  floors: string | null;
  furnished_status: string | null;
  transaction_type: string | null;
  owner_name: string | null;
  mobile: string | null;
  whatsapp: string | null;
  landline: string | null;
  email: string | null;
  occupancy: string | null;
  description: string | null;
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
  image: string | null;
  google_address: string | null;
  user_type: number;
  total_floors: string | null;
  open_parking: string | null;
  carpet_area: string | null;
  under_construction: string | null;
  ready_to_move: string | null;
  updated_from: string | null;
  property_age: string | null;
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
  area_units: string | null;
  pent_house: string | null;
  servant_room: string | null;
  possession_status: string | null;
  builder_plot: string | null;
  investor_property: string | null;
  loan_facility: string | null;
  plot_number: string | null;
  pantry_room: string | null;
  total_project_area: string | null;
  uploaded_from_seller_panel: string | null;
  featured_property: string | null;
 
}

interface ListingsResponse {
  total_count: number;
  
  properties: Property[];
}




interface ErrorResponse {
  message?: string;
}

export interface ListingState {
  listings: Property[];
  totalCount: number;

  loading: boolean;
  error: string | null;
}









export const getAllApprovedListing = createAsyncThunk(
  "listings/getAllApprovedListing",
  async (_, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.get<ListingsResponse>(
        "/listings/v1/getAllListings");

      toast.promise(promise, {
        loading: "Fetching approved listings...",
        success: "Approved listings fetched successfully!",
        error: "Failed to fetch approved listings",
      });

      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Fetch approved listings error:", axiosError);
      return rejectWithValue(
        axiosError.response?.data || { message: "Failed to fetch approved listings" }
      );
    }
  }
);


// Create the slice
const listingSlice = createSlice({
  name: "listings",
  initialState: {
    listings: [],
    totalCount: 0,
    currentPage: 1,
    currentCount: 0,
    totalPages: 0,
    loading: false, 
    error: null,
  } as ListingState,
  reducers: {
    clearListings: (state) => {
      state.listings = [];
      state.totalCount = 0;
     
      
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Listings
    builder
    
      .addCase(getAllApprovedListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllApprovedListing.fulfilled, (state, action) => {
        state.loading = false;
        state.listings = action.payload.properties;
        state.totalCount = action.payload.total_count;
       
      })
      .addCase(getAllApprovedListing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      
  },
});

export const { clearListings } = listingSlice.actions;
export default listingSlice.reducer;
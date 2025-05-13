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
  user: {
    name: string;
    email: string | null;
    mobile: string;
    photo: string | null;
    user_type: number;
  };
}

interface ListingsResponse {
  total_count: number;
  current_page: number;
  current_count: number;
  total_pages: number;
  properties: Property[];
}


interface UpdateStatusResponse {
  message: string;
}

interface DeleteListingResponse {
  message: string;
  unique_property_id: string;
  property_name: string | null;
}

interface ErrorResponse {
  message?: string;
}

export interface ListingState {
  listings: Property[];
  totalCount: number;
  currentPage: number;
  currentCount: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

interface ListingFilters {
  property_status:number
  property_for: string;
  property_in: string;
  page:number;
  search:string;

 
}

interface UpdateStatusPayload {
  property_status: number;
  unique_property_id: string;
}

interface DeleteListingPayload {
  unique_property_id: string;
}

// Async thunk for fetching listings
export const fetchListings = createAsyncThunk(
  "listings/fetchListings",
  async (filters: ListingFilters, { rejectWithValue }) => {
    try {
      const { property_status,property_for, property_in, page,search } = filters;
      const promise = axiosInstance.get<ListingsResponse>(
        "/listings/v1/getAllPropertiesByType",
        {
          params: {
            property_status,
            property_for,
            property_in,
            page,
            search
          },
          
        }
      );

      toast.promise(promise, {
        loading: "Fetching listings...",
        success: "Listings fetched successfully!",
        error: "Failed to fetch listings",
      });

      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Fetch listings error:", axiosError);
      return rejectWithValue(
        axiosError.response?.data || { message: "Failed to fetch listings" }
      );
    }
  }
);

// Async thunk for updating property status
export const updatePropertyStatus = createAsyncThunk(
  "listings/updatePropertyStatus",
  async (payload: UpdateStatusPayload, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.post<UpdateStatusResponse>(
        "/listings/v1/updateStatus",
        payload,
       
      );

      toast.promise(promise, {
        loading: "Updating property status...",
        success: (response) => response.data.message, // Changed to response.data.message
        error: "Failed to update property status",
      });

      const response = await promise;
      return { ...response.data, unique_property_id: payload.unique_property_id };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Update status error:", axiosError);
      return rejectWithValue(
        axiosError.response?.data || { message: "Failed to update status" }
      );
    }
  }
);

// Async thunk for deleting a listing
export const deleteListing = createAsyncThunk(
  "listings/deleteListing",
  async (payload: DeleteListingPayload, { rejectWithValue }) => {
    try {
      const { unique_property_id } = payload;
      const promise = axiosInstance.delete<DeleteListingResponse>(
        "/listings/v1/deleteListing",
        {
          params: { unique_property_id },
         
        }
      );

      toast.promise(promise, {
        loading: "Deleting property...",
        success: (response) => response.data.message, 
        error: "Failed to delete property",
      });

      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Delete listing error:", axiosError);
      return rejectWithValue(
        axiosError.response?.data || { message: "Failed to delete listing" }
      );
    }
  }
);

//updating the edited values 
interface UpdateListingPayload {
  unique_property_id: string;
  updates: Partial<Property>; // Allows any subset of Property fields
}

// Define the response interface
interface UpdateListingResponse {
  message: string;
}

export const updateListing = createAsyncThunk(
  "listings/updateListing",
  async (payload: UpdateListingPayload, { rejectWithValue }) => {
    try {
      const { unique_property_id, updates } = payload;
      const promise = axiosInstance.post<UpdateListingResponse>(
        `/listings/v1/updateListing?unique_property_id=${unique_property_id}`,
        updates,
      );

      toast.promise(promise, {
        loading: "Updating property...",
        success: (response) => response.data.message,
        error: "Failed to update property",
      });

      const response = await promise;
      return { ...response.data, unique_property_id, updates };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Update listing error:", axiosError);
      return rejectWithValue(
        axiosError.response?.data || { message: "Failed to update listing" }
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
      state.totalPages = 0;
      state.currentCount = 0;
      state.currentPage = 1;
      
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Listings
    builder
      .addCase(fetchListings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchListings.fulfilled, (state, action) => {
        state.loading = false;
        state.listings = action.payload.properties;
        state.totalCount = action.payload.total_count;
        state.currentPage = action.payload.current_page;
        state.currentCount = action.payload.current_count;
        state.totalPages = action.payload.total_pages;
      })
      .addCase(fetchListings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Property Status
      .addCase(updatePropertyStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePropertyStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProperty = state.listings.find(
          (listing) => listing.unique_property_id === action.payload.unique_property_id
        );
        if (updatedProperty) {
          updatedProperty.property_status = action.meta.arg.property_status;
        }
      })
      .addCase(updatePropertyStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Listing
      .addCase(deleteListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteListing.fulfilled, (state, action) => {
        state.loading = false;
        state.listings = state.listings.filter(
          (listing) => listing.unique_property_id !== action.payload.unique_property_id
        );
        state.totalCount -= 1;
      })
      .addCase(deleteListing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateListing.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProperty = state.listings.find(
          (listing) => listing.unique_property_id === action.payload.unique_property_id
        );
        if (updatedProperty) {
          // Merge the updated fields into the existing property
          Object.assign(updatedProperty, action.payload.updates);
        }
      })
      .addCase(updateListing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearListings } = listingSlice.actions;
export default listingSlice.reducer;
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

// Define the Lead interface based on your API response
interface Lead {
  id: number;
  property_id: string;
  user_id: number;
  name: string;
  mobile: string;
  email: string;
  searched_on_date: string;
  searched_on_time: string;
  interested_status: number;
  property_user_id: number | null;
  searched_filter_desc: string | null;
  shedule_date: string | null;
  shedule_time: string | null;
  view_status: string | null;
  property_for: string;
  property_name: string | null;
  owner_name: string | null;
  owner_mobile: string | null;
  owner_type: string | null;
  owner_email: string | null;
}

interface LeadByContacted {
  id: number;
  user_id: number;
  unique_property_id: string;
  fullname: string | null;
  mobile: string | null;
  email: string | null;
  created_date: string | null;
  property_for: string | null;
  property_name: string | null;
  owner_user_id: number | null;
  owner_name: string | null;
  owner_mobile: string | null;
  owner_email: string | null;
  owner_photo: string | null;
  owner_type: number | null;
}

interface PropertyView {
  property_id: string;
  property_name: string;
  google_address: string;
  city_id: string;
  view_count: number;
}

interface PropertyViewDetail {
  id: number;
  user_id: number;
  property_id: string;
  name: string;
  mobile: string;
  email: string;
  created_date: string;
  property_name: string;
  google_address: string;
  city_id: string;
}

// New interface for Most Searched Locations response
interface MostSearchedLocation {
  searched_location: string;
  total_searches: number;
}

interface MostSearchedLocationsResponse {
  message: string;
  count: number;
  data: MostSearchedLocation[];
}

// New interface for User Search Data by City response
interface UserSearchData {
  id: number;
  user_id: number;
  mobile: string | null;
  name: string | null;
  searched_location: string | null;
  searched_for: string | null;
  created_date: string | null;
  created_time: string | null ;
  email: string | null;
  sub_type: string | null;
  searched_city: string | null;
  property_in: string | null;
}

interface UserSearchDataResponse {
  message: string;
  count: number;
  data: UserSearchData[];
}

interface PropertyViewDetailsResponse {
  count: number;
  views: PropertyViewDetail[];
}

interface PropertyViewsResponse {
  count: number;
  views: PropertyView[];
}

interface LeadsByContactedResponse {
  message: string;
  count: number;
  data: LeadByContacted[];
}

interface PropertyViewDetailsFilters {
  property_id: string;
}

interface LeadsResponse {
  count: number;
  data: Lead[];
}

interface ErrorResponse {
  message?: string;
}

// Define the filter parameters for the API request
interface LeadsFilters {
  property_for: string;
}

// Define the filter parameters for User Search Data by City
interface UserSearchDataFilters {
  city: string;
}

// Updated state interface
export interface LeadsState {
  leads: Lead[];
  leadsByContacted: LeadByContacted[];
  totalCount: number;
  totalCountByContacted: number;
  propertyViews: PropertyView[];
  propertyViewsCount: number;
  propertyViewDetails: PropertyViewDetail[];
  propertyViewDetailsCount: number;
  mostSearchedLocations: MostSearchedLocation[];
  mostSearchedLocationsCount: number;
  userSearchData: UserSearchData[];
  userSearchDataCount: number;
  loading: boolean;
  error: string | null;
}

// Create async thunk for fetching leads
export const fetchLeads = createAsyncThunk(
  "leads/fetchLeads",
  async (filters: LeadsFilters, { rejectWithValue }) => {
    try {
      const { property_for } = filters;
      const promise = axiosInstance.get<LeadsResponse>("/listings/v1/getAllLeads", {
        params: { property_for },
      });
      toast.promise(promise, {
        loading: "Fetching leads...",
        success: "Leads fetched successfully!",
        error: "Failed to fetch leads",
      });

      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to fetch leads";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchLeadsByContacted = createAsyncThunk(
  "leads/fetchLeadsByContacted",
  async (_, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.get<LeadsByContactedResponse>(
        "/enquiry/v1/getAllContactSellersByFilter"
      );

      toast.promise(promise, {
        loading: "Fetching contacted leads...",
        success: "Contacted leads fetched successfully!",
        error: "Failed to fetch contacted leads",
      });

      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to fetch contacted leads";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchPropertyViews = createAsyncThunk(
  "leads/fetchPropertyViews",
  async (_, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.get<PropertyViewsResponse>(
        "/listings/v1/getAllPropertyViews"
      );

      toast.promise(promise, {
        loading: "Fetching property views...",
        success: "Property views fetched successfully!",
        error: "Failed to fetch property views",
      });

      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to fetch property views";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchPropertyViewDetails = createAsyncThunk(
  "leads/fetchPropertyViewDetails",
  async (filters: PropertyViewDetailsFilters, { rejectWithValue }) => {
    try {
      const { property_id } = filters;
      const promise = axiosInstance.get<PropertyViewDetailsResponse>(
        "/listings/v1/getAllPropertyViews",
        {
          params: { property_id },
        }
      );

      toast.promise(promise, {
        loading: "Fetching property view details...",
        success: "Property view details fetched successfully!",
        error: "Failed to fetch property view details",
      });

      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to fetch property view details";
      return rejectWithValue(errorMessage);
    }
  }
);

// New async thunk for fetching most searched locations
export const fetchMostSearchedLocations = createAsyncThunk(
  "leads/fetchMostSearchedLocations",
  async (_, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.get<MostSearchedLocationsResponse>(
        "/enquiry/v1/getMostSearchedLocations"
      );

      toast.promise(promise, {
        loading: "Fetching most searched locations...",
        success: "Most searched locations fetched successfully!",
        error: "Failed to fetch most searched locations",
      });

      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to fetch most searched locations";
      return rejectWithValue(errorMessage);
    }
  }
);

// New async thunk for fetching user search data by city
export const fetchUserSearchDataByCity = createAsyncThunk(
  "leads/fetchUserSearchDataByCity",
  async (filters: UserSearchDataFilters, { rejectWithValue }) => {
    try {
      const { city } = filters;
     
      const promise = axiosInstance.get<UserSearchDataResponse>(
        "/enquiry/v1/getMostSearchedLocations", 
        {
          params: { city },
        }
      );

      toast.promise(promise, {
        loading: `Fetching user search data for city: ${city}...`,
        success: "User search data fetched successfully!",
        error: "Failed to fetch user search data",
      });

      const response = await promise;
      console.log("API Response for city", city, ":", response.data); // Log response
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to fetch user search data";
      console.error("API Error for city", filters.city, ":", {
        message: errorMessage,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });
      return rejectWithValue(errorMessage);
    }
  }
);

// Create the slice
const leadsSlice = createSlice({
  name: "leads",
  initialState: {
    leads: [],
    leadsByContacted: [],
    totalCount: 0,
    totalCountByContacted: 0,
    propertyViews: [],
    propertyViewsCount: 0,
    propertyViewDetails: [],
    propertyViewDetailsCount: 0,
    mostSearchedLocations: [],
    mostSearchedLocationsCount: 0,
    userSearchData: [],
    userSearchDataCount: 0,
    loading: false,
    error: null,
  } as LeadsState,
  reducers: {
    clearLeads: (state) => {
      state.leads = [];
      state.leadsByContacted = [];
      state.totalCount = 0;
      state.totalCountByContacted = 0;
      state.propertyViews = [];
      state.propertyViewsCount = 0;
      state.propertyViewDetails = [];
      state.propertyViewDetailsCount = 0;
      state.mostSearchedLocations = [];
      state.mostSearchedLocationsCount = 0;
      state.userSearchData = [];
      state.userSearchDataCount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Existing cases for fetchLeads
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload.data;
        state.totalCount = action.payload.count;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Existing cases for fetchLeadsByContacted
    builder
      .addCase(fetchLeadsByContacted.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeadsByContacted.fulfilled, (state, action) => {
        state.loading = false;
        state.leadsByContacted = action.payload.data;
        state.totalCountByContacted = action.payload.count;
      })
      .addCase(fetchLeadsByContacted.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Existing cases for fetchPropertyViews
    builder
      .addCase(fetchPropertyViews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyViews.fulfilled, (state, action) => {
        state.loading = false;
        state.propertyViews = action.payload.views;
        state.propertyViewsCount = action.payload.count;
      })
      .addCase(fetchPropertyViews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Existing cases for fetchPropertyViewDetails
    builder
      .addCase(fetchPropertyViewDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyViewDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.propertyViewDetails = action.payload.views;
        state.propertyViewDetailsCount = action.payload.count;
      })
      .addCase(fetchPropertyViewDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // New cases for fetchMostSearchedLocations
    builder
      .addCase(fetchMostSearchedLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMostSearchedLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.mostSearchedLocations = action.payload.data;
        state.mostSearchedLocationsCount = action.payload.count;
      })
      .addCase(fetchMostSearchedLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // New cases for fetchUserSearchDataByCity
    builder
      .addCase(fetchUserSearchDataByCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSearchDataByCity.fulfilled, (state, action) => {
        state.loading = false;
        state.userSearchData = action.payload.data || []; 
        state.userSearchDataCount = action.payload.count || 0;
      })
      .addCase(fetchUserSearchDataByCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.userSearchData = []; 
        state.userSearchDataCount = 0;
      });
  },
});

export const { clearLeads } = leadsSlice.actions;
export default leadsSlice.reducer;
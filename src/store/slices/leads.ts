import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import  { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import axiosIstance from "../../utils/axiosInstance";

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
  property_name:string | null;
  owner_name : string | null;
  owner_mobile:string | null;
  owner_type:string | null;
  owner_email :string | null;
}

interface LeadsResponse {
  count: number;
  data: Lead[];
}

interface ErrorResponse {
  message?: string;
}

// Define the state interface
export interface LeadsState {
  leads: Lead[];
  totalCount: number;
  loading: boolean;
  error: string | null;
}

// Define the filter parameters for the API request
interface LeadsFilters {
  property_for: string;
}

// Create async thunk for fetching leads
export const fetchLeads = createAsyncThunk(
  "leads/fetchLeads",
  async (filters: LeadsFilters, { rejectWithValue }) => {
    try {
      const { property_for } = filters;
      const promise = axiosIstance.get<LeadsResponse>(
        "/listings/v1/getAllLeads",
        {
          params: {
            property_for,
          },
          
        }
      );

      

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


export interface LeadsState {
  leads: Lead[];
  totalCount: number;
  loading: boolean;
  error: string | null;
}
// Create the slice
const leadsSlice = createSlice({
  name: "leads",
  initialState: {
    leads: [],
    totalCount: 0,
    loading: false,
    error: null,
  } as LeadsState,
  reducers: {
    // Optional: Add any synchronous reducers if needed
    clearLeads: (state) => {
      state.leads = [];
      state.totalCount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
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
        state.error = action.payload as string; // Ensure error is a string
      });
  },
});

export const { clearLeads } = leadsSlice.actions;
export default leadsSlice.reducer;
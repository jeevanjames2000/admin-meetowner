import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";


interface City {
    value: number;
    label: string;
  }
  
  interface State {
    value: number;
    label: string;
  }
  

interface CitiesResponse {
    status: "success" | "error";
    message: string;
    cities: City[];
  }
  
interface StatesResponse {
    status: "success" | "error";
    message: string;
    states: State[]
  }

interface ErrorResponse {
  message?: string;
}

// Fetch cities
export const getCities = createAsyncThunk(
    "property/getCities",
    async (_, { rejectWithValue }) => {
      try {
        const promise = axios.get<CitiesResponse>(
          "https://api.meetowner.in/general/getcities"
        );
        toast.promise(promise, {
          loading: "Fetching locations",
          success: "Successfully fetched cities",
          error: "Something went wrong",
        });
        const response = await promise;
        return response.data.cities;
      } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error("Error fetching cities:", axiosError);
        return rejectWithValue(
          axiosError.response?.data || { message: "Failed to fetch cities" }
        );
      }
    }
  );
  
  // Fetch states
  export const getStates = createAsyncThunk(
    "property/getStates",
    async (_, { rejectWithValue }) => {
      try {
        const promise = axios.get<StatesResponse>(
          "https://api.meetowner.in/general/getstates"
        );
        toast.promise(promise, {
          loading: "Fetching locations",
          success: "Successfully fetched states",
          error: "Something went wrong",
        });
        const response = await promise;
        return response.data.states;
      } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error("Error fetching states:", axiosError);
        return rejectWithValue(
          axiosError.response?.data || { message: "Failed to fetch states" }
        );
      }
    }
  );

const propertySlice = createSlice({
  name: "property",
  initialState: {
    propertyDetails: [],
    cities: [] as City[],
    states: [] as State[],
  },
  reducers: {
    setPropertyDetails: (state, action) => {
      state.propertyDetails = action.payload;
    },
    setCityDetails: (state, action) => {
      state.cities = action.payload;
    },
    setStates: (state, action) => {
      state.states = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCities.fulfilled, (state, action) => {
        state.cities = action.payload;
      })
      .addCase(getStates.fulfilled, (state, action) => {
        state.states = action.payload;
      })
      .addCase(getCities.rejected, (state, action) => {
        console.log("Cities fetch failed:", action.payload);
      })
      .addCase(getStates.rejected, (state, action) => {
        console.log("States fetch failed:", action.payload);
      });
  },
});

export const { setPropertyDetails, setCityDetails, setStates } =
  propertySlice.actions;
export default propertySlice.reducer;
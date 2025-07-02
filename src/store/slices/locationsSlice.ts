import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

interface City {
  city: string;
  state: string;
  status: string;
}

interface State {
  state: string;
  status: string;
}

interface ErrorResponse {
  message?: string;
}

// Fetch all cities (new API)
export const getAllCities = createAsyncThunk(
  "location/getAllCities",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<City[]>(
        "https://api.meetowner.in/api/v1/getAllCities"
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Error fetching all cities:", axiosError);
      return rejectWithValue(
        axiosError.response?.data || { message: "Failed to fetch all cities" }
      );
    }
  }
);

// Fetch all states (new API)
export const getAllStates = createAsyncThunk(
  "location/getAllStates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<State[]>(
        "https://api.meetowner.in/api/v1/getAllStates"
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Error fetching all states:", axiosError);
      return rejectWithValue(
        axiosError.response?.data || { message: "Failed to fetch all states" }
      );
    }
  }
);

interface LocationState {
  cities: City[];
  states: State[];
  citiesLoading: boolean;
  statesLoading: boolean;
  citiesError: string | null;
  statesError: string | null;
}

const locationSlice = createSlice({
  name: "location",
  initialState: {
    cities: [] as City[],
    states: [] as State[],
    citiesLoading: false,
    statesLoading: false,
    citiesError: null,
    statesError: null,
  } as LocationState,
  reducers: {
    setCityDetails: (state, action) => {
      state.cities = action.payload;
    },
    setStates: (state, action) => {
      state.states = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // New getAllCities
      .addCase(getAllCities.pending, (state) => {
        state.citiesLoading = true;
        state.citiesError = null;
      })
      .addCase(getAllCities.fulfilled, (state, action) => {
        state.citiesLoading = false;
        state.cities = action.payload;
      })
      .addCase(getAllCities.rejected, (state, action) => {
        state.citiesLoading = false;
        state.citiesError =
          (action.payload as ErrorResponse)?.message ||
          "Failed to fetch all cities";
        console.log("All cities fetch failed:");
      })
      // New getAllStates
      .addCase(getAllStates.pending, (state) => {
        state.statesLoading = true;
        state.statesError = null;
      })
      .addCase(getAllStates.fulfilled, (state, action) => {
        state.statesLoading = false;
        state.states = action.payload;
      })
      .addCase(getAllStates.rejected, (state, action) => {
        state.statesLoading = false;
        state.statesError =
          (action.payload as ErrorResponse)?.message ||
          "Failed to fetch all states";
        console.log("All states fetch failed:");
      });
  },
});

export const { setCityDetails, setStates } = locationSlice.actions;
export default locationSlice.reducer;
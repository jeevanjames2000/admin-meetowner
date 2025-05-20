import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
interface Place {
  id: number;
  state: string;
  city: string;
  locality: string;
  areas: string | null;
}
interface PlacesResponse {
  page: number;
  search: string;
  perPage: number;
  currentCount: number;
  totalPlaces: number;
  totalPages: number;
  data: Place[];
}
interface ErrorResponse {
  message?: string;
}
interface RawStateData {
  state: string;
}
interface RawCityData {
  city: string;
}
interface StateData {
  name: string;
}
interface CityData {
  name: string;
  state: string;
}
export interface PlacesState {
  places: Place[];
  currentPage: number;
  perPage: number;
  currentCount: number;
  totalPlaces: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  editLoading: boolean;
  editError: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
  insertLoading: boolean;
  insertError: string | null;
  states: StateData[];
  statesLoading: boolean;
  statesError: string | null;
  cities: CityData[];
  citiesLoading: boolean;
  citiesError: string | null;
}
interface PlaceFilter {
  page: number;
  search: string;
}
interface DeletePlacePayload {
  state: string;
  city: string;
  locality: string;
}
interface EditPlacePayload {
  oldState: string;
  oldCity: string;
  oldLocality: string;
  newState: string;
  newCity: string;
  newLocality: string;
}
interface InsertPlacePayload {
  state: string;
  city: string;
  locality: string;
}
export const fetchAllStates = createAsyncThunk(
  "places/fetchAllStates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<RawStateData[]>("/api/v1/getAllStates");
      const uniqueStates = Array.from(
        new Set(response.data.map((item) => item.state))
      ).map((state) => ({ name: state }));
      return uniqueStates;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data || { message: "Failed to fetch states" }
      );
    }
  }
);
export const fetchAllCities = createAsyncThunk(
  "places/fetchAllCities",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<RawCityData[]>("/api/v1/getAllCities");
      const uniqueCities = Array.from(
        new Set(response.data.map((item) => item.city))
      ).map((city) => ({
        name: city,
        state: "",
      }));
      return uniqueCities;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data || { message: "Failed to fetch cities" }
      );
    }
  }
);
export const insertPlace = createAsyncThunk(
  "places/insertPlace",
  async (payload: InsertPlacePayload, { rejectWithValue }) => {
    try {
      const { state, city, locality } = payload;
      const response = await axiosInstance.post(`/api/v1/insertPlaces`, {
        state,
        city,
        locality,
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data || { message: "Failed to insert place" }
      );
    }
  }
);
export const fetchAllPlaces = createAsyncThunk(
  "places/fetchAllPlaces",
  async (filter: PlaceFilter, { rejectWithValue }) => {
    try {
      const { page, search } = filter;
      const promise = axiosInstance.get<PlacesResponse>(`/api/v1/getAllPlaces?page=${page}&search=${encodeURIComponent(search)}`);
      toast.promise(promise, {
        loading: "Fetching places...",
        success: "Places fetched successfully!",
        error: "Failed to fetch places",
      });
      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data || { message: "Failed to fetch places" }
      );
    }
  }
);
export const deletePlace = createAsyncThunk(
  "places/deletePlace",
  async (payload: DeletePlacePayload, { rejectWithValue }) => {
    try {
      const { state, city, locality } = payload;
      const response = await axiosInstance.post(`/api/v1/deletePlace`, {
        state,
        city,
        locality,
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to delete place"
      );
    }
  }
);
export const editPlace = createAsyncThunk(
  "places/editPlace",
  async (payload: EditPlacePayload, { rejectWithValue }) => {
    console.log("payload: ", payload);
    try {
      const { oldState, oldCity, oldLocality, newState, newCity, newLocality,status } = payload;
      const response = await axiosInstance.post(`/api/v1/editPlacesss`, {
        oldState,
        oldCity,
        oldLocality,
        newState,
        newCity,
        newLocality,
        status
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data || { message: "Failed to edit place" }
      );
    }
  }
);
const placesSlice = createSlice({
  name: "places",
  initialState: {
    places: [],
    currentPage: 1,
    perPage: 10,
    currentCount: 0,
    totalPlaces: 0,
    totalPages: 0,
    loading: false,
    error: null,
    editLoading: false,
    editError: null,
    deleteLoading: false,
    deleteError: null,
    insertLoading: false,
    insertError: null,
    states: [],
    statesLoading: false,
    statesError: null,
    cities: [],
    citiesLoading: false,
    citiesError: null,
  } as PlacesState,
  reducers: {
    clearPlaces: (state) => {
      state.places = [];
      state.currentPage = 1;
      state.perPage = 10;
      state.currentCount = 0;
      state.totalPlaces = 0;
      state.totalPages = 0;
      state.error = null;
      state.editError = null;
      state.deleteError = null;
      state.insertError = null;
      state.statesError = null;
      state.citiesError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPlaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPlaces.fulfilled, (state, action) => {
        state.loading = false;
        state.places = action.payload.data;
        state.currentPage = action.payload.page;
        state.perPage = action.payload.perPage;
        state.currentCount = action.payload.currentCount;
        state.totalPlaces = action.payload.totalPlaces;
        state.totalPages = action.payload.totalPages;
      })
     .addCase(fetchAllPlaces.rejected, (state, action) => {
  state.loading = false;
  state.error = (action.payload as any)?.message || "Failed to fetch places";
});
    builder
      .addCase(deletePlace.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deletePlace.fulfilled, (state) => {
        state.deleteLoading = false;
      })
      .addCase(deletePlace.rejected, (state, action) => {
  state.deleteLoading = false;
  state.deleteError = action.payload as string;
});
    builder
      .addCase(editPlace.pending, (state) => {
        state.editLoading = true;
        state.editError = null;
      })
      .addCase(editPlace.fulfilled, (state) => {
        state.editLoading = false;
      })
      .addCase(editPlace.rejected, (state, action) => {
        state.editLoading = false;
        state.editError = action.payload as string;
      });
    builder
      .addCase(insertPlace.pending, (state) => {
        state.insertLoading = true;
        state.insertError = null;
      })
      .addCase(insertPlace.fulfilled, (state) => {
        state.insertLoading = false;
      })
      .addCase(insertPlace.rejected, (state, action) => {
        state.insertLoading = false;
        state.insertError = action.payload as string;
      });
    builder
      .addCase(fetchAllStates.pending, (state) => {
        state.statesLoading = true;
        state.statesError = null;
      })
      .addCase(fetchAllStates.fulfilled, (state, action) => {
        state.statesLoading = false;
        state.states = action.payload;
      })
      .addCase(fetchAllStates.rejected, (state, action) => {
        state.statesLoading = false;
        state.statesError = action.payload as string;
      });
    builder
      .addCase(fetchAllCities.pending, (state) => {
        state.citiesLoading = true;
        state.citiesError = null;
      })
      .addCase(fetchAllCities.fulfilled, (state, action) => {
        state.citiesLoading = false;
        state.cities = action.payload;
      })
      .addCase(fetchAllCities.rejected, (state, action) => {
        state.citiesLoading = false;
        state.citiesError = action.payload as string;
      });
  },
});
export const { clearPlaces } = placesSlice.actions;
export default placesSlice.reducer;
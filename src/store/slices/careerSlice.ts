import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

interface Career {
  id?: number;
  description: string;
  job_title: string;
  upload_date: string;
  preferred_location: string;
  salary: string;
  experience: string;
}

interface CareerResponse {
  message: string;
  careerId?: number;
}

interface ErrorResponse {
  message?: string;
}

export interface CareerState {
  careers: Career[];
  createLoading: boolean;
  createError: string | null;
  createSuccess: string | null;
  fetchLoading: boolean;
  fetchError: string | null;
  fetchSuccess: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
  deleteSuccess: string | null;
  updateLoading: boolean;
  updateError: string | null;
  updateSuccess: string | null;
}

const initialState: CareerState = {
  careers: [],
  createLoading: false,
  createError: null,
  createSuccess: null,
  fetchLoading: false,
  fetchError: null,
  fetchSuccess: null,
  deleteLoading: false,
  deleteError: null,
  deleteSuccess: null,
  updateLoading: false,
  updateError: null,
  updateSuccess: null,
};

// Fetch All Careers Thunk
export const fetchAllCareers = createAsyncThunk(
  "career/fetchAllCareers",
  async (_, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.get<Career[]>("/api/v1/careers");

      

      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Fetch careers error:", axiosError);

      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 403:
            return rejectWithValue("You don't have permission to view careers");
          case 404:
            return rejectWithValue("Careers not found");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(
              axiosError.response.data?.message || "Failed to fetch careers"
            );
        }
      }
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Create Career Thunk
export const createCareer = createAsyncThunk(
  "career/createCareer",
  async (careerData: Career, { rejectWithValue }) => {
    try {
      const payload = {
        description: careerData.description,
        job_title: careerData.job_title,
        preferred_location: careerData.preferred_location,
        salary: careerData.salary,
        experience: careerData.experience,
      };

      const promise = axiosInstance.post<CareerResponse>(
        "/api/v1/insertCareer",
        payload
      );

      toast.promise(promise, {
        loading: "Creating career...",
        success: "Career created successfully!",
        error: "Failed to create career",
      });

      const response = await promise;
      return { ...response.data, career: careerData };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Create career error:", axiosError);

      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 403:
            return rejectWithValue("You don't have permission to create career");
          case 400:
            return rejectWithValue(
              axiosError.response.data?.message || "Invalid career data"
            );
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(
              axiosError.response.data?.message || "Failed to create career"
            );
        }
      }
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Update Career Thunk
export const updateCareer = createAsyncThunk(
  "career/updateCareer",
  async (
    { id, careerData }: { id: number; careerData: Career },
    { rejectWithValue }
  ) => {
    try {
      const payload = {
        description: careerData.description,
        job_title: careerData.job_title,
        upload_date: careerData.upload_date,
        preferred_location: careerData.preferred_location,
        salary: careerData.salary,
        experience: careerData.experience,
      };

      const promise = axiosInstance.post<CareerResponse>(
        `/api/v1/updateCareer?id=${id}`,
        payload
      );

      toast.promise(promise, {
        loading: "Updating career...",
        success: "Career updated successfully!",
        error: "Failed to update career",
      });

      const response = await promise;
      return { ...response.data, id, career: careerData };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Update career error:", axiosError);

      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 403:
            return rejectWithValue("You don't have permission to update career");
          case 400:
            return rejectWithValue(
              axiosError.response.data?.message || "Invalid career data"
            );
          case 404:
            return rejectWithValue("Career not found");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(
              axiosError.response.data?.message || "Failed to update career"
            );
        }
      }
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Delete Career Thunk
export const deleteCareer = createAsyncThunk(
  "career/deleteCareer",
  async (careerId: number, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.delete<CareerResponse>(
        `/api/v1/deleteCareer?id=${careerId}`
      );

      toast.promise(promise, {
        loading: "Deleting career...",
        success: "Career deleted successfully!",
        error: "Failed to delete career",
      });

      const response = await promise;
      return { message: response.data.message, id: careerId };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Delete career error:", axiosError);

      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 404:
            return rejectWithValue("Career not found");
          case 403:
            return rejectWithValue("You don't have permission to delete career");
          case 400:
            return rejectWithValue(
              axiosError.response.data?.message || "Invalid request data"
            );
          default:
            return rejectWithValue(
              axiosError.response.data?.message || "Failed to delete career"
            );
        }
      }
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

const careerSlice = createSlice({
  name: "career",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.createError = null;
      state.createSuccess = null;
      state.fetchError = null;
      state.fetchSuccess = null;
      state.deleteError = null;
      state.deleteSuccess = null;
      state.updateError = null;
      state.updateSuccess = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Careers
      .addCase(fetchAllCareers.pending, (state) => {
        state.fetchLoading = true;
        state.fetchError = null;
        state.fetchSuccess = null;
      })
      .addCase(fetchAllCareers.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.careers = action.payload;
        state.fetchSuccess = "Careers fetched successfully";
      })
      .addCase(fetchAllCareers.rejected, (state, action) => {
        state.fetchLoading = false;
        state.fetchError = action.payload as string;
      })
      // Create Career
      .addCase(createCareer.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = null;
      })
      .addCase(createCareer.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = action.payload.message;
        if (action.payload.careerId) {
          state.careers.push({
            ...action.payload.career,
            id: action.payload.careerId,
          });
        } else {
          state.careers.push(action.payload.career);
        }
      })
      .addCase(createCareer.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      })
      // Update Career
      .addCase(updateCareer.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = null;
      })
      .addCase(updateCareer.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = action.payload.message;
        state.careers = state.careers.map((career) =>
          career.id === action.payload.id
            ? { ...action.payload.career, id: action.payload.id }
            : career
        );
      })
      .addCase(updateCareer.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      })
      // Delete Career
      .addCase(deleteCareer.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccess = null;
      })
      .addCase(deleteCareer.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess = action.payload.message;
        state.careers = state.careers.filter(
          (career) => career.id !== action.payload.id
        );
      })
      .addCase(deleteCareer.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload as string;
      });
  },
});

export const { clearMessages } = careerSlice.actions;
export default careerSlice.reducer;
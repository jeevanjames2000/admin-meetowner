import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axiosInstance";
import axiosIstance from "../../utils/axiosInstance";
interface LegalsState {
  aboutUs: string;
  services: string;
  terms: string;
  privacy: string;
  loading: boolean;
  error: string | null;
  updateSuccess: boolean;
}
const initialState: LegalsState = {
  aboutUs: "",
  services: "",
  terms: "",
  privacy: "",
  loading: false,
  error: null,
  updateSuccess: false,
};
export const fetchAboutUs = createAsyncThunk("legals/fetchAboutUs", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosIstance.get("api/v1/about");
    return res.data[0]?.description || "";
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || "Failed to fetch about info");
  }
});
export const fetchServices = createAsyncThunk("legals/fetchServices", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosIstance.get("api/v1/services");
    return res.data[0]?.description || "";
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || "Failed to fetch services");
  }
});
export const fetchTerms = createAsyncThunk("legals/fetchTerms", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosIstance.get("api/v1/terms");
    return res.data[0]?.description || "";
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || "Failed to fetch terms");
  }
});
export const fetchPrivacy = createAsyncThunk("legals/fetchPrivacy", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosIstance.get("api/v1/privacy");
    return res.data[0]?.description || "";
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || "Failed to fetch privacy policy");
  }
});
export const updateAboutUs = createAsyncThunk(
  "legals/updateAboutUs",
  async ({ description }: { description: string }, { rejectWithValue }) => {
    try {
      const res = await axiosIstance.post("api/v1/updateAbout", { description });
      return res.data.message;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to update about info");
    }
  }
);
export const updateServices = createAsyncThunk(
  "legals/updateServices",
  async ({ services }: { services: string }, { rejectWithValue }) => {
    try {
      const res = await axiosIstance.post("api/v1/updateServices", { services });
      return res.data.message;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to update services");
    }
  }
);
export const updateTerms = createAsyncThunk("legals/updateTerms", async (description: string, { rejectWithValue }) => {
  try {
    const res = await axiosIstance.post("api/v1/updateTerms", { description });
    return res.data.message;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || "Failed to update terms");
  }
});
export const updatePrivacy = createAsyncThunk("legals/updatePrivacy", async (description: string, { rejectWithValue }) => {
  try {
    const res = await axiosIstance.post("api/v1/updatePrivacy", { description });
    return res.data.message;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || "Failed to update privacy policy");
  }
});
const legalsSlice = createSlice({
  name: "legals",
  initialState,
  reducers: {
    clearLegalsError(state) {
      state.error = null;
    },
    clearLegalsSuccess(state) {
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAboutUs.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAboutUs.fulfilled, (state, action) => {
      state.loading = false;
      state.aboutUs = action.payload;
    });
    builder.addCase(fetchAboutUs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    builder.addCase(fetchServices.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchServices.fulfilled, (state, action) => {
      state.loading = false;
      state.services = action.payload;
    });
    builder.addCase(fetchServices.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    builder.addCase(fetchTerms.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTerms.fulfilled, (state, action) => {
      state.loading = false;
      state.terms = action.payload;
    });
    builder.addCase(fetchTerms.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    builder.addCase(fetchPrivacy.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPrivacy.fulfilled, (state, action) => {
      state.loading = false;
      state.privacy = action.payload;
    });
    builder.addCase(fetchPrivacy.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    builder.addCase(updateAboutUs.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.updateSuccess = false;
    });
    builder.addCase(updateAboutUs.fulfilled, (state) => {
      state.loading = false;
      state.updateSuccess = true;
    });
    builder.addCase(updateAboutUs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    builder.addCase(updateServices.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.updateSuccess = false;
    });
    builder.addCase(updateServices.fulfilled, (state) => {
      state.loading = false;
      state.updateSuccess = true;
    });
    builder.addCase(updateServices.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    builder.addCase(updateTerms.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.updateSuccess = false;
    });
    builder.addCase(updateTerms.fulfilled, (state) => {
      state.loading = false;
      state.updateSuccess = true;
    });
    builder.addCase(updateTerms.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    builder.addCase(updatePrivacy.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.updateSuccess = false;
    });
    builder.addCase(updatePrivacy.fulfilled, (state) => {
      state.loading = false;
      state.updateSuccess = true;
    });
    builder.addCase(updatePrivacy.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});
export const { clearLegalsError, clearLegalsSuccess } = legalsSlice.actions;
export default legalsSlice.reducer;

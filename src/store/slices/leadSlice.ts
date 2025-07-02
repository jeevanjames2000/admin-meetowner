import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
interface LeadState {
  searchedLeads: any[];
  contactedLeads: any[];
  notifications: any[];
  loading: boolean;
  error: string | null;
}
const initialState: LeadState = {
  searchedLeads: [],
  contactedLeads: [],
  notifications: [],
  loading: false,
  error: null,
};
export const fetchNotifications = createAsyncThunk(
  "leads/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("https://api.meetowner.in/live/getLiveNotifications");
      return response.data.data || [];
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch notifications");
    }
  }
);
const leadSlice = createSlice({
  name: "leads",
  initialState,
  reducers: {
    addSearchedLead(state, action: PayloadAction<any[]>) {
      state.searchedLeads = [...action.payload];
    },
    addContactedLead(state, action: PayloadAction<any[]>) {
      state.contactedLeads = [...action.payload];
    },
    setNotifications(state, action: PayloadAction<any[]>) {
      state.notifications = [...action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
export const { addSearchedLead, addContactedLead, setNotifications } = leadSlice.actions;
export default leadSlice.reducer;
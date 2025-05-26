import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import  { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";




interface Employee {
  id?: number;
  user_type: number;
  name: string;
  mobile: string;
  alt_mobile?: string | null;
  email: string;
  password?: string;
  photo?: string | null;
  status?: number;
  created_date?: string | null;
  created_time?: string | null;
  updated_date?: string | null;
  updated_time?: string | null;
  state?: string | null;
  city?: string | null;
  location?: string | null;
  address?: string | null;
  pincode?: string | null;
  from_app?: string | null;
  gst_number?: string | null;
  rera_number?: string | null;
  uploaded_from_seller_panel?: string | null;
  designation?: string | null;
  created_by?: string | null;
  created_userID?: number | null;
  assigned_user_id?: number | null;
  assigned_user_type?: number | null;
  assigned_user_name?: string | null;
 
}

interface EmployeeResponse {
  message: string;
  userId?: number;
}

interface ErrorResponse {
  message?: string;
}





export interface EmployeeState {
 
  updateLoading: boolean;
  updateError: string | null;
  updateSuccess: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
  deleteSuccess: string | null;
}

const initialState: EmployeeState = {
  
  
  
  // Initial states for update
  updateLoading: false,
  updateError: null,
  updateSuccess: null,

 

  deleteLoading: false,
  deleteError: null,
  deleteSuccess: null,
 
};




// Update Employee Thunk
export const updateUser = createAsyncThunk(
  "employee/updateUser",
  async (employeeData: Employee, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.post<EmployeeResponse>(
        "/user/v1/updateUser",
        employeeData
      );

      toast.promise(promise, {
        loading: "Updating employee...",
        success: "Employee updated successfully!",
        error: "Failed to update employee",
      });

      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Update employee error:", axiosError);

      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 404:
            return rejectWithValue("User id Not found");
          case 403:
            return rejectWithValue("You don't have permission to update user");
          case 400:
            return rejectWithValue(axiosError.response.data?.message || "Invalid employee data");
          default:
            return rejectWithValue(
              axiosError.response.data?.message || "Failed to update employee"
            );
        }
      }
      return rejectWithValue("Network error. Please try again.");
    }
  }
);




export const deleteUser = createAsyncThunk(
  "employee/deleteUser",
  async (employeeId: number, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.delete<EmployeeResponse>("/user/v1/deleteUser", {
        data: { id: employeeId }, 
      });

      toast.promise(promise, {
        loading: "Deleting employee...",
        success: "Employee deleted successfully!",
        error: "Failed to delete employee",
      });

      const response = await promise;
      return { message: response.data.message, id: employeeId }; 
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Delete employee error:", axiosError);

      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 404:
            return rejectWithValue("User id Not found");
          case 403:
            return rejectWithValue("You don't have permission to delete user");
          case 400:
            return rejectWithValue(axiosError.response.data?.message || "Invalid request data");
          default:
            return rejectWithValue(
              axiosError.response.data?.message || "Failed to delete employee"
            );
        }
      }
      return rejectWithValue("Network error. Please try again.");
    }
  }
);





const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.updateError = null;
      state.updateSuccess = null;
      state.deleteError = null;
      state.deleteSuccess = null;
    },
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(updateUser.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = action.payload.message;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      })

      .addCase(deleteUser.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccess = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess = action.payload.message;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload as string;
      })
     
  },
});

export const { clearMessages } = employeeSlice.actions;
export default employeeSlice.reducer;
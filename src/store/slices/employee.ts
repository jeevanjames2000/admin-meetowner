import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import  { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

interface AssignedUser {
  id: number;
  user_type: number;
  photo: string | null;
  name: string;
  mobile: string;
  email: string;
  city: string | null;
  address: string | null;
  subscription_package: string | null;
  subscription_start_date: string | null;
  subscription_expiry_date: string | null;
  subscription_status: string | null;
  assigned_emp_id: number;
  assigned_emp_type: string;
  assigned_emp_name: string;
}

interface AssignEmployeeRequest {
  user_id: number;
  employee_id: number;
  employee_name: string;
  employee_type: number;
  user_name: string;
  user_type: number;
}

interface AssignEmployeeResponse {
  success: boolean;
  message: string;
}

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
  assigned_users?: AssignedUser[];
}

interface EmployeeResponse {
  message: string;
  userId?: number;
}

interface ErrorResponse {
  message?: string;
}



interface FetchAllEmployeesResponse {
  success: boolean;
  count: number;
  data: Employee[];
}

export interface EmployeeState {
  employees: Employee[];
  // States for creating an employee
  createLoading: boolean;
  createError: string | null;
  createSuccess: string | null;
  // States for updating an employee
  updateLoading: boolean;
  updateError: string | null;
  updateSuccess: string | null;
  // States for fetching employees
  fetchLoading: boolean;
  fetchError: string | null;
  fetchSuccess: string | null;
  // States for deleting an employee
  deleteLoading: boolean;
  deleteError: string | null;
  deleteSuccess: string | null;
   assignLoading: boolean;
  assignError: string | null;
  assignSuccess: string | null;
}

const initialState: EmployeeState = {
  employees: [],
  
  // Initial states for creation
  createLoading: false,
  createError: null,
  createSuccess: null,
  // Initial states for update
  updateLoading: false,
  updateError: null,
  updateSuccess: null,
  // Initial states for fetch
  fetchLoading: false,
  fetchError: null,
  fetchSuccess: null,

  deleteLoading: false,
  deleteError: null,
  deleteSuccess: null,

  assignLoading: false,
  assignError: null,
  assignSuccess: null,
};

// Create Employee Thunk
export const createEmployee = createAsyncThunk(
  "employee/createEmployee",
  async (employeeData: Employee, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.post<EmployeeResponse>(
        "/user/v1/createEmployee",
        employeeData
      );

      toast.promise(promise, {
        loading: "Creating employee...",
        success: "Employee created successfully!",
        error: "Failed to create employee",
      });

      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Create employee error:", axiosError);

      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 403:
            return rejectWithValue("You don't have permission to create user");
          case 400:
            return rejectWithValue(axiosError.response.data?.message || "Invalid employee data");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(
              axiosError.response.data?.message || "Failed to create employee"
            );
        }
      }
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Update Employee Thunk
export const updateEmployee = createAsyncThunk(
  "employee/updateEmployee",
  async (employeeData: Employee, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.post<EmployeeResponse>(
        "/user/v1/updateEmployee",
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

// Fetch All Employees Thunk
export const fetchAllEmployees = createAsyncThunk(
  "employee/fetchAllEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<FetchAllEmployeesResponse>(
        `/user/v1/getAllEmployeesByTypeSearch`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Fetch employees error:", axiosError);

      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 403:
            return rejectWithValue("You don't have permission to view employees");
          case 404:
            return rejectWithValue("Employees not found");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(
              axiosError.response.data?.message || "Failed to fetch employees"
            );
        }
      }
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  "employee/deleteEmployee",
  async (employeeId: number, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.delete<EmployeeResponse>("/user/v1/deleteEmployee", {
        data: { id: employeeId }, // Pass the id in the request body
      });

      toast.promise(promise, {
        loading: "Deleting employee...",
        success: "Employee deleted successfully!",
        error: "Failed to delete employee",
      });

      const response = await promise;
      return { message: response.data.message, id: employeeId }; // Return id for state update
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

//Assign Employee

export const assignEmployee = createAsyncThunk(
  "employee/assignEmployee",
  async (assignData: AssignEmployeeRequest, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.post<AssignEmployeeResponse>(
        "/user/v1/assignEmployee",
        assignData
      );

      toast.promise(promise, {
        loading: "Assigning employee...",
        success: "Employee assigned successfully!",
        error: "Failed to assign employee",
      });

      const response = await promise;
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Assign employee error:", axiosError);

      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 403:
            return rejectWithValue("You don't have permission to assign employee");
          case 400:
            return rejectWithValue(axiosError.response.data?.message || "Invalid assignment data");
          case 404:
            return rejectWithValue("User or employee not found");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(
              axiosError.response.data?.message || "Failed to assign employee"
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
      state.createError = null;
      state.createSuccess = null;
      state.updateError = null;
      state.updateSuccess = null;
      state.fetchError = null;
      state.fetchSuccess = null;
      state.deleteError = null;
      state.deleteSuccess = null;
    },
  },
  extraReducers: (builder) => {
    // Create Employee Cases
    builder
      .addCase(createEmployee.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = action.payload.message;
        if (action.payload.userId) {
          state.employees.push({
            ...action.meta.arg,
            id: action.payload.userId,
          });
        }
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      })

      // Update Employee Cases
      .addCase(updateEmployee.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = action.payload.message;
        const index = state.employees.findIndex(
          (emp) => emp.id === action.meta.arg.id
        );
        if (index !== -1) {
          state.employees[index] = action.meta.arg;
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      })

      // Fetch All Employees Cases
      .addCase(fetchAllEmployees.pending, (state) => {
        state.fetchLoading = true;
        state.fetchError = null;
        state.fetchSuccess = null;
      })
      .addCase(fetchAllEmployees.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.employees = action.payload.data;
        state.fetchSuccess = "Employees fetched successfully";
      })
      .addCase(fetchAllEmployees.rejected, (state, action) => {
        state.fetchLoading = false;
        state.fetchError = action.payload as string;
      })
      .addCase(deleteEmployee.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccess = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess = action.payload.message;
        // Remove the deleted employee from the employees array
        state.employees = state.employees.filter(
          (emp) => emp.id !== action.payload.id
        );
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload as string;
      })
      .addCase(assignEmployee.pending, (state) => {
        state.assignLoading = true;
        state.assignError = null;
        state.assignSuccess = null;
      })
      .addCase(assignEmployee.fulfilled, (state, action) => {
        state.assignLoading = false;
        state.assignSuccess = action.payload.message;
      })
      .addCase(assignEmployee.rejected, (state, action) => {
        state.assignLoading = false;
        state.assignError = action.payload as string;
      });
  },
});

export const { clearMessages } = employeeSlice.actions;
export default employeeSlice.reducer;
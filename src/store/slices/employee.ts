import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

interface Employee {
  id?: number;
  name: string;
  mobile: string;
  email: string;
  designation: string;
  password: string;
  city: string;
  pincode: string;
  state: string;
  user_type: number;
  created_by: string;
  created_userID: number;
  status?: number;
}

interface EmployeeResponse {
  message: string;
  userId?: number;
}

interface ErrorResponse {
  message?: string;
}
interface GroupedCount {
  user_type: number;
  count: number;
}

interface GetAllEmployeesResponse {
  groupedCount: GroupedCount[];
  employees: Employee[];
}
export interface EmployeeState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: EmployeeState = {
  employees: [],
  loading: false,
  error: null,
  success: null,
};

// Create Employee Thunk
export const createEmployee = createAsyncThunk(
  "employee/createEmployee",
  async (employeeData: Employee, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.post<EmployeeResponse>(
        "/user/createUser",
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
        "/user/updateUser",
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

export const fetchAllEmployees = createAsyncThunk(
  "employee/fetchAllEmployees",
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<GetAllEmployeesResponse>(
        `/user/getAllEmp/${userId}`
        ,{
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
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

const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    // Create Employee Cases
    builder
      .addCase(createEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        if (action.payload.userId) {
          state.employees.push({
            ...action.meta.arg,
            id: action.payload.userId,
          });
        }
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Employee Cases
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        const index = state.employees.findIndex(
          (emp) => emp.id === action.meta.arg.id
        );
        if (index !== -1) {
          state.employees[index] = action.meta.arg;
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMessages } = employeeSlice.actions;
export default employeeSlice.reducer;
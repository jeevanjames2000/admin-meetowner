import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";
const API_ENDPOINTS = {
  GET_ALL: "/upcoming/v1/getAllUpComingProjects",
  DELETE: "/upcoming/v1/delete",
  CREATE_DATA: "/upcoming/v1/createProjectData",
  UPLOAD_ASSETS: "/upcoming/v1/uploadProjectAssets",
} as const;
interface Size {
  size_id: number;
  buildup_area: number;
  carpet_area: number;
  sqft_price?: number;
  floor_plan?: string | null;
}

interface AroundProperty {
  title: string;
  distance: number;
}

interface UpcomingProject {
  unique_property_id: string;
  property_name: string;
  builder_name: string;
  mobile?: string;
  state: string;
  city: string;
  location: string;
  property_type: string;
  property_for: string;
  sub_type: string;
  possession_status: string;
  brochure?: string | null;
  price_sheet?: string | null;
  launch_type: string;
  launch_date?: string | null;
  possession_end_date?: string | null;
  is_rera_registered: boolean;
  rera_number?: string | null;
  otp_options?: string[] | null;
  created_at: string;
  sizes?: Size[];
}

interface CreateProjectDataPayload {
  unique_property_id: string;
  property_name: string;
  builder_name: string;
  mobile?: string;
  state: string;
  city: string;
  location: string;
  property_type: string;
  property_for: string;
  sub_type: string;
  possession_status: string;
  launch_type: string;
  launch_date?: string;
  possession_end_date?: string;
  is_rera_registered: boolean;
  rera_number?: string;
  otp_options?: string[];
  sizes?: { buildup_area: number; carpet_area: number; sqft_price?: number }[];
  around_property?: AroundProperty[];
}

interface UploadProjectAssetsPayload {
  unique_property_id: string;
  size_ids: number[];
  brochure?: File;
  price_sheet?: File;
  floor_plans?: File[];
}

interface UpcomingProjectsState {
  projects: UpcomingProject[];
  loading: boolean;
  error: string | null;
  createProjectStatus: "idle" | "loading" | "succeeded" | "failed";
  createProjectError: string | null;
}
const initialState: UpcomingProjectsState = {
  projects: [],
  loading: false,
  error: null,
  createProjectStatus: "idle",
  createProjectError: null,
};
const createApiThunk = <Returned, ThunkArg>(
  typePrefix: string ,
  apiCall: (arg: ThunkArg) => Promise<any>,
  successCheck: (response: any) => boolean,
  getData: (response: any) => Returned,
  errorMessage: string
) =>
  createAsyncThunk<Returned, ThunkArg, { rejectValue: string }>(
    typePrefix,
    async (arg, { rejectWithValue }) => {
      try {
        const response = await apiCall(arg);
        if (successCheck(response)) {
          return getData(response);
        }
        return rejectWithValue(response.data.message || errorMessage);
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Internal server error");
      }
    }
  );
export const getAllUpcomingProjects = createApiThunk<UpcomingProject[], void>(
  "upcomingProjects/getAll",
  () => axiosInstance.get(API_ENDPOINTS.GET_ALL),
  (response) => response.data.status === "success",
  (response) => response.data.data,
  "Failed to fetch projects"
);

export const deleteUpComingProject = createApiThunk<void, string>(
  "upcomingProjects/delete",
  (unique_property_id) =>
    axiosInstance.post(API_ENDPOINTS.DELETE, { unique_property_id }),
  (response) => response.data.status === "success",
  () => undefined,
  "Failed to delete project"
);

export const createProjectData = createApiThunk<
  { unique_property_id: string; size_ids: number[] },
  CreateProjectDataPayload
>(
  "upcomingProjects/createProjectData",
  (payload) => axiosInstance.post(API_ENDPOINTS.CREATE_DATA, payload),
  (response) => response.data.status === "success",
  (response) => response.data.data,
  "Failed to create project data"
);

export const uploadProjectAssets = createApiThunk<
  {
    unique_property_id: string;
    brochure: string | null;
    price_sheet: string | null;
    floor_plans: { size_id: number; floor_plan: string | null }[];
  },
  UploadProjectAssetsPayload
>(
  "upcomingProjects/uploadProjectAssets",
  (payload) => {
    const formData = new FormData();
    formData.append("unique_property_id", payload.unique_property_id);
    formData.append("size_ids", JSON.stringify(payload.size_ids));
    if (payload.brochure) formData.append("brochure", payload.brochure);
    if (payload.price_sheet) formData.append("price_sheet", payload.price_sheet);
    payload.floor_plans?.forEach((floorPlan, index) =>
      formData.append(`floor_plans[${index}]`, floorPlan)
    );
    return axiosInstance.post(API_ENDPOINTS.UPLOAD_ASSETS, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  (response) => response.data.status === "success",
  (response) => response.data.data,
  "Failed to upload project assets"
);
const upcomingProjectsSlice = createSlice({
  name: "upcomingProjects",
  initialState,
  reducers: {
    resetCreateProjectStatus(state) {
      state.createProjectStatus = "idle";
      state.createProjectError = null;
    },
    resetError(state) {
      state.error = null;
      state.createProjectError = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state: UpcomingProjectsState) => {
      state.loading = true;
      state.error = null;
    };

    const handleRejected = (
      state: UpcomingProjectsState,
      action: { payload: string | undefined }
    ) => {
      state.loading = false;
      state.error = action.payload || "Operation failed";
    };

    const handleCreatePending = (state: UpcomingProjectsState) => {
      state.createProjectStatus = "loading";
      state.createProjectError = null;
    };

    const handleCreateRejected = (
      state: UpcomingProjectsState,
      action: { payload: string | undefined }
    ) => {
      state.createProjectStatus = "failed";
      state.createProjectError = action.payload || "Operation failed";
    };

    builder
      .addCase(getAllUpcomingProjects.pending, handlePending)
      .addCase(getAllUpcomingProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(getAllUpcomingProjects.rejected, handleRejected);

    builder
      .addCase(deleteUpComingProject.pending, handlePending)
      .addCase(deleteUpComingProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(
          (project) => project.unique_property_id !== action.meta.arg
        );
      })
      .addCase(deleteUpComingProject.rejected, handleRejected);

    builder
      .addCase(createProjectData.pending, handleCreatePending)
      .addCase(createProjectData.fulfilled, (state, action) => {
        state.createProjectStatus = "succeeded";
        const newProject: UpcomingProject = {
          ...action.meta.arg,
          property_name: action.meta.arg.property_name,
          builder_name: action.meta.arg.builder_name,
          property_type: action.meta.arg.property_type,
          property_for: action.meta.arg.property_for,
          sub_type: action.meta.arg.sub_type,
          possession_status: action.meta.arg.possession_status,
          launch_type: action.meta.arg.launch_type,
          is_rera_registered: action.meta.arg.is_rera_registered,
          created_at: new Date().toISOString(),
          sizes: action.meta.arg.sizes?.map((size, index) => ({
            size_id: action.payload.size_ids[index] || index + 1,
            buildup_area: size.buildup_area,
            carpet_area: size.carpet_area,
            sqft_price: size.sqft_price,
            floor_plan: null,
          })),
        };
        state.projects.push(newProject);
      })
      .addCase(createProjectData.rejected, handleCreateRejected);

    builder
      .addCase(uploadProjectAssets.pending, handleCreatePending)
      .addCase(uploadProjectAssets.fulfilled, (state, action) => {
        state.createProjectStatus = "succeeded";
        const project = state.projects.find(
          (p) => p.unique_property_id === action.payload.unique_property_id
        );
        if (project) {
          project.brochure = action.payload.brochure;
          project.price_sheet = action.payload.price_sheet;
          if (project.sizes && action.payload.floor_plans.length > 0) {
            project.sizes = project.sizes.map((size) => {
              const floorPlan = action.payload.floor_plans.find(
                (fp) => fp.size_id === size.size_id
              );
              return floorPlan ? { ...size, floor_plan: floorPlan.floor_plan } : size;
            });
          }
        }
      })
      .addCase(uploadProjectAssets.rejected, handleCreateRejected);
  },
});

export const { resetCreateProjectStatus, resetError } = upcomingProjectsSlice.actions;
export default upcomingProjectsSlice.reducer;
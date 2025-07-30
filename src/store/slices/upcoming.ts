import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";

const API_ENDPOINTS = {
  GET_ALL: "/upcoming/v1/getAllUpComingProjects",
  DELETE: "/upcoming/v1/deleteUpComingProject",
  CREATE_DATA: "/upcoming/v1/createProjectData",
  UPLOAD_ASSETS: "/upcoming/v1/uploadProjectAssets",
   DELETE_PLACES_AROUND: "/property/deleteplacesaroundproperty",
  DELETE_PROPERTY_SIZES: "/upcoming/v1/deletePropertySizes",
  DELETE_BROURCHER_OR_PRICESHEET:"/upcoming/v1/deleteBroucherOrPriceSheet",
  CREATE_AROUND_PROPERTY:"/upcoming/v1/createAroundThisProperty",
  CREATE_PROPERTY_SIZES:"/upcoming/v1/createPropertySizes",
    GET_PROPERTY_SIZES: "/upcoming/v1/getPropertySizes",
  GET_AROUND_PROPERTY: "/upcoming/v1/getAroundThisProperty",
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
  export const deletePlacesAroundProperty = createApiThunk<void, { placeid: string; unique_property_id: string }>(
  "upcomingProjects/deletePlacesAroundProperty",
  ({ placeid, unique_property_id }) =>
    axiosInstance.post(API_ENDPOINTS.DELETE_PLACES_AROUND, { placeid, unique_property_id }),
  (response) => response.data.status === "success",
  () => undefined,
  "Failed to delete place around property"
); 

export const deletePropertySizes = createApiThunk<void, { unique_property_id: string }>(
  "upcomingProjects/deletePropertySizes",
  ({ unique_property_id }) =>
    axiosInstance.post(
      `${API_ENDPOINTS.DELETE_PROPERTY_SIZES}?unique_property_id=${encodeURIComponent(unique_property_id)}`
    ),
  (response) => response.data.status === "success",
  () => undefined,
  "Failed to delete property sizes"
);
export const deleteBroucherOrPriceSheet = createApiThunk<
  void,
  { key: string; unique_property_id: string }
>(
  "upcomingProjects/deleteBroucherOrPriceSheet",
  ({ key, unique_property_id }) =>
    axiosInstance.post(
      `${API_ENDPOINTS.DELETE_BROURCHER_OR_PRICESHEET}?key=${encodeURIComponent(
        key
      )}&unique_property_id=${encodeURIComponent(unique_property_id)}`
    ),
  (response) => response.data.status === "success",
  () => undefined,
  "Failed to delete brochure or price sheet"
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
  { size_ids: number[] },
  CreateProjectDataPayload
>(
  "upcomingProjects/createProjectData",
  (payload) => axiosInstance.post(API_ENDPOINTS.CREATE_DATA, payload),
  (response) => response.data.status === "success",
  (response) => response.data.data,
  "Failed to create project data"
);
export const getPropertySizes = createApiThunk<
  Array<{
    size_id: number;
    buildup_area: number;
    carpet_area: number;
    sqft_price?: number;
    floor_plan?: string;
  }>,
  { unique_property_id: string }
>(
  "upcomingProjects/getPropertySizes",
  ({ unique_property_id }) =>
    axiosInstance.get(
      `${API_ENDPOINTS.GET_PROPERTY_SIZES}?unique_property_id=${encodeURIComponent(
        unique_property_id
      )}`
    ),
  (response) => response.data.status === "success",
  (response) => response.data.data,
  "Failed to fetch property sizes"
);

export const getAroundThisProperty = createApiThunk<
  Array<{ id: string; title: string; distance: string }>,
  { unique_property_id: string }
>(
  "upcomingProjects/getAroundThisProperty",
  ({ unique_property_id }) =>
    axiosInstance.get(
      `${API_ENDPOINTS.GET_AROUND_PROPERTY}?unique_property_id=${encodeURIComponent(
        unique_property_id
      )}`
    ),
  (response) => response.data.status === "success",
  (response) => response.data.data,
  "Failed to fetch around property entries"
);

export const createPropertySizes = createApiThunk<
  { size_ids: number[] },
  { unique_property_id: string; sizes: { buildup_area: number; carpet_area: number; sqft_price?: number }[] }
>(
  "upcomingProjects/createPropertySizes",
  ({ unique_property_id, sizes }) =>
    axiosInstance.post(API_ENDPOINTS.CREATE_PROPERTY_SIZES, {
      unique_property_id,
      sizes,
    }),
  (response) => response.data.status === "success",
  (response) => response.data.data,
  "Failed to create property sizes"
);

export const createAroundThisProperty = createApiThunk<
  { unique_property_id: string },
  { unique_property_id: string; around_property: { title: string; distance: string }[] }
>(
  "upcomingProjects/createAroundThisProperty",
  ({ unique_property_id, around_property }) =>
    axiosInstance.post(API_ENDPOINTS.CREATE_AROUND_PROPERTY, {
      unique_property_id,
      around_property,
    }),
  (response) => response.data.status === "success",
  (response) => response.data.data,
  "Failed to create around property entries"
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
       builder
      .addCase(deletePlacesAroundProperty.pending, handlePending)
      .addCase(deletePlacesAroundProperty.fulfilled, (state, action) => {
        state.loading = false;
      
        const { unique_property_id } = action.meta.arg;
        const project = state.projects.find(
          (p) => p.unique_property_id === unique_property_id
        );
        if (project && project.around_property) {
          project.around_property = project.around_property.filter(
            (place) => place.placeid !== action.meta.arg.placeid
          );
        }
      })
      .addCase(deletePlacesAroundProperty.rejected, handleRejected)

    // Add new cases for deletePropertySizes
    builder
      .addCase(deletePropertySizes.pending, handlePending)
      .addCase(deletePropertySizes.fulfilled, (state, action) => {
        state.loading = false;
        const project = state.projects.find(
          (p) => p.unique_property_id === action.meta.arg.unique_property_id
        );
        if (project) {
          project.sizes = []; // Clear sizes array
        }
      })
      .addCase(deletePropertySizes.rejected, handleRejected);
      
  },
});

export const { resetCreateProjectStatus, resetError } = upcomingProjectsSlice.actions;
export default upcomingProjectsSlice.reducer;
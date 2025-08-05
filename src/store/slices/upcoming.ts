import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";
const API_ENDPOINTS = {
  GET_ALL: "/upcoming/v1/getAllUpComingProjects",
  GET_BY_ID: "/upcoming/v1/getProjectById",
  DELETE: "/upcoming/v1/deleteUpComingProject",
  CREATE_DATA: "/upcoming/v1/createProjectData",
  UPLOAD_ASSETS: "/upcoming/v1/uploadProjectAssets",
  DELETE_PLACES_AROUND: "/property/deleteplacesaroundproperty",
  DELETE_PROPERTY_SIZES: "/upcoming/v1/deletePropertySizes",
  DELETE_BROCHURE_OR_PRICESHEET: "/upcoming/v1/deleteBroucherOrPriceSheet",
  CREATE_AROUND_PROPERTY: "/upcoming/v1/createAroundThisProperty",
  CREATE_PROPERTY_SIZES: "/upcoming/v1/createPropertySizes",
  GET_PROPERTY_SIZES: "/upcoming/v1/getPropertySizes",
  GET_AROUND_PROPERTY: "/upcoming/v1/getAroundThisProperty",
  UploadPropertyImages:"/upcoming/v1/addUpcomingProjectImages"
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
  created_at?: string;
  sizes?: Size[];
  around_property?: AroundProperty[];
}
interface CreateProjectDataPayload {
  user_id:number,
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
interface AddUpcomingProjectImagesPayload {
  unique_property_id: string;
  user_id: number;
  photos: File[];
}
interface UpcomingProjectsState {
  projects: UpcomingProject[];
  currentProject: UpcomingProject | null;
  loading: boolean;
  error: string | null;
  createProjectStatus: "idle" | "loading" | "succeeded" | "failed";
  createProjectError: string | null;
}
const initialState: UpcomingProjectsState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  createProjectStatus: "idle",
  createProjectError: null,
};
const createApiThunk = <Returned, ThunkArg>(
  typePrefix: string,
  apiCall: (arg: ThunkArg) => Promise<any>,
  successCheck: (response: any) => boolean = (response) => response.data.status === "success",
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
export const getProjectById = createApiThunk<UpcomingProject, string>(
  "upcomingProjects/getById",
  (unique_property_id) =>
    axiosInstance.get(`${API_ENDPOINTS.GET_BY_ID}?unique_property_id=${encodeURIComponent(unique_property_id)}`),
  undefined,
  (response) => response.data.data,
  "Failed to fetch project"
);
export const getAllUpcomingProjects = createApiThunk<UpcomingProject[], void>(
  "upcomingProjects/getAll",
  () => axiosInstance.get(API_ENDPOINTS.GET_ALL),
  undefined,
  (response) => response.data.data,
  "Failed to fetch projects"
);
export const deleteUpComingProject = createApiThunk<void, string>(
  "upcomingProjects/delete",
  (unique_property_id) =>
    axiosInstance.post(API_ENDPOINTS.DELETE, { unique_property_id }),
  undefined,
  () => undefined,
  "Failed to delete project"
);
export const createProjectData = createApiThunk<{ size_ids: number[] }, CreateProjectDataPayload>(
  "upcomingProjects/createProjectData",
  (payload) => axiosInstance.post(API_ENDPOINTS.CREATE_DATA, payload),
  undefined,
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
  undefined,
  (response) => response.data.data,
  "Failed to upload project assets"
);
export const addUpcomingProjectImages = createAsyncThunk(
  "upcoming/addUpcomingProjectImages",
  async (payload: AddUpcomingProjectImagesPayload, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("unique_property_id", payload.unique_property_id);
      formData.append("user_id", payload.user_id.toString());
      payload.photos.forEach((file) => {
        formData.append("photo", file, file.name);
      });
      const response = await axiosInstance.post(
        API_ENDPOINTS.UploadPropertyImages,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to upload project images";
      console.error("Image upload error:", errorMessage, error);
      return rejectWithValue(errorMessage);
    }
  }
);
export const deletePlacesAroundProperty = createApiThunk<void, { placeid: string; unique_property_id: string }>(
  "upcomingProjects/deletePlacesAroundProperty",
  ({ placeid, unique_property_id }) =>
    axiosInstance.post(API_ENDPOINTS.DELETE_PLACES_AROUND, { placeid, unique_property_id }),
  undefined,
  () => undefined,
  "Failed to delete place around property"
);
export const deletePropertySizes = createApiThunk<void, { unique_property_id: string }>(
  "upcomingProjects/deletePropertySizes",
  ({ unique_property_id }) =>
    axiosInstance.post(`${API_ENDPOINTS.DELETE_PROPERTY_SIZES}?unique_property_id=${encodeURIComponent(unique_property_id)}`),
  undefined,
  () => undefined,
  "Failed to delete property sizes"
);
export const deleteBrochureOrPriceSheet = createApiThunk<void, { key: string; unique_property_id: string }>(
  "upcomingProjects/deleteBroucherOrPriceSheet",
  ({ key, unique_property_id }) =>
    axiosInstance.post(
      `${API_ENDPOINTS.DELETE_BROCHURE_OR_PRICESHEET}?key=${encodeURIComponent(key)}&unique_property_id=${encodeURIComponent(unique_property_id)}`
    ),
  undefined,
  () => undefined,
  "Failed to delete brochure or price sheet"
);
export const createPropertySizes = createApiThunk<
  { size_ids: number[]; floor_plans: string[] },
  { unique_property_id: string; sizes: { buildup_area: number; carpet_area: number; sqft_price?: number; floor_plan?: File }[] }
>(
  "upcomingProjects/createPropertySizes",
  ({ unique_property_id, sizes }) => {
    const formData = new FormData();
    formData.append("unique_property_id", unique_property_id);
    formData.append(
      "sizes",
      JSON.stringify(
        sizes.map(({ floor_plan, ...rest }) => rest)
      )
    );
    sizes.forEach((size) => {
      if (size.floor_plan) {
        formData.append("floor_plans", size.floor_plan);
      }
    });
    return axiosInstance.post(API_ENDPOINTS.CREATE_PROPERTY_SIZES, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  undefined,
  (response) => response.data.data,
  "Failed to create property sizes"
);
export const createAroundThisProperty = createApiThunk<
  { unique_property_id: string },
  { unique_property_id: string; around_property: { title: string; distance: string }[] }
>(
  "upcomingProjects/createAroundThisProperty",
  ({ unique_property_id, around_property }) =>
    axiosInstance.post(API_ENDPOINTS.CREATE_AROUND_PROPERTY, { unique_property_id, around_property }),
  undefined,
  (response) => response.data.data,
  "Failed to create around property entries"
);
export const getPropertySizes = createApiThunk<Size[], { unique_property_id: string }>(
  "upcomingProjects/getPropertySizes",
  ({ unique_property_id }) =>
    axiosInstance.get(`${API_ENDPOINTS.GET_PROPERTY_SIZES}?unique_property_id=${encodeURIComponent(unique_property_id)}`),
  undefined,
  (response) => response.data.data,
  "Failed to fetch property sizes"
);
export const getAroundThisProperty = createApiThunk<
  Array<{ id: string; title: string; distance: string }>,
  { unique_property_id: string }
>(
  "upcomingProjects/getAroundThisProperty",
  ({ unique_property_id }) =>
    axiosInstance.get(`${API_ENDPOINTS.GET_AROUND_PROPERTY}?unique_property_id=${encodeURIComponent(unique_property_id)}`),
  undefined,
  (response) => response.data.data,
  "Failed to fetch around property entries"
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
    clearCurrentProject(state) {
      state.currentProject = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state: UpcomingProjectsState) => {
      state.loading = true;
      state.error = null;
    };
    const handleRejected = (state: UpcomingProjectsState, action: { payload: string | undefined }) => {
      state.loading = false;
      state.error = action.payload || "Operation failed";
    };
    const handleCreatePending = (state: UpcomingProjectsState) => {
      state.createProjectStatus = "loading";
      state.createProjectError = null;
    };
    const handleCreateRejected = (state: UpcomingProjectsState, action: { payload: string | undefined }) => {
      state.createProjectStatus = "failed";
      state.createProjectError = action.payload || "Operation failed";
    };
    builder
      .addCase(getProjectById.pending, handlePending)
      .addCase(getProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
      })
      .addCase(getProjectById.rejected, handleRejected);
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
        state.projects = state.projects.filter((project) => project.unique_property_id !== action.meta.arg);
      })
      .addCase(deleteUpComingProject.rejected, handleRejected);
    builder
      .addCase(createProjectData.pending, handleCreatePending)
      .addCase(createProjectData.fulfilled, (state, action) => {
        state.createProjectStatus = "succeeded";
        const newProject: UpcomingProject = {
          ...action.meta.arg,
          unique_property_id: action.payload.unique_property_id || `TEMP-${Date.now()}`,
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
    }
  })
  .addCase(uploadProjectAssets.rejected, handleCreateRejected);
    builder
      .addCase(deletePlacesAroundProperty.pending, handlePending)
      .addCase(deletePlacesAroundProperty.fulfilled, (state, action) => {
        state.loading = false;
        const { unique_property_id, placeid } = action.meta.arg;
        const project = state.projects.find((p) => p.unique_property_id === unique_property_id);
        if (project && project.around_property) {
          project.around_property = project.around_property.filter((place) => place.placeid !== placeid);
        }
      })
      .addCase(deletePlacesAroundProperty.rejected, handleRejected);
    builder
      .addCase(deletePropertySizes.pending, handlePending)
      .addCase(deletePropertySizes.fulfilled, (state, action) => {
        state.loading = false;
        const project = state.projects.find((p) => p.unique_property_id === action.meta.arg.unique_property_id);
        if (project) {
          project.sizes = [];
        }
      })
      .addCase(deletePropertySizes.rejected, handleRejected);
    builder
      .addCase(deleteBrochureOrPriceSheet.pending, handlePending)
      .addCase(deleteBrochureOrPriceSheet.fulfilled, (state, action) => {
        state.loading = false;
        const { unique_property_id, key } = action.meta.arg;
        const project = state.projects.find((p) => p.unique_property_id === unique_property_id);
        if (project) {
          if (key === "brochure") project.brochure = null;
          if (key === "price_sheet") project.price_sheet = null;
        }
      })
      .addCase(deleteBrochureOrPriceSheet.rejected, handleRejected);
  },
});
export const { resetCreateProjectStatus, resetError, clearCurrentProject } = upcomingProjectsSlice.actions;
export default upcomingProjectsSlice.reducer;
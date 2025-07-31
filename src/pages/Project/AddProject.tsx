import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";
import toast from "react-hot-toast";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Dropdown from "../../components/form/Dropdown";
import DatePicker from "../../components/form/date-picker";
import Select from "../../components/form/Select";
import {
  createProjectData,
  uploadProjectAssets,
  deletePlacesAroundProperty,
  deletePropertySizes,
  createPropertySizes,
  createAroundThisProperty,
  getPropertySizes,
  getAroundThisProperty,
  deleteBrochureOrPriceSheet,
  getProjectById,
  addUpcomingProjectImages,
} from "../../store/slices/upcoming";
import {
  fetchAllCities,
  fetchLocalities,
  fetchAllStates,
} from "../../store/slices/places";
import { AppDispatch, RootState } from "../../store/store";
interface SizeEntry {
  id: string;
  buildupArea: string;
  carpetArea: string;
  floorPlan: File | null;
  sqftPrice?: string;
  size_id?: number;
}
interface AroundPropertyEntry {
  id?: string;
  title: string;
  distance: string;
}
interface FormData {
  state: string;
  city: string;
  locality: string;
  propertyType: string;
  propertySubType: string;
  projectName: string;
  builderName: string;
  brochure: File | null;
  priceSheet: File | null;
  isUpcoming: boolean;
  status: "Under Construction" | "Ready to Move";
  launchType: "Pre Launch" | "Soft Launch" | "Launched";
  launchDate?: string;
  possessionEndDate?: string;
  isReraRegistered: boolean;
  reraNumber: string;
  otpOptions: string[];
}
interface Errors {
  [key: string]: string | undefined;
}
interface Option {
  value: string;
  text: string;
}
interface CreateProjectDataPayload {
  user_id: number;
  unique_property_id: string;
  property_name: string;
  builder_name: string;
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
}
interface UploadProjectAssetsPayload {
  unique_property_id: string;
  size_ids: number[];
  brochure?: File;
  price_sheet?: File;
  floor_plans: File[];
}
interface AddUpcomingProjectImagesPayload {
  unique_property_id: string;
  user_id: number;
  photos: File[];
}
interface UpcomingProject {
  unique_property_id: string;
  property_name: string;
  builder_name: string;
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
  is_rera_registered: number;
  rera_number?: string;
  otp_options?: string[];
  brochure?: string;
  price_sheet?: string;
  sizes?: Array<{
    size_id: number;
    buildup_area: number;
    carpet_area: number;
    sqft_price?: number;
    floor_plan?: string;
  }>;
  gallery?: Array<{
    id: number;
    image: string;
  }>;
}
const FILE_TYPES = {
  assets: ["image/jpeg", "image/png", "application/pdf"],
  images: ["image/jpeg", "image/png", "image/gif"],
};
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ERROR_MESSAGES = {
  required: (field: string) => `${field} is required`,
  invalidFileType: (types: string) => `Only ${types} files are allowed`,
  fileSize: "File size must be less than 20MB",
  number: (field: string) => `${field} must be a number`,
};
const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
};
export default function CreateProperty() {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { cities, states, localities } = useSelector(
    (state: RootState) => state.places
  );
  const { createProjectStatus, currentProject } = useSelector(
    (state: RootState) => state.upcoming
  );
  const userId = Number(localStorage.getItem("userId") || "0");
  const uniquePropertyId = location.state?.unique_property_id as
    | string
    | undefined;
  const isEditMode = !!uniquePropertyId;
  const [formData, setFormData] = useState<FormData>({
    state: "",
    city: "",
    locality: "",
    propertyType: "",
    propertySubType: "",
    projectName: "",
    builderName: "",
    brochure: null,
    priceSheet: null,
    isUpcoming: true,
    status: "Under Construction",
    launchType: "Pre Launch",
    launchDate: "",
    possessionEndDate: "",
    isReraRegistered: false,
    reraNumber: "",
    otpOptions: [],
  });
  const [sizes, setSizes] = useState<SizeEntry[]>([
    {
      id: `${Date.now()}-1`,
      buildupArea: "",
      carpetArea: "",
      floorPlan: null,
      sqftPrice: "",
    },
  ]);
  const [aroundProperty, setAroundProperty] = useState<AroundPropertyEntry[]>(
    []
  );
  const [placeAroundProperty, setPlaceAroundProperty] = useState("");
  const [distanceFromProperty, setDistanceFromProperty] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [isLocalityDropdownOpen, setIsLocalityDropdownOpen] = useState(false);
  const brochureInputRef = useRef<HTMLInputElement>(null);
  const priceSheetInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const localityInputRef = useRef<HTMLDivElement>(null);
  const stateOptions = useMemo(
    () => [
      ...(isEditMode &&
      formData.state &&
      !states.some((s) => s.name === formData.state)
        ? [{ value: formData.state, text: formData.state }]
        : []),
      ...states
        .filter(
          (state) =>
            state.name &&
            typeof state.name === "string" &&
            state.name.trim() !== ""
        )
        .map((state) => ({ value: state.name, text: state.name })),
    ],
    [states, isEditMode, formData.state]
  );
  const cityOptions = useMemo(
    () => [
      ...(isEditMode &&
      formData.city &&
      !cities.some((c) => c.name === formData.city)
        ? [{ value: formData.city, text: formData.city }]
        : []),
      ...cities
        .filter(
          (city) =>
            city.name &&
            typeof city.name === "string" &&
            city.name.trim() !== ""
        )
        .map((city) => ({ value: city.name, text: city.name })),
    ],
    [cities, isEditMode, formData.city]
  );
  const placeOptions = useMemo(
    () => [
      ...(isEditMode &&
      formData.locality &&
      !localities.some((l) => l.locality === formData.locality)
        ? [{ value: formData.locality, text: formData.locality }]
        : []),
      ...localities
        .filter(
          (place) =>
            place.locality &&
            typeof place.locality === "string" &&
            place.locality.trim() !== ""
        )
        .map((place) => ({ value: place.locality, text: place.locality })),
    ],
    [localities, isEditMode, formData.locality]
  );
  const propertyTypeOptions = useMemo(
    () => [
      { value: "Residential", text: "Residential" },
      { value: "Commercial", text: "Commercial" },
    ],
    []
  );
  const residentialSubTypeOptions = useMemo(
    () => [
      { value: "Apartment", text: "Apartment" },
      { value: "Independent House", text: "Independent House" },
      { value: "Independent Villa", text: "Independent Villa" },
      { value: "Plot", text: "Plot" },
      { value: "Land", text: "Land" },
    ],
    []
  );
  const commercialSubTypeOptions = useMemo(
    () => [
      { value: "Office", text: "Office" },
      { value: "Retail Shop", text: "Retail Shop" },
      { value: "Show Room", text: "Show Room" },
      { value: "Warehouse", text: "Warehouse" },
      { value: "Plot", text: "Plot" },
      { value: "Others", text: "Others" },
    ],
    []
  );
  const propertySubTypeOptions = useMemo(
    () =>
      formData.propertyType === "Residential"
        ? residentialSubTypeOptions
        : formData.propertyType === "Commercial"
        ? commercialSubTypeOptions
        : [],
    [formData.propertyType, residentialSubTypeOptions, commercialSubTypeOptions]
  );
  const launchTypeOptions = useMemo(
    () => [
      { value: "Pre Launch", text: "Pre Launch" },
      { value: "Soft Launch", text: "Soft Launch" },
      { value: "Launched", text: "Launched" },
    ],
    []
  );
  const otpOptions = useMemo(
    () => [
      { value: "Regular", text: "Regular" },
      { value: "OTP", text: "OTP" },
      { value: "Offers", text: "Offers" },
      { value: "EMI", text: "EMI" },
    ],
    []
  );
  useEffect(() => {
    dispatch(fetchAllStates()).then((result) => {
      if (fetchAllStates.rejected.match(result))
        toast.error("Failed to load states.");
    });
  }, [dispatch]);
  useEffect(() => {
    if (formData.state) {
      dispatch(fetchAllCities({ state: formData.state })).then((result) => {
        if (fetchAllCities.rejected.match(result))
          toast.error("Failed to load cities.");
      });
    }
  }, [dispatch, formData.state]);
  useEffect(() => {
    if (formData.city && formData.state) {
      dispatch(
        fetchLocalities({ city: formData.city, state: formData.state })
      ).then((result) => {
        if (fetchLocalities.rejected.match(result))
          toast.error("Failed to load localities.");
      });
    }
  }, [dispatch, formData.city, formData.state]);
  useEffect(() => {
    if (isEditMode && uniquePropertyId) {
      dispatch(getProjectById(uniquePropertyId)).then((result) => {
        if (getProjectById.fulfilled.match(result)) {
          const project = result.payload;
          setFormData({
            state: project.state || "",
            city: project.city || "",
            locality: project.location || "",
            propertyType: project.property_type || "",
            propertySubType: project.sub_type || "",
            projectName: project.property_name || "",
            builderName: project.builder_name || "",
            brochure: null,
            priceSheet: null,
            isUpcoming: true,
            status: (project.possession_status ||
              "Under Construction") as FormData["status"],
            launchType: (project.launch_type ||
              "Pre Launch") as FormData["launchType"],
            launchDate: project.launch_date || "",
            possessionEndDate: project.possession_end_date || "",
            isReraRegistered: !!project.is_rera_registered,
            reraNumber: project.rera_number || "",
            otpOptions: project.otp_options?.length ? project.otp_options : [],
          });
          setImagePreviews(project.gallery?.map((img) => img.image) || []);
        } else {
          toast.error(result.payload || "Failed to fetch project details");
        }
      });
      const fetchData = async () => {
        const [sizesResult, aroundResult] = await Promise.all([
          dispatch(getPropertySizes({ unique_property_id: uniquePropertyId })),
          dispatch(
            getAroundThisProperty({ unique_property_id: uniquePropertyId })
          ),
        ]);
        if (getPropertySizes.fulfilled.match(sizesResult)) {
          setSizes(
            sizesResult.payload.map((size, index) => ({
              id: `${uniquePropertyId}-${index}`,
              buildupArea: size.buildup_area?.toString() || "",
              carpetArea: size.carpet_area?.toString() || "",
              floorPlan: null,
              sqftPrice: size.sqft_price?.toString() || "",
              size_id: size.size_id,
            }))
          );
        } else {
          toast.error(sizesResult.payload || "Failed to fetch property sizes");
        }
        if (getAroundThisProperty.fulfilled.match(aroundResult)) {
          setAroundProperty(
            aroundResult.payload.map((entry) => ({
              id: entry.id,
              title: entry.title,
              distance: entry.distance,
            }))
          );
        } else {
          toast.error(
            aroundResult.payload || "Failed to fetch around property entries"
          );
        }
      };
      fetchData();
    }
  }, [dispatch, isEditMode, uniquePropertyId]);
  useEffect(() => {
    if (isEditMode && uniquePropertyId) {
      dispatch(getProjectById(uniquePropertyId));
      dispatch(getPropertySizes({ unique_property_id: uniquePropertyId }));
      dispatch(getAroundThisProperty({ unique_property_id: uniquePropertyId }));
    }
  }, [dispatch, isEditMode, uniquePropertyId]);
  const debouncedFetchLocalities = useCallback(
    debounce((city: string, state: string, query: string) => {
      dispatch(fetchLocalities({ city, state, query }));
    }, 300),
    [dispatch]
  );
  const handleLocalityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const searchTerm = e.target.value;
      setFormData((prev) => ({ ...prev, locality: searchTerm }));
      if (formData.city && formData.state) {
        debouncedFetchLocalities(formData.city, formData.state, searchTerm);
        setIsLocalityDropdownOpen(true);
      }
      setErrors((prev) => ({ ...prev, locality: undefined }));
    },
    [formData.city, formData.state, debouncedFetchLocalities]
  );
  const handleLocalitySelect = useCallback((locality: string) => {
    setFormData((prev) => ({ ...prev, locality }));
    setIsLocalityDropdownOpen(false);
    setErrors((prev) => ({ ...prev, locality: undefined }));
  }, []);
  const handleLocalityFocus = useCallback(() => {
    if (formData.city && formData.state && formData.locality) {
      debouncedFetchLocalities(
        formData.city,
        formData.state,
        formData.locality
      );
      setIsLocalityDropdownOpen(true);
    }
  }, [
    formData.city,
    formData.state,
    formData.locality,
    debouncedFetchLocalities,
  ]);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        localityInputRef.current &&
        !localityInputRef.current.contains(e.target as Node)
      ) {
        setIsLocalityDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setErrors((prev) => ({
      ...prev,
      ...Object.keys(updates).reduce(
        (acc, key) => ({ ...acc, [key]: undefined }),
        {}
      ),
    }));
  }, []);
  const handleFileValidation = useCallback(
    (file: File, type: "assets" | "images") => {
      const validTypes = FILE_TYPES[type];
      if (!validTypes.includes(file.type))
        return ERROR_MESSAGES.invalidFileType(validTypes.join(", "));
      if (file.size > MAX_FILE_SIZE) return ERROR_MESSAGES.fileSize;
      return null;
    },
    []
  );
  const handleFileChange = useCallback(
    (field: keyof FormData | string, type: "assets" | "images") =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        if (type === "images") {
          const invalidFiles = files.filter((file) =>
            handleFileValidation(file, "images")
          );
          if (invalidFiles.length) {
            setErrors((prev) => ({
              ...prev,
              images: handleFileValidation(invalidFiles[0], "images"),
            }));
            return;
          }
          setImages((prev) => {
            const newImages = [...prev, ...files];
            return newImages;
          });
          setImagePreviews((prev) => [
            ...prev,
            ...files.map((file) => URL.createObjectURL(file)),
          ]);
          setErrors((prev) => ({ ...prev, images: undefined }));
          if (imagesInputRef.current) imagesInputRef.current.value = "";
        } else if (type === "assets") {
          const file = files[0];
          const error = handleFileValidation(file, "assets");
          if (error) {
            setErrors((prev) => ({ ...prev, [field]: error }));
            return;
          }
          if (field === "brochure" || field === "priceSheet") {
            updateFormData({ [field]: file });
          } else {
            setSizes((prev) =>
              prev.map((size) =>
                size.id === field ? { ...size, floorPlan: file } : size
              )
            );
            setErrors((prev) => ({ ...prev, sizes: undefined }));
          }
        }
      },
    [updateFormData]
  );
  const handleDeleteFile = useCallback(
    (field: keyof FormData | string) => async () => {
      if (field === "brochure" || field === "priceSheet") {
        if (isEditMode && uniquePropertyId && currentProject?.[field]) {
          const result = await dispatch(
            deleteBrochureOrPriceSheet({
              key: currentProject[field]!,
              unique_property_id: uniquePropertyId,
            })
          );
          if (deleteBrochureOrPriceSheet.fulfilled.match(result)) {
            toast.success(`${field} deleted successfully`);
          } else {
            toast.error(result.payload || `Failed to delete ${field}`);
          }
        }
        updateFormData({ [field]: null });
        if (field === "brochure" && brochureInputRef.current)
          brochureInputRef.current.value = "";
        if (field === "priceSheet" && priceSheetInputRef.current)
          priceSheetInputRef.current.value = "";
      } else {
        setSizes((prev) =>
          prev.map((size) =>
            size.id === field ? { ...size, floorPlan: null } : size
          )
        );
        setErrors((prev) => ({ ...prev, sizes: undefined }));
      }
    },
    [dispatch, isEditMode, uniquePropertyId, currentProject, updateFormData]
  );
  const handleSizeChange = useCallback(
    (id: string, field: keyof SizeEntry) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setSizes((prev) =>
          prev.map((size) =>
            size.id === id ? { ...size, [field]: e.target.value } : size
          )
        );
        setErrors((prev) => ({ ...prev, sizes: undefined }));
      },
    []
  );
  const handleAddSize = useCallback(() => {
    setSizes((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length + 1}`,
        buildupArea: "",
        carpetArea: "",
        floorPlan: null,
        sqftPrice: "",
      },
    ]);
  }, []);
  const handleDeleteSize = useCallback(
    (id: string) => async () => {
      if (isEditMode && uniquePropertyId && sizes.length === 1) {
        const result = await dispatch(
          deletePropertySizes({ unique_property_id: uniquePropertyId })
        );
        if (deletePropertySizes.fulfilled.match(result)) {
          setSizes([]);
          toast.success("Property sizes deleted successfully");
        } else {
          toast.error(result.payload || "Failed to delete property sizes");
        }
      } else {
        setSizes((prev) => prev.filter((size) => size.id !== id));
        toast.success("Size removed successfully");
      }
    },
    [dispatch, isEditMode, uniquePropertyId, sizes.length]
  );
  const handleAddAroundProperty = useCallback(() => {
    if (placeAroundProperty.trim() && distanceFromProperty.trim()) {
      setAroundProperty((prev) => [
        ...prev,
        {
          title: placeAroundProperty.trim(),
          distance: distanceFromProperty.trim(),
        },
      ]);
      setPlaceAroundProperty("");
      setDistanceFromProperty("");
      setErrors((prev) => ({ ...prev, aroundProperty: undefined }));
      toast.success("Around property entry added successfully");
    } else {
      setErrors((prev) => ({
        ...prev,
        aroundProperty: ERROR_MESSAGES.required("Place and distance"),
      }));
      toast.error("Both place and distance are required");
    }
  }, [placeAroundProperty, distanceFromProperty]);
  const handleDeleteAroundProperty = useCallback(
    (index: number) => async () => {
      if (isEditMode && uniquePropertyId && aroundProperty[index].id) {
        const result = await dispatch(
          deletePlacesAroundProperty({
            placeid: aroundProperty[index].id!,
            unique_property_id: uniquePropertyId,
          })
        );
        if (deletePlacesAroundProperty.fulfilled.match(result)) {
          setAroundProperty((prev) => prev.filter((_, i) => i !== index));
          toast.success("Around property entry deleted successfully");
        } else {
          toast.error(
            result.payload || "Failed to delete around property entry"
          );
        }
      } else {
        setAroundProperty((prev) => prev.filter((_, i) => i !== index));
        toast.success("Around property entry removed successfully");
      }
    },
    [dispatch, isEditMode, uniquePropertyId, aroundProperty]
  );
  const handleLaunchDateChange = useCallback(
    (selectedDates: Date[]) => {
      const selectedDate = selectedDates[0];
      const formattedDate = selectedDate
        ? `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${selectedDate
            .getDate()
            .toString()
            .padStart(2, "0")}`
        : "";
      updateFormData({ launchDate: formattedDate });
    },
    [updateFormData]
  );
  const handlePossessionEndDateChange = useCallback(
    (selectedDates: Date[]) => {
      const selectedDate = selectedDates[0];
      const formattedDate = selectedDate
        ? `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${selectedDate
            .getDate()
            .toString()
            .padStart(2, "0")}`
        : "";
      updateFormData({ possessionEndDate: formattedDate });
    },
    [updateFormData]
  );
  const handleOtpOptionsChange = useCallback((option: string) => {
    setFormData((prev) => ({
      ...prev,
      otpOptions: prev.otpOptions.includes(option)
        ? prev.otpOptions.filter((opt) => opt !== option)
        : [...prev.otpOptions, option],
    }));
    setErrors((prev) => ({ ...prev, otpOptions: undefined }));
  }, []);
  const validateForm = useCallback(() => {
    const newErrors: Errors = {};
    const requiredFields: (keyof FormData)[] = [
      "state",
      "city",
      "locality",
      "propertyType",
      "propertySubType",
      "projectName",
      "builderName",
      "launchType",
    ];
    requiredFields.forEach((field) => {
      if (!formData[field].trim())
        newErrors[field] = ERROR_MESSAGES.required(field);
    });
    if (formData.isReraRegistered && !formData.reraNumber.trim())
      newErrors.reraNumber = ERROR_MESSAGES.required("RERA Number");
    if (formData.launchType === "Launched" && !formData.launchDate)
      newErrors.launchDate = ERROR_MESSAGES.required(
        "Launch Date for Launched projects"
      );
    if (formData.status === "Under Construction" && !formData.possessionEndDate)
      newErrors.possessionEndDate = ERROR_MESSAGES.required(
        "Possession End Date for Under Construction projects"
      );
    if (sizes.length === 0)
      newErrors.sizes = ERROR_MESSAGES.required("At least one size entry");
    if (aroundProperty.length === 0)
      newErrors.aroundProperty = ERROR_MESSAGES.required(
        "At least one place around property"
      );
    sizes.forEach((size) => {
      if (!size.buildupArea.trim() || !size.carpetArea.trim())
        newErrors.sizes = ERROR_MESSAGES.required(
          "Buildup Area and Carpet Area for all sizes"
        );
      if (size.sqftPrice && isNaN(Number(size.sqftPrice)))
        newErrors.sizes = ERROR_MESSAGES.number("Square Foot Price");
    });
    aroundProperty.forEach((entry) => {
      if (!entry.title.trim() || !entry.distance.trim())
        newErrors.aroundProperty = ERROR_MESSAGES.required(
          "Place and distance for all around property entries"
        );
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, sizes, aroundProperty]);
  const generateUniqueId = useCallback(
    () => `MO-${Math.floor(100000 + Math.random() * 900000)}`,
    []
  );
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;
      if (!userId) {
        toast.error("User ID is missing. Please log in again.");
        return;
      }
      const projectData: CreateProjectDataPayload = {
        user_id: userId,
        unique_property_id: isEditMode ? uniquePropertyId! : generateUniqueId(),
        property_name: formData.projectName,
        builder_name: formData.builderName,
        state:
          stateOptions.find((s) => s.value === formData.state)?.text ||
          formData.state,
        city:
          cityOptions.find((c) => c.value === formData.city)?.text ||
          formData.city,
        location:
          placeOptions.find((p) => p.value === formData.locality)?.text ||
          formData.locality,
        property_type: formData.propertyType,
        property_for: "Sale",
        sub_type: formData.propertySubType,
        possession_status: formData.status,
        launch_type: formData.launchType,
        launch_date:
          formData.launchType === "Launched" ? formData.launchDate : undefined,
        possession_end_date:
          formData.status === "Under Construction"
            ? formData.possessionEndDate
            : undefined,
        is_rera_registered: formData.isReraRegistered,
        rera_number: formData.isReraRegistered
          ? formData.reraNumber
          : undefined,
        otp_options:
          formData.otpOptions.length > 0 ? formData.otpOptions : undefined,
      };
      try {
        const projectResult = await dispatch(createProjectData(projectData));
        if (!createProjectData.fulfilled.match(projectResult)) {
          toast.error(projectResult.payload || "Failed to save project");
          return;
        }
        const unique_property_id =
          projectResult.payload.unique_property_id ||
          projectData.unique_property_id;
        if (sizes.length > 0) {
          if (isEditMode) {
            const deleteResult = await dispatch(
              deletePropertySizes({ unique_property_id })
            );
            if (!deletePropertySizes.fulfilled.match(deleteResult)) {
              toast.error(
                deleteResult.payload ||
                  "Failed to delete existing property sizes"
              );
              return;
            }
          }
          const sizesData = sizes.map((size) => ({
            buildup_area: Number(size.buildupArea),
            carpet_area: Number(size.carpetArea),
            sqft_price: size.sqftPrice ? Number(size.sqftPrice) : undefined,
          }));
          const sizesResult = await dispatch(
            createPropertySizes({ unique_property_id, sizes: sizesData })
          );
          if (!createPropertySizes.fulfilled.match(sizesResult)) {
            toast.error(sizesResult.payload || "Failed to save property sizes");
            return;
          }
        }
        if (aroundProperty.length > 0) {
          if (isEditMode) {
            for (const entry of aroundProperty) {
              if (entry.id) {
                const deleteResult = await dispatch(
                  deletePlacesAroundProperty({
                    placeid: entry.id,
                    unique_property_id,
                  })
                );
                if (!deletePlacesAroundProperty.fulfilled.match(deleteResult)) {
                  toast.error(
                    deleteResult.payload ||
                      "Failed to delete existing around property entry"
                  );
                  return;
                }
              }
            }
          }
          const aroundPropertyData = aroundProperty.map((entry) => ({
            title: entry.title,
            distance: entry.distance,
          }));
          const aroundResult = await dispatch(
            createAroundThisProperty({
              unique_property_id,
              around_property: aroundPropertyData,
            })
          );
          if (!createAroundThisProperty.fulfilled.match(aroundResult)) {
            toast.error(
              aroundResult.payload || "Failed to save around property entries"
            );
            return;
          }
        }
        if (
          formData.brochure ||
          formData.priceSheet ||
          sizes.some((s) => s.floorPlan)
        ) {
          const uploadPayload: UploadProjectAssetsPayload = {
            unique_property_id,
            size_ids: sizes.length > 0 ? projectResult.payload.size_ids : [],
            brochure: formData.brochure || undefined,
            price_sheet: formData.priceSheet || undefined,
            floor_plans: sizes
              .filter((s) => s.floorPlan)
              .map((s) => s.floorPlan!),
          };
          const uploadResult = await dispatch(
            uploadProjectAssets(uploadPayload)
          );
          if (!uploadProjectAssets.fulfilled.match(uploadResult)) {
            toast.error(
              uploadResult.payload || "Failed to upload project assets"
            );
            return;
          }
        }
        if (images.length > 0) {
          const imagesPayload: AddUpcomingProjectImagesPayload = {
            unique_property_id,
            user_id: Number(userId),
            photos: images,
          };
          const imagesResult = await dispatch(
            addUpcomingProjectImages(imagesPayload)
          );
          if (!addUpcomingProjectImages.fulfilled.match(imagesResult)) {
            console.error("Image upload error:", imagesResult.payload);
            toast.error(
              imagesResult.payload || "Failed to upload project images"
            );
            return;
          }
          toast.success("Project images uploaded successfully");
        }
        toast.success(
          isEditMode
            ? "Project updated successfully"
            : "Project created successfully"
        );
        if (!isEditMode) {
          setFormData({
            state: "",
            city: "",
            locality: "",
            propertyType: "",
            propertySubType: "",
            projectName: "",
            builderName: "",
            brochure: null,
            priceSheet: null,
            isUpcoming: true,
            status: "Under Construction",
            launchType: "Pre Launch",
            launchDate: "",
            possessionEndDate: "",
            isReraRegistered: false,
            reraNumber: "",
            otpOptions: [],
          });
          setSizes([
            {
              id: `${Date.now()}-1`,
              buildupArea: "",
              carpetArea: "",
              floorPlan: null,
              sqftPrice: "",
            },
          ]);
          setAroundProperty([]);
          setPlaceAroundProperty("");
          setDistanceFromProperty("");
          setImages([]);
          setImagePreviews([]);
        }
      } catch (error) {
        console.error("Submit error:", error);
        toast.error("Error saving project");
      }
    },
    [
      dispatch,
      formData,
      sizes,
      aroundProperty,
      images,
      userId,
      isEditMode,
      uniquePropertyId,
      stateOptions,
      cityOptions,
      placeOptions,
      validateForm,
      generateUniqueId,
    ]
  );
  return (
    <ComponentCard title={isEditMode ? "Edit Property" : "Create Property"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="min-h-[80px]">
          <Label htmlFor="projectName">Project Name *</Label>
          <Input
            type="text"
            id="projectName"
            value={formData.projectName}
            onChange={(e) => updateFormData({ projectName: e.target.value })}
            placeholder="Enter project name"
            className="dark:bg-gray-800"
          />
          {errors.projectName && (
            <p className="text-red-500 text-sm mt-1">{errors.projectName}</p>
          )}
        </div>
        
        <div className="min-h-[80px]">
          <Label htmlFor="builderName">Builder Name *</Label>
          <Input
            type="text"
            id="builderName"
            value={formData.builderName}
            onChange={(e) => updateFormData({ builderName: e.target.value })}
            placeholder="Enter builder name"
            className="dark:bg-gray-800"
          />
          {errors.builderName && (
            <p className="text-red-500 text-sm mt-1">{errors.builderName}</p>
          )}
        </div>
        
        <Dropdown
          id="state"
          label="Select State *"
          options={stateOptions}
          value={formData.state}
          onChange={(value, text) =>
            updateFormData({ state: value, city: "", locality: "" })
          }
          placeholder="Search for a state..."
          error={errors.state}
        />
        
        <Dropdown
          id="city"
          label="Select City *"
          options={cityOptions}
          value={formData.city}
          onChange={(value, text) =>
            updateFormData({ city: value, locality: "" })
          }
          placeholder="Search for a city..."
          disabled={!formData.state}
          error={errors.city}
        />
        
        <div className="min-h-[80px] relative" ref={localityInputRef}>
          <Label htmlFor="locality">Select Place *</Label>
          <Input
            type="text"
            id="locality"
            value={formData.locality}
            onChange={handleLocalityChange}
            onFocus={handleLocalityFocus}
            placeholder="Search for a place..."
            disabled={!formData.city}
            className="dark:bg-gray-800"
          />
          {isLocalityDropdownOpen && formData.city && (
            <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
              {placeOptions.length > 0 ? (
                placeOptions.map((option) => (
                  <li
                    key={option.value}
                    onClick={() => handleLocalitySelect(option.value)}
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    {option.text}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No places found
                </li>
              )}
            </ul>
          )}
          {errors.locality && (
            <p className="text-red-500 text-sm mt-1">{errors.locality}</p>
          )}
        </div>
        
        <div className="min-h-[80px]">
          <Label htmlFor="propertyType">Property Type *</Label>
          <div className="flex space-x-4">
            {propertyTypeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  updateFormData({
                    propertyType: option.value,
                    propertySubType: "",
                  })
                }
                className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                  formData.propertyType === option.value
                    ? "bg-[#1D3A76] text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                }`}
              >
                {option.text}
              </button>
            ))}
          </div>
          {errors.propertyType && (
            <p className="text-red-500 text-sm mt-1">{errors.propertyType}</p>
          )}
        </div>
        
        <div className="min-h-[80px]">
          <Label htmlFor="propertySubType">Property Sub Type *</Label>
          <div className="flex flex-wrap gap-4">
            {propertySubTypeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  updateFormData({ propertySubType: option.value })
                }
                className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                  formData.propertySubType === option.value
                    ? "bg-[#1D3A76] text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                }`}
              >
                {option.text}
              </button>
            ))}
          </div>
          {errors.propertySubType && (
            <p className="text-red-500 text-sm mt-1">
              {errors.propertySubType}
            </p>
          )}
        </div>
        
        <div className="min-h-[80px]">
          <Label htmlFor="status">Construction Status *</Label>
          <div className="flex space-x-4">
            {["Under Construction", "Ready to Move"].map((statusOption) => (
              <button
                key={statusOption}
                type="button"
                onClick={() =>
                  updateFormData({
                    status: statusOption as FormData["status"],
                    ...(statusOption === "Ready to Move" &&
                    formData.launchType !== "Launched"
                      ? { launchDate: "" }
                      : {}),
                  })
                }
                className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                  formData.status === statusOption
                    ? "bg-[#1D3A76] text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                }`}
              >
                {statusOption}
              </button>
            ))}
          </div>
        </div>
        
        <div className="min-h-[80px] w-full max-w-md">
          <Label htmlFor="launchType">Launch Type *</Label>
          <Select
            id="launchType"
            options={launchTypeOptions}
            value={formData.launchType}
            onChange={(value) =>
              updateFormData({ launchType: value as FormData["launchType"] })
            }
            placeholder="Select launch type..."
            error={errors.launchType}
          />
          {errors.launchType && (
            <p className="text-red-500 text-sm mt-1">{errors.launchType}</p>
          )}
        </div>
        
        {formData.launchType === "Launched" && (
          <div className="min-h-[80px] w-full max-w-md">
            <DatePicker
              id="launchDate"
              label="Launch Date"
              placeholder="Select launch date"
              defaultDate={formData.launchDate || undefined}
              onChange={handleLaunchDateChange}
            />
            {errors.launchDate && (
              <p className="text-red-500 text-sm mt-1">{errors.launchDate}</p>
            )}
          </div>
        )}
        
        {formData.status === "Under Construction" && (
          <div className="min-h-[80px] w-full max-w-md">
            <DatePicker
              id="possessionEndDate"
              label="Possession End Date"
              placeholder="Select possession end date"
              defaultDate={formData.possessionEndDate || undefined}
              onChange={handlePossessionEndDateChange}
            />
            {errors.possessionEndDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.possessionEndDate}
              </p>
            )}
          </div>
        )}
        
        <div className="min-h-[80px]">
          <Label htmlFor="isReraRegistered">Is this RERA Registered?</Label>
          <div className="flex space-x-4 mb-5">
            <button
              type="button"
              onClick={() => updateFormData({ isReraRegistered: true })}
              className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                formData.isReraRegistered
                  ? "bg-[#1D3A76] text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() =>
                updateFormData({ isReraRegistered: false, reraNumber: "" })
              }
              className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                !formData.isReraRegistered
                  ? "bg-[#1D3A76] text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
              }`}
            >
              No
            </button>
          </div>
        </div>
        
        {formData.isReraRegistered && (
          <div className="min-h-[80px] w-full max-w-md">
            <Label htmlFor="reraNumber">RERA Number *</Label>
            <Input
              type="text"
              id="reraNumber"
              value={formData.reraNumber}
              onChange={(e) => updateFormData({ reraNumber: e.target.value })}
              placeholder="Enter RERA number"
              className="dark:bg-gray-800"
            />
            {errors.reraNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.reraNumber}</p>
            )}
          </div>
        )}
        
        <div className="min-h-[80px]">
          <Label htmlFor="otpOptions">Payment Modes</Label>
          <div className="flex flex-wrap gap-4">
            {otpOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOtpOptionsChange(option.value)}
                className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                  formData.otpOptions.includes(option.value)
                    ? "bg-[#1D3A76] text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                }`}
              >
                {option.text}
              </button>
            ))}
          </div>
          {errors.otpOptions && (
            <p className="text-red-500 text-sm mt-1">{errors.otpOptions}</p>
          )}
        </div>
        
        <div className="space-y-4">
          <Label htmlFor="sizes">Sizes *</Label>
          {sizes.map((size) => (
            <div
              key={size.id}
              className="relative grid grid-cols-1 md:grid-cols-4 gap-4 border p-4 rounded-md"
            >
              <button
                type="button"
                onClick={handleDeleteSize(size.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                title="Delete Size"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="min-h-[80px]">
                <Label htmlFor={`buildupArea-${size.id}`}>
                  Buildup Area (sq.ft) *
                </Label>
                <Input
                  type="text"
                  id={`buildupArea-${size.id}`}
                  value={size.buildupArea}
                  onChange={handleSizeChange(size.id, "buildupArea")}
                  placeholder="Enter buildup area"
                  className="dark:bg-gray-800"
                />
              </div>
              <div className="min-h-[80px]">
                <Label htmlFor={`carpetArea-${size.id}`}>
                  Carpet Area (sq.ft) *
                </Label>
                <Input
                  type="text"
                  id={`carpetArea-${size.id}`}
                  value={size.carpetArea}
                  onChange={handleSizeChange(size.id, "carpetArea")}
                  placeholder="Enter carpet area"
                  className="dark:bg-gray-800"
                />
              </div>
              <div className="min-h-[80px]">
                <Label htmlFor={`sqftPrice-${size.id}`}>
                  Square Foot Price
                </Label>
                <Input
                  type="text"
                  id={`sqftPrice-${size.id}`}
                  value={size.sqftPrice}
                  onChange={handleSizeChange(size.id, "sqftPrice")}
                  placeholder="Enter square foot price"
                  className="dark:bg-gray-800"
                />
              </div>
              <div className="min-h-[80px]">
                <Label>Floor Plan</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    id={`floorPlan-${size.id}`}
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleFileChange(size.id, "assets")}
                    ref={(el) => (fileInputRefs.current[size.id] = el)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[size.id]?.click()}
                    className="px-2 py-2 text-sm font-semibold text-white bg-[#1D3A76] rounded-md hover:bg-blue-900"
                  >
                    Choose File
                  </button>
                  {size.floorPlan && (
                    <button
                      type="button"
                      onClick={handleDeleteFile(size.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  )}
                  <span className="text-sm text-gray-500 truncate max-w-[200px]">
                    {size.floorPlan?.name ||
                      (isEditMode &&
                        size.size_id &&
                        currentProject?.sizes
                          ?.find((s) => s.size_id === size.size_id)
                          ?.floor_plan?.split("/")
                          .pop()) ||
                      "No file chosen"}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {errors.sizes && (
            <p className="text-red-500 text-sm mt-1">{errors.sizes}</p>
          )}
          <button
            type="button"
            onClick={handleAddSize}
            className="px-4 py-2 text-white bg-[#1D3A76] rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Size
          </button>
        </div>
        
        <div className="space-y-4">
          <Label htmlFor="aroundProperty" className="mt-4">
            Around This Property *
          </Label>
          <div className="flex space-x-6 my-4 w-full">
            <Input
              type="text"
              id="aroundProperty-place"
              placeholder="Place around property"
              value={placeAroundProperty}
              onChange={(e) => setPlaceAroundProperty(e.target.value)}
              className="dark:bg-gray-800"
            />
            <Input
              type="text"
              id="aroundProperty-distance"
              placeholder="Distance from property"
              value={distanceFromProperty}
              onChange={(e) => setDistanceFromProperty(e.target.value)}
              className="dark:bg-gray-800"
            />
            <button
              type="button"
              onClick={handleAddAroundProperty}
              className="px-4 py-2 bg-[#1D3A76] text-white rounded-lg hover:bg-blue-900 transition-colors duration-200 w-[20%]"
            >
              Add
            </button>
          </div>
          {errors.aroundProperty && (
            <p className="text-red-500 text-sm mt-1">{errors.aroundProperty}</p>
          )}
          {aroundProperty.length > 0 && (
            <div className="mt-4">
              <ul className="space-y-2">
                {aroundProperty.map((entry, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
                  >
                    <span>
                      {entry.title} - {entry.distance}
                      {isEditMode && entry.id && (
                        <span className="text-gray-500 text-sm ml-2">
                          (ID: {entry.id})
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={handleDeleteAroundProperty(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <Label>Upload Brochure</Label>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              id="brochure"
              ref={brochureInputRef}
              accept="image/jpeg,image/png,application/pdf"
              onChange={handleFileChange("brochure", "assets")}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => brochureInputRef.current?.click()}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#1D3A76] rounded-md hover:bg-blue-900"
            >
              Choose File
            </button>
            {(formData.brochure ||
              (isEditMode && currentProject?.brochure)) && (
              <button
                type="button"
                onClick={handleDeleteFile("brochure")}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            )}
            <span className="text-sm text-gray-500">
              {formData.brochure?.name ||
                (isEditMode && currentProject?.brochure?.split("/").pop()) ||
                "No file chosen"}
            </span>
          </div>
          {errors.brochure && (
            <p className="text-red-500 text-sm mt-1">{errors.brochure}</p>
          )}
          <div className="min-h-[80px] flex items-end">
            {formData.brochure ? (
              formData.brochure.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(formData.brochure)}
                  alt="Brochure Preview"
                  className="max-w-[100px] max-h-[100px] object-contain"
                />
              ) : (
                <p className="text-sm text-gray-500 truncate">
                  {formData.brochure.name}
                </p>
              )
            ) : isEditMode && currentProject?.brochure ? (
              currentProject.brochure.endsWith(".pdf") ? (
                <p className="text-sm text-gray-500 truncate">
                  {currentProject.brochure.split("/").pop()}
                </p>
              ) : (
                <img
                  src={currentProject.brochure}
                  alt="Brochure Preview"
                  className="max-w-[100px] max-h-[100px] object-contain"
                />
              )
            ) : (
              <p className="text-sm text-gray-400"></p>
            )}
          </div>
        </div>
        
        <div className="space-y-1">
          <Label>Upload Price Sheet</Label>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              id="priceSheet"
              ref={priceSheetInputRef}
              accept="image/jpeg,image/png,application/pdf"
              onChange={handleFileChange("priceSheet", "assets")}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => priceSheetInputRef.current?.click()}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#1D3A76] rounded-md hover:bg-blue-900"
            >
              Choose File
            </button>
            {(formData.priceSheet ||
              (isEditMode && currentProject?.price_sheet)) && (
              <button
                type="button"
                onClick={handleDeleteFile("priceSheet")}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            )}
            <span className="text-sm text-gray-500">
              {formData.priceSheet?.name ||
                (isEditMode && currentProject?.price_sheet?.split("/").pop()) ||
                "No file chosen"}
            </span>
          </div>
          {errors.priceSheet && (
            <p className="text-red-500 text-sm mt-1">{errors.priceSheet}</p>
          )}
          <div className="min-h-[80px] flex items-end">
            {formData.priceSheet ? (
              formData.priceSheet.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(formData.priceSheet)}
                  alt="Price Sheet Preview"
                  className="max-w-[100px] max-h-[100px] object-contain"
                />
              ) : (
                <p className="text-sm text-gray-500 truncate">
                  {formData.priceSheet.name}
                </p>
              )
            ) : isEditMode && currentProject?.price_sheet ? (
              currentProject.price_sheet.endsWith(".pdf") ? (
                <p className="text-sm text-gray-500 truncate">
                  {currentProject.price_sheet.split("/").pop()}
                </p>
              ) : (
                <img
                  src={currentProject.price_sheet}
                  alt="Price Sheet Preview"
                  className="max-w-[100px] max-h-[100px] object-contain"
                />
              )
            ) : (
              <p className="text-sm text-gray-400"></p>
            )}
          </div>
        </div>
        
        <div className="space-y-1">
          <Label>Upload Project Images</Label>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              id="projectImages"
              ref={imagesInputRef}
              accept="image/jpeg,image/png,image/gif"
              onChange={handleFileChange("images", "images")}
              multiple
              className="hidden"
            />
            <button
              type="button"
              onClick={() => imagesInputRef.current?.click()}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#1D3A76] rounded-md hover:bg-blue-900"
            >
              Choose Images
            </button>
          </div>
          {errors.images && (
            <p className="text-red-500 text-sm mt-1">{errors.images}</p>
          )}
          {(images.length > 0 || (isEditMode && imagePreviews.length > 0)) && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Project Image ${index + 1}`}
                    className="w-full h-[100px] object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImages((prev) => prev.filter((_, i) => i !== index));
                      setImagePreviews((prev) =>
                        prev.filter((_, i) => i !== index)
                      );
                      setErrors((prev) => ({ ...prev, images: undefined }));
                    }}
                    className="absolute top-1 right-1 text-red-500 hover:text-red-700 bg-white rounded-full p-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={createProjectStatus === "loading"}
            className="w-[60%] px-4 py-2 text-white bg-[#1D3A76] rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {createProjectStatus === "loading"
              ? "Submitting..."
              : isEditMode
              ? "Update"
              : "Submit"}
          </button>
        </div>
      </form>
    </ComponentCard>
  );
}

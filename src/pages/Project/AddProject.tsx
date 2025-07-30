import React, { useCallback, useEffect, useRef, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Dropdown from "../../components/form/Dropdown";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import DatePicker from "../../components/form/date-picker";
import Select from "../../components/form/Select";
import {
  createProjectData,
  uploadProjectAssets,
  resetCreateProjectStatus,
  deletePlacesAroundProperty,
  deletePropertySizes,
  deleteBroucherOrPriceSheet,
  createPropertySizes,
  createAroundThisProperty,
  getPropertySizes,
  getAroundThisProperty,
} from "../../store/slices/upcoming";
import {
  fetchAllCities,
  fetchLocalities,
  fetchAllStates,
} from "../../store/slices/places";
import { useLocation } from "react-router";
import toast from "react-hot-toast";

// Update interfaces
interface SizeEntry {
  id: string;
  buildupArea: string;
  carpetArea: string;
  floorPlan: File | null;
  sqftPrice?: string;
  size_id?: number;
}

interface AroundPropertyEntry {
  id?: string; // Changed from placeid to id to match API response
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
  state?: string;
  city?: string;
  locality?: string;
  propertyType?: string;
  propertySubType?: string;
  projectName?: string;
  builderName?: string;
  brochure?: string;
  priceSheet?: string;
  launchType?: string;
  launchDate?: string;
  possessionEndDate?: string;
  reraNumber?: string;
  otpOptions?: string;
  sizes?: string; // For general size errors
  aroundProperty?: string; // For general around property errors
}

interface CreateProjectDataPayload {
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
}

export default function CreateProperty() {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { cities, states, localities } = useSelector(
    (state: RootState) => state.places
  );
  const { createProjectStatus, createProjectError } = useSelector(
    (state: RootState) => state.upcoming
  );
  const project = location.state?.project as UpcomingProject | undefined;
  const isEditMode = !!project;

  // Separate states for sizes and aroundProperty
  const [sizes, setSizes] = useState<SizeEntry[]>([]);
  const [aroundProperty, setAroundProperty] = useState<AroundPropertyEntry[]>(
    []
  );
  const [placeAroundProperty, setPlaceAroundProperty] = useState("");
  const [distanceFromProperty, setDistanceFromProperty] = useState("");

  const [formData, setFormData] = useState<FormData>(() => {
    if (isEditMode && project) {
      return {
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
        status: project.possession_status as
          | "Under Construction"
          | "Ready to Move",
        launchType: project.launch_type as
          | "Pre Launch"
          | "Soft Launch"
          | "Launched",
        launchDate: project.launch_date || "",
        possessionEndDate: project.possession_end_date || "",
        isReraRegistered: !!project.is_rera_registered,
        reraNumber: project.rera_number || "",
        otpOptions: project.otp_options?.length ? project.otp_options : [],
      };
    }
    return {
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
    };
  });

  const [errors, setErrors] = useState<Errors>({});
  const brochureInputRef = useRef<HTMLInputElement>(null);
  const priceSheetInputRef = useRef<HTMLInputElement>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const localityInputRef = useRef<HTMLDivElement>(null);
  const [isLocalityDropdownOpen, setIsLocalityDropdownOpen] = useState(false);

  // Fetch sizes and aroundProperty in edit mode
  useEffect(() => {
    if (isEditMode && project?.unique_property_id) {
      // Fetch property sizes
      dispatch(
        getPropertySizes({ unique_property_id: project.unique_property_id })
      ).then((result) => {
        if (getPropertySizes.fulfilled.match(result)) {
          setSizes(
            result.payload.map((size, index) => ({
              id: `${project.unique_property_id}-${index}`,
              buildupArea: size.buildup_area?.toString() || "",
              carpetArea: size.carpet_area?.toString() || "",
              floorPlan: null,
              sqftPrice: size.sqft_price?.toString() || "",
              size_id: size.size_id,
            }))
          );
        } else {
          toast.error(result.payload || "Failed to fetch property sizes");
        }
      });

      // Fetch around property entries
      dispatch(
        getAroundThisProperty({
          unique_property_id: project.unique_property_id,
        })
      ).then((result) => {
        if (getAroundThisProperty.fulfilled.match(result)) {
          setAroundProperty(
            result.payload.map((entry) => ({
              id: entry.id,
              title: entry.title,
              distance: entry.distance,
            }))
          );
        } else {
          toast.error(
            result.payload || "Failed to fetch around property entries"
          );
        }
      });
    } else {
      // Initialize with one empty size in create mode
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
    }
  }, [dispatch, isEditMode, project]);

  const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: any[]) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(...args);
        timeout = null;
      }, wait);
    };
  };

  const city = formData.city;
  const state = formData.state;
  const debouncedFetchLocalities = useCallback(
    debounce((city: string, state: string, query: string) => {
      dispatch(fetchLocalities({ city, state, query }));
    }, 300),
    [dispatch]
  );

  useEffect(() => {
    dispatch(fetchAllStates());
  }, [dispatch]);

  useEffect(() => {
    if (formData.state) {
      dispatch(fetchAllCities({ state: formData.state }));
    }
  }, [dispatch, formData.state]);

  useEffect(() => {
    if (formData.city) {
      dispatch(fetchLocalities({ city: formData.city, state: formData.state }));
    }
  }, [dispatch, formData.city, formData.state]);

  const handleLocalityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const searchTerm = e.target.value;
      setFormData((prev) => ({
        ...prev,
        locality: searchTerm,
      }));
      if (city) {
        debouncedFetchLocalities(city, state, searchTerm);
        setIsLocalityDropdownOpen(true);
      }
      if (errors.locality) {
        setErrors((prev) => ({ ...prev, locality: undefined }));
      }
    },
    [city, state, debouncedFetchLocalities, errors.locality]
  );

  const handleLocalitySelect = useCallback(
    (locality: string) => {
      setFormData((prev) => ({
        ...prev,
        locality,
      }));
      setIsLocalityDropdownOpen(false);
      if (errors.locality) {
        setErrors((prev) => ({ ...prev, locality: undefined }));
      }
    },
    [errors.locality]
  );

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
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleLocalityFocus = () => {
    if (city && formData.locality) {
      debouncedFetchLocalities(city, state, formData.locality);
      setIsLocalityDropdownOpen(true);
    }
  };

  // Remove alert-based feedback, rely on toasts
  useEffect(() => {
    if (createProjectStatus === "succeeded") {
      toast.success(
        isEditMode
          ? "Project updated successfully!"
          : "Project created successfully!"
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
      }
      dispatch(resetCreateProjectStatus());
    } else if (createProjectStatus === "failed" && createProjectError) {
      toast.error(`Error: ${createProjectError}`);
      dispatch(resetCreateProjectStatus());
    }
  }, [createProjectStatus, createProjectError, dispatch, isEditMode]);

  const stateOptions: Option[] =
    states.map((state: any) => ({
      value: state.name,
      text: state.name,
    })) || [];

  const cityOptions: Option[] =
    cities.map((city: any) => ({
      value: city.name,
      text: city.name,
    })) || [];

  const placeOptions: Option[] =
    localities.map((place: any) => ({
      value: place.locality,
      text: place.locality,
    })) || [];

  const propertyTypeOptions: SelectOption[] = [
    { value: "Residential", label: "Residential" },
    { value: "Commercial", label: "Commercial" },
  ];

  const residentialSubTypeOptions: SelectOption[] = [
    { value: "Apartment", label: "Apartment" },
    { value: "Independent House", label: "Independent House" },
    { value: "Independent Villa", label: "Independent Villa" },
    { value: "Plot", label: "Plot" },
    { value: "Land", label: "Land" },
  ];

  const commercialSubTypeOptions: SelectOption[] = [
    { value: "Office", label: "Office" },
    { value: "Retail Shop", label: "Retail Shop" },
    { value: "Show Room", label: "Show Room" },
    { value: "Warehouse", label: "Warehouse" },
    { value: "Plot", label: "Plot" },
    { value: "Others", label: "Others" },
  ];

  const propertySubTypeOptions =
    formData.propertyType === "Residential"
      ? residentialSubTypeOptions
      : formData.propertyType === "Commercial"
      ? commercialSubTypeOptions
      : [];

  const launchTypeOptions: SelectOption[] = [
    { value: "Pre Launch", label: "Pre Launch" },
    { value: "Soft Launch", label: "Soft Launch" },
    { value: "Launched", label: "Launched" },
  ];

  const otpOptions: SelectOption[] = [
    { value: "Regular", label: "Regular" },
    { value: "OTP", label: "OTP" },
    { value: "Offers", label: "Offers" },
    { value: "EMI", label: "EMI" },
  ];

  const handleDropdownChange =
    (field: "state" | "city" | "locality" | "launchType") =>
    (value: string, text: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        ...(field === "state" && { city: "", locality: "" }),
        ...(field === "city" && { locality: "" }),
      }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSelectChange =
    (field: "propertyType" | "propertySubType") => (value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        ...(field === "propertyType" && { propertySubType: "" }),
      }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleInputChange =
    (field: "projectName" | "builderName" | "reraNumber") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSizeChange =
    (id: string, field: "buildupArea" | "carpetArea" | "sqftPrice") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSizes((prev) =>
        prev.map((size) =>
          size.id === id ? { ...size, [field]: e.target.value } : size
        )
      );
      if (errors.sizes) {
        setErrors((prev) => ({ ...prev, sizes: undefined }));
      }
    };

  const handleFileChange =
    (id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      if (file) {
        const validFileTypes = ["image/jpeg", "image/png", "application/pdf"];
        if (!validFileTypes.includes(file.type)) {
          setErrors((prev) => ({
            ...prev,
            sizes: "Only JPEG, PNG, or PDF files are allowed for floor plans",
          }));
          return;
        }
        if (file.size > 20 * 1024 * 1024) {
          setErrors((prev) => ({
            ...prev,
            sizes: "Floor plan file size must be less than 20MB",
          }));
          return;
        }
      }
      setSizes((prev) =>
        prev.map((size) =>
          size.id === id ? { ...size, floorPlan: file } : size
        )
      );
      if (errors.sizes) {
        setErrors((prev) => ({ ...prev, sizes: undefined }));
      }
    };

  const handleBrochureButtonClick = () => {
    brochureInputRef.current?.click();
  };

  const handleBrochureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const validFileTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!validFileTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          brochure: "Only JPEG, PNG, or PDF files are allowed",
        }));
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          brochure: "File size must be less than 20MB",
        }));
        return;
      }
    }
    setFormData((prev) => ({ ...prev, brochure: file }));
    setErrors((prev) => ({ ...prev, brochure: undefined }));
  };

  const handleDeleteBrochure = () => {
    if (isEditMode && project?.brochure) {
      dispatch(
        deleteBroucherOrPriceSheet({
          key: project.brochure,
          unique_property_id: project.unique_property_id,
        })
      ).then((result) => {
        if (deleteBroucherOrPriceSheet.fulfilled.match(result)) {
          toast.success("Brochure deleted successfully");
        } else {
          toast.error(result.payload || "Failed to delete brochure");
        }
      });
    } else {
      toast.success("Brochure removed successfully");
    }
    setFormData((prev) => ({ ...prev, brochure: null }));
    setErrors((prev) => ({ ...prev, brochure: undefined }));
    if (brochureInputRef.current) {
      brochureInputRef.current.value = "";
    }
  };

  const handleDeleteFile = (id: string) => () => {
    setSizes((prev) =>
      prev.map((size) => (size.id === id ? { ...size, floorPlan: null } : size))
    );
    if (errors.sizes) {
      setErrors((prev) => ({ ...prev, sizes: undefined }));
    }
  };

  const handlePriceSheetButtonClick = () => {
    priceSheetInputRef.current?.click();
  };

  const handlePriceSheetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const validFileTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!validFileTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          priceSheet: "Only JPEG, PNG, or PDF files are allowed",
        }));
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          priceSheet: "File size must be less than 20MB",
        }));
        return;
      }
    }
    setFormData((prev) => ({ ...prev, priceSheet: file }));
    setErrors((prev) => ({ ...prev, priceSheet: undefined }));
  };

  const handleDeletePriceSheet = () => {
    if (isEditMode && project?.price_sheet) {
      dispatch(
        deleteBroucherOrPriceSheet({
          key: project.price_sheet,
          unique_property_id: project.unique_property_id,
        })
      ).then((result) => {
        if (deleteBroucherOrPriceSheet.fulfilled.match(result)) {
          toast.success("Price sheet deleted successfully");
        } else {
          toast.error(result.payload || "Failed to delete price sheet");
        }
      });
    } else {
      toast.success("Price sheet removed successfully");
    }
    setFormData((prev) => ({ ...prev, priceSheet: null }));
    setErrors((prev) => ({ ...prev, priceSheet: undefined }));
    if (priceSheetInputRef.current) {
      priceSheetInputRef.current.value = "";
    }
  };

  const handleDeleteSize = (id: string) => async () => {
    if (isEditMode && project && sizes.length === 1) {
      const result = await dispatch(
        deletePropertySizes({
          unique_property_id: project.unique_property_id,
        })
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
  };

  const handleAddSize = () => {
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
  };

  const handleAddAroundProperty = () => {
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
        aroundProperty: "Both place and distance are required",
      }));
      toast.error("Both place and distance are required");
    }
  };

  const handleDeleteAroundProperty = (index: number) => async () => {
    if (isEditMode && project && aroundProperty[index].id) {
      const result = await dispatch(
        deletePlacesAroundProperty({
          placeid: aroundProperty[index].id!,
          unique_property_id: project.unique_property_id,
        })
      );
      if (deletePlacesAroundProperty.fulfilled.match(result)) {
        setAroundProperty((prev) => prev.filter((_, i) => i !== index));
        toast.success("Around property entry deleted successfully");
      } else {
        toast.error(result.payload || "Failed to delete around property entry");
      }
    } else {
      setAroundProperty((prev) => prev.filter((_, i) => i !== index));
      toast.success("Around property entry removed successfully");
    }
  };

  const handleLaunchDateChange = (selectedDates: Date[]) => {
    const selectedDate = selectedDates[0];
    const formattedDate = selectedDate
      ? `${selectedDate.getFullYear()}-${String(
          selectedDate.getMonth() + 1
        ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
      : "";
    setFormData((prev) => ({
      ...prev,
      launchDate: formattedDate,
    }));
    setErrors((prev) => ({ ...prev, launchDate: undefined }));
  };

  const handlePossessionEndDateChange = (selectedDates: Date[]) => {
    const selectedDate = selectedDates[0];
    const formattedDate = selectedDate
      ? `${selectedDate.getFullYear()}-${String(
          selectedDate.getMonth() + 1
        ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
      : "";
    setFormData((prev) => ({
      ...prev,
      possessionEndDate: formattedDate,
    }));
    setErrors((prev) => ({ ...prev, possessionEndDate: undefined }));
  };

  const handleOtpOptionsChange = (option: string) => {
    setFormData((prev) => ({
      ...prev,
      otpOptions: prev.otpOptions.includes(option)
        ? prev.otpOptions.filter((opt) => opt !== option)
        : [...prev.otpOptions, option],
    }));
    setErrors((prev) => ({ ...prev, otpOptions: undefined }));
  };

  const validateForm = () => {
    let newErrors: Errors = {};
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.locality) newErrors.locality = "Locality is required";
    if (!formData.propertyType)
      newErrors.propertyType = "Property Type is required";
    if (!formData.propertySubType)
      newErrors.propertySubType = "Property Sub Type is required";
    if (!formData.projectName.trim())
      newErrors.projectName = "Project Name is required";
    if (!formData.builderName.trim())
      newErrors.builderName = "Builder Name is required";
    if (!formData.launchType) newErrors.launchType = "Launch Type is required";
    if (formData.isReraRegistered && !formData.reraNumber.trim())
      newErrors.reraNumber = "RERA Number is required if RERA registered";
    if (formData.launchType === "Launched" && !formData.launchDate)
      newErrors.launchDate = "Launch Date is required for Launched projects";
    if (formData.status === "Under Construction" && !formData.possessionEndDate)
      newErrors.possessionEndDate =
        "Possession End Date is required for Under Construction projects";
    if (sizes.length === 0)
      newErrors.sizes = "At least one size entry is required";
    if (aroundProperty.length === 0)
      newErrors.aroundProperty =
        "At least one place around property is required";
    sizes.forEach((size) => {
      if (!size.buildupArea.trim() || !size.carpetArea.trim()) {
        newErrors.sizes =
          "Buildup Area and Carpet Area are required for all sizes";
      }
      if (size.sqftPrice && isNaN(Number(size.sqftPrice))) {
        newErrors.sizes = "Square Foot Price must be a number for all sizes";
      }
    });
    aroundProperty.forEach((entry) => {
      if (!entry.title.trim() || !entry.distance.trim()) {
        newErrors.aroundProperty =
          "Place and distance are required for all around property entries";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateUniqueId = () =>
    `MO-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const stateName =
      stateOptions.find((option) => option.value === formData.state)?.text ||
      formData.state;
    const cityName =
      cityOptions.find((option) => option.value === formData.city)?.text ||
      formData.city;
    const localityName =
      placeOptions.find((option) => option.value === formData.locality)?.text ||
      formData.locality;

    const projectData: CreateProjectDataPayload = {
      unique_property_id: isEditMode
        ? project!.unique_property_id
        : generateUniqueId(),
      property_name: formData.projectName,
      builder_name: formData.builderName,
      state: stateName,
      city: cityName,
      location: localityName,
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
      rera_number: formData.isReraRegistered ? formData.reraNumber : undefined,
      otp_options:
        formData.otpOptions.length > 0 ? formData.otpOptions : undefined,
    };

    try {
      const projectResult = await dispatch(createProjectData(projectData));
      if (createProjectData.fulfilled.match(projectResult)) {
        const { unique_property_id } = projectResult.payload;
        toast.success(
          isEditMode
            ? "Project data updated successfully"
            : "Project data created successfully"
        );

        // Handle sizes
        if (sizes.length > 0) {
          // In edit mode, delete existing sizes before adding new ones
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
          if (createPropertySizes.fulfilled.match(sizesResult)) {
            toast.success("Property sizes saved successfully");
          } else {
            toast.error(sizesResult.payload || "Failed to save property sizes");
            return;
          }
        }

        // Handle around property entries
        if (aroundProperty.length > 0) {
          // In edit mode, delete existing around property entries before adding new ones
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
          if (createAroundThisProperty.fulfilled.match(aroundResult)) {
            toast.success("Around property entries saved successfully");
          } else {
            toast.error(
              aroundResult.payload || "Failed to save around property entries"
            );
            return;
          }
        }

        // Handle asset uploads
        if (
          formData.brochure ||
          formData.priceSheet ||
          sizes.some((s) => s.floorPlan)
        ) {
          const uploadPayload: UploadProjectAssetsPayload = {
            unique_property_id,
            size_ids: sizes.length > 0 ? projectResult.payload.size_ids : [], // Use size_ids if available
            brochure: formData.brochure || undefined,
            price_sheet: formData.priceSheet || undefined,
            floor_plans: sizes
              .filter((s) => s.floorPlan)
              .map((s) => s.floorPlan!),
          };
          const uploadResult = await dispatch(
            uploadProjectAssets(uploadPayload)
          );
          if (uploadProjectAssets.fulfilled.match(uploadResult)) {
            toast.success("Project assets uploaded successfully");
          } else {
            toast.error(
              uploadResult.payload || "Failed to upload project assets"
            );
          }
        }
      } else {
        toast.error(projectResult.payload || "Failed to save project");
      }
    } catch (error) {
      toast.error("Error saving project");
    }
  };

  // JSX remains mostly the same, update sizes and aroundProperty sections
  return (
    <ComponentCard title={isEditMode ? "Edit Property" : "Create Property"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Existing form fields for project details */}
        <div className="min-h-[80px]">
          <Label htmlFor="projectName">Project Name *</Label>
          <Input
            type="text"
            id="projectName"
            value={formData.projectName}
            onChange={handleInputChange("projectName")}
            placeholder="Enter project name"
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
            onChange={handleInputChange("builderName")}
            placeholder="Enter builder name"
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
          onChange={handleDropdownChange("state")}
          placeholder="Search for a state..."
          error={errors.state}
        />
        <Dropdown
          id="city"
          label="Select City *"
          options={cityOptions}
          value={formData.city}
          onChange={handleDropdownChange("city")}
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
                onClick={() => handleSelectChange("propertyType")(option.value)}
                className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                  formData.propertyType === option.value
                    ? "bg-[#1D3A76] text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                }`}
              >
                {option.label}
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
                  handleSelectChange("propertySubType")(option.value)
                }
                className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                  formData.propertySubType === option.value
                    ? "bg-[#1D3A76] text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                }`}
              >
                {option.label}
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
                  setFormData({
                    ...formData,
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
              handleDropdownChange("launchType")(value, value)
            }
            placeholder="Select launch type..."
            error={errors.launchType}
          />
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
              onClick={() =>
                setFormData({ ...formData, isReraRegistered: true })
              }
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
                setFormData({
                  ...formData,
                  isReraRegistered: false,
                  reraNumber: "",
                })
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
              onChange={handleInputChange("reraNumber")}
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
                {option.label}
              </button>
            ))}
          </div>
          {errors.otpOptions && (
            <p className="text-red-500 text-sm mt-1">{errors.otpOptions}</p>
          )}
        </div>
        <div className="space-y-4">
          <Label htmlFor="sizes">Sizes *</Label>
          {sizes.map((size, index) => (
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
                    onChange={handleFileChange(size.id)}
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
                        project?.sizes
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
              onChange={handleBrochureChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleBrochureButtonClick}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#1D3A76] rounded-md hover:bg-blue-900"
            >
              Choose File
            </button>
            {(formData.brochure || (isEditMode && project?.brochure)) && (
              <button
                type="button"
                onClick={handleDeleteBrochure}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            )}
            <span className="text-sm text-gray-500">
              {formData.brochure?.name ||
                (isEditMode && project?.brochure?.split("/").pop()) ||
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
            ) : isEditMode && project?.brochure ? (
              project.brochure.endsWith(".pdf") ? (
                <p className="text-sm text-gray-500 truncate">
                  {project.brochure.split("/").pop()}
                </p>
              ) : (
                <img
                  src={project.brochure}
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
              onChange={handlePriceSheetChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={handlePriceSheetButtonClick}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#1D3A76] rounded-md hover:bg-blue-900"
            >
              Choose File
            </button>
            {(formData.priceSheet || (isEditMode && project?.price_sheet)) && (
              <button
                type="button"
                onClick={handleDeletePriceSheet}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            )}
            <span className="text-sm text-gray-500">
              {formData.priceSheet?.name ||
                (isEditMode && project?.price_sheet?.split("/").pop()) ||
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
            ) : isEditMode && project?.price_sheet ? (
              project.price_sheet.endsWith(".pdf") ? (
                <p className="text-sm text-gray-500 truncate">
                  {project.price_sheet.split("/").pop()}
                </p>
              ) : (
                <img
                  src={project.price_sheet}
                  alt="Price Sheet Preview"
                  className="max-w-[100px] max-h-[100px] object-contain"
                />
              )
            ) : (
              <p className="text-sm text-gray-400"></p>
            )}
          </div>
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={createProjectStatus === "loading"}
            className={`w-[60%] px-4 py-2 text-white bg-[#1D3A76] rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50`}
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

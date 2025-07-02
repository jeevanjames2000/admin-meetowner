import React, { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Dropdown from "../../components/form/Dropdown"; // Adjust the import path
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { getCities, getStates } from "../../store/slices/propertyDetails";

// Define interfaces
interface SelectOption {
  value: string;
  label: string;
}

interface Option {
  value: string;
  text: string;
}

interface SizeEntry {
  id: string;
  buildupArea: string;
  carpetArea: string;
  floorPlan: File | null;
}

interface AroundPropertyEntry {
  place: string;
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
  sizes: SizeEntry[];
  aroundProperty: AroundPropertyEntry[];
}

interface Errors {
  state?: string;
  city?: string;
  locality?: string;
  propertyType?: string;
  propertySubType?: string;
  projectName?: string;
  builderName?: string;
  sizes?: {
    [key: string]: {
      buildupArea?: string;
      carpetArea?: string;
      floorPlan?: string;
    };
  };
  aroundProperty?: string;
}

export default function CreateProperty() {
  const dispatch = useDispatch<AppDispatch>();
  const { cities, states } = useSelector((state: RootState) => state.property);

  const [formData, setFormData] = useState<FormData>({
    state: "",
    city: "",
    locality: "",
    propertyType: "",
    propertySubType: "",
    projectName: "",
    builderName: "",
    sizes: [
      {
        id: `${Date.now()}-1`,
        buildupArea: "",
        carpetArea: "",
        floorPlan: null,
      },
    ],
    aroundProperty: [],
  });

  const [errors, setErrors] = useState<Errors>({});
  const [placeAroundProperty, setPlaceAroundProperty] = useState("");
  const [distanceFromProperty, setDistanceFromProperty] = useState("");

  useEffect(() => {
    dispatch(getCities());
    dispatch(getStates());
  }, [dispatch]);

  // Mock locality options (replace with actual API if available)
  const localityOptions: Option[] = [
    { value: "locality1", text: "Locality 1" },
    { value: "locality2", text: "Locality 2" },
    { value: "locality3", text: "Locality 3" },
  ];

  const cityOptions: Option[] =
    cities?.map((city: any) => ({
      value: city.value,
      text: city.label,
    })) || [];

  const stateOptions: Option[] =
    states?.map((state: any) => ({
      value: state.value,
      text: state.label,
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

  const handleDropdownChange =
    (field: "state" | "city" | "locality") => (value: string, text: string) => {
      setFormData({
        ...formData,
        [field]: value,
        ...(field === "state" && { city: "", locality: "" }),
        ...(field === "city" && { locality: "" }),
      });
      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined });
      }
    };

  const handleSelectChange =
    (field: "propertyType" | "propertySubType") => (value: string) => {
      const newFormData = {
        ...formData,
        [field]: value,
        ...(field === "propertyType" && { propertySubType: "" }),
      };
      setFormData(newFormData);
      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined });
      }
    };

  const handleInputChange =
    (field: "projectName" | "builderName") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined });
      }
    };

  const handleSizeChange =
    (id: string, field: "buildupArea" | "carpetArea") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        sizes: formData.sizes.map((size) =>
          size.id === id ? { ...size, [field]: e.target.value } : size
        ),
      });
      if (errors.sizes?.[id]?.[field]) {
        setErrors({
          ...errors,
          sizes: {
            ...errors.sizes,
            [id]: { ...errors.sizes?.[id], [field]: undefined },
          },
        });
      }
    };

  const handleFileChange =
    (id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setFormData({
        ...formData,
        sizes: formData.sizes.map((size) =>
          size.id === id ? { ...size, floorPlan: file } : size
        ),
      });
      if (errors.sizes?.[id]?.floorPlan) {
        setErrors({
          ...errors,
          sizes: {
            ...errors.sizes,
            [id]: { ...errors.sizes?.[id], floorPlan: undefined },
          },
        });
      }
    };

  const handleDeleteFile = (id: string) => () => {
    setFormData({
      ...formData,
      sizes: formData.sizes.map((size) =>
        size.id === id ? { ...size, floorPlan: null } : size
      ),
    });
  };

  const handleDeleteSize = (id: string) => () => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((size) => size.id !== id),
    });
    setErrors({
      ...errors,
      sizes: Object.fromEntries(
        Object.entries(errors.sizes || {}).filter(([key]) => key !== id)
      ),
    });
  };

  const handleAddSize = () => {
    setFormData({
      ...formData,
      sizes: [
        ...formData.sizes,
        {
          id: `${Date.now()}-${formData.sizes.length + 1}`,
          buildupArea: "",
          carpetArea: "",
          floorPlan: null,
        },
      ],
    });
  };

  const handleAddAroundProperty = () => {
    if (placeAroundProperty.trim() && distanceFromProperty.trim()) {
      setFormData({
        ...formData,
        aroundProperty: [
          ...formData.aroundProperty,
          {
            place: placeAroundProperty.trim(),
            distance: distanceFromProperty.trim(),
          },
        ],
      });
      setPlaceAroundProperty("");
      setDistanceFromProperty("");
      if (errors.aroundProperty) {
        setErrors({ ...errors, aroundProperty: undefined });
      }
    } else {
      setErrors({
        ...errors,
        aroundProperty: "Both place and distance are required",
      });
    }
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
    if (formData.aroundProperty.length === 0)
      newErrors.aroundProperty =
        "At least one place around property is required";

    const sizeErrors: {
      [key: string]: {
        buildupArea?: string;
        carpetArea?: string;
        floorPlan?: string;
      };
    } = {};
    formData.sizes.forEach((size) => {
      const errorsForSize: {
        buildupArea?: string;
        carpetArea?: string;
        floorPlan?: string;
      } = {};
      if (!size.buildupArea.trim())
        errorsForSize.buildupArea = "Buildup Area is required";
      if (!size.carpetArea.trim())
        errorsForSize.carpetArea = "Carpet Area is required";
      if (!size.floorPlan) errorsForSize.floorPlan = "Floor Plan is required";
      if (Object.keys(errorsForSize).length > 0) {
        sizeErrors[size.id] = errorsForSize;
      }
    });

    if (Object.keys(sizeErrors).length > 0) {
      newErrors.sizes = sizeErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const stateName =
        stateOptions.find((option) => option.value === formData.state)?.text ||
        formData.state;
      const cityName =
        cityOptions.find((option) => option.value === formData.city)?.text ||
        formData.city;
      const localityName =
        localityOptions.find((option) => option.value === formData.locality)
          ?.text || formData.locality;

      const propertyData = {
        state: stateName,
        city: cityName,
        locality: localityName,
        propertyType: formData.propertyType,
        propertySubType: formData.propertySubType,
        projectName: formData.projectName,
        builderName: formData.builderName,
        sizes: formData.sizes.map((size) => ({
          buildupArea: size.buildupArea,
          carpetArea: size.carpetArea,
          floorPlan: size.floorPlan ? size.floorPlan.name : null,
        })),
        aroundProperty: formData.aroundProperty,
      };
    }
  };

  return (
    <ComponentCard title="Create Property">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Dropdown
          id="state"
          label="Select State"
          options={stateOptions}
          value={formData.state}
          onChange={(value, text) => handleDropdownChange("state")(value, text)}
          placeholder="Search for a state..."
          error={errors.state}
        />

        <Dropdown
          id="city"
          label="Select City"
          options={cityOptions}
          value={formData.city}
          onChange={(value, text) => handleDropdownChange("city")(value, text)}
          placeholder="Search for a city..."
          disabled={!formData.state}
          error={errors.city}
        />

        <Dropdown
          id="locality"
          label="Select Locality"
          options={localityOptions}
          value={formData.locality}
          onChange={(value, text) =>
            handleDropdownChange("locality")(value, text)
          }
          placeholder="Search for a locality..."
          disabled={!formData.city}
          error={errors.locality}
        />

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

        {formData.propertyType && (
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
        )}

        <div className="min-h-[80px]">
          <Label htmlFor="projectName">Project Name</Label>
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
          <Label htmlFor="builderName">Builder Name</Label>
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

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sizes</h3>
          {formData.sizes.map((size, index) => (
            <div
              key={size.id}
              className="relative grid grid-cols-1 md:grid-cols-4 gap-4 border p-4 rounded-md"
            >
              {index > 0 && (
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
              )}
              <div className="min-h-[80px]">
                <Label htmlFor={`buildupArea-${size.id}`}>
                  Buildup Area (sq.ft)
                </Label>
                <Input
                  type="text"
                  id={`buildupArea-${size.id}`}
                  value={size.buildupArea}
                  onChange={handleSizeChange(size.id, "buildupArea")}
                  placeholder="Enter buildup area"
                />
                {errors.sizes?.[size.id]?.buildupArea && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.sizes[size.id].buildupArea}
                  </p>
                )}
              </div>

              <div className="min-h-[80px]">
                <Label htmlFor={`carpetArea-${size.id}`}>
                  Carpet Area (sq.ft)
                </Label>
                <Input
                  type="text"
                  id={`carpetArea-${size.id}`}
                  value={size.carpetArea}
                  onChange={handleSizeChange(size.id, "carpetArea")}
                  placeholder="Enter carpet area"
                />
                {errors.sizes?.[size.id]?.carpetArea && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.sizes[size.id].carpetArea}
                  </p>
                )}
              </div>

              <div className="min-h-[80px]">
                <Label htmlFor={`floorPlan-${size.id}`}>Floor Plan</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    id={`floorPlan-${size.id}`}
                    accept="image/*,application/pdf"
                    onChange={handleFileChange(size.id)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#1D3A76] file:text-white hover:file:bg-blue-700"
                  />
                  {size.floorPlan && (
                    <button
                      type="button"
                      onClick={handleDeleteFile(size.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
                {errors.sizes?.[size.id]?.floorPlan && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.sizes[size.id].floorPlan}
                  </p>
                )}
              </div>

              <div className="min-h-[80px] flex items-end">
                {size.floorPlan ? (
                  size.floorPlan.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(size.floorPlan)}
                      alt="Floor Plan Preview"
                      className="max-w-[100px] max-h-[100px] object-contain"
                    />
                  ) : (
                    <p className="text-sm text-gray-500 truncate">
                      {size.floorPlan.name}
                    </p>
                  )
                ) : (
                  <p className="text-sm text-gray-400">No file selected</p>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddSize}
            className="px-4 py-2 text-white bg-[#1D3A76] rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Size
          </button>
        </div>

        <div>
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
              className="dark:bg-gray-800 "
            />
            <Input
              type="text"
              id="aroundProperty-distance"
              placeholder="Distance from property"
              value={distanceFromProperty}
              onChange={(e) => setDistanceFromProperty(e.target.value)}
              className="dark:bg-gray-800 "
            />
            <button
              type="button"
              onClick={handleAddAroundProperty}
              className="px-4 py-2 bg-[#1D3A76] text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 w-[20%]"
            >
              Add
            </button>
          </div>
          {errors.aroundProperty && (
            <p className="text-red-500 text-sm mt-1">{errors.aroundProperty}</p>
          )}
          {formData.aroundProperty.length > 0 && (
            <div className="mt-4">
              <ul className="space-y-2">
                {formData.aroundProperty.map((entry, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
                  >
                    <span>
                      {entry.place} - {entry.distance}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          aroundProperty: formData.aroundProperty.filter(
                            (_, i) => i !== index
                          ),
                        })
                      }
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

        <div className="flex justify-center">
          <button
            type="submit"
            className="w-[60%] px-4 py-2 text-white bg-[#1D3A76] rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </form>
    </ComponentCard>
  );
}

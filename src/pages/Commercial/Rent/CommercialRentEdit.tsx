import { useState, ChangeEvent, FormEvent } from "react";
import ComponentCard from "../../../components/common/ComponentCard";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PropertyLocationFields from "../../Residential/components/propertyLocationFields";
import MediaUploadSection from "../../Residential/components/MediaUploadSection";
import DatePicker from "../../../components/form/date-picker";

// Define the type for the Around Property entries
interface AroundProperty {
  place: string;
  distance: string;
}

// Define the type for the form data
interface CommercialRentFormData {
  propertyType: "Residential" | "Commercial";
  lookingTo: "Sell" | "Rent" | "PG-Co-living";
  location: string;
  propertySubType: "Office" | "Retail Shop" | "Show Room" | "Warehouse" | "Plot" | "Others";
  passengerLifts: string;
  serviceLifts: string;
  stairCases: string;
  privateParking: string;
  publicParking: string;
  privateWashrooms: string;
  publicWashrooms: string;
  availableFrom: string;
  monthlyRent: string;
  maintenanceCharge: string;
  securityDeposit: string;
  lockInPeriod: string;
  chargeBrokerage: "None" | "15 Days" | "30 Days"; // Updated type
  areaUnits: "Sq.ft" | "Sq.yd" | "Acres";
  builtUpArea: string;
  carpetArea: string;
  totalProjectArea: string;
  plotArea: string;
  lengthArea: string;
  widthArea: string;
  facilities: string[];
  flatNo: string;
  zoneType: "Industrial" | "Commercial" | "Special Economic Zone" | "Open Spaces" | "Agricultural Zone" | "Other";
  suitable: "Jewellery" | "Grocery" | "Clinic" | "Footwear" | "Electronics" | "Clothing" | "Others";
  facing: "East" | "West" | "South" | "North" | "";
  carParking: "0" | "1" | "2" | "3" | "4+";
  bikeParking: "0" | "1" | "2" | "3" | "4+";
  openParking: "0" | "1" | "2" | "3" | "4+";
  aroundProperty: AroundProperty[];
  pantryRoom: "Yes" | "No";
  propertyDescription: string;
  city: string;
  propertyName: string;
  locality: string;
  floorNo: string;
  totalFloors: string;
  photos: File[];
  video: File | null;
  floorPlan: File | null;
  featuredImageIndex: number | null;
}

// Define the type for the Select options
interface SelectOption {
  value: string;
  label: string;
}

const CommercialRentEdit: React.FC = () => {
  const [formData, setFormData] = useState<CommercialRentFormData>({
    propertyType: "Commercial",
    lookingTo: "Rent",
    location: "",
    propertySubType: "Office",
    passengerLifts: "",
    serviceLifts: "",
    stairCases: "",
    privateParking: "",
    publicParking: "",
    privateWashrooms: "",
    publicWashrooms: "",
    availableFrom: "",
    monthlyRent: "",
    maintenanceCharge: "",
    securityDeposit: "",
    lockInPeriod: "",
    chargeBrokerage: "None", // Updated to match new options
    areaUnits: "Sq.ft",
    builtUpArea: "",
    carpetArea: "",
    totalProjectArea: "",
    plotArea: "",
    lengthArea: "",
    widthArea: "",
    facilities: [],
    flatNo: "",
    zoneType: "Commercial",
    suitable: "Others",
    facing: "",
    carParking: "0",
    bikeParking: "0",
    openParking: "0",
    aroundProperty: [],
    pantryRoom: "No",
    propertyDescription: "",
    city: "",
    propertyName: "",
    locality: "",
    floorNo: "",
    totalFloors: "",
    photos: [],
    video: null,
    floorPlan: null,
    featuredImageIndex: null,
  });

  const [errors, setErrors] = useState({
    propertyType: "",
    lookingTo: "",
    propertySubType: "",
    passengerLifts: "",
    serviceLifts: "",
    stairCases: "",
    privateParking: "",
    publicParking: "",
    privateWashrooms: "",
    publicWashrooms: "",
    availableFrom: "",
    monthlyRent: "",
    maintenanceCharge: "",
    securityDeposit: "",
    lockInPeriod: "",
    chargeBrokerage: "",
    builtUpArea: "",
    carpetArea: "",
    totalProjectArea: "",
    plotArea: "",
    lengthArea: "",
    widthArea: "",
    flatNo: "",
    zoneType: "",
    suitable: "",
    aroundProperty: "",
    pantryRoom: "",
    propertyDescription: "",
    city: "",
    propertyName: "",
    locality: "",
    floorNo: "",
    totalFloors: "",
    photos: "",
    video: "",
    floorPlan: "",
    featuredImage: "",
  });

  // State for Around Property inputs
  const [placeAroundProperty, setPlaceAroundProperty] = useState("");
  const [distanceFromProperty, setDistanceFromProperty] = useState("");

  const propertyTypeOptions: SelectOption[] = [
    { value: "Residential", label: "Residential" },
    { value: "Commercial", label: "Commercial" },
  ];

  const lookingToOptions: SelectOption[] = [
    { value: "Sell", label: "Sell" },
    { value: "Rent", label: "Rent" },
    { value: "PG-Co-living", label: "PG-Co-living" },
  ];

  const propertySubTypeOptions: SelectOption[] = [
    { value: "Office", label: "Office" },
    { value: "Retail Shop", label: "Retail Shop" },
    { value: "Show Room", label: "Show Room" },
    { value: "Warehouse", label: "Warehouse" },
    { value: "Plot", label: "Plot" },
    { value: "Others", label: "Others" },
  ];

  const areaUnitsOptions: SelectOption[] = [
    { value: "Sq.ft", label: "Sq.ft" },
    { value: "Sq.yd", label: "Sq.yd" },
    { value: "Acres", label: "Acres" },
  ];

  const zoneTypeOptions: SelectOption[] = [
    { value: "Industrial", label: "Industrial" },
    { value: "Commercial", label: "Commercial" },
    { value: "Special Economic Zone", label: "Special Economic Zone" },
    { value: "Open Spaces", label: "Open Spaces" },
    { value: "Agricultural Zone", label: "Agricultural Zone" },
    { value: "Other", label: "Other" },
  ];

  const suitableOptions: SelectOption[] = [
    { value: "Jewellery", label: "Jewellery" },
    { value: "Grocery", label: "Grocery" },
    { value: "Clinic", label: "Clinic" },
    { value: "Footwear", label: "Footwear" },
    { value: "Electronics", label: "Electronics" },
    { value: "Clothing", label: "Clothing" },
    { value: "Others", label: "Others" },
  ];

  const carParkingOptions: SelectOption[] = [
    { value: "0", label: "0" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4+", label: "4+" },
  ];

  const bikeParkingOptions: SelectOption[] = [
    { value: "0", label: "0" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4+", label: "4+" },
  ];

  const openParkingOptions: SelectOption[] = [
    { value: "0", label: "0" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4+", label: "4+" },
  ];

  const securityDepositOptions: SelectOption[] = [
    { value: "1 Month", label: "1 Month" },
    { value: "2 Months", label: "2 Months" },
    { value: "3 Months", label: "3 Months" },
  ];

  const lockInPeriodOptions: SelectOption[] = [
    { value: "1 Month", label: "1 Month" },
    { value: "2 Months", label: "2 Months" },
    { value: "3 Months", label: "3 Months" },
  ];

  const chargeBrokerageOptions: SelectOption[] = [
    { value: "None", label: "None" },
    { value: "15 Days", label: "15 Days" },
    { value: "30 Days", label: "30 Days" },
  ];

  const facilitiesOptions: string[] = [
    "Lift",
    "CCTV",
    "Gym",
    "Garden",
    "Club House",
    "Sports",
    "Swimming Pool",
    "Intercom",
    "Power Backup",
    "Gated Community",
    "Regular Water",
    "Community Hall",
    "Pet Allowed",
    "Entry / Exit",
    "Outdoor Fitness Station",
    "Half Basket Ball Court",
    "Gazebo",
    "Badminton Court",
    "Children Play Area",
    "Ample Greenery",
    "Water Harvesting Pit",
    "Water Softner",
    "Solar Fencing",
    "Security Cabin",
    "Lawn",
    "Transformer Yard",
    "Amphitheatre",
    "Lawn with Stepping Stones",
    "None",
  ];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validation for address details
    if (name === "city") {
      if (!value) {
        setErrors((prev) => ({ ...prev, city: "City is required" }));
      } else {
        setErrors((prev) => ({ ...prev, city: "" }));
      }
    }

    if (name === "propertyName") {
      if (!value) {
        setErrors((prev) => ({ ...prev, propertyName: "Property name is required" }));
      } else {
        setErrors((prev) => ({ ...prev, propertyName: "" }));
      }
    }

    if (name === "locality") {
      if (!value) {
        setErrors((prev) => ({ ...prev, locality: "Locality is required" }));
      } else {
        setErrors((prev) => ({ ...prev, locality: "" }));
      }
    }

    if (name === "flatNo") {
      if (!value) {
        setErrors((prev) => ({ ...prev, flatNo: "Flat number is required" }));
      } else {
        setErrors((prev) => ({ ...prev, flatNo: "" }));
      }
    }

    if (name === "floorNo") {
      if (!value) {
        setErrors((prev) => ({ ...prev, floorNo: "Floor number is required" }));
      } else {
        setErrors((prev) => ({ ...prev, floorNo: "" }));
      }
    }

    if (name === "totalFloors") {
      if (!value) {
        setErrors((prev) => ({ ...prev, totalFloors: "Total floors is required" }));
      } else {
        setErrors((prev) => ({ ...prev, totalFloors: "" }));
      }
    }

    // Validation for Built-up Area
    if (name === "builtUpArea") {
      if (!value) {
        setErrors((prev) => ({
          ...prev,
          builtUpArea: "Built-up area is required",
        }));
      } else {
        setErrors((prev) => ({ ...prev, builtUpArea: "" }));
      }
    }

    // Validation for Total Project Area
    if (name === "totalProjectArea") {
      if (!value) {
        setErrors((prev) => ({
          ...prev,
          totalProjectArea: "Total project area is required",
        }));
      } else {
        setErrors((prev) => ({ ...prev, totalProjectArea: "" }));
      }
    }

    // Validation for Monthly Rent
    if (name === "monthlyRent") {
      if (!value) {
        setErrors((prev) => ({
          ...prev,
          monthlyRent: "Monthly rent is required",
        }));
      } else {
        setErrors((prev) => ({ ...prev, monthlyRent: "" }));
      }
    }

    // Validation for Property Description
    if (name === "propertyDescription") {
      if (!value) {
        setErrors((prev) => ({
          ...prev,
          propertyDescription: "Property description is required",
        }));
      } else {
        setErrors((prev) => ({ ...prev, propertyDescription: "" }));
      }
    }
  };

  const handleSelectChange = (name: keyof CommercialRentFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validation for required select fields
    if (name === "propertyType" && !value) {
      setErrors((prev) => ({ ...prev, propertyType: "Property type is required" }));
    } else if (name === "propertyType") {
      setErrors((prev) => ({ ...prev, propertyType: "" }));
    }

    if (name === "lookingTo" && !value) {
      setErrors((prev) => ({ ...prev, lookingTo: "Looking to is required" }));
    } else if (name === "lookingTo") {
      setErrors((prev) => ({ ...prev, lookingTo: "" }));
    }

    if (name === "propertySubType" && !value) {
      setErrors((prev) => ({ ...prev, propertySubType: "Property sub type is required" }));
    } else if (name === "propertySubType") {
      setErrors((prev) => ({ ...prev, propertySubType: "" }));
    }

    if (name === "zoneType" && !value) {
      setErrors((prev) => ({ ...prev, zoneType: "Zone type is required" }));
    } else if (name === "zoneType") {
      setErrors((prev) => ({ ...prev, zoneType: "" }));
    }

    if (name === "suitable" && !value) {
      setErrors((prev) => ({ ...prev, suitable: "Suitable for is required" }));
    } else if (name === "suitable") {
      setErrors((prev) => ({ ...prev, suitable: "" }));
    }

    if (name === "securityDeposit" && !value) {
      setErrors((prev) => ({ ...prev, securityDeposit: "Security deposit is required" }));
    } else if (name === "securityDeposit") {
      setErrors((prev) => ({ ...prev, securityDeposit: "" }));
    }

    if (name === "lockInPeriod" && !value) {
      setErrors((prev) => ({ ...prev, lockInPeriod: "Lock in period is required" }));
    } else if (name === "lockInPeriod") {
      setErrors((prev) => ({ ...prev, lockInPeriod: "" }));
    }

    if (name === "chargeBrokerage" && !value) {
      setErrors((prev) => ({ ...prev, chargeBrokerage: "Brokerage charge is required" }));
    } else if (name === "chargeBrokerage") {
      setErrors((prev) => ({ ...prev, chargeBrokerage: "" }));
    }

    if (name === "pantryRoom" && !value) {
      setErrors((prev) => ({ ...prev, pantryRoom: "Pantry room is required" }));
    } else if (name === "pantryRoom") {
      setErrors((prev) => ({ ...prev, pantryRoom: "" }));
    }
  };

  const handleFacilityChange = (facility: string) => {
    setFormData((prev) => {
      const updatedFacilities = prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility];
      return { ...prev, facilities: updatedFacilities };
    });
  };

  const handleAddAroundProperty = () => {
    if (placeAroundProperty && distanceFromProperty) {
      setFormData((prev) => ({
        ...prev,
        aroundProperty: [
          ...prev.aroundProperty,
          { place: placeAroundProperty, distance: distanceFromProperty },
        ],
      }));
      setPlaceAroundProperty("");
      setDistanceFromProperty("");
      setErrors((prev) => ({ ...prev, aroundProperty: "" }));
    } else {
      setErrors((prev) => ({
        ...prev,
        aroundProperty: "Both place and distance are required",
      }));
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate all required fields before submission
    const newErrors: any = {};

    if (!formData.propertyType) {
      newErrors.propertyType = "Property type is required";
    }
    if (!formData.lookingTo) {
      newErrors.lookingTo = "Looking to is required";
    }
    if (!formData.propertySubType) {
      newErrors.propertySubType = "Property sub type is required";
    }
    if (
      (formData.propertySubType === "Office" ||
        formData.propertySubType === "Retail Shop" ||
        formData.propertySubType === "Show Room") &&
      !formData.passengerLifts
    ) {
      newErrors.passengerLifts = "Passenger lifts are required";
    }
    if (
      (formData.propertySubType === "Office" ||
        formData.propertySubType === "Retail Shop" ||
        formData.propertySubType === "Show Room") &&
      !formData.serviceLifts
    ) {
      newErrors.serviceLifts = "Service lifts are required";
    }
    if (
      (formData.propertySubType === "Office" ||
        formData.propertySubType === "Retail Shop" ||
        formData.propertySubType === "Show Room") &&
      !formData.stairCases
    ) {
      newErrors.stairCases = "Stair cases are required";
    }
    if (
      (formData.propertySubType === "Office" ||
        formData.propertySubType === "Retail Shop" ||
        formData.propertySubType === "Show Room") &&
      !formData.privateParking
    ) {
      newErrors.privateParking = "Private parking is required";
    }
    if (
      (formData.propertySubType === "Office" ||
        formData.propertySubType === "Retail Shop" ||
        formData.propertySubType === "Show Room") &&
      !formData.publicParking
    ) {
      newErrors.publicParking = "Public parking is required";
    }
    if (
      (formData.propertySubType === "Office" ||
        formData.propertySubType === "Retail Shop" ||
        formData.propertySubType === "Show Room") &&
      !formData.privateWashrooms
    ) {
      newErrors.privateWashrooms = "Private washrooms are required";
    }
    if (
      (formData.propertySubType === "Office" ||
        formData.propertySubType === "Retail Shop" ||
        formData.propertySubType === "Show Room") &&
      !formData.publicWashrooms
    ) {
      newErrors.publicWashrooms = "Public washrooms are required";
    }
    if (
      (formData.propertySubType === "Office" ||
        formData.propertySubType === "Retail Shop" ||
        formData.propertySubType === "Show Room" ||
        formData.propertySubType === "Warehouse" ||
        formData.propertySubType === "Plot" ||
        formData.propertySubType === "Others") &&
      !formData.availableFrom
    ) {
      newErrors.availableFrom = "Available from date is required";
    }
    if (
      (formData.propertySubType === "Office" ||
        formData.propertySubType === "Retail Shop" ||
        formData.propertySubType === "Show Room" ||
        formData.propertySubType === "Warehouse" ||
        formData.propertySubType === "Plot" ||
        formData.propertySubType === "Others") &&
      !formData.monthlyRent
    ) {
      newErrors.monthlyRent = "Monthly rent is required";
    }
    if (
      (formData.propertySubType === "Office" ||
        formData.propertySubType === "Retail Shop" ||
        formData.propertySubType === "Show Room" ||
        formData.propertySubType === "Warehouse" ||
        formData.propertySubType === "Plot" ||
        formData.propertySubType === "Others") &&
      !formData.securityDeposit
    ) {
      newErrors.securityDeposit = "Security deposit is required";
    }
    if (
      (formData.propertySubType === "Office" ||
        formData.propertySubType === "Retail Shop" ||
        formData.propertySubType === "Show Room" ||
        formData.propertySubType === "Warehouse" ||
        formData.propertySubType === "Plot" ||
        formData.propertySubType === "Others") &&
      !formData.lockInPeriod
    ) {
      newErrors.lockInPeriod = "Lock in period is required";
    }
    if (
      (formData.propertySubType === "Office" ||
        formData.propertySubType === "Retail Shop" ||
        formData.propertySubType === "Show Room" ||
        formData.propertySubType === "Warehouse" ||
        formData.propertySubType === "Plot" ||
        formData.propertySubType === "Others") &&
      !formData.chargeBrokerage
    ) {
      newErrors.chargeBrokerage = "Brokerage charge is required";
    }
    if (
      (formData.propertySubType === "Office" ||
        formData.propertySubType === "Retail Shop" ||
        formData.propertySubType === "Show Room") &&
      !formData.builtUpArea
    ) {
      newErrors.builtUpArea = "Built-up area is required";
    }
    if (
      (formData.propertySubType === "Warehouse" ||
        formData.propertySubType === "Plot" ||
        formData.propertySubType === "Others") &&
      !formData.plotArea
    ) {
      newErrors.plotArea = "Plot area is required";
    }
    if (formData.propertySubType === "Plot" && !formData.lengthArea) {
      newErrors.lengthArea = "Length area is required";
    }
    if (formData.propertySubType === "Plot" && !formData.widthArea) {
      newErrors.widthArea = "Width area is required";
    }
    if (
      (formData.propertySubType === "Office" ||
        formData.propertySubType === "Retail Shop" ||
        formData.propertySubType === "Show Room" ||
        formData.propertySubType === "Warehouse" ||
        formData.propertySubType === "Plot" ||
        formData.propertySubType === "Others") &&
      !formData.totalProjectArea
    ) {
      newErrors.totalProjectArea = "Total project area is required";
    }
    if (
      (formData.propertySubType === "Office" ||
        formData.propertySubType === "Retail Shop" ||
        formData.propertySubType === "Show Room" ||
        formData.propertySubType === "Warehouse" ||
        formData.propertySubType === "Plot" ||
        formData.propertySubType === "Others") &&
      !formData.flatNo
    ) {
      newErrors.flatNo = "Flat number is required";
    }
    if (
      (formData.propertySubType === "Office" ||
        formData.propertySubType === "Warehouse") &&
      !formData.zoneType
    ) {
      newErrors.zoneType = "Zone type is required";
    }
    if (
      (formData.propertySubType === "Retail Shop" ||
        formData.propertySubType === "Show Room" ||
        formData.propertySubType === "Plot" ||
        formData.propertySubType === "Others") &&
      !formData.suitable
    ) {
      newErrors.suitable = "Suitable for is required";
    }
    if (formData.aroundProperty.length === 0) {
      newErrors.aroundProperty = "At least one place around property is required";
    }
    if (
      (formData.propertySubType === "Office" ||
        formData.propertySubType === "Show Room" ||
        formData.propertySubType === "Others") &&
      !formData.pantryRoom
    ) {
      newErrors.pantryRoom = "Pantry room is required";
    }
    if (!formData.propertyDescription) {
      newErrors.propertyDescription = "Property description is required";
    }
    if (!formData.city) {
      newErrors.city = "City is required";
    }
    if (!formData.propertyName) {
      newErrors.propertyName = "Property name is required";
    }
    if (!formData.locality) {
      newErrors.locality = "Locality is required";
    }
    if (!formData.floorNo) {
      newErrors.floorNo = "Floor number is required";
    }
    if (!formData.totalFloors) {
      newErrors.totalFloors = "Total floors is required";
    }
    if (formData.photos.length === 0) {
      newErrors.photos = "At least one photo is required";
    } else if (formData.photos.length < 5) {
      newErrors.photos = "You must upload exactly 5 photos";
    }

    if (formData.photos.length === 5 && formData.featuredImageIndex === null) {
      newErrors.featuredImage = "You must select a featured image when 5 photos are uploaded";
    }

    if (!formData.video) {
      newErrors.video = "Video upload is required";
    }

    if (!formData.floorPlan) {
      newErrors.floorPlan = "Floor plan upload is required";
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));

    // If there are no errors, proceed with submission
    if (Object.values(newErrors).every((error) => !error)) {
      console.log("Form Data:", formData);
      // Add your form submission logic here (e.g., API call)
    }
  };

  const areaUnitLabel = formData.areaUnits || "Sq.ft";

  // Check if the form should render the specific fields (Commercial -> Rent)
  const shouldRenderFields = formData.propertyType === "Commercial" && formData.lookingTo === "Rent";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-2 sm:px-6 lg:px-8">
      <PageBreadcrumb pageTitle="Commercial Rent Review" pagePlacHolder="Filter listings" />
      <ComponentCard title="Add Basic Details">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Type */}
          <div>
            <Label htmlFor="propertyType">Property Type *</Label>
            <div className="flex space-x-4">
              {propertyTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelectChange("propertyType")(option.value)}
                  className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                    formData.propertyType === option.value
                      ? "bg-blue-600 text-white border-blue-600"
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

          {/* Looking to */}
          <div>
            <Label htmlFor="lookingTo">Looking to *</Label>
            <div className="flex space-x-4">
              {lookingToOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelectChange("lookingTo")(option.value)}
                  className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                    formData.lookingTo === option.value
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {errors.lookingTo && (
              <p className="text-red-500 text-sm mt-1">{errors.lookingTo}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Search location</Label>
            <Input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Search location"
              className="dark:bg-dark-900"
            />
          </div>

          {/* Property Sub Type */}
          <div>
            <Label htmlFor="propertySubType">Property Sub Type *</Label>
            <div className="flex space-x-4">
              {propertySubTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelectChange("propertySubType")(option.value)}
                  className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                    formData.propertySubType === option.value
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {errors.propertySubType && (
              <p className="text-red-500 text-sm mt-1">{errors.propertySubType}</p>
            )}
          </div>

          {/* Conditionally Render Fields Based on Property Sub Type */}
          {shouldRenderFields && (
            <>
              {/* Lift & Stair Cases (Office, Retail Shop, Show Room) */}
              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Retail Shop" ||
                formData.propertySubType === "Show Room") && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Lift & Stair Cases
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="passengerLifts">Passenger Lifts *</Label>
                      <Input
                        type="number"
                        id="passengerLifts"
                        name="passengerLifts"
                        value={formData.passengerLifts}
                        onChange={handleInputChange}
                        placeholder="Enter passenger lifts"
                        className="dark:bg-dark-900 no-spinner"
                        min="0"
                      />
                      {errors.passengerLifts && (
                        <p className="text-red-500 text-sm mt-1">{errors.passengerLifts}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="serviceLifts">Service Lifts *</Label>
                      <Input
                        type="number"
                        id="serviceLifts"
                        name="serviceLifts"
                        value={formData.serviceLifts}
                        onChange={handleInputChange}
                        placeholder="Enter service lifts"
                        className="dark:bg-dark-900 no-spinner"
                        min="0"
                      />
                      {errors.serviceLifts && (
                        <p className="text-red-500 text-sm mt-1">{errors.serviceLifts}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="stairCases">Stair Cases *</Label>
                      <Input
                        type="number"
                        id="stairCases"
                        name="stairCases"
                        value={formData.stairCases}
                        onChange={handleInputChange}
                        placeholder="Enter stair cases"
                        className="dark:bg-dark-900 no-spinner"
                        min="0"
                      />
                      {errors.stairCases && (
                        <p className="text-red-500 text-sm mt-1">{errors.stairCases}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Parking (Office, Retail Shop, Show Room) */}
              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Retail Shop" ||
                formData.propertySubType === "Show Room") && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Parking
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="privateParking">Private Parking *</Label>
                      <Input
                        type="number"
                        id="privateParking"
                        name="privateParking"
                        value={formData.privateParking}
                        onChange={handleInputChange}
                        placeholder="Enter private parking"
                        className="dark:bg-dark-900 no-spinner"
                        min="0"
                      />
                      {errors.privateParking && (
                        <p className="text-red-500 text-sm mt-1">{errors.privateParking}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="publicParking">Public Parking *</Label>
                      <Input
                        type="number"
                        id="publicParking"
                        name="publicParking"
                        value={formData.publicParking}
                        onChange={handleInputChange}
                        placeholder="Enter public parking"
                        className="dark:bg-dark-900 no-spinner"
                        min="0"
                      />
                      {errors.publicParking && (
                        <p className="text-red-500 text-sm mt-1">{errors.publicParking}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Washrooms (Office, Retail Shop, Show Room) */}
              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Retail Shop" ||
                formData.propertySubType === "Show Room") && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Washrooms
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="privateWashrooms">Private Washrooms *</Label>
                      <Input
                        type="number"
                        id="privateWashrooms"
                        name="privateWashrooms"
                        value={formData.privateWashrooms}
                        onChange={handleInputChange}
                        placeholder="Enter private washrooms"
                        className="dark:bg-dark-900 no-spinner"
                        min="0"
                      />
                      {errors.privateWashrooms && (
                        <p className="text-red-500 text-sm mt-1">{errors.privateWashrooms}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="publicWashrooms">Public Washrooms *</Label>
                      <Input
                        type="number"
                        id="publicWashrooms"
                        name="publicWashrooms"
                        value={formData.publicWashrooms}
                        onChange={handleInputChange}
                        placeholder="Enter public washrooms"
                        className="dark:bg-dark-900 no-spinner"
                        min="0"
                      />
                      {errors.publicWashrooms && (
                        <p className="text-red-500 text-sm mt-1">{errors.publicWashrooms}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Available From (All Sub Types) */}
              <div>
                <Label htmlFor="availableFrom">Available From *</Label>
                <DatePicker
                  id="availableFrom"
                  mode="single"
                  onChange={(date) => {
                    const formattedDate = date ? date.toString().split("T")[0] : "";
                    setFormData((prev) => ({ ...prev, availableFrom: formattedDate }));

                    if (!formattedDate) {
                      setErrors((prev) => ({
                        ...prev,
                        availableFrom: "Available from date is required",
                      }));
                    } else {
                      setErrors((prev) => ({ ...prev, availableFrom: "" }));
                    }
                  }}
                  defaultDate={formData.availableFrom ? new Date(formData.availableFrom) : ""}
                  placeholder="Select Available date"
                  label=""
                />
                {errors.availableFrom && (
                  <p className="text-red-500 text-sm mt-1">{errors.availableFrom}</p>
                )}
              </div>

              {/* Monthly Rent (All Sub Types) */}
              <div>
                <Label htmlFor="monthlyRent">Monthly Rent (₹) *</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700 dark:text-gray-300">Rs</span>
                  <Input
                    type="number"
                    id="monthlyRent"
                    name="monthlyRent"
                    value={formData.monthlyRent}
                    onChange={handleInputChange}
                    className="dark:bg-dark-900 no-spinner"
                    min="0"
                  />
                </div>
                {errors.monthlyRent && (
                  <p className="text-red-500 text-sm mt-1">{errors.monthlyRent}</p>
                )}
              </div>

              {/* Maintenance Charge (All Sub Types) */}
              <div>
                <Label htmlFor="maintenanceCharge">Maintenance Charge (Per Month)</Label>
                <Input
                  type="number"
                  id="maintenanceCharge"
                  name="maintenanceCharge"
                  value={formData.maintenanceCharge}
                  onChange={handleInputChange}
                  className="dark:bg-dark-900 no-spinner"
                  min="0"
                />
                {errors.maintenanceCharge && (
                  <p className="text-red-500 text-sm mt-1">{errors.maintenanceCharge}</p>
                )}
              </div>

              {/* Security Deposit (All Sub Types) */}
              <div>
                <Label htmlFor="securityDeposit">Security Deposit *</Label>
                <div className="flex space-x-4">
                  {securityDepositOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelectChange("securityDeposit")(option.value)}
                      className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                        formData.securityDeposit === option.value
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {errors.securityDeposit && (
                  <p className="text-red-500 text-sm mt-1">{errors.securityDeposit}</p>
                )}
              </div>

              {/* Lock In Period (All Sub Types) */}
              <div>
                <Label htmlFor="lockInPeriod">Lock In Period *</Label>
                <div className="flex space-x-4">
                  {lockInPeriodOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelectChange("lockInPeriod")(option.value)}
                      className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                        formData.lockInPeriod === option.value
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {errors.lockInPeriod && (
                  <p className="text-red-500 text-sm mt-1">{errors.lockInPeriod}</p>
                )}
              </div>

              {/* Do you Charge Brokerage? (All Sub Types) */}
              <div>
                <Label htmlFor="chargeBrokerage">Do you Charge Brokerage? *</Label>
                <div className="flex space-x-4">
                  {chargeBrokerageOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelectChange("chargeBrokerage")(option.value)}
                      className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                        formData.chargeBrokerage === option.value
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {errors.chargeBrokerage && (
                  <p className="text-red-500 text-sm mt-1">{errors.chargeBrokerage}</p>
                )}
              </div>

              {/* Area Units (All Sub Types) */}
              <div>
                <Label htmlFor="areaUnits">Area Units</Label>
                <Select
                  options={areaUnitsOptions}
                  placeholder="Select area units"
                  onChange={handleSelectChange("areaUnits")}
                  value={formData.areaUnits}
                  className="dark:bg-dark-900"
                />
              </div>

              {/* Length Area (Plot) */}
              {formData.propertySubType === "Plot" && (
                <div>
                  <Label htmlFor="lengthArea">Length Area *</Label>
                  <Input
                    type="number"
                    id="lengthArea"
                    name="lengthArea"
                    value={formData.lengthArea}
                    onChange={handleInputChange}
                    placeholder="Enter length area"
                    className="dark:bg-dark-900 no-spinner"
                    min="0"
                  />
                  {errors.lengthArea && (
                    <p className="text-red-500 text-sm mt-1">{errors.lengthArea}</p>
                  )}
                </div>
              )}

              {/* Width Area (Plot) */}
              {formData.propertySubType === "Plot" && (
                <div>
                  <Label htmlFor="widthArea">Width Area *</Label>
                  <Input
                    type="number"
                    id="widthArea"
                    name="widthArea"
                    value={formData.widthArea}
                    onChange={handleInputChange}
                    placeholder="Enter width area"
                    className="dark:bg-dark-900 no-spinner"
                    min="0"
                  />
                  {errors.widthArea && (
                    <p className="text-red-500 text-sm mt-1">{errors.widthArea}</p>
                  )}
                </div>
              )}

              {/* Plot Area (Warehouse, Plot, Others) */}
              {(formData.propertySubType === "Warehouse" ||
                formData.propertySubType === "Plot" ||
                formData.propertySubType === "Others") && (
                <div>
                  <Label htmlFor="plotArea">Plot Area ({areaUnitLabel}) *</Label>
                  <Input
                    type="number"
                    id="plotArea"
                    name="plotArea"
                    value={formData.plotArea}
                    onChange={handleInputChange}
                    placeholder="Enter plot area"
                    className="dark:bg-dark-900 no-spinner"
                    min="0"
                  />
                  {errors.plotArea && (
                    <p className="text-red-500 text-sm mt-1">{errors.plotArea}</p>
                  )}
                </div>
              )}

              {/* Built-up Area (Office, Retail Shop, Show Room) */}
              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Retail Shop" ||
                formData.propertySubType === "Show Room") && (
                <div>
                  <Label htmlFor="builtUpArea">Built-up Area ({areaUnitLabel}) *</Label>
                  <Input
                    type="number"
                    id="builtUpArea"
                    name="builtUpArea"
                    value={formData.builtUpArea}
                    onChange={handleInputChange}
                    className="dark:bg-dark-900 no-spinner"
                    min="0"
                  />
                  {errors.builtUpArea && (
                    <p className="text-red-500 text-sm mt-1">{errors.builtUpArea}</p>
                  )}
                </div>
              )}

              {/* Carpet Area (Office, Retail Shop, Show Room) */}
              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Retail Shop" ||
                formData.propertySubType === "Show Room") && (
                <div>
                  <Label htmlFor="carpetArea">Carpet Area ({areaUnitLabel})</Label>
                  <Input
                    type="number"
                    id="carpetArea"
                    name="carpetArea"
                    value={formData.carpetArea}
                    onChange={handleInputChange}
                    className="dark:bg-dark-900 no-spinner"
                    min="0"
                  />
                  {errors.carpetArea && (
                    <p className="text-red-500 text-sm mt-1">{errors.carpetArea}</p>
                  )}
                </div>
              )}

              {/* Total Project Area (All Sub Types) */}
              <div>
                <Label htmlFor="totalProjectArea">Total Project Area (Acres) *</Label>
                <Input
                  type="number"
                  id="totalProjectArea"
                  name="totalProjectArea"
                  value={formData.totalProjectArea}
                  onChange={handleInputChange}
                  placeholder="Enter total project area"
                  className="dark:bg-dark-900 no-spinner"
                  min="0"
                />
                {errors.totalProjectArea && (
                  <p className="text-red-500 text-sm mt-1">{errors.totalProjectArea}</p>
                )}
              </div>

              {/* Facilities (Office, Retail Shop, Show Room) */}
              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Retail Shop" ||
                formData.propertySubType === "Show Room") && (
                <div>
                  <Label htmlFor="facilities">Facilities</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {facilitiesOptions.map((facility) => (
                      <label key={facility} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.facilities.includes(facility)}
                          onChange={() => handleFacilityChange(facility)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">{facility}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Flat No (All Sub Types) */}
              <div>
                <Label htmlFor="flatNo">Flat No. *</Label>
                <Input
                  type="text"
                  id="flatNo"
                  name="flatNo"
                  value={formData.flatNo}
                  onChange={handleInputChange}
                  placeholder="Flat Number"
                  className="dark:bg-dark-900"
                />
                {errors.flatNo && (
                  <p className="text-red-500 text-sm mt-1">{errors.flatNo}</p>
                )}
              </div>

              {/* Zone Type (Office, Warehouse) */}
              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Warehouse") && (
                <div>
                  <Label htmlFor="zoneType">Zone Type *</Label>
                  <Select
                    options={zoneTypeOptions}
                    placeholder="Select..."
                    onChange={handleSelectChange("zoneType")}
                    value={formData.zoneType}
                    className="dark:bg-dark-900"
                  />
                  {errors.zoneType && (
                    <p className="text-red-500 text-sm mt-1">{errors.zoneType}</p>
                  )}
                </div>
              )}

              {/* Suitable (Retail Shop, Show Room, Plot, Others) */}
              {(formData.propertySubType === "Retail Shop" ||
                formData.propertySubType === "Show Room" ||
                formData.propertySubType === "Plot" ||
                formData.propertySubType === "Others") && (
                <div>
                  <Label htmlFor="suitable">Suitable *</Label>
                  <Select
                    options={suitableOptions}
                    placeholder="Select..."
                    onChange={handleSelectChange("suitable")}
                    value={formData.suitable}
                    className="dark:bg-dark-900"
                  />
                  {errors.suitable && (
                    <p className="text-red-500 text-sm mt-1">{errors.suitable}</p>
                  )}
                </div>
              )}

              {/* Additional Details Section (All Sub Types) */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Additional Details
                </h3>

                {/* Facing (All Sub Types except Plot) */}
                {(formData.propertySubType === "Office" ||
                  formData.propertySubType === "Retail Shop" ||
                  formData.propertySubType === "Show Room" ||
                  formData.propertySubType === "Warehouse" ||
                  formData.propertySubType === "Others") && (
                  <div>
                    <Label htmlFor="facing">Facing</Label>
                    <div className="flex space-x-4">
                      {["East", "West", "South", "North"].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleSelectChange("facing")(option)}
                          className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                            formData.facing === option
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Car Parking (All Sub Types except Plot) */}
                {(formData.propertySubType === "Office" ||
                  formData.propertySubType === "Retail Shop" ||
                  formData.propertySubType === "Show Room" ||
                  formData.propertySubType === "Warehouse" ||
                  formData.propertySubType === "Others") && (
                  <div>
                    <Label htmlFor="carParking" className="mt-2">
                      Car Parking
                    </Label>
                    <Select
                      options={carParkingOptions}
                      placeholder="Select car parking"
                      onChange={handleSelectChange("carParking")}
                      value={formData.carParking}
                      className="dark:bg-dark-900"
                    />
                  </div>
                )}

                {/* Bike Parking (All Sub Types except Plot) */}
                {(formData.propertySubType === "Office" ||
                  formData.propertySubType === "Retail Shop" ||
                  formData.propertySubType === "Show Room" ||
                  formData.propertySubType === "Warehouse" ||
                  formData.propertySubType === "Others") && (
                  <div>
                    <Label htmlFor="bikeParking" className="mt-2">
                      Bike Parking
                    </Label>
                    <Select
                      options={bikeParkingOptions}
                      placeholder="Select bike parking"
                      onChange={handleSelectChange("bikeParking")}
                      value={formData.bikeParking}
                      className="dark:bg-dark-900"
                    />
                  </div>
                )}

                {/* Open Parking (All Sub Types except Plot) */}
                {(formData.propertySubType === "Office" ||
                  formData.propertySubType === "Retail Shop" ||
                  formData.propertySubType === "Show Room" ||
                  formData.propertySubType === "Warehouse" ||
                  formData.propertySubType === "Others") && (
                  <div>
                    <Label htmlFor="openParking" className="mt-2">
                      Open Parking
                    </Label>
                    <Select
                      options={openParkingOptions}
                      placeholder="Select open parking"
                      onChange={handleSelectChange("openParking")}
                      value={formData.openParking}
                      className="dark:bg-dark-900"
                    />
                  </div>
                )}

                {/* Around This Property (All Sub Types) */}
                <div>
                  <Label htmlFor="aroundProperty" className="mt-4">
                    Around This Property *
                  </Label>
                  <div className="flex space-x-6 my-4 w-full">
                    <Input
                      type="text"
                      placeholder="Place around property"
                      value={placeAroundProperty}
                      onChange={(e) => setPlaceAroundProperty(e.target.value)}
                      className="dark:bg-dark-900 w-[30%]"
                    />
                    <Input
                      type="text"
                      placeholder="Distance from property"
                      value={distanceFromProperty}
                      onChange={(e) => setDistanceFromProperty(e.target.value)}
                      className="dark:bg-dark-900 w-[30%]"
                    />
                    <button
                      type="button"
                      onClick={handleAddAroundProperty}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 w-[20%]"
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
                                setFormData((prev) => ({
                                  ...prev,
                                  aroundProperty: prev.aroundProperty.filter(
                                    (_, i) => i !== index
                                  ),
                                }))
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

                {/* Pantry Room (Office, Show Room, Others) */}
                {(formData.propertySubType === "Office" ||
                  formData.propertySubType === "Show Room" ||
                  formData.propertySubType === "Others") && (
                  <div>
                    <Label htmlFor="pantryRoom">Pantry Room? *</Label>
                    <div className="flex space-x-4">
                      {["Yes", "No"].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleSelectChange("pantryRoom")(option)}
                          className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                            formData.pantryRoom === option
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {errors.pantryRoom && (
                      <p className="text-red-500 text-sm mt-1">{errors.pantryRoom}</p>
                    )}
                  </div>
                )}

                {/* Property Description (All Sub Types) */}
                <div>
                  <Label htmlFor="propertyDescription" className="mt-5">
                    Property Description *
                  </Label>
                  <textarea
                    id="propertyDescription"
                    name="propertyDescription"
                    value={formData.propertyDescription}
                    onChange={handleInputChange}
                    className="w-full p-2 m-1 border rounded-lg dark:bg-dark-900 dark:text-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    placeholder="Property Description"
                  />
                  {errors.propertyDescription && (
                    <p className="text-red-500 text-sm mt-1">{errors.propertyDescription}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Use the common PropertyLocationFields component */}
          <PropertyLocationFields
            formData={{
              city: formData.city,
              propertyName: formData.propertyName,
              locality: formData.locality,
              flatNo: formData.flatNo,
              floorNo: formData.floorNo,
              totalFloors: formData.totalFloors,
            }}
            errors={{
              city: errors.city,
              propertyName: errors.propertyName,
              locality: errors.locality,
              flatNo: errors.flatNo,
              floorNo: errors.floorNo,
              totalFloors: errors.totalFloors,
            }}
            handleInputChange={handleInputChange}
          />

          {/* Media Upload Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Upload Media
            </h3>
            <MediaUploadSection
              photos={formData.photos}
              setPhotos={(photos) => setFormData((prev) => ({ ...prev, photos }))}
              video={formData.video}
              setVideo={(video) => setFormData((prev) => ({ ...prev, video }))}
              floorPlan={formData.floorPlan}
              setFloorPlan={(floorPlan) => setFormData((prev) => ({ ...prev, floorPlan }))}
              featuredImageIndex={formData.featuredImageIndex}
              setFeaturedImageIndex={(index) =>
                setFormData((prev) => ({ ...prev, featuredImageIndex: index }))
              }
              photoError={errors.photos}
              videoError={errors.video}
              floorPlanError={errors.floorPlan}
              featuredImageError={errors.featuredImage}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors duration-200"
            >
              Submit
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default CommercialRentEdit;
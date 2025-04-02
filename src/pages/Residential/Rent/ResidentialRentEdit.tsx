import { useState, ChangeEvent, FormEvent } from "react";
import ComponentCard from "../../../components/common/ComponentCard";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import DatePicker from "../../../components/form/date-picker";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PropertyLocationFields from "../components/propertyLocationFields";
import MediaUploadSection from "../components/MediaUploadSection";


// Define the type for the Around Property entries
interface AroundProperty {
  place: string;
  distance: string;
}

// Define the type for the form data
interface ResidentialRentFormData {
  propertyType: "Residential" | "Commercial";
  lookingTo: "Sell" | "Rent" | "PG-Co-living";
  transactionType: "New" | "Resale";
  location: string;
  propertySubType: "Apartment" | "Independent House" | "Independent Villa" | "Plot" | "Land";
  bhk: "1BHK" | "2BHK" | "3BHK" | "4BHK" | "4+BHK";
  bedroom: "1" | "2" | "3" | "4" | "4+";
  balcony: "1" | "2" | "3" | "4" | "4+";
  furnishType: "Fully" | "Semi" | "Unfurnished";
  availableFrom: string;
  monthlyRent: string;
  maintenanceCharge: string;
  securityDeposit: "1 Month" | "2 Months" | "3 Months";
  lockInPeriod: "1 Month" | "2 Months" | "3 Months";
  chargeBrokerage: "None" | "15 Days" | "30 Days";
  preferredTenantType: "Anyone" | "Family" | "Bachelors" | "Single Men" | "Single Women";
  areaUnits: "Sq.ft" | "Sq.yd" | "Acres";
  builtUpArea: string;
  carpetArea: string;
  lengthArea: string;
  widthArea: string;
  plotArea: string;
  totalProjectArea: string;
  pentHouse: "Yes" | "No";
  facilities: string[];
  facing: "East" | "West" | "South" | "North" | "";
  carParking: "0" | "1" | "2" | "3" | "4+";
  bikeParking: "0" | "1" | "2" | "3" | "4+";
  openParking: "0" | "1" | "2" | "3" | "4+";
  aroundProperty: AroundProperty[];
  servantRoom: "Yes" | "No";
  propertyDescription: string;
  city: string;
  propertyName: string;
  locality: string;
  flatNo: string;
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

const ResidentialRentEdit: React.FC = () => {
  const [formData, setFormData] = useState<ResidentialRentFormData>({
    propertyType: "Residential",
    lookingTo: "Rent",
    transactionType: "New",
    location: "",
    propertySubType: "Apartment",
    bhk: "2BHK",
    bedroom: "3",
    balcony: "3",
    furnishType: "Semi",
    availableFrom: "",
    monthlyRent: "",
    maintenanceCharge: "",
    securityDeposit: "1 Month",
    lockInPeriod: "1 Month",
    chargeBrokerage: "None",
    preferredTenantType: "Anyone",
    areaUnits: "Sq.ft",
    builtUpArea: "",
    carpetArea: "",
    lengthArea: "",
    widthArea: "",
    plotArea: "",
    totalProjectArea: "",
    pentHouse: "No",
    facilities: ["Lift", "Regular Water", "Gazebo", "Water Harvesting Pit", "Security Cabin"],
    facing: "",
    carParking: "0",
    bikeParking: "0",
    openParking: "0",
    aroundProperty: [],
    servantRoom: "No",
    propertyDescription: "",
    city: "",
    propertyName: "",
    locality: "",
    flatNo: "",
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
    bhk: "",
    bedroom: "",
    balcony: "",
    furnishType: "",
    availableFrom: "",
    monthlyRent: "",
    maintenanceCharge: "",
    securityDeposit: "",
    lockInPeriod: "",
    chargeBrokerage: "",
    preferredTenantType: "",
    builtUpArea: "",
    plotArea: "",
    totalProjectArea: "",
    aroundProperty: "",
    servantRoom: "",
    propertyDescription: "",
    carpetArea: "",
    city: "",
    propertyName: "",
    locality: "",
    flatNo: "",
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
    { value: "Apartment", label: "Apartment" },
    { value: "Independent House", label: "Independent House" },
    { value: "Independent Villa", label: "Independent Villa" },
    { value: "Plot", label: "Plot" },
    { value: "Land", label: "Land" },
  ];

  const bhkOptions: SelectOption[] = [
    { value: "1BHK", label: "1BHK" },
    { value: "2BHK", label: "2BHK" },
    { value: "3BHK", label: "3BHK" },
    { value: "4BHK", label: "4BHK" },
    { value: "4+BHK", label: "4+BHK" },
  ];

  const bedroomOptions: SelectOption[] = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "4+", label: "4+" },
  ];

  const balconyOptions: SelectOption[] = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "4+", label: "4+" },
  ];

  const furnishTypeOptions: SelectOption[] = [
    { value: "Fully", label: "Fully" },
    { value: "Semi", label: "Semi" },
    { value: "Unfurnished", label: "Unfurnished" },
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

  const preferredTenantTypeOptions: SelectOption[] = [
    { value: "Anyone", label: "Anyone" },
    { value: "Family", label: "Family" },
    { value: "Bachelors", label: "Bachelors" },
    { value: "Single Men", label: "Single Men" },
    { value: "Single Women", label: "Single Women" },
  ];

  const areaUnitsOptions: SelectOption[] = [
    { value: "Sq.ft", label: "Sq.ft" },
    { value: "Sq.yd", label: "Sq.yd" },
    { value: "Acres", label: "Acres" },
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

    //validations for address details
      // Validation for new fields
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

    // Validation for Carpet Area
    if (name === "carpetArea") {
      const carpetAreaValue = parseFloat(value);
      if (carpetAreaValue < 150 || carpetAreaValue > 20000) {
        setErrors((prev) => ({
          ...prev,
          carpetArea: "Carpet area should be between 150 to 20,000",
        }));
      } else {
        setErrors((prev) => ({ ...prev, carpetArea: "" }));
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

    // Validation for Plot Area
    if (name === "plotArea") {
      if (!value) {
        setErrors((prev) => ({
          ...prev,
          plotArea: "Plot area is required",
        }));
      } else {
        setErrors((prev) => ({ ...prev, plotArea: "" }));
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

    // Validation for Maintenance Charge
    if (name === "maintenanceCharge") {
      if (!value) {
        setErrors((prev) => ({
          ...prev,
          maintenanceCharge: "Maintenance charge is required",
        }));
      } else {
        setErrors((prev) => ({ ...prev, maintenanceCharge: "" }));
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

  const handleSelectChange = (name: keyof ResidentialRentFormData) => (value: string) => {
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

    if (name === "bhk" && !value) {
      setErrors((prev) => ({ ...prev, bhk: "BHK is required" }));
    } else if (name === "bhk") {
      setErrors((prev) => ({ ...prev, bhk: "" }));
    }

    if (name === "bedroom" && !value) {
      setErrors((prev) => ({ ...prev, bedroom: "Bathroom is required" }));
    } else if (name === "bedroom") {
      setErrors((prev) => ({ ...prev, bedroom: "" }));
    }

    if (name === "balcony" && !value) {
      setErrors((prev) => ({ ...prev, balcony: "Balcony is required" }));
    } else if (name === "balcony") {
      setErrors((prev) => ({ ...prev, balcony: "" }));
    }

    if (name === "furnishType" && !value) {
      setErrors((prev) => ({ ...prev, furnishType: "Furnish type is required" }));
    } else if (name === "furnishType") {
      setErrors((prev) => ({ ...prev, furnishType: "" }));
    }

    if (name === "securityDeposit" && !value) {
      setErrors((prev) => ({ ...prev, securityDeposit: "Security deposit is required" }));
    } else if (name === "securityDeposit") {
      setErrors((prev) => ({ ...prev, securityDeposit: "" }));
    }

    if (name === "lockInPeriod" && !value) {
      setErrors((prev) => ({ ...prev, lockInPeriod: "Lock-in period is required" }));
    } else if (name === "lockInPeriod") {
      setErrors((prev) => ({ ...prev, lockInPeriod: "" }));
    }

    if (name === "chargeBrokerage" && !value) {
      setErrors((prev) => ({ ...prev, chargeBrokerage: "Brokerage charge is required" }));
    } else if (name === "chargeBrokerage") {
      setErrors((prev) => ({ ...prev, chargeBrokerage: "" }));
    }

    if (name === "preferredTenantType" && !value) {
      setErrors((prev) => ({ ...prev, preferredTenantType: "Preferred tenant type is required" }));
    } else if (name === "preferredTenantType") {
      setErrors((prev) => ({ ...prev, preferredTenantType: "" }));
    }

    if (name === "servantRoom" && !value) {
      setErrors((prev) => ({ ...prev, servantRoom: "Servant room is required" }));
    } else if (name === "servantRoom") {
      setErrors((prev) => ({ ...prev, servantRoom: "" }));
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

  const handleDateChange = (selectedDates: Date[]) => {
    const date = selectedDates[0] ? selectedDates[0].toISOString().split("T")[0] : "";
    setFormData((prev) => ({ ...prev, availableFrom: date }));
    if (!date) {
      setErrors((prev) => ({ ...prev, availableFrom: "Available from date is required" }));
    } else {
      setErrors((prev) => ({ ...prev, availableFrom: "" }));
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
      (formData.propertySubType === "Apartment" ||
        formData.propertySubType === "Independent House" ||
        formData.propertySubType === "Independent Villa") &&
      !formData.bhk
    ) {
      newErrors.bhk = "BHK is required";
    }
    if (formData.propertySubType === "Apartment" && !formData.bedroom) {
      newErrors.bedroom = "Bathroom is required";
    }
    if (formData.propertySubType === "Apartment" && !formData.balcony) {
      newErrors.balcony = "Balcony is required";
    }
    if (
      (formData.propertySubType === "Apartment" ||
        formData.propertySubType === "Independent House" ||
        formData.propertySubType === "Independent Villa") &&
      !formData.furnishType
    ) {
      newErrors.furnishType = "Furnish type is required";
    }
    if (!formData.availableFrom) {
      newErrors.availableFrom = "Available from date is required";
    }
    if (!formData.monthlyRent) {
      newErrors.monthlyRent = "Monthly rent is required";
    }
    if (!formData.maintenanceCharge) {
      newErrors.maintenanceCharge = "Maintenance charge is required";
    }
    if (!formData.securityDeposit) {
      newErrors.securityDeposit = "Security deposit is required";
    }
    if (!formData.lockInPeriod) {
      newErrors.lockInPeriod = "Lock-in period is required";
    }
    if (!formData.chargeBrokerage) {
      newErrors.chargeBrokerage = "Brokerage charge is required";
    }
    if (!formData.preferredTenantType) {
      newErrors.preferredTenantType = "Preferred tenant type is required";
    }
    if (
      (formData.propertySubType === "Apartment" ||
        formData.propertySubType === "Independent House" ||
        formData.propertySubType === "Independent Villa" ||
        formData.propertySubType === "Land") &&
      !formData.builtUpArea
    ) {
      newErrors.builtUpArea = "Built-up area is required";
    }
    if (
      (formData.propertySubType === "Independent House" ||
        formData.propertySubType === "Independent Villa" ||
        formData.propertySubType === "Plot") &&
      !formData.plotArea
    ) {
      newErrors.plotArea = "Plot area is required";
    }
    if (!formData.totalProjectArea) {
      newErrors.totalProjectArea = "Total project area is required";
    }
    if (formData.aroundProperty.length === 0) {
      newErrors.aroundProperty = "At least one place around property is required";
    }
    if (
      (formData.propertySubType === "Apartment" ||
        formData.propertySubType === "Independent House" ||
        formData.propertySubType === "Independent Villa") &&
      !formData.servantRoom
    ) {
      newErrors.servantRoom = "Servant room is required";
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
      if (!formData.flatNo) {
        newErrors.flatNo = "Flat number is required";
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

  // Check if the form should render the specific fields (Residential -> Rent)
  const shouldRenderFields = formData.propertyType === "Residential" && formData.lookingTo === "Rent";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-2 sm:px-6 lg:px-8">
          <PageBreadcrumb pageTitle="Residential Rent" pagePlacHolder="Filter listings" />
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
              {/* BHK (Apartment, Independent House, Independent Villa) */}
              {(formData.propertySubType === "Apartment" ||
                formData.propertySubType === "Independent House" ||
                formData.propertySubType === "Independent Villa") && (
                <div>
                  <Label htmlFor="bhk">BHK *</Label>
                  <div className="flex space-x-4">
                    {bhkOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelectChange("bhk")(option.value)}
                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                          formData.bhk === option.value
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {errors.bhk && <p className="text-red-500 text-sm mt-1">{errors.bhk}</p>}
                </div>
              )}

              {/* Bathroom (Apartment) */}
              {formData.propertySubType === "Apartment" && (
                <div>
                  <Label htmlFor="bedroom">Bathroom *</Label>
                  <div className="flex space-x-4">
                    {bedroomOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelectChange("bedroom")(option.value)}
                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                          formData.bedroom === option.value
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {errors.bedroom && (
                    <p className="text-red-500 text-sm mt-1">{errors.bedroom}</p>
                  )}
                </div>
              )}

              {/* Balcony (Apartment) */}
              {formData.propertySubType === "Apartment" && (
                <div>
                  <Label htmlFor="balcony">Balcony *</Label>
                  <div className="flex space-x-4">
                    {balconyOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelectChange("balcony")(option.value)}
                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                          formData.balcony === option.value
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {errors.balcony && (
                    <p className="text-red-500 text-sm mt-1">{errors.balcony}</p>
                  )}
                </div>
              )}

              {/* Furnish Type (Apartment, Independent House, Independent Villa) */}
              {(formData.propertySubType === "Apartment" ||
                formData.propertySubType === "Independent House" ||
                formData.propertySubType === "Independent Villa") && (
                <div>
                  <Label htmlFor="furnishType">Furnish Type *</Label>
                  <div className="flex space-x-4">
                    {furnishTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelectChange("furnishType")(option.value)}
                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                          formData.furnishType === option.value
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {errors.furnishType && (
                    <p className="text-red-500 text-sm mt-1">{errors.furnishType}</p>
                  )}
                </div>
              )}

              {/* Available From (All Sub Types) */}
              <div>
                <Label htmlFor="availableFrom">Available From *</Label>
                <DatePicker
                  id="availableFrom"
                  mode="single"
                  onChange={handleDateChange}
                  defaultDate={formData.availableFrom}
                  placeholder="Select available from date (mm/dd/yyyy)"
                  label=""
                />
                {errors.availableFrom && (
                  <p className="text-red-500 text-sm mt-1">{errors.availableFrom}</p>
                )}
              </div>

              {/* Monthly Rent (All Sub Types) */}
              <div>
                <Label htmlFor="monthlyRent">Monthly Rent *</Label>
                <Input
                  type="number"
                  id="monthlyRent"
                  name="monthlyRent"
                  value={formData.monthlyRent}
                  onChange={handleInputChange}
                  placeholder="Cost (per month)"
                  className="dark:bg-dark-900"
                />
                {errors.monthlyRent && (
                  <p className="text-red-500 text-sm mt-1">{errors.monthlyRent}</p>
                )}
              </div>

              {/* Maintenance Charge (All Sub Types) */}
              <div>
                <Label htmlFor="maintenanceCharge">Maintenance Charge (per Month) *</Label>
                <Input
                  type="number"
                  id="maintenanceCharge"
                  name="maintenanceCharge"
                  value={formData.maintenanceCharge}
                  onChange={handleInputChange}
                  placeholder="Cost (per month)"
                  className="dark:bg-dark-900"
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

              {/* Do You Charge Brokerage? (All Sub Types) */}
              <div>
                <Label htmlFor="chargeBrokerage">Do You Charge Brokerage? *</Label>
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

              {/* Preferred Tenant Type (All Sub Types) */}
              <div>
                <Label htmlFor="preferredTenantType">Preferred Tenant Type *</Label>
                <div className="flex space-x-4">
                  {preferredTenantTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelectChange("preferredTenantType")(option.value)}
                      className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                        formData.preferredTenantType === option.value
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {errors.preferredTenantType && (
                  <p className="text-red-500 text-sm mt-1">{errors.preferredTenantType}</p>
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

              {/* Built-up Area (Apartment, Independent House, Independent Villa, Land) */}
              {(formData.propertySubType === "Apartment" ||
                formData.propertySubType === "Independent House" ||
                formData.propertySubType === "Independent Villa" ||
                formData.propertySubType === "Land") && (
                <div>
                  <Label htmlFor="builtUpArea">Built-up Area ({areaUnitLabel}) *</Label>
                  <Input
                    type="number"
                    id="builtUpArea"
                    name="builtUpArea"
                    value={formData.builtUpArea}
                    onChange={handleInputChange}
                    className="dark:bg-dark-900"
                  />
                  {errors.builtUpArea && (
                    <p className="text-red-500 text-sm mt-1">{errors.builtUpArea}</p>
                  )}
                </div>
              )}

              {/* Carpet Area (Apartment, Independent House, Independent Villa, Land) */}
              {(formData.propertySubType === "Apartment" ||
                formData.propertySubType === "Independent House" ||
                formData.propertySubType === "Independent Villa" ||
                formData.propertySubType === "Land") && (
                <div>
                  <Label htmlFor="carpetArea">Carpet Area ({areaUnitLabel})</Label>
                  <Input
                    type="number"
                    id="carpetArea"
                    name="carpetArea"
                    value={formData.carpetArea}
                    onChange={handleInputChange}
                    className="dark:bg-dark-900"
                  />
                  {errors.carpetArea && (
                    <p className="text-red-500 text-sm mt-1">{errors.carpetArea}</p>
                  )}
                </div>
              )}

              {/* Length Area (Plot, Land) */}
              {(formData.propertySubType === "Plot" || formData.propertySubType === "Land") && (
                <div>
                  <Label htmlFor="lengthArea">Length Area ({areaUnitLabel})</Label>
                  <Input
                    type="number"
                    id="lengthArea"
                    name="lengthArea"
                    value={formData.lengthArea}
                    onChange={handleInputChange}
                    className="dark:bg-dark-900"
                  />
                </div>
              )}

              {/* Width Area (Plot, Land) */}
              {(formData.propertySubType === "Plot" || formData.propertySubType === "Land") && (
                <div>
                  <Label htmlFor="widthArea">Width Area ({areaUnitLabel})</Label>
                  <Input
                    type="number"
                    id="widthArea"
                    name="widthArea"
                    value={formData.widthArea}
                    onChange={handleInputChange}
                    className="dark:bg-dark-900"
                  />
                </div>
              )}

              {/* Plot Area (Independent House, Independent Villa, Plot) */}
              {(formData.propertySubType === "Independent House" ||
                formData.propertySubType === "Independent Villa" ||
                formData.propertySubType === "Plot") && (
                <div>
                  <Label htmlFor="plotArea">Plot Area ({areaUnitLabel}) *</Label>
                  <Input
                    type="number"
                    id="plotArea"
                    name="plotArea"
                    value={formData.plotArea}
                    onChange={handleInputChange}
                    className="dark:bg-dark-900"
                  />
                  {errors.plotArea && (
                    <p className="text-red-500 text-sm mt-1">{errors.plotArea}</p>
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
                  className="dark:bg-dark-900"
                />
                {errors.totalProjectArea && (
                  <p className="text-red-500 text-sm mt-1">{errors.totalProjectArea}</p>
                )}
              </div>

              {/* Pent House (Independent House, Independent Villa) */}
              {(formData.propertySubType === "Independent House" ||
                formData.propertySubType === "Independent Villa") && (
                <div>
                  <Label htmlFor="pentHouse">Pent House</Label>
                  <div className="flex space-x-4">
                    {["Yes", "No"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelectChange("pentHouse")(option)}
                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                          formData.pentHouse === option
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

              {/* Facilities (Apartment, Independent House, Independent Villa) */}
              {(formData.propertySubType === "Apartment" ||
                formData.propertySubType === "Independent House" ||
                formData.propertySubType === "Independent Villa") && (
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

              {/* Additional Details Section (All Sub Types) */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Additional Details
                </h3>

                {/* Facing (All Sub Types) */}
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

                {/* Car Parking (Apartment, Independent House, Independent Villa) */}
                {(formData.propertySubType === "Apartment" ||
                  formData.propertySubType === "Independent House" ||
                  formData.propertySubType === "Independent Villa") && (
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

                {/* Bike Parking (Apartment, Independent House, Independent Villa) */}
                {(formData.propertySubType === "Apartment" ||
                  formData.propertySubType === "Independent House" ||
                  formData.propertySubType === "Independent Villa") && (
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

                {/* Open Parking (Apartment, Independent House, Independent Villa) */}
                {(formData.propertySubType === "Apartment" ||
                  formData.propertySubType === "Independent House" ||
                  formData.propertySubType === "Independent Villa") && (
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

                {/* Servant Room (Apartment, Independent House, Independent Villa) */}
                {(formData.propertySubType === "Apartment" ||
                  formData.propertySubType === "Independent House" ||
                  formData.propertySubType === "Independent Villa") && (
                  <div>
                    <Label htmlFor="servantRoom">Servant Room? *</Label>
                    <div className="flex space-x-4">
                      {["Yes", "No"].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleSelectChange("servantRoom")(option)}
                          className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                            formData.servantRoom === option
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {errors.servantRoom && (
                      <p className="text-red-500 text-sm mt-1">{errors.servantRoom}</p>
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

export default ResidentialRentEdit;
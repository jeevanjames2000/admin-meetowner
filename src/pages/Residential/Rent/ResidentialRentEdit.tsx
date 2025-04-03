import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useLocation } from "react-router"; // Add useLocation
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

// Updated ResidentialRentFormData interface to include all fields from the JSON
interface ResidentialRentFormData {
  propertyType: "Residential" | "Commercial";
  lookingTo: "Sell" | "Rent" | "PG-Co-living";
  transactionType: "New" | "Resale" | null;
  location: string;
  propertySubType: "Apartment" | "Independent House" | "Independent Villa" | "Plot" | "Land";
  bhk: "1BHK" | "2BHK" | "3BHK" | "4BHK" | "4+BHK";
  bedroom: "1" | "2" | "3" | "4" | "4+";
  balcony: "1" | "2" | "3" | "4" | "4+";
  furnishType: "Fully" | "Semi" | "Unfurnished";
  availableFrom: string;
  monthlyRent: string;
  maintenanceCharge: string;
  securityDeposit: "1 Month" | "2 Months" | "3 Months" | string;
  lockInPeriod: "1 Month" | "2 Months" | "3 Months" | string;
  chargeBrokerage: "None" | "15 Days" | "30 Days" | string;
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
  plotNumber: string;
  floorNo: string;
  totalFloors: string;
  photos: File[];
  video: File | null;
  floorPlan: File | null;
  featuredImageIndex: number | null;
  uniquePropertyId: string;
  userId: number | null;
  expiryDate: string | null;
  unitFlatHouseNo: string;
  stateId: string | null;
  cityId: string;
  locationId: string;
  street: string | null;
  address: string | null;
  zipcode: string | null;
  latitude: string | null;
  longitude: string | null;
  bathroom: string;
  propertyIn: string;
  googleAddress: string;
  userType: number | null;
  types: string;
  reraApproved: "0" | "1";
  uploadedFromSellerPanel: "Yes" | "No";
  featuredProperty: "Yes" | "No";
}

interface SelectOption {
  value: string;
  label: string;
}

const ResidentialRentEdit: React.FC = () => {
  const location = useLocation();
  const property = location.state?.property;

  const [formData, setFormData] = useState<ResidentialRentFormData>(() => {
    if (property) {
      return {
        propertyType: property.property_in || "Residential",
        lookingTo: property.property_for || "Rent",
        transactionType: property.transaction_type || null,
        location: property.google_address || "",
        propertySubType: property.sub_type || "Apartment",
        bhk: property.bedrooms ? `${property.bedrooms}BHK` : "1BHK",
        bedroom: property.bedrooms || "1",
        balcony: property.balconies ? String(property.balconies) : "1",
        furnishType: property.furnished_status || "Semi",
        availableFrom: property.available_from
          ? new Date(property.available_from).toISOString().split("T")[0]
          : "",
        monthlyRent: property.monthly_rent || "",
        maintenanceCharge: property.maintenance || "",
        securityDeposit: property.security_deposit
          ? `${property.security_deposit} Months`
          : "1 Month",
        lockInPeriod: property.lock_in ? `${property.lock_in} Months` : "1 Month",
        chargeBrokerage: property.brokerage_charge
          ? `${property.brokerage_charge} Days`
          : "None",
        preferredTenantType: property.types || "Anyone",
        areaUnits: property.area_units || "Sq.ft",
        builtUpArea: property.builtup_area || "",
        carpetArea: property.carpet_area || "",
        lengthArea: property.length_area || "", // Added from response
        widthArea: property.width_area || "",   // Added from response
        plotArea: property.plot_area || "",     // Added from response
        totalProjectArea: property.total_project_area || "",
        pentHouse: property.pent_house === "Yes" ? "Yes" : "No",
        facilities: property.facilities ? property.facilities.split(", ") : [],
        facing: property.facing || "",
        carParking: property.car_parking ? String(property.car_parking) : "0",
        bikeParking: property.bike_parking ? String(property.bike_parking) : "0",
        openParking: property.open_parking ? String(property.open_parking) : "0",
        aroundProperty: [],
        servantRoom: property.servant_room || "No",
        propertyDescription: property.description || "",
        city: property.city_id || "",
        propertyName: property.property_name || "",
        locality: property.location_id || "",
        flatNo: property.unit_flat_house_no || "",
        plotNumber: property.plot_number || "",
        floorNo: property.floors || "",
        totalFloors: property.total_floors || "",
        photos: [],
        video: null,
        floorPlan: null,
        featuredImageIndex: null,
        uniquePropertyId: property.unique_property_id || "",
        userId: property.user_id || null,
        expiryDate: property.expiry_date || null,
        unitFlatHouseNo: property.unit_flat_house_no || "",
        stateId: property.state_id || null,
        cityId: property.city_id || "",
        locationId: property.location_id || "",
        street: property.street || null,
        address: property.address || null,
        zipcode: property.zipcode || null,
        latitude: property.latitude || null,
        longitude: property.longitude || null,
        bathroom: property.bathroom ? String(property.bathroom) : "1",
        propertyIn: property.property_in || "Residential",
        googleAddress: property.google_address || "",
        userType: property.user_type || null,
        types: property.types || "Family",
        reraApproved: property.rera_approved === 1 ? "1" : "0",
        uploadedFromSellerPanel: property.uploaded_from_seller_panel || "No",
        featuredProperty: property.featured_property || "No",
      };
    }
    return {
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
      plotNumber: "",
      floorNo: "",
      totalFloors: "",
      photos: [],
      video: null,
      floorPlan: null,
      featuredImageIndex: null,
      uniquePropertyId: "",
      userId: null,
      expiryDate: null,
      unitFlatHouseNo: "",
      stateId: null,
      cityId: "",
      locationId: "",
      street: null,
      address: null,
      zipcode: null,
      latitude: null,
      longitude: null,
      bathroom: "1",
      propertyIn: "Residential",
      googleAddress: "",
      userType: null,
      types: "Family",
      reraApproved: "0",
      uploadedFromSellerPanel: "No",
      featuredProperty: "No",
    };
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
    plotArea: "", // Added
    lengthArea: "", // Added
    widthArea: "",  // Added
    totalProjectArea: "",
    aroundProperty: "",
    servantRoom: "",
    propertyDescription: "",
    carpetArea: "",
    city: "",
    propertyName: "",
    locality: "",
    flatNo: "",
    plotNumber: "",
    floorNo: "",
    totalFloors: "",
    photos: "",
    video: "",
    floorPlan: "",
    featuredImage: "",
    uniquePropertyId: "",
    bathroom: "",
  });

  const [placeAroundProperty, setPlaceAroundProperty] = useState("");
  const [distanceFromProperty, setDistanceFromProperty] = useState("");

  // Select options (unchanged)
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
    "Lift", "CCTV", "Gym", "Garden", "Club House", "Sports", "Swimming Pool",
    "Intercom", "Power Backup", "Gated Community", "Regular Water", "Community Hall",
    "Pet Allowed", "Entry / Exit", "Outdoor Fitness Station", "Half Basket Ball Court",
    "Gazebo", "Badminton Court", "Children Play Area", "Ample Greenery",
    "Water Harvesting Pit", "Water Softner", "Solar Fencing", "Security Cabin",
    "Lawn", "Transformer Yard", "Amphitheatre", "Lawn with Stepping Stones", "None",
  ];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validation logic
    if (name === "city") {
      setErrors((prev) => ({ ...prev, city: !value ? "City is required" : "" }));
    }
    if (name === "propertyName") {
      setErrors((prev) => ({ ...prev, propertyName: !value ? "Property name is required" : "" }));
    }
    if (name === "locality") {
      setErrors((prev) => ({ ...prev, locality: !value ? "Locality is required" : "" }));
    }
    if (name === "flatNo") {
      setErrors((prev) => ({ ...prev, flatNo: !value ? "Flat number is required" : "" }));
    }
    if (name === "floorNo") {
      setErrors((prev) => ({ ...prev, floorNo: !value ? "Floor number is required" : "" }));
    }
    if (name === "totalFloors") {
      setErrors((prev) => ({ ...prev, totalFloors: !value ? "Total floors is required" : "" }));
    }
    if (name === "builtUpArea") {
      setErrors((prev) => ({ ...prev, builtUpArea: !value ? "Built-up area is required" : "" }));
    }
    if (name === "monthlyRent") {
      setErrors((prev) => ({ ...prev, monthlyRent: !value ? "Monthly rent is required" : "" }));
    }
    if (name === "maintenanceCharge") {
      setErrors((prev) => ({ ...prev, maintenanceCharge: !value ? "Maintenance charge is required" : "" }));
    }
    if (name === "propertyDescription") {
      setErrors((prev) => ({ ...prev, propertyDescription: !value ? "Property description is required" : "" }));
    }
    if (name === "uniquePropertyId") {
      setErrors((prev) => ({ ...prev, uniquePropertyId: !value ? "Unique property ID is required" : "" }));
    }
    if (name === "plotArea" && (formData.propertySubType === "Plot" || formData.propertySubType === "Land")) {
      setErrors((prev) => ({ ...prev, plotArea: !value ? "Plot area is required" : "" }));
    }
    if (name === "lengthArea" && (formData.propertySubType === "Plot" || formData.propertySubType === "Land")) {
      setErrors((prev) => ({ ...prev, lengthArea: !value ? "Length area is required" : "" }));
    }
    if (name === "widthArea" && (formData.propertySubType === "Plot" || formData.propertySubType === "Land")) {
      setErrors((prev) => ({ ...prev, widthArea: !value ? "Width area is required" : "" }));
    }
  };

  const handleSelectChange = (name: keyof ResidentialRentFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        aroundProperty: [...prev.aroundProperty, { place: placeAroundProperty, distance: distanceFromProperty }],
      }));
      setPlaceAroundProperty("");
      setDistanceFromProperty("");
      setErrors((prev) => ({ ...prev, aroundProperty: "" }));
    } else {
      setErrors((prev) => ({ ...prev, aroundProperty: "Both place and distance are required" }));
    }
  };

  const handleDateChange = (selectedDates: Date[]) => {
    const date = selectedDates[0] ? selectedDates[0].toISOString().split("T")[0] : "";
    setFormData((prev) => ({ ...prev, availableFrom: date }));
    setErrors((prev) => ({ ...prev, availableFrom: !date ? "Available from date is required" : "" }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: any = {};
    if (!formData.propertyType) newErrors.propertyType = "Property type is required";
    if (!formData.lookingTo) newErrors.lookingTo = "Looking to is required";
    if (!formData.propertySubType) newErrors.propertySubType = "Property sub type is required";
    if (!formData.bhk) newErrors.bhk = "BHK is required";
    if (!formData.bedroom) newErrors.bedroom = "Bedroom is required";
    if (!formData.balcony) newErrors.balcony = "Balcony is required";
    if (!formData.furnishType) newErrors.furnishType = "Furnish type is required";
    if (!formData.availableFrom) newErrors.availableFrom = "Available from date is required";
    if (!formData.monthlyRent) newErrors.monthlyRent = "Monthly rent is required";
    if (!formData.maintenanceCharge) newErrors.maintenanceCharge = "Maintenance charge is required";
    if (!formData.securityDeposit) newErrors.securityDeposit = "Security deposit is required";
    if (!formData.lockInPeriod) newErrors.lockInPeriod = "Lock-in period is required";
    if (!formData.chargeBrokerage) newErrors.chargeBrokerage = "Brokerage charge is required";
    if (!formData.preferredTenantType) newErrors.preferredTenantType = "Preferred tenant type is required";
    if (!formData.builtUpArea) newErrors.builtUpArea = "Built-up area is required";
    if (!formData.totalProjectArea) newErrors.totalProjectArea = "Total project area is required";
    if (formData.aroundProperty.length === 0) newErrors.aroundProperty = "At least one place around property is required";
    if (!formData.servantRoom) newErrors.servantRoom = "Servant room is required";
    if (!formData.propertyDescription) newErrors.propertyDescription = "Property description is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.propertyName) newErrors.propertyName = "Property name is required";
    if (!formData.locality) newErrors.locality = "Locality is required";
    if (!formData.flatNo) newErrors.flatNo = "Flat number is required";
    if (!formData.floorNo) newErrors.floorNo = "Floor number is required";
    if (!formData.totalFloors) newErrors.totalFloors = "Total floors is required";
    if (formData.photos.length === 0) newErrors.photos = "At least one photo is required";
    if (!formData.uniquePropertyId) newErrors.uniquePropertyId = "Unique property ID is required";
    // Add validation for Plot/Land specific fields
    if (formData.propertySubType === "Plot" || formData.propertySubType === "Land") {
      if (!formData.plotArea) newErrors.plotArea = "Plot area is required";
      if (!formData.lengthArea) newErrors.lengthArea = "Length area is required";
      if (!formData.widthArea) newErrors.widthArea = "Width area is required";
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));

    if (Object.values(newErrors).every((error) => !error)) {
      console.log("Form Data:", formData);
      // Add your form submission logic here (e.g., API call)
    }
  };

  const areaUnitLabel = formData.areaUnits || "Sq.ft";
  const shouldRenderFields = formData.propertyType === "Residential" && formData.lookingTo === "Rent";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-2 sm:px-6 lg:px-8">
      <PageBreadcrumb pageTitle="Residential Rent Edit" pagePlacHolder="Edit property details" />
      <ComponentCard title="Edit Basic Details">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Unique Property ID */}
          <div>
            <Label htmlFor="uniquePropertyId">Unique Property ID *</Label>
            <Input
              type="text"
              id="uniquePropertyId"
              name="uniquePropertyId"
              value={formData.uniquePropertyId}
              onChange={handleInputChange}
              placeholder="Enter unique property ID"
              className="dark:bg-dark-900"
            />
            {errors.uniquePropertyId && (
              <p className="text-red-500 text-sm mt-1">{errors.uniquePropertyId}</p>
            )}
          </div>

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

          {shouldRenderFields && (
            <>
              {/* BHK */}
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

              {/* Bedroom */}
              <div>
                <Label htmlFor="bedroom">Bedroom *</Label>
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
                {errors.bedroom && <p className="text-red-500 text-sm mt-1">{errors.bedroom}</p>}
              </div>

              {/* Bathroom */}
              <div>
                <Label htmlFor="bathroom">Bathroom *</Label>
                <Input
                  type="number"
                  id="bathroom"
                  name="bathroom"
                  value={formData.bathroom}
                  onChange={handleInputChange}
                  placeholder="Enter number of bathrooms"
                  className="dark:bg-dark-900"
                />
                {errors.bathroom && <p className="text-red-500 text-sm mt-1">{errors.bathroom}</p>}
              </div>

              {/* Balcony */}
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
                {errors.balcony && <p className="text-red-500 text-sm mt-1">{errors.balcony}</p>}
              </div>

              {/* Furnish Type */}
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

              {/* Available From */}
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

              {/* Monthly Rent */}
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

              {/* Maintenance Charge */}
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

              {/* Security Deposit */}
              <div>
                <Label htmlFor="securityDeposit">Security Deposit *</Label>
                <Input
                  type="text"
                  id="securityDeposit"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleInputChange}
                  placeholder="Enter security deposit (e.g., 2 Months)"
                  className="dark:bg-dark-900"
                />
                {errors.securityDeposit && (
                  <p className="text-red-500 text-sm mt-1">{errors.securityDeposit}</p>
                )}
              </div>

              {/* Lock In Period */}
              <div>
                <Label htmlFor="lockInPeriod">Lock In Period *</Label>
                <Input
                  type="text"
                  id="lockInPeriod"
                  name="lockInPeriod"
                  value={formData.lockInPeriod}
                  onChange={handleInputChange}
                  placeholder="Enter lock-in period (e.g., 3 Months)"
                  className="dark:bg-dark-900"
                />
                {errors.lockInPeriod && (
                  <p className="text-red-500 text-sm mt-1">{errors.lockInPeriod}</p>
                )}
              </div>

              {/* Charge Brokerage */}
              <div>
                <Label htmlFor="chargeBrokerage">Do You Charge Brokerage? *</Label>
                <Input
                  type="text"
                  id="chargeBrokerage"
                  name="chargeBrokerage"
                  value={formData.chargeBrokerage}
                  onChange={handleInputChange}
                  placeholder="Enter brokerage charge (e.g., 15 Days)"
                  className="dark:bg-dark-900"
                />
                {errors.chargeBrokerage && (
                  <p className="text-red-500 text-sm mt-1">{errors.chargeBrokerage}</p>
                )}
              </div>

              {/* Preferred Tenant Type */}
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

              {/* Area Units */}
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

              {/* Built-up Area */}
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

              {/* Carpet Area */}
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

              {/* Plot/Land Specific Fields */}
              {(formData.propertySubType === "Plot" || formData.propertySubType === "Land") && (
                <>
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
                    {errors.plotArea && <p className="text-red-500 text-sm mt-1">{errors.plotArea}</p>}
                  </div>

                  <div>
                    <Label htmlFor="lengthArea">Length Area (meters) *</Label>
                    <Input
                      type="number"
                      id="lengthArea"
                      name="lengthArea"
                      value={formData.lengthArea}
                      onChange={handleInputChange}
                      className="dark:bg-dark-900"
                    />
                    {errors.lengthArea && <p className="text-red-500 text-sm mt-1">{errors.lengthArea}</p>}
                  </div>

                  <div>
                    <Label htmlFor="widthArea">Width Area (meters) *</Label>
                    <Input
                      type="number"
                      id="widthArea"
                      name="widthArea"
                      value={formData.widthArea}
                      onChange={handleInputChange}
                      className="dark:bg-dark-900"
                    />
                    {errors.widthArea && <p className="text-red-500 text-sm mt-1">{errors.widthArea}</p>}
                  </div>
                </>
              )}

              {/* Total Project Area */}
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

              {/* Facilities */}
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

              {/* Additional Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Additional Details
                </h3>

                {/* Facing */}
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

                {/* Car Parking */}
                <div>
                  <Label htmlFor="carParking" className="mt-2">Car Parking</Label>
                  <Select
                    options={carParkingOptions}
                    placeholder="Select car parking"
                    onChange={handleSelectChange("carParking")}
                    value={formData.carParking}
                    className="dark:bg-dark-900"
                  />
                </div>

                {/* Bike Parking */}
                <div>
                  <Label htmlFor="bikeParking" className="mt-2">Bike Parking</Label>
                  <Select
                    options={bikeParkingOptions}
                    placeholder="Select bike parking"
                    onChange={handleSelectChange("bikeParking")}
                    value={formData.bikeParking}
                    className="dark:bg-dark-900"
                  />
                </div>

                {/* Open Parking */}
                <div>
                  <Label htmlFor="openParking" className="mt-2">Open Parking</Label>
                  <Select
                    options={openParkingOptions}
                    placeholder="Select open parking"
                    onChange={handleSelectChange("openParking")}
                    value={formData.openParking}
                    className="dark:bg-dark-900"
                  />
                </div>

                {/* Around This Property */}
                <div>
                  <Label htmlFor="aroundProperty" className="mt-4">Around This Property *</Label>
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
                            <span>{entry.place} - {entry.distance}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  aroundProperty: prev.aroundProperty.filter((_, i) => i !== index),
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

                {/* Servant Room */}
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

                {/* Property Description */}
                <div>
                  <Label htmlFor="propertyDescription" className="mt-5">Property Description *</Label>
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

                {/* RERA Approved */}
                <div>
                  <Label htmlFor="reraApproved">RERA Approved</Label>
                  <div className="flex space-x-4">
                    {["1", "0"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelectChange("reraApproved")(option)}
                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                          formData.reraApproved === option
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option === "1" ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Uploaded From Seller Panel */}
                <div>
                  <Label htmlFor="uploadedFromSellerPanel">Uploaded From Seller Panel</Label>
                  <div className="flex space-x-4">
                    {["Yes", "No"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelectChange("uploadedFromSellerPanel")(option)}
                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                          formData.uploadedFromSellerPanel === option
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Featured Property */}
                <div>
                  <Label htmlFor="featuredProperty">Featured Property</Label>
                  <div className="flex space-x-4">
                    {["Yes", "No"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelectChange("featuredProperty")(option)}
                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                          formData.featuredProperty === option
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Property Location Fields */}
          <PropertyLocationFields
            formData={{
              city: formData.city,
              propertyName: formData.propertyName,
              locality: formData.locality,
              flatNo: formData.propertySubType !== "Plot" ? formData.flatNo : formData.plotNumber,
              floorNo: formData.floorNo,
              totalFloors: formData.totalFloors,
            }}
            errors={{
              city: errors.city,
              propertyName: errors.propertyName,
              locality: errors.locality,
              flatNo: formData.propertySubType !== "Plot" ? errors.flatNo : errors.plotNumber,
              floorNo: errors.floorNo,
              totalFloors: errors.totalFloors,
            }}
            handleInputChange={handleInputChange}
            isPlot={formData.propertySubType === "Plot" || formData.propertySubType === "Land"}
          />

          {/* Media Upload Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Upload Media</h3>
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
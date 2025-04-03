import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useLocation } from "react-router"; // Corrected import
import ComponentCard from "../../../components/common/ComponentCard";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import DatePicker from "../../../components/form/date-picker";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PropertyLocationFields from "../components/propertyLocationFields";
import MediaUploadSection from "../components/MediaUploadSection";

interface AroundProperty {
  place: string;
  distance: string;
}

interface ResidentialBuyFormData {
  propertyType: "Residential" | "Commercial";
  lookingTo: "Sell" | "Rent" | "PG-Co-living";
  transactionType: "New" | "Resale";
  location: string;
  propertySubType: "Apartment" | "Independent House" | "Independent Villa" | "Plot" | "Land";
  constructionStatus: "Ready to move" | "Under Construction";
  possessionEnd?: string;
  bhk: "1BHK" | "2BHK" | "3BHK" | "4BHK" | "4+BHK";
  bedroom: "1" | "2" | "3" | "4" | "4+";
  balcony: "1" | "2" | "3" | "4" | "4+";
  furnishType: "Fully" | "Semi" | "Unfurnished";
  ageOfProperty: "0-5" | "5-10" | "Above 10";
  areaUnits: "Sq.ft" | "Sq.yd" | "Acres";
  builtUpArea: string;
  carpetArea: string;
  plotArea: string;
  lengthArea: string;
  widthArea: string;
  totalProjectArea: string;
  unitCost: string;
  pentHouse: "Yes" | "No";
  propertyCost: string;
  possessionStatus: "Immediate" | "Future";
  facilities: string[];
  investorProperty: "Yes" | "No";
  loanFacility: "Yes" | "No";
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
}

interface SelectOption {
  value: string;
  label: string;
}

const ResidentialBuyEdit: React.FC = () => {
  const location = useLocation();
  const property = location.state?.property;

  const [formData, setFormData] = useState<ResidentialBuyFormData>(() => {
    if (property) {
      const possessionEndDate = property.under_construction
        ? new Date(property.under_construction).toISOString().split("T")[0]
        : "";

      return {
        propertyType: property.property_in || "Residential",
        lookingTo: property.property_for || "Sell",
        transactionType: property.transaction_type || "New",
        location: property.google_address || "",
        propertySubType: property.sub_type || "Apartment",
        constructionStatus: property.occupancy === "Under Construction" ? "Under Construction" : "Ready to move",
        possessionEnd: possessionEndDate,
        bhk: property.bedrooms ? `${property.bedrooms}BHK` : "1BHK",
        bedroom: property.bathroom ? String(property.bathroom) as "1" | "2" | "3" | "4" | "4+" : "1",
        balcony: property.balconies ? String(property.balconies) as "1" | "2" | "3" | "4" | "4+" : "1",
        furnishType: property.furnished_status === "Unfurnished" ? "Unfurnished" : property.furnished_status === "Semi" ? "Semi" : "Fully",
        ageOfProperty: property.property_age === "0.00" ? "0-5" : "5-10",
        areaUnits: property.area_units || "Sq.ft",
        builtUpArea: property.builtup_area || "",
        carpetArea: property.carpet_area || "",
        plotArea: property.plot_area || "",
        lengthArea: property.length_area || "",
        widthArea: property.width_area || "",
        totalProjectArea: property.total_project_area || "",
        unitCost: "",
        pentHouse: property.pent_house === "Yes" ? "Yes" : "No",
        propertyCost: property.property_cost || "",
        possessionStatus: property.possession_status || "Immediate",
        facilities: property.facilities ? property.facilities.split(",") : [],
        investorProperty: property.investor_property === "Yes" ? "Yes" : "No",
        loanFacility: property.loan_facility === "Yes" ? "Yes" : "No",
        facing: property.facing || "",
        carParking: property.car_parking || "0",
        bikeParking: property.bike_parking || "0",
        openParking: property.open_parking || "0",
        aroundProperty: [],
        servantRoom: property.servant_room === "Yes" ? "Yes" : "No",
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
      };
    }
    return {
      propertyType: "Residential",
      lookingTo: "Sell",
      transactionType: "New",
      location: "",
      propertySubType: "Apartment",
      constructionStatus: "Ready to move",
      possessionEnd: "",
      bhk: "2BHK",
      bedroom: "3",
      balcony: "3",
      furnishType: "Semi",
      ageOfProperty: "5-10",
      areaUnits: "Sq.yd",
      builtUpArea: "2000",
      carpetArea: "",
      plotArea: "183.00",
      lengthArea: "9.14",
      widthArea: "18.24",
      totalProjectArea: "",
      unitCost: "100",
      pentHouse: "No",
      propertyCost: "1005",
      possessionStatus: "Immediate",
      facilities: ["Lift", "Regular Water", "Gazebo", "Water Harvesting Pit", "Security Cabin"],
      investorProperty: "Yes",
      loanFacility: "Yes",
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
      plotNumber: "87",
      floorNo: "",
      totalFloors: "",
      photos: [],
      video: null,
      floorPlan: null,
      featuredImageIndex: null,
    };
  });

  const [errors, setErrors] = useState({
    propertyType: "",
    lookingTo: "",
    propertySubType: "",
    constructionStatus: "",
    possessionEnd: "",
    bhk: "",
    bedroom: "",
    balcony: "",
    furnishType: "",
    builtUpArea: "",
    plotArea: "",
    lengthArea: "",
    widthArea: "",
    totalProjectArea: "",
    unitCost: "",
    propertyCost: "",
    investorProperty: "",
    loanFacility: "",
    aroundProperty: "",
    servantRoom: "",
    propertyDescription: "",
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
  });

  const [placeAroundProperty, setPlaceAroundProperty] = useState("");
  const [distanceFromProperty, setDistanceFromProperty] = useState("");

  // Updated Select options
  const propertyTypeOptions: SelectOption[] = [
    { value: "Residential", label: "Residential" },
    { value: "Commercial", label: "Commercial" },
  ];
  const lookingToOptions: SelectOption[] = [
    { value: "Sell", label: "Sell" },
    { value: "Rent", label: "Rent" },
    { value: "PG-Co-living", label: "PG-Co-living" },
  ];
  const transactionTypeOptions: SelectOption[] = [
    { value: "New", label: "New" },
    { value: "Resale", label: "Resale" },
  ];
  const propertySubTypeOptions: SelectOption[] = [
    { value: "Apartment", label: "Apartment" },
    { value: "Independent House", label: "Independent House" },
    { value: "Independent Villa", label: "Independent Villa" },
    { value: "Plot", label: "Plot" },
    { value: "Land", label: "Land" },
  ];
  const constructionStatusOptions: SelectOption[] = [
    { value: "Ready to move", label: "Ready to move" },
    { value: "Under Construction", label: "Under Construction" },
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
  const ageOfPropertyOptions: SelectOption[] = [
    { value: "0-5", label: "0-5" },
    { value: "5-10", label: "5-10" },
    { value: "Above 10", label: "Above 10" },
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

    if (name === "city") {
      setErrors((prev) => ({ ...prev, city: !value ? "City is required" : "" }));
    }
    if (name === "propertyName") {
      setErrors((prev) => ({ ...prev, propertyName: !value ? "Property name is required" : "" }));
    }
    if (name === "locality") {
      setErrors((prev) => ({ ...prev, locality: !value ? "Locality is required" : "" }));
    }
    if (name === "flatNo" && formData.propertySubType !== "Plot") {
      setErrors((prev) => ({ ...prev, flatNo: !value ? "Flat number is required" : "" }));
    }
    if (name === "plotNumber" && formData.propertySubType === "Plot") {
      setErrors((prev) => ({ ...prev, plotNumber: !value ? "Plot number is required" : "" }));
    }
    if (name === "floorNo" && formData.propertySubType !== "Plot") {
      setErrors((prev) => ({ ...prev, floorNo: !value ? "Floor number is required" : "" }));
    }
    if (name === "totalFloors" && formData.propertySubType !== "Plot") {
      setErrors((prev) => ({ ...prev, totalFloors: !value ? "Total floors is required" : "" }));
    }
    if (name === "builtUpArea" && formData.propertySubType !== "Plot") {
      setErrors((prev) => ({ ...prev, builtUpArea: !value ? "Built-up area is required" : "" }));
    }
    if (name === "plotArea" && formData.propertySubType === "Plot") {
      setErrors((prev) => ({ ...prev, plotArea: !value ? "Plot area is required" : "" }));
    }
    if (name === "lengthArea" && formData.propertySubType === "Plot") {
      setErrors((prev) => ({ ...prev, lengthArea: !value ? "Length area is required" : "" }));
    }
    if (name === "widthArea" && formData.propertySubType === "Plot") {
      setErrors((prev) => ({ ...prev, widthArea: !value ? "Width area is required" : "" }));
    }
    if (name === "totalProjectArea") {
      setErrors((prev) => ({ ...prev, totalProjectArea: !value ? "Total project area is required" : "" }));
    }
    if (name === "unitCost") {
      setErrors((prev) => ({ ...prev, unitCost: !value ? "Unit cost is required" : "" }));
    }
    if (name === "propertyCost") {
      const propertyCostValue = parseFloat(value);
      setErrors((prev) => ({
        ...prev,
        propertyCost:
          propertyCostValue < 100000 || propertyCostValue > 3000000000
            ? "Property cost should be between 1 lakh to 300 cr"
            : "",
      }));
    }
    if (name === "propertyDescription") {
      setErrors((prev) => ({ ...prev, propertyDescription: !value ? "Property description is required" : "" }));
    }
  };

  const handleSelectChange = (name: keyof ResidentialBuyFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Add validation as needed
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
    setFormData((prev) => ({ ...prev, possessionEnd: date }));
    setErrors((prev) => ({ ...prev, possessionEnd: !date ? "Possession end date is required" : "" }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: any = {};
    if (!formData.propertyType) newErrors.propertyType = "Property type is required";
    if (!formData.lookingTo) newErrors.lookingTo = "Looking to is required";
    if (!formData.propertySubType) newErrors.propertySubType = "Property sub type is required";
    if (
      (formData.propertySubType === "Apartment" ||
        formData.propertySubType === "Independent House" ||
        formData.propertySubType === "Independent Villa") &&
      !formData.constructionStatus
    ) {
      newErrors.constructionStatus = "Construction status is required";
    }
    if (
      formData.constructionStatus === "Under Construction" &&
      (formData.propertySubType === "Apartment" ||
        formData.propertySubType === "Independent House" ||
        formData.propertySubType === "Independent Villa") &&
      !formData.possessionEnd
    ) {
      newErrors.possessionEnd = "Possession end date is required";
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
    if (
      formData.propertySubType !== "Plot" &&
      formData.propertySubType !== "Land" &&
      !formData.builtUpArea
    ) {
      newErrors.builtUpArea = "Built-up area is required";
    }
    if (formData.propertySubType === "Plot" && !formData.plotArea) {
      newErrors.plotArea = "Plot area is required";
    }
    if (formData.propertySubType === "Plot" && !formData.lengthArea) {
      newErrors.lengthArea = "Length area is required";
    }
    if (formData.propertySubType === "Plot" && !formData.widthArea) {
      newErrors.widthArea = "Width area is required";
    }
    if (!formData.totalProjectArea) newErrors.totalProjectArea = "Total project area is required";
    if (!formData.unitCost) newErrors.unitCost = "Unit cost is required";
    if (!formData.propertyCost) newErrors.propertyCost = "Property cost is required";
    if (
      (formData.propertySubType === "Apartment" ||
        formData.propertySubType === "Independent Villa" ||
        formData.propertySubType === "Plot") &&
      !formData.investorProperty
    ) {
      newErrors.investorProperty = "Investor property is required";
    }
    if (
      (formData.propertySubType === "Apartment" ||
        formData.propertySubType === "Independent House" ||
        formData.propertySubType === "Independent Villa" ||
        formData.propertySubType === "Plot" ||
        formData.propertySubType === "Land") &&
      !formData.loanFacility
    ) {
      newErrors.loanFacility = "Loan facility is required";
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
    if (!formData.propertyDescription) newErrors.propertyDescription = "Property description is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.propertyName) newErrors.propertyName = "Property name is required";
    if (!formData.locality) newErrors.locality = "Locality is required";
    if (formData.propertySubType !== "Plot" && !formData.flatNo) newErrors.flatNo = "Flat number is required";
    if (formData.propertySubType === "Plot" && !formData.plotNumber) newErrors.plotNumber = "Plot number is required";
    if (formData.propertySubType !== "Plot" && !formData.floorNo) newErrors.floorNo = "Floor number is required";
    if (formData.propertySubType !== "Plot" && !formData.totalFloors) newErrors.totalFloors = "Total floors is required";
    if (formData.photos.length === 0) newErrors.photos = "At least one photo is required";

    setErrors((prev) => ({ ...prev, ...newErrors }));

    if (Object.values(newErrors).every((error) => !error)) {
      console.log("Form Data:", formData);
    }
  };

  const areaUnitLabel = formData.areaUnits || "Sq.yd";
  const shouldRenderFields =
    formData.propertyType === "Residential" &&
    formData.lookingTo === "Sell" &&
    (formData.transactionType === "New" || formData.transactionType === "Resale");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-2 sm:px-6 lg:px-8">
      <PageBreadcrumb pageTitle="Residential Buy Edit" pagePlacHolder="Edit property details" />
      <ComponentCard title="Edit Basic Details">
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
            {errors.propertyType && <p className="text-red-500 text-sm mt-1">{errors.propertyType}</p>}
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
            {errors.lookingTo && <p className="text-red-500 text-sm mt-1">{errors.lookingTo}</p>}
          </div>

          {/* Transaction Type */}
          <div>
            <Label htmlFor="transactionType">Transaction Type</Label>
            <Select
              options={transactionTypeOptions}
              placeholder="Select transaction type"
              onChange={handleSelectChange("transactionType")}
              value={formData.transactionType}
              className="dark:bg-dark-900"
            />
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
            {errors.propertySubType && <p className="text-red-500 text-sm mt-1">{errors.propertySubType}</p>}
          </div>

          {shouldRenderFields && (
            <>
              {(formData.propertySubType === "Apartment" ||
                formData.propertySubType === "Independent House" ||
                formData.propertySubType === "Independent Villa") && (
                <div>
                  <Label htmlFor="constructionStatus">Construction Status *</Label>
                  <div className="flex space-x-4">
                    {constructionStatusOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelectChange("constructionStatus")(option.value)}
                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                          formData.constructionStatus === option.value
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {errors.constructionStatus && <p className="text-red-500 text-sm mt-1">{errors.constructionStatus}</p>}
                </div>
              )}

              {(formData.propertySubType === "Apartment" ||
                formData.propertySubType === "Independent House" ||
                formData.propertySubType === "Independent Villa" ||
                formData.propertySubType === "Plot") && (
                <>
                  {formData.constructionStatus === "Ready to move" && (
                    <div>
                      <Label htmlFor="ageOfProperty">Age of Property</Label>
                      <Select
                        options={ageOfPropertyOptions}
                        placeholder="Select age of property"
                        onChange={handleSelectChange("ageOfProperty")}
                        value={formData.ageOfProperty}
                        className="dark:bg-dark-900"
                      />
                    </div>
                  )}
                  {formData.constructionStatus === "Under Construction" && (
                    <div>
                      <Label htmlFor="possessionEnd">Possession End *</Label>
                      <DatePicker
                        id="possessionEnd"
                        mode="single"
                        onChange={handleDateChange}
                        defaultDate={formData.possessionEnd}
                        placeholder="Select possession end date"
                        label=""
                      />
                      {errors.possessionEnd && <p className="text-red-500 text-sm mt-1">{errors.possessionEnd}</p>}
                    </div>
                  )}
                </>
              )}

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
                  {errors.bedroom && <p className="text-red-500 text-sm mt-1">{errors.bedroom}</p>}
                </div>
              )}

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
                  {errors.balcony && <p className="text-red-500 text-sm mt-1">{errors.balcony}</p>}
                </div>
              )}

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
                  {errors.furnishType && <p className="text-red-500 text-sm mt-1">{errors.furnishType}</p>}
                </div>
              )}

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

              {(formData.propertySubType === "Apartment" ||
                formData.propertySubType === "Independent House" ||
                formData.propertySubType === "Independent Villa") && (
                <>
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
                    {errors.builtUpArea && <p className="text-red-500 text-sm mt-1">{errors.builtUpArea}</p>}
                  </div>

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
                  </div>
                </>
              )}

              {formData.propertySubType === "Plot" && (
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
                {errors.totalProjectArea && <p className="text-red-500 text-sm mt-1">{errors.totalProjectArea}</p>}
              </div>

              <div>
                <Label htmlFor="unitCost">Unit Cost (₹) *</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700 dark:text-gray-300">Rs</span>
                  <Input
                    type="number"
                    id="unitCost"
                    name="unitCost"
                    value={formData.unitCost}
                    onChange={handleInputChange}
                    className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                {errors.unitCost && <p className="text-red-500 text-sm mt-1">{errors.unitCost}</p>}
              </div>

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

              <div>
                <Label htmlFor="propertyCost">Property Cost *</Label>
                <Input
                  type="number"
                  id="propertyCost"
                  name="propertyCost"
                  value={formData.propertyCost}
                  onChange={handleInputChange}
                  className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <p className="text-gray-500 text-sm mt-1">One Thousand Five Rupees</p>
                {errors.propertyCost && <p className="text-red-500 text-sm mt-1">{errors.propertyCost}</p>}
              </div>

              {(formData.propertySubType === "Plot" || formData.propertySubType === "Land") && (
                <div>
                  <Label htmlFor="possessionStatus">Possession Status</Label>
                  <div className="flex space-x-4">
                    {["Immediate", "Future"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelectChange("possessionStatus")(option)}
                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                          formData.possessionStatus === option
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

              {(formData.propertySubType === "Apartment" ||
                formData.propertySubType === "Independent Villa" ||
                formData.propertySubType === "Plot") && (
                <div>
                  <Label htmlFor="investorProperty">Investor Property *</Label>
                  <div className="flex space-x-4">
                    {["Yes", "No"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelectChange("investorProperty")(option)}
                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                          formData.investorProperty === option
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {errors.investorProperty && <p className="text-red-500 text-sm mt-1">{errors.investorProperty}</p>}
                </div>
              )}

              {(formData.propertySubType === "Apartment" ||
                formData.propertySubType === "Independent House" ||
                formData.propertySubType === "Independent Villa" ||
                formData.propertySubType === "Plot" ||
                formData.propertySubType === "Land") && (
                <div>
                  <Label htmlFor="loanFacility">Loan Facility *</Label>
                  <div className="flex space-x-4">
                    {["Yes", "No"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelectChange("loanFacility")(option)}
                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                          formData.loanFacility === option
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {errors.loanFacility && <p className="text-red-500 text-sm mt-1">{errors.loanFacility}</p>}
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Additional Details</h3>
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

                {(formData.propertySubType === "Apartment" ||
                  formData.propertySubType === "Independent House" ||
                  formData.propertySubType === "Independent Villa") && (
                  <>
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
                  </>
                )}

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
                  {errors.aroundProperty && <p className="text-red-500 text-sm mt-1">{errors.aroundProperty}</p>}
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
                    {errors.servantRoom && <p className="text-red-500 text-sm mt-1">{errors.servantRoom}</p>}
                  </div>
                )}

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
              </div>
            </>
          )}

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
            isPlot={formData.propertySubType === "Plot" || formData.propertySubType === 'Land'}
          />

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

export default ResidentialBuyEdit;
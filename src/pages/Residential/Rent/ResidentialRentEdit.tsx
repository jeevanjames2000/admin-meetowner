import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import ComponentCard from "../../../components/common/ComponentCard";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import DatePicker from "../../../components/form/date-picker";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PropertyLocationFields from "../components/propertyLocationFields";
// import MediaUploadSection from "../components/MediaUploadSection";
import { updateListing } from "../../../store/slices/listings";
import { AppDispatch } from "../../../store/store";

interface AroundProperty {
  place: string;
  distance: string;
}

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
  unitCost: string; // Added unitCost
  pentHouse: "Yes" | "No";
  facilities: { [key: string]: boolean }; 
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
  ageOfProperty: "5" | "10" | "11"; // Added ageOfProperty
}

interface SelectOption {
  value: string;
  label: string;
}

const ResidentialRentEdit: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const property = location.state?.property;


  const defaultFacilities = {
    Lift: false,
    CCTV: false,
    Gym: false,
    Garden: false,
    "Club House": false,
    Sports: false,
    "Swimming Pool": false,
    Intercom: false,
    "Power Backup": false,
    "Gated Community": false,
    "Regular Water": false,
    "Community Hall": false,
    "Pet Allowed": false,
    "Entry / Exit": false,
    "Outdoor Fitness Station": false,
    "Half Basket Ball Court": false,
    Gazebo: false,
    "Badminton Court": false,
    "Children Play Area": false,
    "Ample Greenery": false,
    "Water Harvesting Pit": false,
    "Water Softner": false,
    "Solar Fencing": false,
    "Security Cabin": false,
    Lawn: false,
    "Transformer Yard": false,
    Amphitheatre: false,
    "Lawn with Stepping Stones": false,
    None: false,
  };

  const transformToUIValue = (value: string | number | undefined): "0" | "1" | "2" | "3" | "4+" => {
    const numValue = Number(value);
    if (isNaN(numValue)) return "0"; // Handle undefined or invalid values
    return numValue >= 5 ? "4+" : String(value) as "0" | "1" | "2" | "3" | "4+";
  };
  const [originalData, setOriginalData] = useState<any>(property || {});
  const transformParkingValue = (value: string | number | undefined): "0" | "1" | "2" | "3" | "4+" => {
    const stringValue = String(value); // Convert to string for consistent comparison
    return stringValue === "5" ? "4+" : (stringValue as "0" | "1" | "2" | "3" | "4+");
  };

  const [formData, setFormData] = useState<ResidentialRentFormData>(() => {
    if (property) {
      const facilitiesString = property.facilities || "";
      const selectedFacilities = facilitiesString
        .split(", ")
        .map((item: string) => item.trim())
        .filter(Boolean);
      const updatedFacilities = { ...defaultFacilities };
      selectedFacilities.forEach((facility: PropertyKey) => {
        if (updatedFacilities.hasOwnProperty(facility)) {
          updatedFacilities[facility as keyof typeof defaultFacilities] = true;
        }
      });
      return {
        propertyType: property.property_in || "Residential",
        lookingTo: property.property_for || "Rent",
        transactionType: property.transaction_type || null,
        location: property.google_address || "",
        propertySubType: property.sub_type || "Apartment",
        bhk: property.bedrooms ? `${property.bedrooms}BHK` : "1BHK",
        bedroom: transformToUIValue(property.bathroom),
        balcony:  transformToUIValue(property.balconies),
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
          ? property.brokerage_charge === "0.00"
            ? "None"
            : `${parseInt(property.brokerage_charge)} Days`
          : "None",
        preferredTenantType: property.types || "Anyone",
        areaUnits: property.area_units || "Sq.ft",
        builtUpArea: property.builtup_area || "",
        carpetArea: property.carpet_area || "",
        lengthArea: property.length_area || "",
        widthArea: property.width_area || "",
        plotArea: property.plot_area || "",
        totalProjectArea: property.total_project_area || "",
        unitCost: property.builtup_unit || "6800.00", // Added unitCost
        pentHouse: property.pent_house === "Yes" ? "Yes" : "No",
        facilities: updatedFacilities,
        facing: property.facing || "",
        carParking: transformParkingValue(property.car_parking), // Transform "5" or 5 to "4+"
        bikeParking: transformParkingValue(property.bike_parking), // Transform "5" or 5 to "4+"
        openParking: transformParkingValue(property.open_parking), // Transform "5" or 5 to "4+"
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
        // photos: [],
        // video: null,
        // floorPlan: null,
        // featuredImageIndex: null,
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
        ageOfProperty: property.property_age ? String(property.property_age) as "5" | "10" | "11" : "5", // Added ageOfProperty
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
      unitCost: "6800.00", // Added unitCost
      pentHouse: "No",
      facilities: { ...defaultFacilities },
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
      // photos: [],
      // video: null,
      // floorPlan: null,
      // featuredImageIndex: null,
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
      ageOfProperty: "5", // Added ageOfProperty
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
    plotArea: "",
    lengthArea: "",
    widthArea: "",
    totalProjectArea: "",
    unitCost: "", // Added unitCost
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
    // photos: "",
    // video: "",
    // floorPlan: "",
    // featuredImage: "",
    uniquePropertyId: "",
    bathroom: "",
    ageOfProperty: "", // Added ageOfProperty
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
  const ageOfPropertyOptions: SelectOption[] = [ // Added ageOfPropertyOptions
    { value: "5", label: "0-5" },
    { value: "10", label: "5-10" },
    { value: "11", label: "Above 10" },
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
    if (name === "flatNo" && formData.propertySubType !== "Plot" && formData.propertySubType !== "Land") {
      setErrors((prev) => ({ ...prev, flatNo: !value ? "Flat number is required" : "" }));
    }
    if (name === "plotNumber" && (formData.propertySubType === "Plot" || formData.propertySubType === "Land")) {
      setErrors((prev) => ({ ...prev, plotNumber: !value ? "Plot number is required" : "" }));
    }
    if (name === "floorNo" && formData.propertySubType !== "Plot" && formData.propertySubType !== "Land") {
      setErrors((prev) => ({ ...prev, floorNo: !value ? "Floor number is required" : "" }));
    }
    if (name === "totalFloors" && formData.propertySubType !== "Plot" && formData.propertySubType !== "Land") {
      setErrors((prev) => ({ ...prev, totalFloors: !value ? "Total floors is required" : "" }));
    }
    if (name === "builtUpArea" && formData.propertySubType !== "Plot" && formData.propertySubType !== "Land") {
      setErrors((prev) => ({ ...prev, builtUpArea: !value ? "Built-up area is required" : "" }));
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
    if (name === "unitCost") { // Added validation for unitCost
      setErrors((prev) => ({ ...prev, unitCost: !value ? "Unit cost is required" : "" }));
    }
  };

  const handleSelectChange = (name: keyof ResidentialRentFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFacilityChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = event.target;
    if (id === "None") {
      setFormData((prev) => {
        const updatedFacilities = { ...prev.facilities };
        for (const key in updatedFacilities) {
          updatedFacilities[key] = false;
        }
        updatedFacilities[id] = checked;
        return { ...prev, facilities: updatedFacilities };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        facilities: {
          ...prev.facilities,
          None: false, // Uncheck "None" when any other facility is selected
          [id]: checked,
        },
      }));
    }
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
    const dateObj = selectedDates[0];
    let date = "";
    if (dateObj) {
      // Format date in local time zone
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Months are 0-based
      const day = String(dateObj.getDate()).padStart(2, "0");
      date = `${year}-${month}-${day}`;
    }
  
    setFormData((prev) => ({ ...prev, availableFrom: date }));
    setErrors((prev) => ({ ...prev, availableFrom: !date ? "Available from date is required" : "" }));
  };
  const getChangedFields = () => {
    const changedFields: Partial<any> = {};

    const fieldMappings: {
      [key in keyof ResidentialRentFormData]?: {
        apiField: string;
        transform?: (value: any) => any;
        applicableTo: string[];
      };
    } = {
      propertyType: { apiField: "property_in", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      lookingTo: { apiField: "property_for", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      transactionType: { apiField: "transaction_type", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      location: { apiField: "google_address", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      propertySubType: { apiField: "sub_type", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      bhk: {
        apiField: "bedrooms",
        transform: (value: string) => value.replace("BHK", ""),
        applicableTo: ["Apartment", "Independent House", "Independent Villa"],
      },
      bedroom: {
        apiField: "bathroom",
        transform: (value: string) => (value === "4+" ? 5 : parseInt(value)),
        applicableTo: ["Apartment"],
      },
      balcony: {
        apiField: "balconies",
        transform: (value: string) => (value === "4+" ? 5 : parseInt(value)),
        applicableTo: ["Apartment"],
      },
      furnishType: { apiField: "furnished_status", applicableTo: ["Apartment", "Independent House", "Independent Villa"] },
      availableFrom: {
        apiField: "available_from",
        transform: (value: string) => value,
        applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"],
      },
      monthlyRent: { apiField: "monthly_rent", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      maintenanceCharge: { apiField: "maintenance", applicableTo: ["Apartment", "Independent House", "Independent Villa"] },
      securityDeposit: {
        apiField: "security_deposit",
        transform: (value: string) => value.replace(" Months", ""),
        applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"],
      },
      lockInPeriod: {
        apiField: "lock_in",
        transform: (value: string) => value.replace(" Months", ""),
        applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"],
      },
      chargeBrokerage: {
        apiField: "brokerage_charge",
        transform: (value: string) => value === "None" ? "0.00" : `${value.replace(" Days", "")}.00`,
        applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"],
      },
      facilities: {
        apiField: "facilities",
        transform: (value: { [key: string]: boolean }) =>
          Object.keys(value)
            .filter((key) => value[key])
            .join(", ") || null,
        applicableTo: ["Apartment", "Independent House", "Independent Villa"],
      },
      preferredTenantType: { apiField: "types", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      areaUnits: { apiField: "area_units", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      builtUpArea: { apiField: "builtup_area", applicableTo: ["Apartment", "Independent House", "Independent Villa"] },
      carpetArea: { apiField: "carpet_area", applicableTo: ["Apartment", "Independent House", "Independent Villa"] },
      plotArea: { apiField: "plot_area", applicableTo: ["Plot", "Land"] },
      lengthArea: { apiField: "length_area", applicableTo: ["Plot", "Land"] },
      widthArea: { apiField: "width_area", applicableTo: ["Plot", "Land"] },
      totalProjectArea: { apiField: "total_project_area", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      unitCost: { // Added unitCost
        apiField: "builtup_unit",
        transform: (value: string) => value,
        applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"],
      },
      pentHouse: { apiField: "pent_house", applicableTo: ["Independent House", "Independent Villa"] },
      facing: { apiField: "facing", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      carParking: { 
        apiField: "car_parking", 
        transform: (value: string) => (value === "4+" ? 5 : parseInt(value)), // Transform "4+" to 5
        applicableTo: ["Apartment", "Independent House", "Independent Villa"],
      },
      bikeParking: { 
        apiField: "bike_parking", 
        transform: (value: string) => (value === "4+" ? 5 : parseInt(value)), // Transform "4+" to 5
        applicableTo: ["Apartment", "Independent House", "Independent Villa"],
      },
      openParking: { 
        apiField: "open_parking", 
        transform: (value: string) => (value === "4+" ? 5 : parseInt(value)), // Transform "4+" to 5
        applicableTo: ["Apartment", "Independent House", "Independent Villa"],
      },
      servantRoom: { apiField: "servant_room", applicableTo: ["Apartment", "Independent House", "Independent Villa"] },
      propertyDescription: { apiField: "description", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      city: { apiField: "city_id", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      propertyName: { apiField: "property_name", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      locality: { apiField: "location_id", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      flatNo: { apiField: "unit_flat_house_no", applicableTo: ["Apartment", "Independent House", "Independent Villa"] },
      plotNumber: { apiField: "plot_number", applicableTo: ["Plot", "Land"] },
      floorNo: { apiField: "floors", applicableTo: ["Apartment", "Independent House", "Independent Villa"] },
      totalFloors: { apiField: "total_floors", applicableTo: ["Apartment", "Independent House", "Independent Villa"] },
    
      reraApproved: {
        apiField: "rera_approved",
        transform: (value: string) => value === "1" ? 1 : 0,
        applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"],
      },
      uploadedFromSellerPanel: { apiField: "uploaded_from_seller_panel", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      featuredProperty: { apiField: "featured_property", applicableTo: ["Apartment", "Independent House", "Independent Villa", "Plot", "Land"] },
      ageOfProperty: { // Added ageOfProperty
        apiField: "property_age",
        applicableTo: ["Apartment", "Independent House", "Independent Villa"],
      },
    };

    Object.keys(formData).forEach((key) => {
      const mapping = fieldMappings[key as keyof ResidentialRentFormData];
      if (!mapping) return;

      const { apiField, transform, applicableTo } = mapping;

      if (!applicableTo.includes(formData.propertySubType)) return;

      const originalValue = originalData[apiField];
      let newValue = formData[key as keyof ResidentialRentFormData];

      if (transform) {
        newValue = transform(newValue);
      }

      if (key === "facilities") {
        const originalFacilities = originalValue ? String(originalValue).split(", ").filter(Boolean) : [];
        const newFacilities = newValue ? String(newValue).split(", ").filter(Boolean) : [];
        if (JSON.stringify(originalFacilities.sort()) !== JSON.stringify(newFacilities.sort())) {
          changedFields[apiField] = newValue;
        }
      }
      if (key === "availableFrom") {
        const originalDate = originalValue ? new Date(originalValue).toISOString().split("T")[0] : "";
        const newDate = newValue ? String(newValue) : "";
        if (originalDate !== newDate) {
          changedFields[apiField] = newDate;
        }
      } else {
        const original = originalValue === null || originalValue === undefined ? "" : String(originalValue);
        const current = newValue === null || newValue === undefined ? "" : String(newValue);
        if (original !== current) {
          changedFields[apiField] = newValue;
        }
      }
    });

    return changedFields;
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
      !formData.bhk
    ) {
      newErrors.bhk = "BHK is required";
    }
    if (
      (formData.propertySubType === "Apartment" ||
        formData.propertySubType === "Independent House" ||
        formData.propertySubType === "Independent Villa") &&
      !formData.bedroom
    ) {
      newErrors.bedroom = "Bedroom is required";
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
    if (!formData.availableFrom) newErrors.availableFrom = "Available from date is required";
    if (!formData.monthlyRent) newErrors.monthlyRent = "Monthly rent is required";
    if (!formData.maintenanceCharge) newErrors.maintenanceCharge = "Maintenance charge is required";
    if (!formData.securityDeposit) newErrors.securityDeposit = "Security deposit is required";
    if (!formData.lockInPeriod) newErrors.lockInPeriod = "Lock-in period is required";
    if (!formData.chargeBrokerage) newErrors.chargeBrokerage = "Brokerage charge is required";
    if (!formData.preferredTenantType) newErrors.preferredTenantType = "Preferred tenant type is required";
    if (
      formData.propertySubType !== "Plot" &&
      formData.propertySubType !== "Land" &&
      !formData.builtUpArea
    ) {
      newErrors.builtUpArea = "Built-up area is required";
    }
    if ((formData.propertySubType === "Plot" || formData.propertySubType === "Land") && !formData.plotArea) {
      newErrors.plotArea = "Plot area is required";
    }
    if ((formData.propertySubType === "Plot" || formData.propertySubType === "Land") && !formData.lengthArea) {
      newErrors.lengthArea = "Length area is required";
    }
    if ((formData.propertySubType === "Plot" || formData.propertySubType === "Land") && !formData.widthArea) {
      newErrors.widthArea = "Width area is required";
    }
    if (!formData.totalProjectArea) newErrors.totalProjectArea = "Total project area is required";
    if (!formData.unitCost) newErrors.unitCost = "Unit cost is required"; // Added validation
    if (formData.aroundProperty.length === 0) newErrors.aroundProperty = "At least one place around property is required";
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
    if (formData.propertySubType !== "Plot" && formData.propertySubType !== "Land" && !formData.flatNo) {
      newErrors.flatNo = "Flat number is required";
    }
    if ((formData.propertySubType === "Plot" || formData.propertySubType === "Land") && !formData.plotNumber) {
      newErrors.plotNumber = "Plot number is required";
    }
    if (formData.propertySubType !== "Plot" && formData.propertySubType !== "Land" && !formData.floorNo) {
      newErrors.floorNo = "Floor number is required";
    }
    if (formData.propertySubType !== "Plot" && formData.propertySubType !== "Land" && !formData.totalFloors) {
      newErrors.totalFloors = "Total floors is required";
    }
    // if (formData.photos.length === 0) newErrors.photos = "At least one photo is required";
    if (!formData.uniquePropertyId) newErrors.uniquePropertyId = "Unique property ID is required";
    if (formData.propertySubType === "Apartment" && !formData.bathroom) {
      newErrors.bathroom = "Bathroom is required";
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));

    if (Object.values(newErrors).every((error) => !error)) {
      const changedFields = getChangedFields();

      if (Object.keys(changedFields).length > 0) {
        const payload = {
          unique_property_id: property.unique_property_id,
          updates: changedFields,
        };

        console.log("API Call: Post /listings/updateListing");
        console.log("Payload:", JSON.stringify(payload, null, 2));

        dispatch(updateListing(payload))
          .unwrap()
          .then((response) => {
            console.log("API Response:", JSON.stringify(response, null, 2));
            navigate(-1);
          })
          .catch((err) => {
            console.error("Update failed:", err);
          });
      } else {
        console.log("No changes detected.");
        navigate(-1);
      }
    }
  };

  useEffect(() => {
    if (property) {
      setOriginalData(property);
    }
  }, [property]);

  const areaUnitLabel = formData.areaUnits || "Sq.ft";
  const shouldRenderFields = formData.propertyType === "Residential" && formData.lookingTo === "Rent";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-2 sm:px-6 lg:px-8">
      <PageBreadcrumb pageTitle="Residential Rent Edit"  />
      <ComponentCard title="Edit Basic Details">
        <form onSubmit={handleSubmit} className="space-y-6">
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
              disabled
            />
            {errors.uniquePropertyId && (
              <p className="text-red-500 text-sm mt-1">{errors.uniquePropertyId}</p>
            )}
          </div>

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
                      ? "bg-[#1D3A76] text-white border-blue-600"
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
                      ? "bg-[#1D3A76] text-white border-blue-600"
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
                            ? "bg-[#1D3A76] text-white border-blue-600"
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

              {(formData.propertySubType === "Apartment" ||
                formData.propertySubType === "Independent House" ||
                formData.propertySubType === "Independent Villa") && (
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
                            ? "bg-[#1D3A76] text-white border-blue-600"
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

        {/* {formData.propertySubType === "Apartment" && (
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
                            ? "bg-[#1D3A76] text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {errors.bedroom && <p className="text-red-500 text-sm mt-1">{errors.bedroom}</p>}
                </div>
              )} */}

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
                            ? "bg-[#1D3A76] text-white border-blue-600"
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
                            ? "bg-[#1D3A76] text-white border-blue-600"
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

              {(formData.propertySubType === "Apartment" ||
                formData.propertySubType === "Independent House" ||
                formData.propertySubType === "Independent Villa") && (
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

          <div>
            <Label htmlFor="availableFrom">Available From *</Label>
            <DatePicker
                id="availableFrom"
                mode="single"
                onChange={handleDateChange}
                defaultDate={
                  formData.availableFrom
                    ? (() => {
                        const defaultDate = new Date(formData.availableFrom);
                        console.log("Default date:", defaultDate, "From string:", formData.availableFrom);
                        return defaultDate;
                      })()
                    : undefined
                }
                placeholder="Select available from date (mm/dd/yyyy)"
                label=""
              />


            {errors.availableFrom && (
              <p className="text-red-500 text-sm mt-1">{errors.availableFrom}</p>
            )}
          </div>

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
                          ? "bg-[#1D3A76] text-white border-blue-600"
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

              {(formData.propertySubType === "Apartment" ||
                formData.propertySubType === "Independent House" ||
                formData.propertySubType === "Independent Villa") && (
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
                            ? "bg-[#1D3A76] text-white border-blue-600"
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
                            id={facility} // Add id for better accessibility
                            checked={formData.facilities[facility]} // Check the boolean value
                            onChange={handleFacilityChange} // Use the event-based handler
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-gray-700 dark:text-gray-300">{facility}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}


              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Additional Details
                </h3>

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
                            ? "bg-[#1D3A76] text-white border-blue-600"
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
                              ? "bg-[#1D3A76] text-white border-blue-600"
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
                            ? "bg-[#1D3A76] text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option === "1" ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                </div>

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
                            ? "bg-[#1D3A76] text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

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
                            ? "bg-[#1D3A76] text-white border-blue-600"
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

          <PropertyLocationFields
            formData={{
              city: formData.city,
              propertyName: formData.propertyName,
              locality: formData.locality,
              flatNo: formData.propertySubType !== "Plot" && formData.propertySubType !== "Land" ? formData.flatNo : formData.plotNumber,
              floorNo: formData.floorNo,
              totalFloors: formData.totalFloors,
            }}
            errors={{
              city: errors.city,
              propertyName: errors.propertyName,
              locality: errors.locality,
              flatNo: formData.propertySubType !== "Plot" && formData.propertySubType !== "Land" ? errors.flatNo : errors.plotNumber,
              floorNo: errors.floorNo,
              totalFloors: errors.totalFloors,
            }}
            handleInputChange={handleInputChange}
            isPlot={formData.propertySubType === "Plot" || formData.propertySubType === "Land"}
          />

          {/* <div>
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
          </div> */}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-[#1D3A76] text-white rounded-lg hover:bg-brand-600 transition-colors duration-200"
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
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import ComponentCard from "../../../components/common/ComponentCard";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PropertyLocationFields from "../../Residential/components/propertyLocationFields";
// import MediaUploadSection from "../../Residential/components/MediaUploadSection";
import DatePicker from "../../../components/form/date-picker";
import { updateListing } from "../../../store/slices/listings";
import { AppDispatch } from "../../../store/store";

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
  chargeBrokerage: "None" | "15 Days" | "30 Days";
  areaUnits: "Sq.ft" | "Sq.yd" | "Acres";
  builtUpArea: string;
  carpetArea: string;
  totalProjectArea: string;
  plotArea: string;
  lengthArea: string;
  widthArea: string;
  facilities: { [key: string]: boolean }; 
  flatNo: string;
  plotNumber: string;
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
  // photos: File[];
  // video: File | null;
  // floorPlan: File | null;
  // featuredImageIndex: number | null;
}

// Define the type for the Select options
interface SelectOption {
  value: string;
  label: string;
}

const CommercialRentEdit: React.FC = () => {
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

  const [originalData, setOriginalData] = useState<any>(property || {});
  const transformParkingValue = (value: string | number | undefined): "0" | "1" | "2" | "3" | "4+" => {
    const stringValue = String(value); // Convert to string for consistent comparison
    return stringValue === "5" ? "4+" : (stringValue as "0" | "1" | "2" | "3" | "4+");
  };
  const [formData, setFormData] = useState<CommercialRentFormData>(() => {
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
      const availableFromDate = property.available_from
        ? new Date(property.available_from).toISOString().split("T")[0]
        : "";
      const securityDepositValue = property.security_deposit
        ? `${parseInt(property.security_deposit)} Months`
        : "";
      const chargeBrokerageValue = property.brokerage_charge
        ? `${parseInt(property.brokerage_charge)} Days`
        : "None";
      const lockInPeriodValue = property.lock_in
        ? parseInt(property.lock_in) === 1
          ? "1 Month"
          : `${parseInt(property.lock_in)} Months`
        : "";

      return {
        propertyType: property.property_in || "Commercial",
        lookingTo: property.property_for || "Rent",
        location: property.google_address || "",
        propertySubType: property.sub_type || "Others",
        passengerLifts: property.passenger_lifts ? String(property.passenger_lifts) : "",
        serviceLifts: property.service_lifts ? String(property.service_lifts) : "",
        stairCases: property.stair_cases ? String(property.stair_cases) : "",
        privateParking: property.private_parking ? String(property.private_parking) : "",
        publicParking: property.public_parking ? String(property.public_parking) : "",
        privateWashrooms: property.private_washrooms ? String(property.private_washrooms) : "",
        publicWashrooms: property.public_washrooms ? String(property.public_washrooms) : "",
        availableFrom: availableFromDate,
        monthlyRent: property.monthly_rent ? String(property.monthly_rent) : "",
        maintenanceCharge: property.maintenance ? String(property.maintenance) : "",
        securityDeposit: securityDepositValue,
        lockInPeriod: lockInPeriodValue,
        chargeBrokerage: chargeBrokerageValue as "None" | "15 Days" | "30 Days",
        areaUnits: property.area_units || "Sq.ft",
        builtUpArea: property.builtup_area ? String(property.builtup_area) : "",
        carpetArea: property.carpet_area ? String(property.carpet_area) : "",
        totalProjectArea: property.total_project_area ? String(property.total_project_area) : "",
        plotArea: property.plot_area ? String(property.plot_area) : "",
        lengthArea: property.length_area ? String(property.length_area) : "",
        widthArea: property.width_area ? String(property.width_area) : "",
        facilities: updatedFacilities,
        flatNo: property.unit_flat_house_no || "",
        plotNumber: property.plot_number || "",
        zoneType: property.zone_types || "Commercial",
        suitable: property.business_types || "Others",
        facing: property.facing || "",
        carParking: transformParkingValue(property.car_parking), // Transform "5" or 5 to "4+"
        bikeParking: transformParkingValue(property.bike_parking), // Transform "5" or 5 to "4+"
        openParking: transformParkingValue(property.open_parking), // Transform "5" or 5 to "4+"
        aroundProperty: [], // Adjust if API provides this data
        pantryRoom: property.pantry_room || "No",
        propertyDescription: property.description || "",
        city: property.city_id || "",
        propertyName: property.property_name || "",
        locality: property.location_id || "",
        floorNo: property.floors || "",
        totalFloors: property.total_floors || "",
        // photos: [],
        // video: null,
        // floorPlan: null,
        // featuredImageIndex: null,
      };
    }
    return {
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
      chargeBrokerage: "None",
      areaUnits: "Sq.ft",
      builtUpArea: "",
      carpetArea: "",
      totalProjectArea: "",
      plotArea: "",
      lengthArea: "",
      widthArea: "",
      facilities: [],
      flatNo: "",
      plotNumber: "",
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
      // photos: [],
      // video: null,
      // floorPlan: null,
      // featuredImageIndex: null,
    };
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
    plotNumber: "",
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
    // photos: "",
    // video: "",
    // floorPlan: "",
    // featuredImage: "",
  });

  const [placeAroundProperty, setPlaceAroundProperty] = useState("");
  const [distanceFromProperty, setDistanceFromProperty] = useState("");

  const propertyTypeOptions: SelectOption[] = [
  
    { value: "Commercial", label: "Commercial" },
  ];

  const lookingToOptions: SelectOption[] = [
    { value: "Sell", label: "Sell" },
    { value: "Rent", label: "Rent" },
  
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
    if (name === "builtUpArea" && ["Office", "Retail Shop", "Show Room"].includes(formData.propertySubType)) {
      setErrors((prev) => ({ ...prev, builtUpArea: !value ? "Built-up area is required" : "" }));
    }
    if (name === "plotArea" && ["Warehouse", "Plot", "Others"].includes(formData.propertySubType)) {
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
    if (name === "monthlyRent") {
      setErrors((prev) => ({ ...prev, monthlyRent: !value ? "Monthly rent is required" : "" }));
    }
    if (name === "propertyDescription") {
      setErrors((prev) => ({ ...prev, propertyDescription: !value ? "Property description is required" : "" }));
    }
  };

  const handleSelectChange = (name: keyof CommercialRentFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "propertyType") {
      setErrors((prev) => ({ ...prev, propertyType: !value ? "Property type is required" : "" }));
    }
    if (name === "lookingTo") {
      setErrors((prev) => ({ ...prev, lookingTo: !value ? "Looking to is required" : "" }));
    }
    if (name === "propertySubType") {
      setErrors((prev) => ({ ...prev, propertySubType: !value ? "Property sub type is required" : "" }));
    }
    if (name === "zoneType") {
      setErrors((prev) => ({ ...prev, zoneType: !value ? "Zone type is required" : "" }));
    }
    if (name === "suitable") {
      setErrors((prev) => ({ ...prev, suitable: !value ? "Suitable for is required" : "" }));
    }
    if (name === "securityDeposit") {
      setErrors((prev) => ({ ...prev, securityDeposit: !value ? "Security deposit is required" : "" }));
    }
    if (name === "lockInPeriod") {
      setErrors((prev) => ({ ...prev, lockInPeriod: !value ? "Lock in period is required" : "" }));
    }
    if (name === "chargeBrokerage") {
      setErrors((prev) => ({ ...prev, chargeBrokerage: !value ? "Brokerage charge is required" : "" }));
    }
    if (name === "pantryRoom") {
      setErrors((prev) => ({ ...prev, pantryRoom: !value ? "Pantry room is required" : "" }));
    }
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
      // setErrors((prev) => ({ ...prev, aroundProperty: "Both place and distance are required" }));
    }
  };

  const handleDateChange = (selectedDates: Date[]) => {
    const dateObj = selectedDates[0];
    let date = "";
    if (dateObj){
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth()+1).padStart(2,"0");
      const day = String(dateObj.getDate()).padStart(2,"0");
      date = `${year}-${month}-${day}`;
    }

    setFormData((prev) => ({ ...prev, availableFrom: date }));
    setErrors((prev) => ({ ...prev, availableFrom: !date ? "Available from date is required" : "" }));
  };

  // Function to get changed fields
  const getChangedFields = () => {
    const changedFields: Partial<any> = {};

    const fieldMappings: {
      [key in keyof CommercialRentFormData]?: {
        apiField: string;
        transform?: (value: any) => any;
        applicableTo: string[];
      };
    } = {
      propertyType: { apiField: "property_in", applicableTo: ["Office", "Retail Shop", "Show Room", "Warehouse", "Plot", "Others"] },
      lookingTo: { apiField: "property_for", applicableTo: ["Office", "Retail Shop", "Show Room", "Warehouse", "Plot", "Others"] },
      location: { apiField: "google_address", applicableTo: ["Office", "Retail Shop", "Show Room", "Warehouse", "Plot", "Others"] },
      propertySubType: { apiField: "sub_type", applicableTo: ["Office", "Retail Shop", "Show Room", "Warehouse", "Plot", "Others"] },
      passengerLifts: { apiField: "passenger_lifts", transform: (value: string) => parseInt(value), applicableTo: ["Office", "Retail Shop", "Show Room"] },
      serviceLifts: { apiField: "service_lifts", transform: (value: string) => parseInt(value), applicableTo: ["Office", "Retail Shop", "Show Room"] },
      stairCases: { apiField: "stair_cases", transform: (value: string) => parseInt(value), applicableTo: ["Office", "Retail Shop", "Show Room"] },
      privateParking: { apiField: "private_parking", transform: (value: string) => parseInt(value), applicableTo: ["Office", "Retail Shop", "Show Room"] },
      publicParking: { apiField: "public_parking", transform: (value: string) => parseInt(value), applicableTo: ["Office", "Retail Shop", "Show Room"] },
      privateWashrooms: { apiField: "private_washrooms", transform: (value: string) => parseInt(value), applicableTo: ["Office", "Retail Shop", "Show Room"] },
      publicWashrooms: { apiField: "public_washrooms", transform: (value: string) => parseInt(value), applicableTo: ["Office", "Retail Shop", "Show Room"] },
      availableFrom: { apiField: "available_from", applicableTo: ["Office", "Retail Shop", "Show Room", "Warehouse", "Plot", "Others"] },
      monthlyRent: { apiField: "monthly_rent", transform: (value: string) => parseFloat(value), applicableTo: ["Office", "Retail Shop", "Show Room", "Warehouse", "Plot", "Others"] },
      maintenanceCharge: { apiField: "maintenance", transform: (value: string) => parseFloat(value), applicableTo: ["Office", "Retail Shop", "Show Room", "Warehouse", "Plot", "Others"] },
      securityDeposit: {
        apiField: "security_deposit",
        transform: (value: string) => parseInt(value.split(" ")[0]),
        applicableTo: ["Office", "Retail Shop", "Show Room", "Warehouse", "Plot", "Others"],
      },
      lockInPeriod: {
        apiField: "lock_in",
        transform: (value: string) => parseInt(value.split(" ")[0]),
        applicableTo: ["Office", "Retail Shop", "Show Room", "Warehouse", "Plot", "Others"],
      },
      chargeBrokerage: {
        apiField: "brokerage_charge",
        transform: (value: string) => (value === "None" ? 0 : parseInt(value.split(" ")[0])),
        applicableTo: ["Office", "Retail Shop", "Show Room", "Warehouse", "Plot", "Others"],
      },
      areaUnits: { apiField: "area_units", applicableTo: ["Office", "Retail Shop", "Show Room", "Warehouse", "Plot", "Others"] },
      builtUpArea: { apiField: "builtup_area", applicableTo: ["Office", "Retail Shop", "Show Room"] },
      carpetArea: { apiField: "carpet_area", applicableTo: ["Office", "Retail Shop", "Show Room"] },
      totalProjectArea: { apiField: "total_project_area", applicableTo: ["Office", "Retail Shop", "Show Room", "Warehouse", "Plot", "Others"] },
      plotArea: { apiField: "plot_area", applicableTo: ["Warehouse", "Plot", "Others"] },
      lengthArea: { apiField: "length_area", applicableTo: ["Plot"] },
      widthArea: { apiField: "width_area", applicableTo: ["Plot"] },
      facilities: {
        apiField: "facilities",
        transform: (value: { [key: string]: boolean }) =>
          Object.keys(value)
            .filter((key) => value[key])
            .join(", ") || null,
            applicableTo: ["Office", "Retail Shop", "Show Room", "Others"],
      },
      flatNo: { apiField: "unit_flat_house_no", applicableTo: ["Office", "Retail Shop", "Show Room", "Warehouse", "Others"] },
      plotNumber: { apiField: "plot_number", applicableTo: ["Plot"] },
      zoneType: { apiField: "zone_types", applicableTo: ["Office", "Warehouse"] },
      suitable: { apiField: "business_types", applicableTo: ["Retail Shop", "Show Room", "Plot", "Others"] },
      facing: { apiField: "facing", applicableTo: ["Office", "Retail Shop", "Show Room", "Warehouse", "Others"] },
      carParking: { 
        apiField: "car_parking", 
        transform: (value: string) => (value === "4+" ? 5 : parseInt(value)), // Transform "4+" to 5
        applicableTo: ["Office", "Retail Shop", "Show Room", "Warehouse", "Others"]
      },
      bikeParking: { 
        apiField: "bike_parking", 
        transform: (value: string) => (value === "4+" ? 5 : parseInt(value)), // Transform "4+" to 5
        applicableTo: ["Office", "Retail Shop", "Show Room", "Warehouse", "Others"]
      },
      openParking: { 
        apiField: "open_parking", 
        transform: (value: string) => (value === "4+" ? 5 : parseInt(value)), // Transform "4+" to 5
        applicableTo: ["Office", "Retail Shop", "Show Room", "Warehouse", "Others"]
      },
      pantryRoom: { apiField: "pantry_room", applicableTo: ["Office", "Show Room", "Others"] },
      propertyDescription: { apiField: "description", applicableTo: ["Office", "Retail Shop", "Show Room", "Warehouse", "Plot", "Others"] },
      city: { apiField: "city_id", applicableTo: ["Office", "Retail Shop", "Show Room", "Warehouse", "Plot", "Others"] },
      propertyName: { apiField: "property_name", applicableTo: ["Office", "Retail Shop", "Show Room", "Warehouse", "Plot", "Others"] },
      locality: { apiField: "location_id", applicableTo: ["Office", "Retail Shop", "Show Room", "Warehouse", "Plot", "Others"] },
      floorNo: { apiField: "floors", applicableTo: ["Office", "Retail Shop", "Show Room", "Warehouse", "Others"] },
      totalFloors: { apiField: "total_floors", applicableTo: ["Office", "Retail Shop", "Show Room", "Warehouse", "Others"] },
    };

    Object.keys(formData).forEach((key) => {
      const mapping = fieldMappings[key as keyof CommercialRentFormData];
      if (!mapping) return;

      const { apiField, transform, applicableTo } = mapping;

      if (!applicableTo.includes(formData.propertySubType)) return;

      const originalValue = originalData[apiField];
      let newValue = formData[key as keyof CommercialRentFormData];

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
        const original = originalValue === null || originalValue === undefined ? "" : String(originalValue);
        const current = newValue === null || newValue === undefined ? "" : String(newValue);
        if (original !== current) {
          changedFields[apiField] = newValue;
        }
      // }
    });

    return changedFields;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: any = {};

    if (!formData.propertyType) newErrors.propertyType = "Property type is required";
    if (!formData.lookingTo) newErrors.lookingTo = "Looking to is required";
    if (!formData.propertySubType) newErrors.propertySubType = "Property sub type is required";

    if (["Office", "Retail Shop", "Show Room"].includes(formData.propertySubType)) {
      if (!formData.passengerLifts) newErrors.passengerLifts = "Passenger lifts are required";
      if (!formData.serviceLifts) newErrors.serviceLifts = "Service lifts are required";
      if (!formData.stairCases) newErrors.stairCases = "Stair cases are required";
      if (!formData.privateParking) newErrors.privateParking = "Private parking is required";
      if (!formData.publicParking) newErrors.publicParking = "Public parking is required";
      if (!formData.privateWashrooms) newErrors.privateWashrooms = "Private washrooms are required";
      if (!formData.publicWashrooms) newErrors.publicWashrooms = "Public washrooms are required";
      if (!formData.builtUpArea) newErrors.builtUpArea = "Built-up area is required";
    }

    if (["Warehouse", "Plot", "Others"].includes(formData.propertySubType) && !formData.plotArea) {
      newErrors.plotArea = "Plot area is required";
    }

    if (formData.propertySubType === "Plot") {
      if (!formData.lengthArea) newErrors.lengthArea = "Length area is required";
      if (!formData.widthArea) newErrors.widthArea = "Width area is required";
      if (!formData.plotNumber) newErrors.plotNumber = "Plot number is required";
    }

    if (!formData.availableFrom) newErrors.availableFrom = "Available from date is required";
    if (!formData.monthlyRent) newErrors.monthlyRent = "Monthly rent is required";
    if (!formData.securityDeposit) newErrors.securityDeposit = "Security deposit is required";
    if (!formData.lockInPeriod) newErrors.lockInPeriod = "Lock in period is required";
    if (!formData.chargeBrokerage) newErrors.chargeBrokerage = "Brokerage charge is required";
    if (!formData.totalProjectArea) newErrors.totalProjectArea = "Total project area is required";

    if (["Office", "Retail Shop", "Show Room", "Warehouse", "Others"].includes(formData.propertySubType) && !formData.flatNo) {
      newErrors.flatNo = "Flat number is required";
    }

    if (["Office", "Warehouse"].includes(formData.propertySubType) && !formData.zoneType) {
      newErrors.zoneType = "Zone type is required";
    }

    if (["Retail Shop", "Show Room", "Plot", "Others"].includes(formData.propertySubType) && !formData.suitable) {
      newErrors.suitable = "Suitable for is required";
    }

    // if (formData.aroundProperty.length === 0) newErrors.aroundProperty = "At least one place around property is required";

    if (["Office", "Show Room", "Others"].includes(formData.propertySubType) && !formData.pantryRoom) {
      newErrors.pantryRoom = "Pantry room is required";
    }

    if (!formData.propertyDescription) newErrors.propertyDescription = "Property description is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.propertyName) newErrors.propertyName = "Property name is required";
    if (!formData.locality) newErrors.locality = "Locality is required";
    if (formData.propertySubType !== "Plot" && !formData.floorNo) newErrors.floorNo = "Floor number is required";
    if (formData.propertySubType !== "Plot" && !formData.totalFloors) newErrors.totalFloors = "Total floors is required";

    // if (formData.photos.length === 0) newErrors.photos = "At least one photo is required";

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
  const shouldRenderFields = formData.propertyType === "Commercial" && formData.lookingTo === "Rent";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-2 sm:px-6 lg:px-8">
      <PageBreadcrumb pageTitle="Commercial Rent Edit"  />
      <ComponentCard title="Edit Basic Details">
        <form onSubmit={handleSubmit} className="space-y-6">
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
            {errors.propertyType && <p className="text-red-500 text-sm mt-1">{errors.propertyType}</p>}
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
            {errors.lookingTo && <p className="text-red-500 text-sm mt-1">{errors.lookingTo}</p>}
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
            {errors.propertySubType && <p className="text-red-500 text-sm mt-1">{errors.propertySubType}</p>}
          </div>

          {shouldRenderFields && (
            <>
              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Retail Shop" ||
                formData.propertySubType === "Show Room") && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Lift & Stair Cases</h3>
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
                        className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      {errors.passengerLifts && <p className="text-red-500 text-sm mt-1">{errors.passengerLifts}</p>}
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
                        className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      {errors.serviceLifts && <p className="text-red-500 text-sm mt-1">{errors.serviceLifts}</p>}
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
                        className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      {errors.stairCases && <p className="text-red-500 text-sm mt-1">{errors.stairCases}</p>}
                    </div>
                  </div>
                </div>
              )}

              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Retail Shop" ||
                formData.propertySubType === "Show Room") && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Parking</h3>
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
                        className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      {errors.privateParking && <p className="text-red-500 text-sm mt-1">{errors.privateParking}</p>}
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
                        className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      {errors.publicParking && <p className="text-red-500 text-sm mt-1">{errors.publicParking}</p>}
                    </div>
                  </div>
                </div>
              )}

              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Retail Shop" ||
                formData.propertySubType === "Show Room") && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Washrooms</h3>
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
                        className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      {errors.privateWashrooms && <p className="text-red-500 text-sm mt-1">{errors.privateWashrooms}</p>}
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
                        className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      {errors.publicWashrooms && <p className="text-red-500 text-sm mt-1">{errors.publicWashrooms}</p>}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="availableFrom">Available From *</Label>
                <DatePicker
                  id="availableFrom"
                  placeholder="Select available date"
                  onChange={handleDateChange}
                  defaultDate={formData.availableFrom ?  (()=>{
                    const defaultDate = new Date(formData.availableFrom);
                    return defaultDate;
                  })():undefined
                }
                    // new Date(formData.availableFrom) : undefined}
                />
                {errors.availableFrom && <p className="text-red-500 text-sm mt-1">{errors.availableFrom}</p>}
              </div>

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
                    className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                {errors.monthlyRent && <p className="text-red-500 text-sm mt-1">{errors.monthlyRent}</p>}
              </div>

              <div>
                <Label htmlFor="maintenanceCharge">Maintenance Charge (Per Month)</Label>
                <Input
                  type="number"
                  id="maintenanceCharge"
                  name="maintenanceCharge"
                  value={formData.maintenanceCharge}
                  onChange={handleInputChange}
                  className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

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
                          ? "bg-[#1D3A76] text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {errors.securityDeposit && <p className="text-red-500 text-sm mt-1">{errors.securityDeposit}</p>}
              </div>

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
                          ? "bg-[#1D3A76] text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {errors.lockInPeriod && <p className="text-red-500 text-sm mt-1">{errors.lockInPeriod}</p>}
              </div>

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
                          ? "bg-[#1D3A76] text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {errors.chargeBrokerage && <p className="text-red-500 text-sm mt-1">{errors.chargeBrokerage}</p>}
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
                    className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {errors.lengthArea && <p className="text-red-500 text-sm mt-1">{errors.lengthArea}</p>}
                </div>
              )}

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
                    className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {errors.widthArea && <p className="text-red-500 text-sm mt-1">{errors.widthArea}</p>}
                </div>
              )}

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
                    className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {errors.plotArea && <p className="text-red-500 text-sm mt-1">{errors.plotArea}</p>}
                </div>
              )}

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
                    className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {errors.builtUpArea && <p className="text-red-500 text-sm mt-1">{errors.builtUpArea}</p>}
                </div>
              )}

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
                    className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
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
                  className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                {errors.totalProjectArea && <p className="text-red-500 text-sm mt-1">{errors.totalProjectArea}</p>}
              </div>

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
                <Label htmlFor={formData.propertySubType === "Plot" ? "plotNumber" : "flatNo"}>
                  {formData.propertySubType === "Plot" ? "Plot No. *" : "Flat No. *"}
                </Label>
                <Input
                  type="text"
                  id={formData.propertySubType === "Plot" ? "plotNumber" : "flatNo"}
                  name={formData.propertySubType === "Plot" ? "plotNumber" : "flatNo"}
                  value={formData.propertySubType === "Plot" ? formData.plotNumber : formData.flatNo}
                  onChange={handleInputChange}
                  placeholder={formData.propertySubType === "Plot" ? "Plot Number" : "Flat Number"}
                  className="dark:bg-dark-900"
                />
                {formData.propertySubType === "Plot" ? (
                  errors.plotNumber && <p className="text-red-500 text-sm mt-1">{errors.plotNumber}</p>
                ) : (
                  errors.flatNo && <p className="text-red-500 text-sm mt-1">{errors.flatNo}</p>
                )}
              </div>

              {(formData.propertySubType === "Office" || formData.propertySubType === "Warehouse") && (
                <div>
                  <Label htmlFor="zoneType">Zone Type *</Label>
                  <Select
                    options={zoneTypeOptions}
                    placeholder="Select..."
                    onChange={handleSelectChange("zoneType")}
                    value={formData.zoneType}
                    className="dark:bg-dark-900"
                  />
                  {errors.zoneType && <p className="text-red-500 text-sm mt-1">{errors.zoneType}</p>}
                </div>
              )}

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
                  {errors.suitable && <p className="text-red-500 text-sm mt-1">{errors.suitable}</p>}
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Additional Details</h3>

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

                {(formData.propertySubType === "Office" ||
                  formData.propertySubType === "Retail Shop" ||
                  formData.propertySubType === "Show Room" ||
                  formData.propertySubType === "Warehouse" ||
                  formData.propertySubType === "Others") && (
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
                )}

                {(formData.propertySubType === "Office" ||
                  formData.propertySubType === "Retail Shop" ||
                  formData.propertySubType === "Show Room" ||
                  formData.propertySubType === "Warehouse" ||
                  formData.propertySubType === "Others") && (
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
                )}

                {(formData.propertySubType === "Office" ||
                  formData.propertySubType === "Retail Shop" ||
                  formData.propertySubType === "Show Room" ||
                  formData.propertySubType === "Warehouse" ||
                  formData.propertySubType === "Others") && (
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
                  {/* {errors.aroundProperty && <p className="text-red-500 text-sm mt-1">{errors.aroundProperty}</p>} */}
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
                              ? "bg-[#1D3A76] text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {errors.pantryRoom && <p className="text-red-500 text-sm mt-1">{errors.pantryRoom}</p>}
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
            isPlot={formData.propertySubType === "Plot"}
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
              setFeaturedImageIndex={(index) => setFormData((prev) => ({ ...prev, featuredImageIndex: index }))}
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

export default CommercialRentEdit;
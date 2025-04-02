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
interface CommercialBuyFormData {
  propertyType: "Residential" | "Commercial";
  lookingTo: "Sell" | "Rent";
  transactionType: "New" | "Resale";
  location: string;
  propertySubType: "Office" | "Retail Shop" | "Show Room" | "Warehouse" | "Plot" | "Others";
  reraApproved: "Yes" | "No";
  constructionStatus: "Ready to move" | "Under Construction";
  ageOfProperty: string;
  possessionEnds: string;
  passengerLifts: string;
  serviceLifts: string;
  stairCases: string;
  privateParking: string;
  publicParking: string;
  privateWashrooms: string;
  publicWashrooms: string;
  areaUnits: "Sq.ft" | "Sq.yd" | "Acres";
  builtUpArea: string;
  carpetArea: string;
  totalProjectArea: string;
  plotArea: string;
  lengthArea: string;
  widthArea: string;
  unitCost: string;
  propertyCost: string;
  ownership: "Freehold" | "Leasehold" | "Cooperative society" | "Power of attorney";
  facilities: string[];
  flatNo: string;
  zoneType: "Industrial" | "Commercial" | "Special Economic Zone" | "Open Spaces" | "Agricultural Zone" | "Other";
  suitable: "Jewellery" | "Grocery" | "Clinic" | "Footwear" | "Electronics" | "Clothing" | "Others";
  loanFacility: "Yes" | "No";
  facing: "East" | "West" | "South" | "North" | "";
  carParking: "0" | "1" | "2" | "3" | "4+";
  bikeParking: "0" | "1" | "2" | "3" | "4+";
  openParking: "0" | "1" | "2" | "3" | "4+";
  aroundProperty: AroundProperty[];
  pantryRoom: "Yes" | "No";
  possessionStatus: "Immediate" | "Future";
  investorProperty: "Yes" | "No";
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

const CommercialBuyEdit: React.FC = () => {
  const [formData, setFormData] = useState<CommercialBuyFormData>({
    propertyType: "Commercial",
    lookingTo: "Sell",
    transactionType: "New",
    location: "",
    propertySubType: "Office",
    reraApproved: "Yes",
    constructionStatus: "Ready to move",
    ageOfProperty: "",
    possessionEnds: "",
    passengerLifts: "",
    serviceLifts: "",
    stairCases: "",
    privateParking: "",
    publicParking: "",
    privateWashrooms: "",
    publicWashrooms: "",
    areaUnits: "Sq.ft",
    builtUpArea: "",
    carpetArea: "",
    totalProjectArea: "",
    plotArea: "",
    lengthArea: "",
    widthArea: "",
    unitCost: "",
    propertyCost: "",
    ownership: "Freehold",
    facilities: [],
    flatNo: "",
    zoneType: "Commercial",
    suitable: "Others",
    loanFacility: "Yes",
    facing: "",
    carParking: "0",
    bikeParking: "0",
    openParking: "0",
    aroundProperty: [],
    pantryRoom: "No",
    possessionStatus: "Immediate",
    investorProperty: "No",
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
    reraApproved: "",
    constructionStatus: "",
    ageOfProperty: "",
    possessionEnds: "",
    passengerLifts: "",
    serviceLifts: "",
    stairCases: "",
    privateParking: "",
    publicParking: "",
    privateWashrooms: "",
    publicWashrooms: "",
    builtUpArea: "",
    carpetArea: "",
    totalProjectArea: "",
    plotArea: "",
    lengthArea: "",
    widthArea: "",
    unitCost: "",
    propertyCost: "",
    ownership: "",
    flatNo: "",
    zoneType: "",
    suitable: "",
    loanFacility: "",
    aroundProperty: "",
    pantryRoom: "",
    possessionStatus: "",
    investorProperty: "",
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

  const [placeAroundProperty, setPlaceAroundProperty] = useState("");
  const [distanceFromProperty, setDistanceFromProperty] = useState("");

  const propertyTypeOptions: SelectOption[] = [
    { value: "Residential", label: "Residential" },
    { value: "Commercial", label: "Commercial" },
  ];

  const lookingToOptions: SelectOption[] = [
    { value: "Sell", label: "Sell" },
    { value: "Rent", label: "Rent" },
  ];

  const transactionTypeOptions: SelectOption[] = [
    { value: "New", label: "New" },
    { value: "Resale", label: "Resale" },
  ];

  const propertySubTypeOptions: SelectOption[] = [
    { value: "Office", label: "Office" },
    { value: "Retail Shop", label: "Retail Shop" },
    { value: "Show Room", label: "Show Room" },
    { value: "Warehouse", label: "Warehouse" },
    { value: "Plot", label: "Plot" },
    { value: "Others", label: "Others" },
  ];

  const constructionStatusOptions: SelectOption[] = [
    { value: "Ready to move", label: "Ready to move" },
    { value: "Under Construction", label: "Under Construction" },
  ];

  const areaUnitsOptions: SelectOption[] = [
    { value: "Sq.ft", label: "Sq.ft" },
    { value: "Sq.yd", label: "Sq.yd" },
    { value: "Acres", label: "Acres" },
  ];

  const ownershipOptions: SelectOption[] = [
    { value: "Freehold", label: "Freehold" },
    { value: "Leasehold", label: "Leasehold" },
    { value: "Cooperative society", label: "Cooperative society" },
    { value: "Power of attorney", label: "Power of attorney" },
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

  const possessionStatusOptions: SelectOption[] = [
    { value: "Immediate", label: "Immediate" },
    { value: "Future", label: "Future" },
  ];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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

    if (name === "unitCost") {
      if (!value) {
        setErrors((prev) => ({
          ...prev,
          unitCost: "Unit cost is required",
        }));
      } else {
        setErrors((prev) => ({ ...prev, unitCost: "" }));
      }
    }

    if (name === "propertyCost") {
      const propertyCostValue = parseFloat(value);
      if (propertyCostValue < 100000 || propertyCostValue > 3000000000) {
        setErrors((prev) => ({
          ...prev,
          propertyCost: "Property cost should be between 1 lakh to 300 cr",
        }));
      } else {
        setErrors((prev) => ({ ...prev, propertyCost: "" }));
      }
    }

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

    if (name === "ageOfProperty") {
      if (!value) {
        setErrors((prev) => ({
          ...prev,
          ageOfProperty: "Age of property is required",
        }));
      } else {
        setErrors((prev) => ({ ...prev, ageOfProperty: "" }));
      }
    }
  };

  const handleSelectChange = (name: keyof CommercialBuyFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "constructionStatus") {
      setFormData((prev) => ({
        ...prev,
        ageOfProperty: "",
        possessionEnds: "",
      }));
      setErrors((prev) => ({
        ...prev,
        ageOfProperty: "",
        possessionEnds: "",
      }));
    }

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

    if (name === "reraApproved" && !value) {
      setErrors((prev) => ({ ...prev, reraApproved: "RERA approval status is required" }));
    } else if (name === "reraApproved") {
      setErrors((prev) => ({ ...prev, reraApproved: "" }));
    }

    if (name === "constructionStatus" && !value) {
      setErrors((prev) => ({ ...prev, constructionStatus: "Construction status is required" }));
    } else if (name === "constructionStatus") {
      setErrors((prev) => ({ ...prev, constructionStatus: "" }));
    }

    if (name === "ownership" && !value) {
      setErrors((prev) => ({ ...prev, ownership: "Ownership is required" }));
    } else if (name === "ownership") {
      setErrors((prev) => ({ ...prev, ownership: "" }));
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

    if (name === "loanFacility" && !value) {
      setErrors((prev) => ({ ...prev, loanFacility: "Loan facility is required" }));
    } else if (name === "loanFacility") {
      setErrors((prev) => ({ ...prev, loanFacility: "" }));
    }

    if (name === "pantryRoom" && !value) {
      setErrors((prev) => ({ ...prev, pantryRoom: "Pantry room is required" }));
    } else if (name === "pantryRoom") {
      setErrors((prev) => ({ ...prev, pantryRoom: "" }));
    }

    if (name === "possessionStatus" && !value) {
      setErrors((prev) => ({ ...prev, possessionStatus: "Possession status is required" }));
    } else if (name === "possessionStatus") {
      setErrors((prev) => ({ ...prev, possessionStatus: "" }));
    }

    if (name === "investorProperty" && !value) {
      setErrors((prev) => ({ ...prev, investorProperty: "Investor property is required" }));
    } else if (name === "investorProperty") {
      setErrors((prev) => ({ ...prev, investorProperty: "" }));
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
    if (!formData.reraApproved) {
      newErrors.reraApproved = "RERA approval status is required";
    }
    if (
      (formData.propertySubType === "Office" ||
        formData.propertySubType === "Retail Shop" ||
        formData.propertySubType === "Show Room" ||
        formData.propertySubType === "Warehouse" ||
        formData.propertySubType === "Others") &&
      !formData.constructionStatus
    ) {
      newErrors.constructionStatus = "Construction status is required";
    }
    if (
      formData.constructionStatus === "Ready to move" &&
      !formData.ageOfProperty
    ) {
      newErrors.ageOfProperty = "Age of property is required";
    }
    if (
      formData.constructionStatus === "Under Construction" &&
      !formData.possessionEnds
    ) {
      newErrors.possessionEnds = "Possession ends date is required";
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
      !formData.unitCost
    ) {
      newErrors.unitCost = "Unit cost is required";
    }
    if (
      (formData.propertySubType === "Office" ||
        formData.propertySubType === "Retail Shop" ||
        formData.propertySubType === "Show Room" ||
        formData.propertySubType === "Warehouse" ||
        formData.propertySubType === "Plot" ||
        formData.propertySubType === "Others") &&
      !formData.propertyCost
    ) {
      newErrors.propertyCost = "Property cost is required";
    }
    if (
      (formData.propertySubType === "Office" ||
        formData.propertySubType === "Retail Shop" ||
        formData.propertySubType === "Show Room" ||
        formData.propertySubType === "Warehouse" ||
        formData.propertySubType === "Plot" ||
        formData.propertySubType === "Others") &&
      !formData.ownership
    ) {
      newErrors.ownership = "Ownership is required";
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
        formData.propertySubType === "Warehouse" ||
        formData.propertySubType === "Others") &&
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
    if (
      (formData.propertySubType === "Office" ||
        formData.propertySubType === "Retail Shop" ||
        formData.propertySubType === "Show Room" ||
        formData.propertySubType === "Warehouse" ||
        formData.propertySubType === "Plot" ||
        formData.propertySubType === "Others") &&
      !formData.loanFacility
    ) {
      newErrors.loanFacility = "Loan facility is required";
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
    if (formData.propertySubType === "Plot" && !formData.possessionStatus) {
      newErrors.possessionStatus = "Possession status is required";
    }
    if (formData.propertySubType === "Plot" && !formData.investorProperty) {
      newErrors.investorProperty = "Investor property is required";
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

    if (Object.values(newErrors).every((error) => !error)) {
      console.log("Form Data:", formData);
    }
  };

  const areaUnitLabel = formData.areaUnits || "Sq.ft";

  const shouldRenderFields =
    formData.propertyType === "Commercial" &&
    formData.lookingTo === "Sell" &&
    (formData.transactionType === "New" || formData.transactionType === "Resale");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-2 sm:px-6 lg:px-8">
      <PageBreadcrumb pageTitle="Commercial Buy Review" pagePlacHolder="Filter listings" />
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
            {errors.propertySubType && (
              <p className="text-red-500 text-sm mt-1">{errors.propertySubType}</p>
            )}
          </div>

          {/* Conditionally Render Fields Based on Property Sub Type */}
          {shouldRenderFields && (
            <>
              {/* RERA Approved (All Sub Types) */}
              <div>
                <Label htmlFor="reraApproved">RERA Approved *</Label>
                <div className="flex space-x-4">
                  {["Yes", "No"].map((option) => (
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
                      {option}
                    </button>
                  ))}
                </div>
                {errors.reraApproved && (
                  <p className="text-red-500 text-sm mt-1">{errors.reraApproved}</p>
                )}
              </div>

              {/* Construction Status (Office, Retail Shop, Show Room, Warehouse, Others) */}
              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Retail Shop" ||
                formData.propertySubType === "Show Room" ||
                formData.propertySubType === "Warehouse" ||
                formData.propertySubType === "Others") && (
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
                  {errors.constructionStatus && (
                    <p className="text-red-500 text-sm mt-1">{errors.constructionStatus}</p>
                  )}
                </div>
              )}

              {/* Age of Property (if Ready to Move) */}
              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Retail Shop" ||
                formData.propertySubType === "Show Room" ||
                formData.propertySubType === "Warehouse" ||
                formData.propertySubType === "Others") &&
                formData.constructionStatus === "Ready to move" && (
                  <div>
                    <Label htmlFor="ageOfProperty">Age of Property *</Label>
                    <Input
                      type="text"
                      id="ageOfProperty"
                      name="ageOfProperty"
                      value={formData.ageOfProperty}
                      onChange={handleInputChange}
                      placeholder="Enter age of property (e.g., 5 years)"
                      className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    {errors.ageOfProperty && (
                      <p className="text-red-500 text-sm mt-1">{errors.ageOfProperty}</p>
                    )}
                  </div>
                )}

              {/* Possession Ends (if Under Construction) */}
              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Retail Shop" ||
                formData.propertySubType === "Show Room" ||
                formData.propertySubType === "Warehouse" ||
                formData.propertySubType === "Others") &&
                formData.constructionStatus === "Under Construction" && (
                  <div>
                    <DatePicker
                      id="possessionEnds"
                      label="Possession Ends *"
                      placeholder="Select possession end date"
                      onChange={(selectedDates) => {
                        const date = selectedDates[0]?.toISOString().split("T")[0] || "";
                        setFormData((prev) => ({ ...prev, possessionEnds: date }));
                        if (!date) {
                          setErrors((prev) => ({
                            ...prev,
                            possessionEnds: "Possession ends date is required",
                          }));
                        } else {
                          setErrors((prev) => ({ ...prev, possessionEnds: "" }));
                        }
                      }}
                      defaultDate={formData.possessionEnds ? new Date(formData.possessionEnds) : undefined}
                    />
                    {errors.possessionEnds && (
                      <p className="text-red-500 text-sm mt-1">{errors.possessionEnds}</p>
                    )}
                  </div>
                )}

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
                        className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                        className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                        className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                        className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                        className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                      Washrooms
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
                        className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      {errors.publicWashrooms && (
                        <p className="text-red-500 text-sm mt-1">{errors.publicWashrooms}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

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
                    className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                    className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                    className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                    className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                    className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                  className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                {errors.totalProjectArea && (
                  <p className="text-red-500 text-sm mt-1">{errors.totalProjectArea}</p>
                )}
              </div>

              {/* Unit Cost (All Sub Types) */}
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
                {errors.unitCost && (
                  <p className="text-red-500 text-sm mt-1">{errors.unitCost}</p>
                )}
              </div>

              {/* Property Cost (All Sub Types) */}
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
                {errors.propertyCost && (
                  <p className="text-red-500 text-sm mt-1">{errors.propertyCost}</p>
                )}
              </div>

              {/* Ownership (All Sub Types) */}
              <div>
                <Label htmlFor="ownership">Ownership *</Label>
                <div className="flex space-x-4">
                  {ownershipOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelectChange("ownership")(option.value)}
                      className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                        formData.ownership === option.value
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {errors.ownership && (
                  <p className="text-red-500 text-sm mt-1">{errors.ownership}</p>
                )}
              </div>

              {/* Facilities (Office, Retail Shop, Show Room) */}
              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Retail Shop" ||
                formData.propertySubType === "Show Room" || formData.propertySubType === 'Others') && (
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

              {/* Flat No / Plot No (All Sub Types) */}
              <div>
                <Label htmlFor="flatNo">
                  {(formData.propertySubType === "Warehouse" || formData.propertySubType === "Plot")
                    ? "Plot No. *"
                    : "Flat No. *"}
                </Label>
                <Input
                  type="text"
                  id="flatNo"
                  name="flatNo"
                  value={formData.flatNo}
                  onChange={handleInputChange}
                  placeholder={(formData.propertySubType === "Warehouse" || formData.propertySubType === "Plot")
                    ? "Plot Number"
                    : "Flat Number"}
                  className="dark:bg-dark-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                {errors.flatNo && (
                  <p className="text-red-500 text-sm mt-1">{errors.flatNo}</p>
                )}
              </div>

              {/* Zone Type (Office, Warehouse, Others) */}
              {(formData.propertySubType === "Office" ||
                formData.propertySubType === "Warehouse" ||
                formData.propertySubType === "Others") && (
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

              {/* Loan Facility (All Sub Types) */}
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
                {errors.loanFacility && (
                  <p className="text-red-500 text-sm mt-1">{errors.loanFacility}</p>
                )}
              </div>

              {/* Possession Status (Plot) */}
              {formData.propertySubType === "Plot" && (
                <div>
                  <Label htmlFor="possessionStatus">Possession Status *</Label>
                  <div className="flex space-x-4">
                    {possessionStatusOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelectChange("possessionStatus")(option.value)}
                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                          formData.possessionStatus === option.value
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {errors.possessionStatus && (
                    <p className="text-red-500 text-sm mt-1">{errors.possessionStatus}</p>
                  )}
                </div>
              )}

              {/* Investor Property (Plot) */}
              {formData.propertySubType === "Plot" && (
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
                  {errors.investorProperty && (
                    <p className="text-red-500 text-sm mt-1">{errors.investorProperty}</p>
                  )}
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

                {/* Car Parking (Office, Retail Shop, Show Room, Warehouse, Others) */}
                {(formData.propertySubType !== "Plot") && (
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

                {/* Bike Parking (Office, Retail Shop, Show Room, Warehouse, Others) */}
                {(formData.propertySubType !== "Plot") && (
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

                {/* Open Parking (Office, Retail Shop, Show Room, Warehouse, Others) */}
                {(formData.propertySubType !== "Plot") && (
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
                      className="dark:bg-dark-900 w-[30%] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Input
                      type="text"
                      placeholder="Distance from property"
                      value={distanceFromProperty}
                      onChange={(e) => setDistanceFromProperty(e.target.value)}
                      className="dark:bg-dark-900 w-[30%] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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

export default CommercialBuyEdit;
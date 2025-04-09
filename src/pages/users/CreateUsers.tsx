import React, { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import MultiSelect from "../../components/form/MultiSelect";
import PhoneInput from "../../components/form/group-input/PhoneInput";
import { EyeCloseIcon, EyeIcon, EnvelopeIcon } from "../../icons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { getCities, getStates } from "../../store/slices/propertyDetails";

// Define interfaces for form data and errors
interface FormData {
  name: string;
  mobile: string;
  email: string;
  designation: string; // Single select
  password: string;
  city: string[];
  state: string[];
  pincode: string;
  paymentType: string;
  paymentMode: string;
}

interface Errors {
  name?: string;
  mobile?: string;
  email?: string;
  designation?: string;
  password?: string;
  city?: string;
  state?: string;
  pincode?: string;
  paymentType?: string;
  paymentMode?: string;
}

interface Option {
  value: string;
  text: string;
}

export default function CreateUser() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { cities, states } = useSelector((state: RootState) => state.property);
  const pageUserType = useSelector((state: RootState) => state.auth.user?.user_type);

  useEffect(() => {
    dispatch(getCities());
    dispatch(getStates());
  }, [dispatch]);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    mobile: "",
    email: "",
    designation: "",
    password: "",
    city: [],
    state: [],
    pincode: "",
    paymentType: "",
    paymentMode: "",
  });

  const [errors, setErrors] = useState<Errors>({});

  // Base designation options (all possible options)
  const allDesignationOptions: Option[] = [
    { value: "2", text: "User" },
    { value: "3", text: "Builder" },
    { value: "4", text: "Agent" },
    { value: "5", text: "Owner" },
    { value: "6", text: "Channel Partner" },
  ];

  // Filter designation options based on pageUserType
  const designationOptions: Option[] = (() => {
    if (pageUserType === 7 || pageUserType === 9) {
      // For Manager (7) and Marketing Executive (9), show Builder, Agent, Channel Partner
      return allDesignationOptions.filter(option =>
        ["3", "4", "6"].includes(option.value) // Builder, Agent, Channel Partner
      );
    } else if (pageUserType === 1) {
      // For userType 1, show all options
      return allDesignationOptions;
    }
    // Default case: show all options (or adjust as needed)
    return allDesignationOptions;
  })();

  const paymentTypeOptions: Option[] = [
    { value: "basic", text: "Basic" },
    { value: "prime", text: "Prime" },
    { value: "prime_plus", text: "Prime Plus" },
  ];

  const paymentModeOptions: Option[] = [
    { value: "neft", text: "NEFT" },
    { value: "cash", text: "Cash" },
    { value: "offline", text: "Offline" },
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

  const countries = [{ code: "IN", label: "+91" }];

  const handleSingleChange =
    (field: "name" | "mobile" | "email" | "password" | "pincode" | "paymentType" | "paymentMode" | "designation") =>
    (value: string) => {
      setFormData({ ...formData, [field]: value });
      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined });
      }
    };

  const handleMultiSelectChange =
    (field: "city" | "state") =>
    (values: string[]) => {
      setFormData({ ...formData, [field]: values });
      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined });
      }
    };

  const validateForm = () => {
    let newErrors: Errors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.designation) newErrors.designation = "Designation is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.city.length === 0) newErrors.city = "At least one city is required";
    if (formData.state.length === 0) newErrors.state = "At least one state is required";
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }
    if (!formData.paymentType) newErrors.paymentType = "Payment Type is required";
    if (!formData.paymentMode) newErrors.paymentMode = "Payment Mode is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const userType = localStorage.getItem("userType");
      const createdBy = localStorage.getItem("name");
      const createdUserIdRaw = localStorage.getItem("userId");

      const selectedCityId = formData.city[0];
      const cityName = cityOptions.find((option) => option.value === selectedCityId)?.text || selectedCityId;

      const selectedStateId = formData.state[0];
      const stateName = stateOptions.find((option) => option.value === selectedStateId)?.text || selectedStateId;

      const selectedDesignationId = formData.designation;
      const designationName = designationOptions.find((option) => option.value === selectedDesignationId)?.text || selectedDesignationId;

      const employeeData = {
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        designation: designationName,
        password: formData.password,
        city: cityName,
        state: stateName,
        pincode: formData.pincode,
        payment_type: formData.paymentType,
        payment_mode: formData.paymentMode,
        user_type: parseInt(selectedDesignationId),
        created_by: createdBy || "Unknown",
        created_userID: createdUserIdRaw ? parseInt(createdUserIdRaw) : 1,
      };

      console.log(employeeData);
    }
  };

  return (
    <ComponentCard title="Create Users">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="min-h-[80px]">
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleSingleChange("name")(e.target.value)}
            placeholder="Enter your name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div className="min-h-[80px]">
          <Label>Mobile Number</Label>
          <PhoneInput
            selectPosition="start"
            countries={countries}
            value={formData.mobile}
            placeholder="Enter mobile number"
            onChange={handleSingleChange("mobile")}
          />
          {errors.mobile && (
            <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
          )}
        </div>

        <div className="min-h-[80px]">
          <Label htmlFor="email">Email ID</Label>
          <div className="relative">
            <Input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleSingleChange("email")(e.target.value)}
              placeholder="example@domain.com"
              className="pl-[62px]"
            />
            <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <EnvelopeIcon className="size-6" />
            </span>
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div className="min-h-[80px]">
          <Label htmlFor="designation">Designation</Label>
          <select
            id="designation"
            value={formData.designation}
            onChange={(e) => handleSingleChange("designation")(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D3A76] dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          >
            <option value="">Select designation</option>
            {designationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
          {errors.designation && (
            <p className="text-red-500 text-sm mt-1">{errors.designation}</p>
          )}
        </div>

        <div className="min-h-[80px]">
          <Label>Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleSingleChange("password")(e.target.value)}
              placeholder="Enter password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
            >
              {showPassword ? (
                <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
              ) : (
                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div className="min-h-[80px]">
          <Label htmlFor="paymentType">Payment Type</Label>
          <select
            id="paymentType"
            value={formData.paymentType}
            onChange={(e) => handleSingleChange("paymentType")(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D3A76] dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          >
            <option value="">Select payment type</option>
            {paymentTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
          {errors.paymentType && (
            <p className="text-red-500 text-sm mt-1">{errors.paymentType}</p>
          )}
        </div>

        <div className="min-h-[80px]">
          <Label htmlFor="paymentMode">Payment Mode</Label>
          <select
            id="paymentMode"
            value={formData.paymentMode}
            onChange={(e) => handleSingleChange("paymentMode")(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D3A76] dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          >
            <option value="">Select payment mode</option>
            {paymentModeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
          {errors.paymentMode && (
            <p className="text-red-500 text-sm mt-1">{errors.paymentMode}</p>
          )}
        </div>

        <div className="relative mb-10 min-h-[80px]">
          <MultiSelect
            label="City"
            options={cityOptions}
            defaultSelected={formData.city}
            onChange={handleMultiSelectChange("city")}
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
          )}
        </div>

        <div className="min-h-[80px]">
          <Label htmlFor="pincode">Pincode</Label>
          <Input
            type="text"
            id="pincode"
            value={formData.pincode}
            onChange={(e) => handleSingleChange("pincode")(e.target.value)}
            placeholder="Enter pincode"
          />
          {errors.pincode && (
            <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
          )}
        </div>

        <div className="relative mb-10 min-h-[80px]">
          <MultiSelect
            label="State"
            options={stateOptions}
            defaultSelected={formData.state}
            onChange={handleMultiSelectChange("state")}
          />
          {errors.state && (
            <p className="text-red-500 text-sm mt-1">{errors.state}</p>
          )}
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="w-[60%] px-4 py-2 text-white bg-[#1D3A76] rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {"Submit"}
          </button>
        </div>
      </form>
    </ComponentCard>
  );
}
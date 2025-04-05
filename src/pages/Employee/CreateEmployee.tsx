import React, { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import MultiSelect from "../../components/form/MultiSelect"; // Updated MultiSelect
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
  designation: string[];
  password: string;
  city: string[];
  state: string[];
  pincode: string;
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
}

interface Option {
  value: string;
  text: string;
}

export default function CreateEmployee() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { cities, states } = useSelector((state: RootState) => state.property);

  useEffect(() => {
    dispatch(getCities());
    dispatch(getStates());
  }, [dispatch]);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    mobile: "",
    email: "",
    designation: [],
    password: "",
    city: [],
    state: [],
    pincode: "",
  });

  const [errors, setErrors] = useState<Errors>({});

  const designationOptions: Option[] = [
    { value: "manager", text: "Manager" },
    { value: "telecaller", text: "TeleCaller" },
    { value: "marketing", text: "Marketing Executive" },
    { value: "customer-support", text: "Customer Support" },
    { value: "customer-service", text: "Customer Service" },
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
    (field: "name" | "mobile" | "email" | "password" | "pincode") =>
    (value: string) => {
      setFormData({ ...formData, [field]: value });
      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined });
      }
    };

  const handleMultiSelectChange =
    (field: "designation" | "city" | "state") =>
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
    if (formData.designation.length === 0)
      newErrors.designation = "At least one designation is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.city.length === 0)
      newErrors.city = "At least one city is required";
    if (formData.state.length === 0)
      newErrors.state = "At least one state is required";
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", formData);
    }
  };

  return (
    <ComponentCard title="Create Employee">
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

        <div className="relative mb-10 min-h-[80px]">
          <MultiSelect
            label="Designation"
            options={designationOptions}
            defaultSelected={formData.designation}
            onChange={handleMultiSelectChange("designation")}
          />
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

        <div className="relative mb-30 min-h-[80px]">
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
            className="w-[60%] px-4 py-2 text-white bg-[#1D3A76] rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit
          </button>
        </div>
      </form>
    </ComponentCard>
  );
}
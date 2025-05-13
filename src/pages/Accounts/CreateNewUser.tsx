import { useState, ChangeEvent, useEffect, FormEvent } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import { AppDispatch, RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { getCities } from "../../store/slices/propertyDetails";
import Dropdown from "../../components/form/Dropdown";
import { createUser } from "../../store/slices/users";
import { useNavigate } from "react-router";

interface FormData {

  mobile: string;
  email: string;
  name: string;
  userType: string;
 
  city: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface Option {
  value: string;
  text: string;
}

const CreateNewUser: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    mobile: "",
    email: "",
    name: "",
    userType: "",
    city: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [apiError, setApiError] = useState<string>("");
  const dispatch = useDispatch<AppDispatch>();
  const { cities } = useSelector((state: RootState) => state.property);
  const navigate = useNavigate();

  const userTypeOptions: SelectOption[] = [
    { value: "User", label: "User" },
    { value: "Builder", label: "Builder" },
    { value: "Agent", label: "Agent" },
    { value: "Owner", label: "Owner" },
    { value: "Channel Partner", label: "Channel Partner" },
  ];

  const cityOptions: Option[] =
    cities?.map((city: any) => ({
      value: city.value,
      text: city.label,
    })) || [];

  useEffect(() => {
    dispatch(getCities());
  }, [dispatch]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  const handleSelectChange = (name: keyof FormData) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  const handleDropdownChange = (field: keyof FormData) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setApiError("");
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name) {
      newErrors.name = "Name is required";
    }

    if (!formData.mobile) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number must be exactly 10 digits";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.userType) {
      newErrors.userType = "User Type is required";
    }

    if (!formData.city) {
      newErrors.city = "City is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        name: formData.name,
        userType: formData.userType,
        mobile: formData.mobile,
        email: formData.email,
        city: parseInt(formData.city),
      };

      console.log("Form Data Submitted:", payload);

      await dispatch(createUser(payload)).unwrap();
      setFormData({
        mobile: "",
        email: "",
        name: "",
        userType: "",
        city: "",
      });
      navigate(-1); // Navigate back to the previous page
    } catch (error) {
      setApiError((error as string) || "Failed to create user");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
      <ComponentCard title="Create New User">
        <form onSubmit={handleSubmit} className="space-y-6">
          {apiError && (
            <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>
          )}
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="dark:bg-dark-900"
              placeholder="Enter user name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="mobile">Mobile</Label>
            <Input
              type="text"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className="dark:bg-dark-900"
              placeholder="Enter 10-digit mobile number"
            />
            {errors.mobile && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.mobile}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="dark:bg-dark-900"
              placeholder="Enter user email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.email}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="userType">User Type</Label>
            <Select
              options={userTypeOptions}
              placeholder="Select user type"
              onChange={handleSelectChange("userType")}
              value={formData.userType}
              className="dark:bg-dark-900"
            />
            {errors.userType && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.userType}
              </p>
            )}
          </div>
          <div>
          
            <Dropdown
              id="city"
              label="Select City"
              options={cityOptions}
              value={formData.city}
              onChange={handleDropdownChange("city")}
              placeholder="Search for a city..."
              error={errors.city}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.city}
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-[#1D3A76] text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Submit
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default CreateNewUser;
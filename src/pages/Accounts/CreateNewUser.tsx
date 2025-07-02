import { useState, ChangeEvent, useEffect, FormEvent } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import { AppDispatch, RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import Dropdown from "../../components/form/Dropdown";
import { createUser } from "../../store/slices/users";
import { useNavigate } from "react-router";
import { fetchAllCities, fetchAllStates } from "../../store/slices/places";

interface FormData {
  mobile: string;
  email: string;
  name: string;
  userType: string;
  city: string;
  state: string;
  gst_number: string;
  rera_number: string;
  company_name: string;
  pincode: string; // Added pincode field
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
    state: "",
    gst_number: "",
    rera_number: "",
    company_name: "",
    pincode: "", // Initialize pincode
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [apiError, setApiError] = useState<string>("");
  const dispatch = useDispatch<AppDispatch>();
  const {
    cities,
    states,
    error: placesError,
  } = useSelector((state: RootState) => state.places);
  const navigate = useNavigate();

  const userTypeOptions: SelectOption[] = [
    { value: "2", label: "User" },
    { value: "3", label: "Builder" },
    { value: "4", label: "Agent" },
    { value: "5", label: "Owner" },
    { value: "6", label: "Channel Partner" },
  ];

  const stateOptions: Option[] =
    states && Array.isArray(states)
      ? states.map((state: any) => ({
          value: state.name || "",
          text: state.name || "",
        }))
      : [];

  const cityOptions: Option[] =
    cities && Array.isArray(cities)
      ? cities.map((city: any) => ({
          value: city.name || "",
          text: city.name || "",
        }))
      : [];

  useEffect(() => {
    dispatch(fetchAllStates());
  }, [dispatch]);

  useEffect(() => {
    if (formData.state) {
      dispatch(fetchAllCities({ state: formData.state }));
    } else {
      dispatch(fetchAllCities({ state: "" }));
    }
  }, [formData.state, dispatch]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // For pincode, allow only numbers
    if (name === "pincode" && value !== "" && !/^\d*$/.test(value)) {
      return; // Prevent non-numeric input
    }
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
      ...(field === "state" && { city: "" }),
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

    if (!formData.state) {
      newErrors.state = "State is required";
    }

    if (!formData.city) {
      newErrors.city = "City is required";
    }

    if (!formData.pincode) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be exactly 6 digits";
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
      const createdBy = localStorage.getItem("name");
      const createdUserIdRaw = localStorage.getItem("userId");
      const selectedCity = cityOptions.find(
        (option) => option.value === formData.city
      );
      const cityLabel = selectedCity ? selectedCity.text : formData.city;
      const selectedState = stateOptions.find(
        (option) => option.value === formData.state
      );
      const stateLabel = selectedState ? selectedState.text : formData.state;

      const payload = {
        name: formData.name,
        user_type: parseInt(formData.userType),
        mobile: formData.mobile,
        email: formData.email,
        state: stateLabel,
        city: cityLabel,
        pincode: formData.pincode, // Include pincode in payload
        gst_number: formData.gst_number,
        rera_number: formData.rera_number,
        company_name: formData.company_name,
        created_userID: createdUserIdRaw ? parseInt(createdUserIdRaw) : 1,
        created_by: createdBy || "Unknown",
      };

      await dispatch(createUser(payload)).unwrap();
      setFormData({
        mobile: "",
        email: "",
        name: "",
        userType: "",
        city: "",
        state: "",
        pincode: "", // Reset pincode
        gst_number: "",
        rera_number: "",
        company_name: "",
      });
      navigate(-1);
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
          {placesError && (
            <p className="text-sm text-red-600 dark:text-red-400">
              Failed to load states or cities: {placesError}
            </p>
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
            <Label htmlFor="gst_number">Gst Number</Label>
            <Input
              type="text"
              id="gst_number"
              name="gst_number"
              value={formData.gst_number}
              onChange={handleInputChange}
              className="dark:bg-dark-900"
              placeholder="Enter gst number"
            />
          </div>
          <div>
            <Label htmlFor="rera_number">Rera Number</Label>
            <Input
              type="text"
              id="rera_number"
              name="rera_number"
              value={formData.rera_number}
              onChange={handleInputChange}
              className="dark:bg-dark-900"
              placeholder="Enter rera number"
            />
          </div>
          <div>
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              type="text"
              id="company_name"
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              className="dark:bg-dark-900"
              placeholder="Enter company name"
            />
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
              id="state"
              label="Select State"
              options={stateOptions}
              value={formData.state}
              onChange={handleDropdownChange("state")}
              placeholder="Search for a state..."
              error={errors.state}
            />
            {errors.state && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.state}
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
              disabled={!formData.state}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.city}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              type="text" // Use text to enforce regex validation
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              className="dark:bg-dark-900"
              placeholder="Enter 6-digit pincode"
            />
            {errors.pincode && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.pincode}
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

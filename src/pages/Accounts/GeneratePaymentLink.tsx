import { useState, ChangeEvent, FormEvent } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";

// Define the type for the form data
interface FormData {
  mobile: string;
  email: string;
  name: string;
  userType: string;
}

// Define the type for the Select options
interface SelectOption {
  value: string;
  label: string;
}

const GeneratePayments: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    mobile: "",
    email: "",
    name: "",
    userType: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  // User Type options based on the provided mapping
  const userTypeOptions: SelectOption[] = [
    { value: "2", label: "User" },
    { value: "3", label: "Builder" },
    { value: "4", label: "Agent" },
    { value: "5", label: "Owner" },
    { value: "6", label: "Channel Partner" },
  ];

  // Handle input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for the field when user starts typing
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle select change for userType
  const handleSelectChange = (name: keyof FormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    // Mobile validation (must be 10 digits)
    if (!formData.mobile) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number must be exactly 10 digits";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Name validation
    if (!formData.name) {
      newErrors.name = "Name is required";
    }

    // User Type validation
    if (!formData.userType) {
      newErrors.userType = "User Type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form Data:", formData);
      // Add your form submission logic here (e.g., API call to generate payment)
      alert("Payment generation initiated successfully!");
      // Reset form after submission
      setFormData({
        mobile: "",
        email: "",
        name: "",
        userType: "",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
      <ComponentCard title="Generate Payment Links">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
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
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Mobile */}
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
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.mobile}</p>
            )}
          </div>

          {/* Email */}
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
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          {/* User Type */}
          <div>
            <Label htmlFor="userType">User Type</Label>
            <Select
              options={userTypeOptions}
              placeholder="Select user type"
              onChange={handleSelectChange("userType")}
              value={formData.userType} // Add this line to make the dropdown controlled
              className="dark:bg-dark-900"
            />
            {errors.userType && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.userType}</p>
            )}
          </div>

          {/* Submit Button */}
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

export default GeneratePayments;
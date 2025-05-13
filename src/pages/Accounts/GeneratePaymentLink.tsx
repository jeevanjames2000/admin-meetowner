import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";

interface FormData {
  user_id: string;
  amount: string;
  mobile: string;
  email: string;
  name: string;
  userType: string;
  package: string;
}

interface SelectOption {
  value: string;
  label: string;
}

const GeneratePayments: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    user_id: "",
    amount: "",
    mobile: "",
    email: "",
    name: "",
    userType: "",
    package: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [apiError, setApiError] = useState<string>("");
  const [paymentLink, setPaymentLink] = useState<string>("");

  const userTypeOptions: SelectOption[] = [
    { value: "2", label: "User" },
    { value: "3", label: "Builder" },
    { value: "4", label: "Agent" },
    { value: "5", label: "Owner" },
    { value: "6", label: "Channel Partner" },
  ];

  const packageOptions: SelectOption[] = [
    { value: "Basic", label: "Basic (₹6999)" },
    { value: "Prime", label: "Prime (₹24999)" },
    { value: "Prime Plus", label: "Prime Plus (₹49999)" },
  ];

  // Package-to-amount mapping
  const packageAmounts: { [key: string]: number } = {
    Basic: 6999,
    Prime: 24999,
    "Prime Plus": 49999,
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  const handleSelectChange = (name: keyof FormData) => (value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "package") {
        newData.amount = packageAmounts[value]?.toString() || "";
      }
      return newData;
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.user_id) {
      newErrors.user_id = "User ID is required";
    } else if (!/^\d+$/.test(formData.user_id)) {
      newErrors.user_id = "User ID must be a number";
    }

    if (!formData.package) {
      newErrors.package = "Package is required";
    } else if (!packageAmounts[formData.package]) {
      newErrors.package = "Invalid package selected";
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

    if (!formData.name) {
      newErrors.name = "Name is required";
    }

    if (!formData.userType) {
      newErrors.userType = "User Type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError("");
    setPaymentLink("");

    if (!validateForm()) {
      return;
    }

    const payload = {
      amount: parseFloat(formData.amount),
      currency: "INR",
      user_id: parseInt(formData.user_id),
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email,
      subscription_package: formData.package,
      customer_email: formData.email,
      customer_contact: formData.mobile,
    };

    try {
      const response = await axios.post(
        "https://api.meetowner.in/payments/createPaymentLink",
        payload,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );

      if (response.data.success) {
        setPaymentLink(response.data.payment_link);
        alert("Payment link generated successfully!");
        setFormData({
          user_id: "",
          amount: "",
          mobile: "",
          email: "",
          name: "",
          userType: "",
          package: "",
        });
      } else {
        setApiError(response.data.message || "Failed to generate payment link");
      }
    } catch (error) {
      console.error("CreatePaymentLink API error:", error);
      // setApiError(
      //   error.response?.data?.message ||
      //     error.message ||
      //     "Failed to connect to the payment service"
      // );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
      <ComponentCard title="Generate Payment Links">
        <form onSubmit={handleSubmit} className="space-y-6">
          {apiError && (
            <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>
          )}
          {paymentLink && (
            <div className="text-sm text-green-600 dark:text-green-400">
              Payment Link:{" "}
              <a
                href={paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {paymentLink}
              </a>
            </div>
          )}
          <div>
            <Label htmlFor="user_id">User ID</Label>
            <Input
              type="text"
              id="user_id"
              name="user_id"
              value={formData.user_id}
              onChange={handleInputChange}
              className="dark:bg-dark-900"
              placeholder="Enter user ID"
            />
            {errors.user_id && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.user_id}
              </p>
            )}
          </div>
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
            <Label htmlFor="package">Package</Label>
            <Select
              options={packageOptions}
              placeholder="Select Package"
              onChange={handleSelectChange("package")}
              value={formData.package}
              className="dark:bg-dark-900"
            />
            {errors.package && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.package}
              </p>
            )}
          </div>
          {formData.package && (
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                type="text"
                id="amount"
                name="amount"
                value={formData.amount}
                
                className="dark:bg-dark-900 bg-gray-100 cursor-not-allowed"
                placeholder="Amount set by package"
              />
            </div>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-[#1D3A76] text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Generate Payment Link
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default GeneratePayments;
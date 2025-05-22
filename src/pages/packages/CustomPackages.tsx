import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "../../components/form/Select";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { AppDispatch, RootState } from "../../store/store";
import { fetchUsersByType } from "../../store/slices/users";
import { clearMessages, insertCustomPackageWithRules } from "../../store/slices/packagesSlice";

interface Rule {
  id?: number;
  name: string;
  included: boolean;
}

interface Package {
  id: string;
  name: string;
  duration_days: string;
  price: string;
  button_text: string;
  actual_amount: string;
  gst: string;
  sgst: string;
  gst_percentage: string;
  sgst_percentage?: string;
  gst_number: string;
  rera_number: string;
  package_for: string;
  rules: Rule[];
  packageFor: string;
  customNumber: string | null;
}

interface User {
  id: number;
  user_type: number;
  name: string | null;
  mobile: string | null;
}

interface Errors {
  packageFor?: string;
  customNumber?: string;
  name?: string;
  price?: string;
  actual_amount?: string;
  gst?: string;
  sgst?: string;
  gst_percentage?: string;
  sgst_percentage?: string;
  gst_number?: string;
  rera_number?: string;
  duration_days?: string;
  button_text?: string;
}

const CustomPackages: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading: usersLoading, error: usersError } = useSelector(
    (state: RootState) => state.users
  );
  const { insertLoading, insertSuccess, insertError } = useSelector(
    (state: RootState) => state.package
  );

  const defaultRules: Rule[] = [
    { name: "Number of Listings 5", included: false },
    { name: "Response Rate 2X More", included: false },
    { name: "Position On Search Low", included: false },
    { name: "Buyers Visibility Limited", included: false },
    { name: "Verified Tag", included: false },
    { name: "Visibility on Best Details", included: false },
    { name: "Visibility on Latest Details", included: false },
    { name: "Land Page AD", included: false },
    { name: "Land Page Banner", included: false },
    { name: "Listings Page Small ADS", included: false },
    { name: "Dedicated Agent Support", included: false },
    { name: "Creatives", included: false },
    { name: "Listing Support", included: false },
    { name: "Meta ADS", included: false },
    { name: "Prime Promotion", included: false },
    { name: "CRM", included: false },
  ];

  const [formData, setFormData] = useState<Package>({
    id: "",
    name: "",
    duration_days: "",
    price: "",
    button_text: "",
    actual_amount: "",
    gst: "",
    sgst: "",
    gst_percentage: "",
    sgst_percentage: "",
    gst_number: "",
    rera_number: "",
    package_for: "User",
    rules: defaultRules,
    packageFor: "User",
    customNumber: null,
  });
  const [userSearchTerm, setUserSearchTerm] = useState<string>("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const userTypeIdMap: { [key: string]: number } = {
    User: 2,
    Builder: 3,
    Agent: 4,
    Owner: 5,
    "Channel Partner": 6,
  };

  const packageOptions = [
    { value: "Basic", label: "Basic (₹6999)" },
    { value: "Prime", label: "Prime (₹24999)" },
    { value: "Prime Plus", label: "Prime Plus (₹49999)" },
    { value: "Custom", label: "Custom" },
    { value: "Offline", label: "Offline" },
  ];
  const packagePrices: { [key: string]: string } = {
    Basic: "6999",
    Prime: "24999",
    "Prime Plus": "49999",
  };

  // Fetch users based on selected packageFor
  useEffect(() => {
    const userTypeId = userTypeIdMap[formData.packageFor];
    if (userTypeId) {
      dispatch(fetchUsersByType({ user_type: userTypeId }));
    } else {
      console.warn(`Invalid user type: ${formData.packageFor}`);
    }
  }, [dispatch, formData.packageFor]);

  // Handle API success/error feedback
  useEffect(() => {
    if (insertSuccess) {
      // Reset form on success
      setFormData({
        id: "",
        name: "",
        duration_days: "",
        price: "",
        button_text: "",
        actual_amount: "",
        gst: "",
        sgst: "",
        gst_percentage: "",
        sgst_percentage: "",
        gst_number: "",
        rera_number: "",
        package_for: "User",
        rules: defaultRules,
        packageFor: "User",
        customNumber: null,
      });
      setUserSearchTerm("");
      setIsUserDropdownOpen(false);
      setErrors({});
      dispatch(clearMessages());
    }
    if (insertError) {
      dispatch(clearMessages());
    }
  }, [insertSuccess, insertError, dispatch]);

  const filteredUserOptions = users.filter(
    (user) =>
      (user.name?.toLowerCase()?.includes(userSearchTerm.toLowerCase()) ||
        user.mobile?.toLowerCase()?.includes(userSearchTerm.toLowerCase())) ??
      false
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (
      [
        "price",
        "actual_amount",
        "gst",
        "sgst",
        "gst_percentage",
        "sgst_percentage",
        "duration_days",
      ].includes(name)
    ) {
      // Allow decimal values for price, actual_amount, gst, sgst
      const decimalFields = ["price", "actual_amount", "gst", "sgst"];
      const regex = decimalFields.includes(name)
        ? /^\d*\.?\d*$/ // Allow numbers with optional decimal point
        : /^\d*$/; // Only integers for duration_days, gst_percentage, sgst_percentage

      if (value === "" || regex.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePackageForChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      packageFor: value,
      package_for: value,
      customNumber: null,
    }));
    setUserSearchTerm("");
    setIsUserDropdownOpen(false);
    setErrors((prev) => ({ ...prev, packageFor: undefined, customNumber: undefined }));
  };

  const handlePackageChange = (value: string) => {
    const price = packagePrices[value] || "";
    setFormData((prev) => ({
      ...prev,
      name: value,
      price: value === "Custom" || value === "Offline" ? "" : price,
    }));
    setErrors((prev) => ({ ...prev, name: undefined, price: undefined }));
  };

  const handleUserSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserSearchTerm(e.target.value);
    setIsUserDropdownOpen(true);
    setErrors((prev) => ({ ...prev, customNumber: undefined }));
  };

  const handleUserSelect = (user: User) => {
    setFormData((prev) => ({
      ...prev,
      customNumber: user.id.toString(),
      package_for: formData.packageFor,
    }));
    const displayText =
      [user.name, user.mobile].filter(Boolean).join(" (") + (user.mobile ? ")" : "") || "";
    setUserSearchTerm(displayText || "");
    setIsUserDropdownOpen(false);
    setErrors((prev) => ({ ...prev, customNumber: undefined }));
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen((prev) => !prev);
  };

  const handleUserClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".user-dropdown")) {
      setIsUserDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleUserClickOutside);
    return () => {
      document.removeEventListener("click", handleUserClickOutside);
    };
  }, []);

  const handleRuleChange = (index: number, field: "name" | "included", value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.map((rule, i) => (i === index ? { ...rule, [field]: value } : rule)),
    }));
  };

  const handleAddRule = () => {
    setFormData((prev) => ({
      ...prev,
      rules: [...prev.rules, { name: "", included: false }],
    }));
  };

  const handleRemoveRule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors: Errors = {};
    if (!formData.packageFor) newErrors.packageFor = "Package For is required";
    if (!formData.customNumber) newErrors.customNumber = "User selection is required";
    if (!formData.name) newErrors.name = "Package Name is required";
    if (!formData.price && (formData.name === "Custom" || formData.name === "Offline"))
      newErrors.price = "Price is required for Custom or Offline packages";
    if (!formData.actual_amount) newErrors.actual_amount = "Actual Amount is required";
    if (!formData.gst) newErrors.gst = "GST is required";
    if (!formData.sgst) newErrors.sgst = "SGST is required";
    if (!formData.gst_percentage) newErrors.gst_percentage = "GST Percentage is required";
    if (!formData.sgst_percentage) newErrors.sgst_percentage = "SGST Percentage is required";
    if (!formData.gst_number) newErrors.gst_number = "GST Number is required";
    if (!formData.rera_number) newErrors.rera_number = "RERA Number is required";
    if (!formData.duration_days || isNaN(parseInt(formData.duration_days)))
      newErrors.duration_days = "Duration Days is required and must be a valid number";
    if (!formData.button_text) newErrors.button_text = "Button Text is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (validateForm()) {
      try {
        const includedRules = formData.rules.filter((rule) => rule.included);
        const createdUserIdRaw = localStorage.getItem("userId");

        // Construct the payload for insertCustomPackageWithRules
        const payload = {
          name: "Custom",
          user_id: parseInt(formData.customNumber!), // customNumber is guaranteed by validation
          price: parseFloat(formData.price) || 0, // Use parseFloat for decimal values
          duration_days: parseInt(formData.duration_days) || 0,
          package_for: formData.package_for.toLowerCase(),
          button_text: formData.button_text,
          actual_amount: parseFloat(formData.actual_amount) || 0, // Use parseFloat
          gst: parseFloat(formData.gst) || 0, // Use parseFloat
          sgst: parseFloat(formData.sgst) || 0, // Use parseFloat
          gst_percentage: parseInt(formData.gst_percentage) || 0,
          gst_number: formData.gst_number,
          rera_number: formData.rera_number,
          rules: includedRules.map((rule) => ({
            name: rule.name,
            included: rule.included,
          })),
          created_by: createdUserIdRaw ? parseInt(createdUserIdRaw) : 1,
        };

        // Dispatch the API call
        await dispatch(insertCustomPackageWithRules(payload)).unwrap();
        console.log(payload);
      } catch (error) {
        console.error("Failed to create package:", error);
      }
    }
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    setFormData({
      id: "",
      name: "",
      duration_days: "",
      price: "",
      button_text: "",
      actual_amount: "",
      gst: "",
      sgst: "",
      gst_percentage: "",
      sgst_percentage: "",
      gst_number: "",
      rera_number: "",
      package_for: "User",
      rules: defaultRules,
      packageFor: "User",
      customNumber: null,
    });
    setUserSearchTerm("");
    setIsUserDropdownOpen(false);
    setErrors({});
    dispatch(clearMessages());
  };

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
      <PageMeta title="Meet Owner Create Custom Package" />
      <ComponentCard title="Create Custom Package">
        {insertSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {insertSuccess}
          </div>
        )}
        {insertError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {insertError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative mb-10 min-h-[80px]">
            <Label htmlFor="packageFor">Package For</Label>
            <Select
              options={Object.keys(userTypeIdMap).map((key) => ({
                value: key,
                label: key,
              }))}
              placeholder="Select Package For"
              onChange={handlePackageForChange}
              value={formData.packageFor}
              className="dark:bg-dark-900 focus:ring-2 focus:ring-blue-500"
            />
            {errors.packageFor && (
              <p className="text-red-500 text-sm mt-1">{errors.packageFor}</p>
            )}
          </div>

          <div className="relative mb-10 min-h-[80px] user-dropdown">
            <Label htmlFor="user-search">Select User</Label>
            <div className="relative">
              <input
                id="user-search"
                type="text"
                value={userSearchTerm}
                onChange={handleUserSearchChange}
                onClick={toggleUserDropdown}
                placeholder="Search for a user..."
                className="block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                disabled={usersLoading || insertLoading}
              />
              <button
                type="button"
                onClick={toggleUserDropdown}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                aria-label="Toggle user dropdown"
                disabled={usersLoading || insertLoading}
              >
                <svg
                  className={`w-4 h-4 transform ${isUserDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isUserDropdownOpen && (
                <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
                  {usersLoading ? (
                    <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      Loading users...
                    </li>
                  ) : filteredUserOptions.length > 0 ? (
                    filteredUserOptions.map((user) => (
                      <li
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        {[user.name, user.mobile]
                          .filter(Boolean)
                          .join(" (") + (user.mobile ? ")" : "") || "Unknown User"}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      No users found
                    </li>
                  )}
                </ul>
              )}
            </div>
            {errors.customNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.customNumber}</p>
            )}
          </div>

          <div className="relative mb-10 min-h-[80px]">
            <Label htmlFor="packageName">Package Name</Label>
            <Select
              options={packageOptions}
              placeholder="Select Package"
              onChange={handlePackageChange}
              value={formData.name}
              className="dark:bg-dark-900 focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="min-h-[80px]">
            <Label htmlFor="price">Price</Label>
            <div className="relative">
              <Input
                type="text"
                id="price"
                name="price"
                value={formData.price}
                onChange={
                  formData.name === "Custom" || formData.name === "Offline"
                    ? handleInputChange
                    : undefined
                }
                className={`dark:bg-dark-900 ${
                  formData.name !== "Custom" && formData.name !== "Offline"
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                } focus:ring-2 focus:ring-blue-500`}
                placeholder={
                  formData.name === "Custom" || formData.name === "Offline"
                    ? "Enter price"
                    : "Price set by package"
                }
                disabled={
                  (formData.name !== "Custom" && formData.name !== "Offline") || insertLoading
                }
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                /-
              </span>
            </div>
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          <div className="min-h-[80px]">
            <Label htmlFor="actual_amount">Actual Amount</Label>
            <div className="relative">
              <Input
                type="text"
                id="actual_amount"
                name="actual_amount"
                value={formData.actual_amount}
                onChange={handleInputChange}
                className="dark:bg-dark-900 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter actual amount"
                disabled={insertLoading}
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                /-
              </span>
            </div>
            {errors.actual_amount && (
              <p className="text-red-500 text-sm mt-1">{errors.actual_amount}</p>
            )}
          </div>

          <div className="min-h-[80px]">
            <Label htmlFor="gst">GST Amount</Label>
            <div className="relative">
              <Input
                type="text"
                id="gst"
                name="gst"
                value={formData.gst}
                onChange={handleInputChange}
                className="dark:bg-dark-900 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter GST"
                disabled={insertLoading}
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                /-
              </span>
            </div>
            {errors.gst && <p className="text-red-500 text-sm mt-1">{errors.gst}</p>}
          </div>

          <div className="min-h-[80px]">
            <Label htmlFor="sgst">SGST Amount</Label>
            <div className="relative">
              <Input
                type="text"
                id="sgst"
                name="sgst"
                value={formData.sgst}
                onChange={handleInputChange}
                className="dark:bg-dark-900 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter SGST"
                disabled={insertLoading}
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                /-
              </span>
            </div>
            {errors.sgst && <p className="text-red-500 text-sm mt-1">{errors.sgst}</p>}
          </div>

          <div className="min-h-[80px]">
            <Label htmlFor="gst_percentage">GST Percentage</Label>
            <div className="relative">
              <Input
                type="text"
                id="gst_percentage"
                name="gst_percentage"
                value={formData.gst_percentage}
                onChange={handleInputChange}
                className="dark:bg-dark-900 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter GST Percentage"
                disabled={insertLoading}
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                %
              </span>
            </div>
            {errors.gst_percentage && (
              <p className="text-red-500 text-sm mt-1">{errors.gst_percentage}</p>
            )}
          </div>

          <div className="min-h-[80px]">
            <Label htmlFor="sgst_percentage">SGST Percentage</Label>
            <div className="relative">
              <Input
                type="text"
                id="sgst_percentage"
                name="sgst_percentage"
                value={formData.sgst_percentage || ""}
                onChange={handleInputChange}
                className="dark:bg-dark-900 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter SGST Percentage"
                disabled={insertLoading}
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                %
              </span>
            </div>
            {errors.sgst_percentage && (
              <p className="text-red-500 text-sm mt-1">{errors.sgst_percentage}</p>
            )}
          </div>

          <div className="min-h-[80px]">
            <Label htmlFor="gst_number">GST Number</Label>
            <Input
              type="text"
              id="gst_number"
              name="gst_number"
              value={formData.gst_number}
              onChange={handleInputChange}
              className="dark:bg-dark-900 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter GST Number"
              disabled={insertLoading}
            />
            {errors.gst_number && (
              <p className="text-red-500 text-sm mt-1">{errors.gst_number}</p>
            )}
          </div>

          <div className="min-h-[80px]">
            <Label htmlFor="rera_number">RERA Number</Label>
            <Input
              type="text"
              id="rera_number"
              name="rera_number"
              value={formData.rera_number}
              onChange={handleInputChange}
              className="dark:bg-dark-900 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter RERA Number"
              disabled={insertLoading}
            />
            {errors.rera_number && (
              <p className="text-red-500 text-sm mt-1">{errors.rera_number}</p>
            )}
          </div>

          <div className="min-h-[80px]">
            <Label htmlFor="duration_days">Duration (Days)</Label>
            <Input
              type="text"
              id="duration_days"
              name="duration_days"
              value={formData.duration_days}
              onChange={handleInputChange}
              className="dark:bg-dark-900 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter duration"
              disabled={insertLoading}
            />
            {errors.duration_days && (
              <p className="text-red-500 text-sm mt-1">{errors.duration_days}</p>
            )}
          </div>

          <div className="min-h-[80px]">
            <Label htmlFor="button_text">Button Text</Label>
            <Input
              type="text"
              id="button_text"
              name="button_text"
              value={formData.button_text}
              onChange={handleInputChange}
              className="dark:bg-dark-900 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter button text"
              disabled={insertLoading}
            />
            {errors.button_text && (
              <p className="text-red-500 text-sm mt-1">{errors.button_text}</p>
            )}
          </div>

          <div className="border border-dashed border-gray-300 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Rules</h3>
              <button
                type="button"
                onClick={handleAddRule}
                className="px-4 py-2 bg-[#1D3A76] text-white rounded-lg hover:bg-blue-700 text-sm transition-colors duration-200"
                disabled={insertLoading}
              >
                Add Rule
              </button>
            </div>
            {formData.rules.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                No rules added. Click "Add Rule" to create one.
              </p>
            )}
            {formData.rules.map((rule, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  checked={rule.included}
                  onChange={(e) => handleRuleChange(index, "included", e.target.checked)}
                  className="h-4 w-4 text-[#1D3A76] focus:ring-blue-500 border-gray-300 rounded"
                  disabled={insertLoading}
                />
                <input
                  type="text"
                  value={rule.name}
                  onChange={(e) => handleRuleChange(index, "name", e.target.value)}
                  className="block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter rule name"
                  disabled={insertLoading}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveRule(index)}
                  className="p-2 text-red-500 font-bold"
                  aria-label={`Remove rule ${rule.name}`}
                  disabled={insertLoading}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="w-[30%] px-4 py-2 text-gray-800 bg-gray-300 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              disabled={isSubmitting || insertLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-[30%] px-4 py-2 text-white bg-[#1D3A76] rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
              disabled={isSubmitting || insertLoading}
            >
              {isSubmitting || insertLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default CustomPackages;
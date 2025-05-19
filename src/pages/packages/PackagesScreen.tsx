import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import ComponentCard from "../../components/common/ComponentCard";
import { getCities } from "../../store/slices/propertyDetails";
import { AppDispatch } from "../../store/store";
import { clearPackages, fetchAllPackages } from "../../store/slices/packagesSlice";
import { useParams } from "react-router";
import { fetchUsersByType } from "../../store/slices/users";

// Define the type for a rule
interface Rule {
  name: string;
  included: boolean;
}

interface Package {
  id: string;
  name: string;
  duration_days: number;
  price: string;
  rules: Rule[];
  buttonText: string;
  isPopular?: boolean;
  packageFor?: string; // "All" or "Custom"
  customNumber?: string | null; 
}

interface PackageFilters {
  package_for?: string;
  city?: string;
}

interface Option {
  value: string;
  text: string;
}

interface User {
  id: number;
  user_type: number;
  name: string | null; // Allow null
  mobile: string | null; // Allow null
}

interface RootState {
  property: {
    cities: { value: string; label: string }[];
  };
  package: {
    packages: Package[];
    loading: boolean;
    error: string | null;
  };
  users: {
    users: User[];
    loading?: boolean;
    error?: string | null;
  };
}

interface EditPackageProps {
  pkg: Package;
  onSave: (updatedPackage: Package) => void;
  onCancel: () => void;
  users: User[];
}

const EditPackage: React.FC<EditPackageProps> = ({ pkg, onSave, onCancel, users }) => {
  const [formData, setFormData] = useState<Package>({
    ...pkg,
    packageFor: pkg.packageFor || "All",
    customNumber: pkg.customNumber || null,
  });
  const [userSearchTerm, setUserSearchTerm] = useState<string>("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false);

  // Prefill userSearchTerm if customNumber corresponds to a user
  useEffect(() => {
    if (formData.customNumber && formData.packageFor === "Custom") {
      const selectedUser = users.find((user) => user.id.toString() === formData.customNumber);
      if (selectedUser) {
        const displayText = [selectedUser.name, selectedUser.mobile].filter(Boolean).join(" (") + (selectedUser.mobile ? ")" : "");
        setUserSearchTerm(displayText || "");
      }
    } else {
      setUserSearchTerm("");
    }
  }, [formData.customNumber, formData.packageFor, users]);

  // Filter users with null checks
  const filteredUserOptions = users.filter((user) =>
    (user.name?.toLowerCase()?.includes(userSearchTerm.toLowerCase() || "") ||
      user.mobile?.toLowerCase()?.includes(userSearchTerm.toLowerCase() || "")) ??
    false
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const cleanValue = name === "price" ? value.replace("/-", "").trim() : value;
    setFormData((prev) => ({ ...prev, [name]: cleanValue }));
  };

  const handlePackageForChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const packageFor = e.target.value;
    setFormData((prev) => ({
      ...prev,
      packageFor,
      customNumber: packageFor === "All" ? null : prev.customNumber,
    }));
    setUserSearchTerm("");
    setIsUserDropdownOpen(false);
  };

  const handleUserSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserSearchTerm(e.target.value);
    setIsUserDropdownOpen(true);
  };

  const handleUserSelect = (user: User) => {
    setFormData((prev) => ({ ...prev, customNumber: user.id.toString() }));
    const displayText = [user.name, user.mobile].filter(Boolean).join(" (") + (user.mobile ? ")" : "");
    setUserSearchTerm(displayText || "");
    setIsUserDropdownOpen(false);
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

  const handleRuleChange = (
    index: number,
    field: "name" | "included",
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.map((rule, i) =>
        i === index ? { ...rule, [field]: value } : rule
      ),
    }));
  };

  const handleAddRule = () => {
    setFormData((prev) => ({
      ...prev,
      rules: [...prev.rules, { name: "New Rule", included: false }],
    }));
  };

  const handleRemoveRule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  const handleIsPopularChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, isPopular: e.target.checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-none flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Edit Package: {pkg.name}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Package For
            </label>
            <select
              name="packageFor"
              value={formData.packageFor}
              onChange={handlePackageForChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
            >
              <option value="All">All</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
          {formData.packageFor === "Custom" && (
            <div className="mb-6 w-full user-dropdown">
              <label
                htmlFor="user-search"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Select User
              </label>
              <div className="relative">
                <input
                  id="user-search"
                  type="text"
                  value={userSearchTerm}
                  onChange={handleUserSearchChange}
                  onClick={toggleUserDropdown}
                  placeholder="Search for a user..."
                  className="block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
                />
                <button
                  type="button"
                  onClick={toggleUserDropdown}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
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
                    {filteredUserOptions.length > 0 ? (
                      filteredUserOptions.map((user) => (
                        <li
                          key={user.id}
                          onClick={() => handleUserSelect(user)}
                          className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        >
                          {[user.name, user.mobile].filter(Boolean).join(" (") + (user.mobile ? ")" : "") || "Unknown User"}
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
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Package Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Price
            </label>
            <div className="relative">
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                /-
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Button Text
            </label>
            <input
              type="text"
              name="buttonText"
              value={formData.buttonText}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isPopular || false}
              onChange={handleIsPopularChange}
              className="h-4 w-4 text-[#1D3A76] focus:ring-[#1D3A76] border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Mark as Popular
            </label>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Rules
              </h3>
              <button
                type="button"
                onClick={handleAddRule}
                className="px-3 py-1 bg-[#1D3A76] text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Add Rule
              </button>
            </div>
            {formData.rules.map((rule, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  checked={rule.included}
                  onChange={(e) =>
                    handleRuleChange(index, "included", e.target.checked)
                  }
                  className="h-4 w-4 text-[#1D3A76] focus:ring-[#1D3A76] border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={rule.name}
                  onChange={(e) =>
                    handleRuleChange(index, "name", e.target.value)
                  }
                  className="block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveRule(index)}
                  className="text-red-500 hover:text-red-700 text-lg font-bold"
                  aria-label={`Remove rule ${rule.name}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#1D3A76] text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main PackagesScreen Component
const PackagesScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const { status } = useParams<{ status: string }>();
  const [selectedCity, setSelectedCity] = useState<string>("Hyderabad");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const { cities } = useSelector((state: RootState) => state.property);
  const { packages, loading, error } = useSelector((state: RootState) => state.package);
  const { users } = useSelector((state: RootState) => state.users);

  const hasSetInitialCity = useRef(false);

  const userTypeIdMap: { [key: string]: number } = {
    User: 2,
    Builder: 3,
    Agent: 4,
    Owner: 5,
    "Channel Partner": 6,
  };

  const cityOptions: Option[] =
    cities?.map((city: any) => ({
      value: city.value,
      text: city.label,
    })) || [];

  useEffect(() => {
    if (cities.length > 0 && !hasSetInitialCity.current) {
      const hyderabadCity = cities.find((city) => city.value === "Hyderabad");
      if (hyderabadCity) {
        setSearchTerm(hyderabadCity.label);
      } else {
        setSearchTerm("Hyderabad");
      }
      hasSetInitialCity.current = true;
    }
  }, [cities]);

  const filteredCityOptions = cityOptions.filter((option) =>
    option.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (status && selectedCity) {
      let normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);
      if (status === "channel_partner") {
        normalizedStatus = "Channel Partner";
      }

      const userTypeId = userTypeIdMap[normalizedStatus];
      console.log(userTypeId);
      console.log({ package_for: status, city: selectedCity });

      if (userTypeId) {
        const packagesFilters: PackageFilters = {
          package_for: status,
          city: selectedCity,
        };
        dispatch(fetchAllPackages(packagesFilters));
        dispatch(fetchUsersByType({ user_type: userTypeId }));
      } else {
        console.warn(`Invalid user type: ${status}`);
      }
    }
    return () => {
      dispatch(clearPackages());
    };
  }, [dispatch, status, selectedCity]);

  useEffect(() => {
    dispatch(getCities());
  }, [dispatch]);

  const mappedPackages: Package[] = packages.map((pkg) => ({
    ...pkg,
    buttonText: pkg.name === "Free Listing" ? "Subscribed" : "Upgrade Now",
    isPopular: pkg.name === "Prime",
  }));

  const formatPrice = (price: string): string => {
    const priceNumber = parseFloat(price);
    if (priceNumber === 0) {
      return "Free";
    }
    return `${Math.floor(priceNumber)} /-`;
  };

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage(pkg);
  };

  const handleSavePackage = (updatedPackage: Package) => {
    console.log("Updated package:", updatedPackage);
    setEditingPackage(null);
  };

  const handleCancelEdit = () => {
    setEditingPackage(null);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleCitySelect = (city: Option) => {
    setSelectedCity(city.value);
    setSearchTerm(city.text);
    setIsDropdownOpen(false);
    console.log("Selected city:", city.value);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".city-dropdown")) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
      <div
        className={`transition-all duration-300 ${editingPackage ? "blur-sm" : ""}`}
      >
        <div className="mb-6 max-w-xs city-dropdown">
          <label
            htmlFor="city-search"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Select City
          </label>
          <div className="relative">
            <input
              id="city-search"
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onClick={toggleDropdown}
              placeholder="Search for a city..."
              className="block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
            />
            <button
              type="button"
              onClick={toggleDropdown}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
            >
              <svg
                className={`w-4 h-4 transform ${isDropdownOpen ? "rotate-180" : ""}`}
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
            {isDropdownOpen && (
              <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
                {filteredCityOptions.length > 0 ? (
                  filteredCityOptions.map((option) => (
                    <li
                      key={option.value}
                      onClick={() => handleCitySelect(option)}
                      className="px-4 py-2 powered by www.html-code-generator.com text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      {option.text}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    No cities found
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

        <ComponentCard title={`${status} Packages`}>
          {loading && <p>Loading packages...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {!loading && !error && mappedPackages.length === 0 && (
            <p>No packages available.</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mappedPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative p-6 rounded-lg shadow-lg border ${
                  pkg.isPopular
                    ? "bg-[#1D3A76] text-white border-[#1D3A76]"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}
              >
                {pkg.isPopular && (
                  <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1D3A76] text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Popular
                  </span>
                )}
                <div className="text-center mb-4">
                  <h3
                    className={`text-lg font-bold ${
                      pkg.isPopular ? "text-white" : "text-gray-800 dark:text-white"
                    }`}
                  >
                    {pkg.name}
                  </h3>
                </div>
                <div className="text-center mb-2">
                  <p
                    className={`text-sm ${
                      pkg.isPopular ? "text-white" : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {pkg.duration_days} Days
                  </p>
                </div>
                <div className="text-center mb-4">
                  <p
                    className={`text-2xl font-semibold ${
                      pkg.isPopular ? "text-white" : "text-gray-800 dark:text-white"
                    }`}
                  >
                    {formatPrice(pkg.price)}
                  </p>
                </div>
                <ul className="space-y-2 mb-6">
                  {pkg.rules.map((rule, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      {rule.included ? (
                        <svg
                          className="w-5 h-5 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                      <span
                        className={`text-sm ${
                          pkg.isPopular ? "text-white" : "text-gray-800 dark:text-white"
                        }`}
                      >
                        {rule.name}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleEditPackage(pkg)}
                  className="w-full py-2 mb-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Edit Package
                </button>
              </div>
            ))}
          </div>
        </ComponentCard>
      </div>
      {editingPackage && (
        <EditPackage
          pkg={editingPackage}
          onSave={handleSavePackage}
          onCancel={handleCancelEdit}
          users={users}
        />
      )}
    </div>
  );
};

export default PackagesScreen;
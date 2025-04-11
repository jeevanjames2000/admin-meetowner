import React, { useState, useEffect, ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import ComponentCard from "../../components/common/ComponentCard";
import { getCities } from "../../store/slices/propertyDetails";
import { AppDispatch } from "../../store/store";

// Define the type for a rule
interface Rule {
  name: string;
  included: boolean;
}

// Define the type for a package
interface Package {
  id: string;
  name: string;
  duration: string;
  price: string;
  rules: Rule[];
  buttonText: string;
  isPopular?: boolean;
}

// Define the type for an option (for the dropdown)
interface Option {
  value: string;
  text: string;
}

// Define the type for the Redux state (simplified)
interface RootState {
  property: {
    cities: { value: string; label: string }[];
  };
}

// Initial package data
const initialPackages: Package[] = [
  {
    id: "1",
    name: "Free Listing",
    duration: "30 Days",
    price: "Free",
    rules: [
      { name: "Number of Listings 5", included: true },
      { name: "Response Rate 2X More", included: true },
      { name: "Position On Search Low", included: true },
      { name: "Buyers Visibility Limited", included: true },
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
    ],
    buttonText: "Subscribed",
  },
  {
    id: "2",
    name: "Basic",
    duration: "30 Days",
    price: "6999 /-",
    rules: [
      { name: "Number of Listings 15", included: true },
      { name: "Response Rate 3X More", included: true },
      { name: "Position On Search Medium", included: true },
      { name: "Buyers Visibility Limited", included: true },
      { name: "Verified Tag", included: false },
      { name: "Visibility on Best Details", included: false },
      { name: "Visibility on Latest Details", included: false },
      { name: "Land Page AD", included: false },
      { name: "Land Page Banner", included: false },
      { name: "Listings Page Small ADS", included: false },
      { name: "Dedicated Agent Support", included: false },
      { name: "Creatives", included: true },
      { name: "Listing Support", included: true },
      { name: "Meta ADS", included: false },
      { name: "Prime Promotion", included: false },
      { name: "CRM", included: false },
    ],
    buttonText: "Upgrade Now",
  },
  {
    id: "3",
    name: "Prime",
    duration: "90 Days",
    price: "24999 /-",
    rules: [
      { name: "Number of Listings 50", included: true },
      { name: "Response Rate 5X More", included: true },
      { name: "Position On Search High", included: true },
      { name: "Buyers Visibility Unlimited", included: true },
      { name: "Verified Tag", included: true },
      { name: "Visibility on Best Details", included: true },
      { name: "Visibility on Latest Details", included: true },
      { name: "Land Page AD", included: true },
      { name: "Land Page Banner", included: true },
      { name: "Listings Page Small ADS", included: true },
      { name: "Dedicated Agent Support", included: false },
      { name: "Creatives", included: false },
      { name: "Listing Support", included: false },
      { name: "Meta ADS", included: false },
      { name: "Prime Promotion", included: false },
      { name: "CRM", included: true },
    ],
    buttonText: "Upgrade Now",
    isPopular: true,
  },
  {
    id: "4",
    name: "Prime Plus",
    duration: "180 Days",
    price: "49999 /-",
    rules: [
      { name: "Number of Listings 60", included: true },
      { name: "Response Rate 5X More", included: true },
      { name: "Position On Search High", included: true },
      { name: "Buyers Visibility Unlimited", included: true },
      { name: "Verified Tag", included: true },
      { name: "Visibility on Best Details", included: true },
      { name: "Visibility on Latest Details", included: true },
      { name: "Land Page AD", included: true },
      { name: "Land Page Banner", included: true },
      { name: "Listings Page Small ADS", included: true },
      { name: "Dedicated Agent Support", included: true },
      { name: "Creatives", included: true },
      { name: "Listing Support", included: true },
      { name: "Meta ADS", included: true },
      { name: "Prime Promotion", included: true },
      { name: "CRM", included: true },
    ],
    buttonText: "Upgrade Now",
  },
];

// EditPackage Component
interface EditPackageProps {
  pkg: Package;
  onSave: (updatedPackage: Package) => void;
  onCancel: () => void;
}

const EditPackage: React.FC<EditPackageProps> = ({ pkg, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Package>({ ...pkg });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
          {/* Package Name */}
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

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Duration
            </label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Price
            </label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
            />
          </div>

          {/* Button Text */}
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

          {/* Is Popular */}
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

          {/* Rules */}
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

          {/* Buttons */}
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

// Main BuilderPackages Component
const BuilderPackages: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [packages, setPackages] = useState<Package[]>(initialPackages);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>(""); // State for selected city
  const [searchTerm, setSearchTerm] = useState<string>(""); // State for search term
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false); // State for dropdown visibility

  // Fetch cities from Redux store
  const { cities } = useSelector((state: RootState) => state.property);

  // Transform cities into options for the dropdown
  const cityOptions: Option[] =
    cities?.map((city: any) => ({
      value: city.value,
      text: city.label,
    })) || [];

  // Filter cities based on search term
  const filteredCityOptions = cityOptions.filter((option) =>
    option.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    dispatch(getCities());
  }, [dispatch]);

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage(pkg);
  };

  const handleSavePackage = (updatedPackage: Package) => {
    setPackages((prev) =>
      prev.map((pkg) =>
        pkg.id === updatedPackage.id ? updatedPackage : pkg
      )
    );
    setEditingPackage(null);
  };

  const handleCancelEdit = () => {
    setEditingPackage(null);
  };

  // Handle search input change
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true); // Open dropdown when typing
  };

  // Handle city selection
  const handleCitySelect = (city: Option) => {
    setSelectedCity(city.value);
    setSearchTerm(city.text); // Display selected city in input
    setIsDropdownOpen(false); // Close dropdown after selection
    console.log("Selected city:", city.value);
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside
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
      {/* Main content with conditional blur */}
      <div
        className={`transition-all duration-300 ${
          editingPackage ? "blur-sm" : ""
        }`}
      >
        {/* Searchable City Dropdown above ComponentCard */}
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
            {/* Dropdown Arrow */}
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
            {/* Dropdown Options */}
            {isDropdownOpen && (
              <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
                {filteredCityOptions.length > 0 ? (
                  filteredCityOptions.map((option) => (
                    <li
                      key={option.value}
                      onClick={() => handleCitySelect(option)}
                      className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
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

        <ComponentCard title="Builder Packages">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative p-6 rounded-lg shadow-lg border ${
                  pkg.isPopular
                    ? "bg-[#1D3A76] text-white border-[#1D3A76]"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}
              >
                {/* Popular Badge */}
                {pkg.isPopular && (
                  <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1D3A76] text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Popular
                  </span>
                )}

                {/* Package Name */}
                <div className="text-center mb-4">
                  <h3
                    className={`text-lg font-bold ${
                      pkg.isPopular
                        ? "text-white"
                        : "text-gray-800 dark:text-white"
                    }`}
                  >
                    {pkg.name}
                  </h3>
                </div>

                {/* Duration */}
                <div className="text-center mb-2">
                  <p
                    className={`text-sm ${
                      pkg.isPopular
                        ? "text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {pkg.duration}
                  </p>
                </div>

                {/* Price */}
                <div className="text-center mb-4">
                  <p
                    className={`text-2xl font-semibold ${
                      pkg.isPopular
                        ? "text-white"
                        : "text-gray-800 dark:text-white"
                    }`}
                  >
                    {pkg.price}
                  </p>
                </div>

                {/* Rules */}
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
                          pkg.isPopular
                            ? "text-white"
                            : "text-gray-800 dark:text-white"
                        }`}
                      >
                        {rule.name}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Edit Button */}
                <button
                  onClick={() => handleEditPackage(pkg)}
                  className="w-full py-2 mb-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Edit Package
                </button>

                {/* Action Button */}
                <button
                  className={`w-full py-2 rounded-lg text-center font-semibold ${
                    pkg.buttonText === "Subscribed"
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-[#1D3A76] text-white hover:bg-blue-700"
                  }`}
                  disabled={pkg.buttonText === "Subscribed"}
                >
                  {pkg.buttonText}
                </button>
              </div>
            ))}
          </div>
        </ComponentCard>
      </div>

      {/* Edit Package Modal */}
      {editingPackage && (
        <EditPackage
          pkg={editingPackage}
          onSave={handleSavePackage}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default BuilderPackages;
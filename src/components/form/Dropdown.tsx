import React, { useState, useEffect } from "react";
import Label from "./Label"; // Adjust the import path based on your project structure

interface Option {
  value: string;
  text: string;
}

interface DropdownProps {
  id: string;
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string, text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export default function Dropdown({
  id,
  label,
  options = [], // Default to empty array to prevent undefined
  value,
  onChange,
  placeholder = "Search...",
  disabled = false,
  error,
}: DropdownProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Update search term when value or options change
  useEffect(() => {
    const selectedOption = options.find((option) => option.value === value);
    setSearchTerm(selectedOption?.text || "");
  }, [value, options]);

  // Filter options based on search term with defensive checks
  const filteredOptions = options.filter((option) => {
    if (!option || !option.text || typeof option.text !== "string") {
      return false; // Skip invalid options
    }
    return option.text
      .toLowerCase()
      .includes(searchTerm ? searchTerm.toLowerCase() : "");
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
  };

  // Handle option selection
  const handleSelect = (option: Option) => {
    onChange(option.value, option.text);
    setSearchTerm(option.text);
    setIsDropdownOpen(false);
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    if (!disabled) {
      setIsDropdownOpen((prev) => !prev);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`#${id}-dropdown`)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [id]);

  return (
    <div className="mb-6 max-w-2xl" id={`${id}-dropdown`}>
      <Label htmlFor={`${id}-search`}>{label}</Label>
      <div className="relative">
        <input
          id={`${id}-search`}
          type="text"
          value={searchTerm || ""} // Ensure searchTerm is always a string
          onChange={handleSearchChange}
          onClick={toggleDropdown}
          placeholder={placeholder}
          disabled={disabled}
          className={`block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76] ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
        />
        <button
          type="button"
          onClick={toggleDropdown}
          disabled={disabled}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
        >
          <svg
            className={`w-4 h-4 transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
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
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  {option.text}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                No {label.toLowerCase()} found
              </li>
            )}
          </ul>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

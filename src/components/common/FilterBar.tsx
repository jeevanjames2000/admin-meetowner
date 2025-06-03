

import React, { useEffect, useState, useMemo, useRef } from "react";
import Select from "../form/Select";
import DatePicker from "../form/date-picker";
import Button from "../ui/button/Button";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCities, fetchAllStates } from "../../store/slices/places";
import { RootState, AppDispatch } from "../../store/store";

interface SelectOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  showUserTypeFilter?: boolean;
  showDateFilters?: boolean;
  showStateFilter?: boolean;
  showCityFilter?: boolean;
  userFilterOptions?: SelectOption[];
  onUserTypeChange?: (value: string | null) => void;
  onStartDateChange?: (date: string | null) => void;
  onEndDateChange?: (date: string | null) => void;
  onStateChange?: (state: string) => void;
  onCityChange?: (city: string) => void;
  onClearFilters?: () => void;
  selectedUserType?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  stateValue?: string;
  cityValue?: string;
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  showUserTypeFilter = false,
  showDateFilters = false,
  showStateFilter = false,
  showCityFilter = false,
  userFilterOptions = [],
  onUserTypeChange,
  onStartDateChange,
  onEndDateChange,
  onStateChange,
  onCityChange,
  onClearFilters,
  selectedUserType,
  startDate,
  endDate,
  stateValue = "",
  cityValue = "",
  className = "",
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { states, statesLoading, statesError, cities, citiesLoading, citiesError } =
    useSelector((state: RootState) => state.places);

  const [stateSearchTerm, setStateSearchTerm] = useState<string>(stateValue);
  const [citySearchTerm, setCitySearchTerm] = useState<string>(cityValue);
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState<boolean>(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch states on mount if state filter is enabled
  useEffect(() => {
    if (showStateFilter || showCityFilter) {
      dispatch(fetchAllStates());
    }
  }, [dispatch, showStateFilter, showCityFilter]);

  // Fetch cities when state changes
  useEffect(() => {
    if (showCityFilter && stateSearchTerm) {
      dispatch(fetchAllCities({ state: stateSearchTerm }));
    } else if (showCityFilter) {
      dispatch(fetchAllCities());
    }
  }, [dispatch, stateSearchTerm, showCityFilter]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutsideDropdowns = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".state-dropdown")) {
        setIsStateDropdownOpen(false);
      }
      if (!target.closest(".city-dropdown")) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideDropdowns);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideDropdowns);
    };
  }, []);

  // Filtered states and cities
  const filteredStates = useMemo(
    () =>
      states
        .map((state) => state.name)
        .filter((name) => name.toLowerCase().includes(stateSearchTerm.toLowerCase())),
    [stateSearchTerm, states]
  );

  const filteredCities = useMemo(
    () =>
      cities
        .filter(
          (city) =>
            (!stateSearchTerm || city.state === stateSearchTerm) &&
            city.name.toLowerCase().includes(citySearchTerm.toLowerCase())
        )
        .map((city) => city.name),
    [citySearchTerm, cities, stateSearchTerm]
  );

  const handleStartDateChange = (selectedDates: Date[]) => {
    const dateObj = selectedDates[0];
    let date = "";
    if (dateObj) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      date = `${year}-${month}-${day}`;
    }
    onStartDateChange?.(date || null);
  };

  const handleEndDateChange = (selectedDates: Date[]) => {
    const dateObj = selectedDates[0];
    let date = "";
    if (dateObj) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      date = `${year}-${month}-${day}`;
      if (startDate && date < startDate) {
        alert("End date cannot be before start date");
        return;
      }
    }
    onEndDateChange?.(date || null);
  };

  const handleClearFilters = () => {
    setStateSearchTerm("");
    setCitySearchTerm("");
    setIsStateDropdownOpen(false);
    setIsCityDropdownOpen(false);
    onClearFilters?.();
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-3 py-2 w-full ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        {showUserTypeFilter && userFilterOptions.length > 0 && (
          <div className="w-full sm:w-43">
            <Select
              options={userFilterOptions}
              placeholder="Select User Type"
              onChange={(value: string) => onUserTypeChange?.(value || null)}
              value={selectedUserType || ""}
              className="dark:bg-dark-900"
            />
          </div>
        )}
        {showDateFilters && (
          <>
            <DatePicker
              id="startDate"
              placeholder="Select start date"
              onChange={handleStartDateChange}
              defaultDate={startDate ? new Date(startDate) : undefined}
            />
            <DatePicker
              id="endDate"
              placeholder="Select end date"
              onChange={handleEndDateChange}
              defaultDate={endDate ? new Date(endDate) : undefined}
            />
          </>
        )}
        {showStateFilter && (
          <div className="max-w-xs state-dropdown">
            <div className="relative">
              <input
                id="state-search"
                type="text"
                name="state"
                value={stateSearchTerm}
                onChange={(e) => {
                  setStateSearchTerm(e.target.value);
                  setIsStateDropdownOpen(true);
                  setCitySearchTerm("");
                  onStateChange?.(e.target.value);
                  onCityChange?.("");
                }}
                onClick={() => setIsStateDropdownOpen(true)}
                onFocus={() => setIsStateDropdownOpen(true)}
                placeholder="Search for a state..."
                className="block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
                disabled={statesLoading}
              />
              <button
                type="button"
                onClick={() => setIsStateDropdownOpen((prev) => !prev)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                disabled={statesLoading}
              >
                <svg
                  className={`w-4 h-4 transform ${isStateDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isStateDropdownOpen && filteredStates.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
                  {filteredStates.map((state) => (
                    <li
                      key={state}
                      onClick={() => {
                        setStateSearchTerm(state);
                        setCitySearchTerm("");
                        setIsStateDropdownOpen(false);
                        onStateChange?.(state);
                        onCityChange?.("");
                      }}
                      className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      {state}
                    </li>
                  ))}
                </ul>
              )}
              {statesError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{statesError}</p>
              )}
            </div>
          </div>
        )}
        {showCityFilter && (
          <div className="max-w-xs city-dropdown">
            <div className="relative">
              <input
                id="city-search"
                type="text"
                name="city"
                value={citySearchTerm}
                onChange={(e) => {
                  setCitySearchTerm(e.target.value);
                  setIsCityDropdownOpen(true);
                  onCityChange?.(e.target.value);
                }}
                onClick={() => setIsCityDropdownOpen(true)}
                onFocus={() => setIsCityDropdownOpen(true)}
                placeholder="Search for a city..."
                className="block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
                disabled={citiesLoading || !stateSearchTerm}
              />
              <button
                type="button"
                onClick={() => setIsCityDropdownOpen((prev) => !prev)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                disabled={citiesLoading || !stateSearchTerm}
              >
                <svg
                  className={`w-4 h-4 transform ${isCityDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isCityDropdownOpen && filteredCities.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
                  {filteredCities.map((city) => (
                    <li
                      key={city}
                      onClick={() => {
                        setCitySearchTerm(city);
                        setIsCityDropdownOpen(false);
                        onCityChange?.(city);
                      }}
                      className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      {city}
                    </li>
                  ))}
                </ul>
              )}
              {citiesError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{citiesError}</p>
              )}
            </div>
          </div>
        )}
        {(showUserTypeFilter || showDateFilters || showStateFilter || showCityFilter) && (
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="px-3 py-1 w-full sm:w-auto"
          >
            Clear 
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
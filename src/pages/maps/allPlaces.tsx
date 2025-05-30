import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { MoreVertical, X } from "lucide-react";
import Button from "../../components/ui/button/Button";
import { fetchAllPlaces, deletePlace, editPlace, fetchAllStates, fetchAllCities } from "../../store/slices/places";
import { toast } from "react-hot-toast";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { AppDispatch, RootState } from "../../store/store";
import PageBreadcrumbList from "../../components/common/PageBreadCrumbLists";


interface Place {
  id: number;
  state: string;
  city: string;
  locality: string;
  areas: string | null;
  status: string;
}

const AllPlaces: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    places = [],
    currentPage,
    perPage,
    totalPlaces,
    totalPages = 0,
    error,
    editLoading,
    editError,
    deleteLoading,
    states,
    statesLoading,
    statesError,
    cities,
    citiesLoading,
    citiesError,
  } = useSelector((state: RootState) => state.places);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [stateFilter, setStateFilter] = useState<string>("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState<boolean>(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState<boolean>(false);
  const [stateSearchTerm, setStateSearchTerm] = useState<string>("");
  const [citySearchTerm, setCitySearchTerm] = useState<string>("");
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [newState, setNewState] = useState<string>("");
  const [newCity, setNewCity] = useState<string>("");
  const [newLocality, setNewLocality] = useState<string>("");
  const [newStatus, setNewStatus] = useState<string>("inactive");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce function
  const debounce = <F extends (...args: any[]) => void>(func: F, wait: number) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<F>) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        func(...args);
      }, wait);
    };
  };

  // Debounced handlers for search, state, and city
  const handleDebouncedSearch = useCallback(
    debounce((query: string) => {
      setDebouncedSearchQuery(query);
    }, 1000),
    []
  );

  const handleDebouncedStateFilter = useCallback(
    debounce((value: string) => {
      setStateFilter(value);
    }, 500),
    []
  );

  const handleDebouncedCityFilter = useCallback(
    debounce((value: string) => {
      setCityFilter(value);
    }, 500),
    []
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    handleDebouncedSearch(query);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "state") {
      setStateSearchTerm(value);
      handleDebouncedStateFilter(value);
    } else if (name === "city") {
      setCitySearchTerm(value);
      handleDebouncedCityFilter(value);
    }
  };

  // Fetch states and cities on mount
  useEffect(() => {
    dispatch(fetchAllStates());
    dispatch(fetchAllCities());
  }, [dispatch]);

  useEffect(() => {
    if (stateFilter) {
      dispatch(fetchAllCities({ state: stateFilter }));
    } else {
      dispatch(fetchAllCities());
    }
  }, [dispatch, stateFilter]);


  // Memoized filter parameters
  const filterParams = useMemo(
    () => ({
      page: currentPage || 1,
      search: debouncedSearchQuery,
      state: stateFilter,
      city: cityFilter,
    }),
    [currentPage, debouncedSearchQuery, stateFilter, cityFilter]
  );

  // Fetch places with filters
  useEffect(() => {
    console.log("Fetching places with params:", filterParams); // Debug log
    dispatch(fetchAllPlaces(filterParams));
  }, [dispatch, filterParams]);

  // Handle click outside for action menu
  useEffect(() => {
    const handleClickOutsideMenu = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideMenu);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMenu);
    };
  }, []);

  // Handle click outside for state and city dropdowns
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

  // Filter states and cities for dropdowns
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
        .filter((city) => 
          (!stateFilter || city.state === stateFilter) &&
          city.name.toLowerCase().includes(citySearchTerm.toLowerCase())
        )
        .map((city) => city.name),
    [citySearchTerm, cities, stateFilter]
  );

  const handleSelectSuggestion = (field: "state" | "city", value: string) => {
    if (field === "state") {
      setStateFilter(value);
      setStateSearchTerm(value);
      setIsStateDropdownOpen(false);
      setCityFilter(""); // Reset city when state changes
      setCitySearchTerm("");
    } else if (field === "city") {
      setCityFilter(value);
      setCitySearchTerm(value);
      setIsCityDropdownOpen(false);
    }
  };

  const toggleStateDropdown = () => {
    setIsStateDropdownOpen((prev) => !prev);
  };

  const toggleCityDropdown = () => {
    setIsCityDropdownOpen((prev) => !prev);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setStateFilter("");
    setCityFilter("");
    setStateSearchTerm("");
    setCitySearchTerm("");
    setIsStateDropdownOpen(false);
    setIsCityDropdownOpen(false);
    dispatch(fetchAllPlaces({ page: 1, search: "", state: "", city: "" }));
    dispatch(fetchAllCities());
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      dispatch(
        fetchAllPlaces({
          ...filterParams,
          page,
        })
      );
      setActiveMenu(null);
    }
  };

  const getPaginationItems = () => {
    const pages: (number | string)[] = [];
    const totalVisiblePages = 5;

    if (totalPages <= totalVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(2, currentPage - 2);
      let end = Math.min(totalPages - 1, currentPage + 2);

      if (currentPage <= 3) {
        start = 2;
        end = 5;
      }

      if (currentPage >= totalPages - 2) {
        start = totalPages - 4;
        end = totalPages - 1;
      }

      pages.push(1);
      if (start > 2) pages.push("...");

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) pages.push("...");
      if (totalPages > 1) pages.push(totalPages);
    }

    return pages;
  };


  const toggleMenu = (id: number) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  const handleEdit = (id: number) => {
    const place = places.find((p) => p.id === id);
    if (place) {
      setSelectedPlace(place);
      setNewState(place.state);
      setNewCity(place.city);
      setNewLocality(place.locality);
      setNewStatus(place.status || "inactive");
      setEditModalOpen(true);
    }
    setActiveMenu(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlace) return;
    const payload = {
      oldState: selectedPlace.state,
      oldCity: selectedPlace.city,
      oldLocality: selectedPlace.locality,
      newState,
      newCity,
      newLocality,
      status: newStatus,
    };
    try {
      await dispatch(editPlace(payload)).unwrap();
      toast.success("Place updated successfully!");
      setEditModalOpen(false);
      dispatch(fetchAllPlaces(filterParams));
    } catch (err) {
      toast.error((err as any)?.message || "Failed to update place");
    }
  };

  const handleDelete = async (id: number) => {
    const place = places.find((p) => p.id === id);
    if (!place) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${place.state}, ${place.city}, ${place.locality}?`
    );
    if (!confirmDelete) return;
    try {
      const resultAction = await dispatch(
        deletePlace({
          state: place.state,
          city: place.city,
          locality: place.locality,
        })
      );
      if (deletePlace.fulfilled.match(resultAction)) {
        toast.success("Place deleted successfully!");
        dispatch(fetchAllPlaces(filterParams));
      } else {
        const errorMessage =
          (resultAction.payload as any)?.error ||
          (resultAction.payload as any)?.message ||
          "Failed to delete place";
        toast.error(errorMessage);
      }
    } catch (err) {
      toast.error("Failed to delete place");
    }
    setActiveMenu(null);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">No places found</h2>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <PageMeta title="Meet owner All Places" />
      <PageBreadcrumbList
        pageTitle="All Places"
        pagePlacHolder="Search by State, City, Locality"
        onFilter={handleSearch}
        
      />
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="max-w-xs state-dropdown">
          
            <div className="relative">
              <input
                id="state-search"
                type="text"
                name="state"
                value={stateSearchTerm}
                onChange={handleInputChange}
                onClick={() => setIsStateDropdownOpen(true)}
                onFocus={() => setIsStateDropdownOpen(true)}
                placeholder="Search for a state..."
                className="block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
                disabled={statesLoading}
              />
              <button
                type="button"
                onClick={toggleStateDropdown}
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
                      onClick={() => handleSelectSuggestion("state", state)}
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

          <div className="max-w-xs city-dropdown">
          
            <div className="relative">
              <input
                id="city-search"
                type="text"
                name="city"
                value={citySearchTerm}
                onChange={handleInputChange}
                onClick={() => setIsCityDropdownOpen(true)}
                onFocus={() => setIsCityDropdownOpen(true)}
                placeholder="Search for a city..."
                className="block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
                disabled={citiesLoading}
              />
              <button
                type="button"
                onClick={toggleCityDropdown}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                disabled={citiesLoading}
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
                      onClick={() => handleSelectSuggestion("city", city)}
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

          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="mt-6 sm:mt-0"
          >
            Clear Filters
          </Button>
        </div>

        <ComponentCard title="All Places">
          <div className="overflow-visible relative rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    {["Sl.No", "ID", "State", "City", "Locality", "Status", "Actions"].map((header) => (
                      <TableCell
                        key={header}
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {places.length > 0 ? (
                    places.map((place, index) => (
                      <TableRow key={place.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {(currentPage - 1) * perPage + index + 1}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {place.id}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {place.state}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {place.city}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {place.locality}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {place.status}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleMenu(place.id)}
                          >
                            <MoreVertical className="size-5 text-gray-500 dark:text-gray-400" />
                          </Button>
                          {activeMenu === place.id && (
                            <div
                              ref={dropdownRef}
                              className="absolute mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20"
                            >
                              <div className="py-2">
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => handleEdit(place.id)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => handleDelete(place.id)}
                                  disabled={deleteLoading}
                                >
                                  {deleteLoading ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                       
                        className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                      >
                        No Places Found!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          {totalPlaces > perPage && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 py-2 gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(currentPage - 1) * perPage + 1} to{" "}
                {Math.min(currentPage * perPage, totalPlaces)} of {totalPlaces} places
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                <Button
                  variant={currentPage === 1 ? "outline" : "primary"}
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {getPaginationItems().map((page, index) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-3 py-1 text-gray-500 dark:text-gray-400"
                    >
                      ...
                    </span>
                  ) : (
                    <Button
                      key={page}
                      variant={page === currentPage ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page as number)}
                      className={
                        page === currentPage ? "bg-[#1D3A76] text-white" : "text-gray-500"
                      }
                    >
                      {page}
                    </Button>
                  )
                )}
                <Button
                  variant={currentPage === totalPages ? "outline" : "primary"}
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </ComponentCard>
      </div>
      {editModalOpen && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Edit Place</h2>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="size-6" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  State
                </label>
                <input
                  type="text"
                  value={newState}
                  onChange={(e) => setNewState(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  City
                </label>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Locality
                </label>
                <input
                  type="text"
                  value={newLocality}
                  onChange={(e) => setNewLocality(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditModalOpen(false)}
                  disabled={editLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={editLoading}
                  className={editLoading ? "opacity-50 cursor-not-allowed" : ""}
                >
                  {editLoading ? "Saving..." : "Save"}
                </Button>
              </div>
              {editError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{editError}</p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPlaces;
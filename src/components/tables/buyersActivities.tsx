import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Button from "../ui/button/Button";
import ComponentCard from "../common/ComponentCard";
import PageBreadcrumbList from "../common/PageBreadCrumbLists";
import { formatDate } from "../../hooks/FormatDate";
import FilterBar from "../common/FilterBar";
import { AppDispatch, RootState } from "../../store/store";
import { fetchUserActivity } from "../../store/slices/user_activity";

const UserActivities: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { userId, name } = location.state || {};
  const { user, loading, error } = useSelector((state: RootState) => state.userActivity);
  const [filterValue, setFilterValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedActivityType, setSelectedActivityType] = useState<string>("All");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 10;

  // Activity type filter options
  const activityTypeOptions = [
    { value: "All", label: "All" },
    { value: "Contacted", label: "Contacted" },
    { value: "Searched", label: "Searched" },
    { value: "Liked", label: "Liked" },
    { value: "Property Viewed", label: "Property Viewed" },
  ];

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserActivity(Number(userId)));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    setCurrentPage(1); // Reset pagination when filters change
  }, [filterValue, startDate, endDate, selectedActivityType, selectedCity]);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle View action
  const handleView = (propertyId: string | null | undefined) => {
    if (!propertyId) {
      console.error("Property ID is missing");
      return;
    }
    try {
      const url = `https://meetowner.in/property?Id_${encodeURIComponent(propertyId)}`;
      window.open(url, "_blank"); // Open in new tab
    } catch (error) {
      console.error("Error navigating to property:", error);
    }
  };

  // Filter activities based on search input, date range, activity type, and city
  const filteredActivities = useMemo(
    () =>
      user?.userActivity?.filter((activity) => {
        const searchableFields = [
          activity.name || activity.userName || activity.fullname || "",
          activity.email || activity.userEmail || "",
          activity.mobile || activity.userMobile || "",
          activity.property_id || activity.unique_property_id || "",
          activity.property_name || "",
          activity.sub_type || "",
          activity.property_for || "",
          activity.city_id || "",
          activity.property_cost || "",
          formatDate(activity.searched_on_date! || activity.created_date!) || "",
        ];
        const matchesSearch = searchableFields
          .map((field: string) => field.toLowerCase())
          .some((field: string) => field.includes(filterValue.toLowerCase()));

        // Date range filter based on searched_on_date or created_date
        let matchesDate = true;
        if (startDate || endDate) {
          const activityDate = (activity.searched_on_date || activity.created_date)?.split("T")[0];
          if (!activityDate) {
            matchesDate = false;
          } else {
            try {
              matchesDate =
                (!startDate || activityDate >= startDate) &&
                (!endDate || activityDate <= endDate);
            } catch {
              matchesDate = false;
            }
          }
        }

        // Activity type filter
        const matchesActivityType =
          selectedActivityType === "All" || activity.activityType === selectedActivityType;

        // City filter
        const matchesCity = !selectedCity || activity.city_id === selectedCity;

        return matchesSearch && matchesDate && matchesActivityType && matchesCity;
      }) || [],
    [user?.userActivity, filterValue, startDate, endDate, selectedActivityType, selectedCity]
  );

  const totalItems = filteredActivities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

  const handleFilter = (value: string) => {
    setFilterValue(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilterValue("");
    setStartDate(null);
    setEndDate(null);
    setSelectedActivityType("All");
    setSelectedState("");
    setSelectedCity("");
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
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

  return (
    <div className="relative min-h-screen p-6">
      <PageBreadcrumbList
        pageTitle={`Activities for ${name || user?.name || "User"} (ID: ${userId || "N/A"})`}
        pagePlacHolder="Filter activities by name, email, mobile, property ID, type, or city"
        onFilter={handleFilter}
      />
      <div className="space-y-6">
        <FilterBar
          showDateFilters={true}
          showUserTypeFilter={true}
          showStateFilter={true}
          showCityFilter={true}
          userFilterOptions={activityTypeOptions}
          onUserTypeChange={(value) => setSelectedActivityType(value || "All")}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onStateChange={setSelectedState}
          onCityChange={setSelectedCity}
          onClearFilters={clearFilters}
          selectedUserType={selectedActivityType}
          startDate={startDate}
          endDate={endDate}
          stateValue={selectedState}
          cityValue={selectedCity}
        />

        {(startDate || endDate || filterValue || selectedActivityType !== "All" || selectedCity) && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Filters: Activity Type: {selectedActivityType} | Date: {startDate || "Any"} to {endDate || "Any"} | 
            State: {selectedState || "Any"} | City: {selectedCity || "Any"} | Search: {filterValue || "None"}
          </div>
        )}

        <ComponentCard title="User Activities">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-200 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Sl.No
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Activity Type
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Property ID
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Property Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      City
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Email
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Mobile
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 dark:divide-white/[0.05]">
                  {loading && (
                    <TableRow>
                      <TableCell
                      
                        className="px-5 py-4 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                      >
                        Loading...
                      </TableCell>
                    </TableRow>
                  )}
                  {error && (
                    <TableRow>
                      <TableCell
                     
                        className="px-5 py-4 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                      >
                        Error: {error}
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && !error && filteredActivities.length === 0 && (
                    <TableRow>
                      <TableCell
                       
                        className="px-5 py-4 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                      >
                        No activities found
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading &&
                    !error &&
                    filteredActivities.length > 0 &&
                    paginatedActivities.map((activity, index) => (
                      <TableRow key={activity.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {activity.activityType}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {activity.property_id || activity.unique_property_id || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {activity.property_name || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {activity.city_id || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {activity.name || activity.userName || activity.fullname || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {activity.email || activity.userEmail || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {activity.mobile || activity.userMobile || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {formatDate(activity.searched_on_date! || activity.created_date!) || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDropdownOpen(dropdownOpen === activity.id ? null : activity.id)}
                          >
                            <svg
                              className="w-5 h-5 text-gray-500 dark:text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </Button>
                          {dropdownOpen === activity.id && (
                            <div
                              ref={dropdownRef}
                              className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10"
                            >
                              <button
                                onClick={() => {
                                  handleView(activity.unique_property_id || activity.property_id);
                                  setDropdownOpen(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                View
                              </button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {totalItems > itemsPerPage && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 py-2 gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {startIndex + 1} to {endIndex} of {totalItems} entries
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                <Button
                  variant={currentPage === 1 ? "outline" : "primary"}
                  size="sm"
                  onClick={goToPreviousPage}
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
                      onClick={() => goToPage(page as number)}
                      className={
                        page === currentPage
                          ? "bg-[#1D3A76] text-white"
                          : "text-gray-500"
                      }
                    >
                      {page}
                    </Button>
                  )
                )}
                <Button
                  variant={currentPage === totalPages ? "outline" : "primary"}
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </ComponentCard>
      </div>
    </div>
  );
};

export default UserActivities;
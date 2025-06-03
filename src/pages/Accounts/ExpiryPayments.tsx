import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchExpiringSoonSubscriptions } from "../../store/slices/paymentSlice";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumbList from "../../components/common/PageBreadCrumbLists";
import Button from "../../components/ui/button/Button";
import ComponentCard from "../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import FilterBar from "../../components/common/FilterBar"; // Import FilterBar

// Updated interface to align with Redux state
interface ExpiringSoonUser {
  user_id: number;
  name: string;
  email: string;
  mobile: string;
  city: string;
  subscription_package: string;
  payment_amount: string; // Changed to string to match Redux state
  subscription_expiry_date: string;
  user_type: number;
  message: string;
}

interface SelectOption {
  value: string;
  label: string;
}

const userTypeMap: { [key: number]: string } = {
  2: "User",
  3: "Builder",
  4: "Agent",
  5: "Owner",
  6: "Channel Partner",
};

const ExpiryPayments: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { expiringSoonSubscriptions, expiringSoonLoading, expiringSoonError } =
    useSelector((state: RootState) => state.payment);

  const [filterValue, setFilterValue] = useState<string>("");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [dateError, setDateError] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<string>(""); // State filter for fetching cities
  const [cityFilter, setCityFilter] = useState<string>(""); // City filter for filtering subscriptions

  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(fetchExpiringSoonSubscriptions());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedUserType, startDate, endDate, filterValue, cityFilter]); // Removed stateFilter from dependencies

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  // Helper function to format payment amount
  const formatPaymentAmount = (amount: string | null): string => {
    if (!amount) return "N/A";
    try {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount)) return "N/A";
      return `₹${numericAmount.toFixed(2)}`;
    } catch {
      return "N/A";
    }
  };

  const handleFilter = (value: string) => {
    setFilterValue(value);
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedUserType(null);
    setStartDate(null);
    setEndDate(null);
    setStateFilter("");
    setCityFilter("");
    setFilterValue("");
    setCurrentPage(1);
    setDateError(null);
  };

  const filteredSubscriptions = useMemo(() => {
    return expiringSoonSubscriptions.filter((sub: ExpiringSoonUser) => {
      const searchableFields = [
        sub.name || "",
        sub.email || "",
        sub.mobile || "",
        sub.city || "",
        sub.subscription_package || "",
      ];
      const matchesSearch = searchableFields.some((field) =>
        field.toLowerCase().includes(filterValue.toLowerCase())
      );

      const matchesUserType =
        selectedUserType === null ||
        selectedUserType === "" ||
        userTypeMap[sub.user_type] === selectedUserType;

      let matchesDate = true;
      if (startDate || endDate) {
        if (!sub.subscription_expiry_date) {
          matchesDate = false;
        } else {
          try {
            const subDate = sub.subscription_expiry_date.split("T")[0];
            matchesDate =
              (!startDate || subDate >= startDate) &&
              (!endDate || subDate <= endDate);
          } catch {
            matchesDate = false;
          }
        }
      }

      // City filter (not state filter)
      const matchesCity = !cityFilter || (sub.city && sub.city.toLowerCase() === cityFilter.toLowerCase());

      return matchesSearch && matchesUserType && matchesDate && matchesCity;
    });
  }, [expiringSoonSubscriptions, filterValue, selectedUserType, startDate, endDate, cityFilter]);

  const userFilterOptions: SelectOption[] = [
    { value: "", label: "All Users" },
    ...Object.entries(userTypeMap).map(([key, value]) => ({
      value: value,
      label: value,
    })),
  ];

  const totalItems = filteredSubscriptions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedSubscriptions = filteredSubscriptions.slice(startIndex, endIndex);

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

  const formatPackageName = (packageName: string): string => {
    return packageName.charAt(0).toUpperCase() + packageName.slice(1).toLowerCase();
  };

  if (expiringSoonLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Loading expiring subscriptions...
        </h2>
      </div>
    );
  }

  if (expiringSoonError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg font-bold text-red-500">
          Error: {expiringSoonError}
        </h2>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <PageMeta title="Meet Owner Expiring Payments" />
      <PageBreadcrumbList
        pageTitle="Expiring Payments"
        pagePlacHolder="Filter subscriptions"
        onFilter={handleFilter}
      />
      <div className="space-y-6">
        {/* Integrate FilterBar with user type, date, state, and city filters */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 py-2">
          <FilterBar
            showUserTypeFilter={true}
            showDateFilters={true}
            showStateFilter={true} // State filter is enabled to fetch cities
            showCityFilter={true}
            userFilterOptions={userFilterOptions}
            onUserTypeChange={setSelectedUserType}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onStateChange={setStateFilter}
            onCityChange={setCityFilter}
            onClearFilters={clearFilters}
            selectedUserType={selectedUserType}
            startDate={startDate}
            endDate={endDate}
            stateValue={stateFilter}
            cityValue={cityFilter}
          />
        </div>

        {/* Display date error if present */}
        {dateError && (
          <div className="text-sm text-red-500 mb-2">{dateError}</div>
        )}

        {/* Display active filters (exclude state since it's not used for filtering) */}
        {(selectedUserType || startDate || endDate || cityFilter || filterValue) && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Filters: User Type: {selectedUserType || "All"} | Date: {startDate || "Any"} to{" "}
            {endDate || "Any"} | City: {cityFilter || "Any"} | Search: {filterValue || "None"}
          </div>
        )}

        {/* Table Section */}
        <ComponentCard title="Expiring Payments">
          <div className="overflow-visible relative rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Sl. No.
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      User ID
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
                      City
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Subscription Package
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Payment Amount
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Expiry Date
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {(!paginatedSubscriptions || paginatedSubscriptions.length === 0) && (
                    <TableRow>
                      <TableCell
                      
                        className="px-5 py-4 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                      >
                        {filterValue || selectedUserType || startDate || endDate || cityFilter
                          ? "No Matching Subscriptions Found"
                          : "No Expiring Subscriptions Available"}
                      </TableCell>
                    </TableRow>
                  )}
                  {paginatedSubscriptions.map((sub: ExpiringSoonUser, index: number) => (
                    <TableRow key={sub.user_id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.user_id}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                                    <div className="flex items-center gap-3">
                                                                      <div>
                                                                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90 cursor-pointer hover:underline">
                                                                          {sub.name}
                                                                        </span>
                                                                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                                                          {userTypeMap[sub.user_type!] || "Unknown"}
                                                                        </span>
                                                                      </div>
                                                                    </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.email}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.mobile || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.city || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        <span
                          className={`inline-block px-2 py-1 rounded-md text-xs w-auto font-medium ${
                            sub.subscription_package.toLowerCase() === "basic"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : sub.subscription_package.toLowerCase() === "prime"
                              ? "bg-[#EC9A0C] text-black dark:bg-[#EC9A0C] dark:text-white"
                              : "bg-[#1D3A76] text-white dark:bg-purple-900 dark:text-purple-200"
                          }`}
                        >
                          {formatPackageName(sub.subscription_package === 'prime_plus' ? 'Prime Plus' : sub.subscription_package)}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatPaymentAmount(sub.payment_amount)}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(sub.subscription_expiry_date)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
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

export default ExpiryPayments;
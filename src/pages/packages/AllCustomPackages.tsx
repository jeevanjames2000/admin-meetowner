import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCustomPackages } from "../../store/slices/packagesSlice";
import { RootState, AppDispatch } from "../../store/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { MoreVertical } from "lucide-react";
import PageBreadcrumbList from "../../components/common/PageBreadCrumbLists";
import ComponentCard from "../../components/common/ComponentCard";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker";

// User type mapping
const userTypeMap: { [key: string]: string } = {
  user: "User",
  builder: "Builder",
  agent: "Agent",
  owner: "Owner",
  "channel partner": "Channel Partner",
};

// Interface for select options
interface SelectOption {
  value: string;
  label: string;
}

// Format date function
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

export default function AllCustomPackages() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { customPackages, customPackagesLoading, customPackagesError } = useSelector(
    (state: RootState) => state.package
  );

  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [filterValue, setFilterValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const itemsPerPage = 10;

  // Fetch all custom packages on mount
  useEffect(() => {
    dispatch(fetchAllCustomPackages());
  }, [dispatch]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedUserType, startDate, endDate, filterValue]);

  // Filter custom packages based on search, user type, and date range
  const filteredPackages = useMemo(
    () =>
      customPackages && Array.isArray(customPackages)
        ? customPackages.filter((pkg) => {
            const searchableFields = [
              pkg.user_name,
              pkg.user_mobile,
              pkg.package_for,
              pkg.city,
            ];
            const matchesSearch = searchableFields
              .filter((field): field is string => field !== null && field !== undefined)
              .map((field) => field.toLowerCase())
              .some((field) => field.includes(filterValue.toLowerCase()));

            const matchesUserType =
              selectedUserType === null ||
              selectedUserType === "" ||
              pkg.package_for.toLowerCase() === selectedUserType.toLowerCase();

            // Date range filter
            let matchesDate = true;
            if (startDate || endDate) {
              if (!pkg.created_date) {
                matchesDate = false; // Exclude null created_date
              } else {
                try {
                  const pkgDate = pkg.created_date.split("T")[0]; // Extract YYYY-MM-DD
                  matchesDate =
                    (!startDate || pkgDate >= startDate) &&
                    (!endDate || pkgDate <= endDate);
                } catch {
                  matchesDate = false; // Exclude invalid dates
                }
              }
            }

            return matchesSearch && matchesUserType && matchesDate;
          })
        : [],
    [customPackages, filterValue, selectedUserType, startDate, endDate]
  );

  const totalItems = filteredPackages.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedPackages = filteredPackages.slice(startIndex, endIndex);

  const toggleMenu = (id: number) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  const handleFilter = (value: string) => {
    setFilterValue(value);
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

  const handleView = (userId: number) => {
    navigate(`/packages/custom/${userId}`); 
  };

  const handleStartDateChange = (selectedDates: Date[]) => {
    const dateObj = selectedDates[0];
    let date = "";
    if (dateObj) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      date = `${year}-${month}-${day}`;
    }
    setStartDate(date || null);
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
    setEndDate(date || null);
  };

  const userFilterOptions: SelectOption[] = [
    { value: "", label: "All Types" },
    ...Object.entries(userTypeMap).map(([key, value]) => ({
      value: key,
      label: value,
    })),
  ];

  if (customPackagesLoading) return <div>Loading custom packages...</div>;
  if (customPackagesError) return <div>Error: {customPackagesError}</div>;
  if (!customPackages || customPackages.length === 0) return <div>No custom packages found.</div>;

  return (
    <div className="relative min-h-screen">
      <PageBreadcrumbList
        pageTitle="All Custom Packages"
        pagePlacHolder="Filter packages by user name, mobile, package for, or city"
        onFilter={handleFilter}
      />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-3 py-2">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-43">
              <Select
                options={userFilterOptions}
                placeholder="Select Package For"
                onChange={(value: string) => setSelectedUserType(value || null)}
                value={selectedUserType || ""}
                className="dark:bg-dark-900"
              />
            </div>
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
            <Button
              variant="outline"
              onClick={() => {
                setSelectedUserType(null);
                setStartDate(null);
                setEndDate(null);
                setFilterValue("");
                setCurrentPage(1);
              }}
              className="px-4 py-2 w-full sm:w-auto"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {(selectedUserType || startDate || endDate || filterValue) && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Filters: {selectedUserType || "All"} | Date: {startDate || "Any"} to{" "}
            {endDate || "Any"} | Search: {filterValue || "None"}
          </div>
        )}

        <ComponentCard title="All Custom Packages">
          <div className="overflow-visible relative rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
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
                      Package ID
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
                      Mobile
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Price
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Duration (Days)
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Created Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginatedPackages.map((pkg, index) => (
                    <TableRow key={pkg.package_id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {pkg.package_id}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {pkg.user_id}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90 cursor-pointer hover:underline">
                              {pkg.user_name || "N/A"}
                            </span>
                              <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                              {userTypeMap[pkg.package_for.toLowerCase()] || "Unknown"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {pkg.user_mobile || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        ₹{pkg.price}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {pkg.duration_days}
                      </TableCell>
                     
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(pkg.created_date)}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleMenu(pkg.package_id)}
                        >
                          <MoreVertical className="size-5 text-gray-500 dark:text-gray-400" />
                        </Button>
                        {activeMenu === pkg.package_id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                            <div className="py-2">
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => handleView(pkg.user_id)}
                              >
                                View
                              </button>
                            </div>
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
                {/* Previous Button */}
                <Button
                  variant={currentPage === 1 ? "outline" : "primary"}
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                {/* Page Buttons */}
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

                {/* Next Button */}
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
}
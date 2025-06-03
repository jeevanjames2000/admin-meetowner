import { useEffect, useState } from "react";
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
import FilterBar from "../common/FilterBar"; // Import the FilterBar component

export default function BuyersActivities() {
  const location = useLocation();
  const [filterValue, setFilterValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [startDate, setStartDate] = useState<string | null>(null); // State for start date
  const [endDate, setEndDate] = useState<string | null>(null); // State for end date
  const itemsPerPage = 10;

  // Get userActivity from location state
  const { userActivity = [], userId, name } = location.state || {};

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterValue, startDate, endDate]);

  // Filter activities based on search input and date range
  const filteredActivities = userActivity.filter((activity: any) => {
    const searchableFields = [
      activity.name || "",
      activity.email || "",
      activity.mobile || "",
      activity.property_id || "",
      formatDate(activity.searched_on_date),
      activity.property_name || "",
    ];
    const matchesSearch = searchableFields
      .map((field: string) => field.toLowerCase())
      .some((field: string) => field.includes(filterValue.toLowerCase()));

    // Date range filter based on searched_on_date (contacted_date)
    let matchesDate = true;
    if (startDate || endDate) {
      if (!activity.searched_on_date) {
        matchesDate = false;
      } else {
        try {
          const activityDate = activity.searched_on_date.split("T")[0]; // Extract YYYY-MM-DD
          matchesDate =
            (!startDate || activityDate >= startDate) &&
            (!endDate || activityDate <= endDate);
        } catch {
          matchesDate = false;
        }
      }
    }

    return matchesSearch && matchesDate;
  });

  const totalItems = filteredActivities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

  const handleFilter = (value: string) => {
    setFilterValue(value);
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterValue("");
    setStartDate(null);
    setEndDate(null);
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
    const totalVisiblePages = 7;
    let startPage = Math.max(1, currentPage - Math.floor(totalVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + totalVisiblePages - 1);

    if (endPage - startPage + 1 < totalVisiblePages) {
      startPage = Math.max(1, endPage - totalVisiblePages + 1);
    }

    if (startPage > 1) pages.push(1);
    if (startPage > 2) pages.push("...");

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) pages.push("...");
    if (endPage < totalPages) pages.push(totalPages);

    return pages;
  };

  return (
    <div className="relative min-h-screen p-6">
      <PageBreadcrumbList
        pageTitle={`Activities for ${name || "User"} (ID: ${userId || "N/A"})`}
        pagePlacHolder="Filter activities by name, email, mobile, property ID, or date"
        onFilter={handleFilter}
      />
      <div className="space-y-6">
        {/* Integrate FilterBar with date filters and clear button */}
        <FilterBar
          showDateFilters={true} // Enable date filters
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onClearFilters={clearFilters}
          startDate={startDate}
          endDate={endDate}
        />

        {/* Display active filters */}
        {(startDate || endDate || filterValue) && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Filters: Date: {startDate || "Any"} to {endDate || "Any"} | Search: {filterValue || "None"}
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
                      Contacted Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Interested Status
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 dark:divide-white/[0.05]">
                  {filteredActivities.length === 0 && (
                    <TableRow>
                      <TableCell
                        className="px-5 py-4 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                      >
                        No activities found
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredActivities.length > 0 &&
                    paginatedActivities.map((activity: any, index: number) => (
                      <TableRow key={activity.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {activity.property_id || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {activity.property_name || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {activity.name || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {activity.email || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {activity.mobile || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {formatDate(activity.searched_on_date)}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {activity.interested_status === 2 ? "Interested" : "Not Interested"}
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
                      key={index}
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
}
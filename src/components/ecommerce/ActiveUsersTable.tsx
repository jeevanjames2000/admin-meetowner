import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentActiveUsers } from "../../store/slices/employeeUsers";
import { RootState, AppDispatch } from "../../store/store";
import { Table,TableBody,
  TableCell,
  TableHeader,
  TableRow, } from "../ui/table";
import Button from "../ui/button/Button";
import ComponentCard from "../common/ComponentCard";
import PageBreadcrumbList from "../common/PageBreadCrumbLists";
import FilterBar from "../common/FilterBar";
import { formatDate } from "../../hooks/FormatDate";



export default function ActiveUsersTable() {
  const dispatch = useDispatch<AppDispatch>();
  const { activeUsers, activeUsersLoading, activeUsersError } = useSelector(
    (state: RootState) => state.employeeUsers
  );
 const userType = useSelector((state: RootState) => state.auth.user?.user_type);
  const [filterValue, setFilterValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const itemsPerPage = 10;

  // Fetch active users
  useEffect(() => {
    if (!activeUsers.length && !activeUsersLoading && !activeUsersError) {
      dispatch(fetchCurrentActiveUsers());
    }
  }, [activeUsers, activeUsersLoading, activeUsersError, dispatch]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, filterValue]);

  // Filter active users based on search and date range
  const filteredUsers = useMemo(
    () =>
      activeUsers && Array.isArray(activeUsers)
        ? activeUsers.filter((user) => {
            // Search filter
            const searchableFields = [
              user.mobile,
              user.device_type,
              user.name,
              user.email,
              user.city,
            ];
            const matchesSearch = searchableFields
              .filter((field): field is string => field !== null && field !== undefined)
              .map((field) => field.toLowerCase())
              .some((field) => field.includes(filterValue.toLowerCase()));

            // Date range filter (based on last_active)
            let matchesDate = true;
            if (startDate || endDate) {
              if (!user.last_active) {
                matchesDate = false;
              } else {
                try {
                  const userDate = user.last_active.split("T")[0]; // Extract YYYY-MM-DD
                  matchesDate =
                    (!startDate || userDate >= startDate) &&
                    (!endDate || userDate <= endDate);
                } catch {
                  matchesDate = false;
                }
              }
            }

            return matchesSearch && matchesDate;
          })
        : [],
    [activeUsers, filterValue, startDate, endDate]
  );

  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

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

  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setFilterValue("");
    setCurrentPage(1);
  };

  if (activeUsersLoading) return <div className="p-6">Loading active users...</div>;
  if (activeUsersError) return <div className="p-6 text-red-500">Error: {activeUsersError}</div>;

  return (
    <div className="relative min-h-screen p-6">
      <PageBreadcrumbList
        pageTitle="Active Users Table"
        pagePlacHolder="Filter by mobile, device type, name, email, or city"
        onFilter={handleFilter}
      />

      <div className="flex flex-col sm:flex-row justify-between gap-3 py-2">
        <FilterBar
          showUserTypeFilter={false}
          showDateFilters={true}
          showStateFilter={false}
          showCityFilter={false}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onStateChange={() => {}}
          onCityChange={() => {}}
          onClearFilters={handleClearFilters}
          startDate={startDate}
          endDate={endDate}
          stateValue=""
          cityValue=""
        />
      </div>

      {(startDate || endDate || filterValue) && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Filters: Date: {startDate || "Any"} to {endDate || "Any"} | 
          Search: {filterValue || "None"}
        </div>
      )}

      <div className="space-y-6">
        <ComponentCard title="Active Users Table">
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
                      Name
                    </TableCell>
                     {userType === 1 && (
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Email
                    </TableCell>
                     )}
                      {userType === 1 && (
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Mobile
                    </TableCell>
                      )}
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
                      Last Active
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Device Type
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Subscription Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Created Date
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user, index) => (
                      <TableRow key={user.user_id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {user.name || "N/A"}
                        </TableCell>
                         {userType === 1 && (
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {user.email || "N/A"}
                        </TableCell>
                         )}
                          {userType === 1 && (
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {user.mobile}
                        </TableCell>
                          )}
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {user.city || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {formatDate(user.last_active)}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {user.device_type}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              user.subscription_status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : user.subscription_status === "inactive"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                            }`}
                          >
                            {user.subscription_status || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {user.created_date ? formatDate(user.created_date) : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell  className="px-5 py-4 text-center text-gray-500">
                        No active users found.
                      </TableCell>
                    </TableRow>
                  )}
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
}
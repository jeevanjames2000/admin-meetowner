import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Table,TableBody, TableCell,TableHeader,TableRow, } from "../ui/table";
import Button from "../ui/button/Button";
import ComponentCard from "../common/ComponentCard";
import PageBreadcrumbList from "../common/PageBreadCrumbLists";


// Interested status mapping
const interestedStatusMap: { [key: number]: string } = {
  0: "Interest",
  1: "Contact",
  2: "Scheduled",
};

// Format date and time for userActivity
const formatDateTime = (date: string | undefined, time: string | undefined): string => {
  if (!date || !time) return "N/A";
  const dateObj = new Date(date);
  const [year, month, day] = [
    dateObj.getFullYear(),
    String(dateObj.getMonth() + 1).padStart(2, "0"),
    String(dateObj.getDate()).padStart(2, "0"),
  ];
  const [hours, minutes] = time.split(":").map(Number);
  const ampm = hours >= 13 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const formattedTime = `${String(formattedHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${ampm}`;
  return `${day}-${month}-${year} ${formattedTime}`;
};

export default function UserActivities() {
  const location = useLocation();
  const { users, loading, error } = useSelector((state: RootState) => state.users);
  const [filterValue, setFilterValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Get userId from query params
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get("userId");

  // Find user by userId
  const user = users.find((u) => u.id === Number(userId));
  const userName = user?.name || "Unknown User";
  const userActivities = user?.userActivity || [];
  console.log(userActivities);

  // Filter activities
  const filteredActivities = userActivities.filter((activity) => {
    const searchableFields = [
      activity.property_name,
      activity.property_id,
      activity.location_id?.toString(),
      activity.searched_filter_desc,
      interestedStatusMap[activity.interested_status] || "",
    ];
    return searchableFields
      .map((field) => field?.toLowerCase() || "")
      .some((field) => field.includes(filterValue.toLowerCase()));
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
    const pages = [];
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

  if (loading) return <div>Loading activities...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="relative min-h-screen">
      <PageBreadcrumbList
        pageTitle={`${userName}'s Activities`}
        pagePlacHolder="Filter activities by property name, ID, location, type, or status"
        onFilter={handleFilter}
      />
      <div className="space-y-6">
        <ComponentCard title="User Activities">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Property Name
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Property ID
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Location
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Property Type
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Searched Time and Date
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Interested Status
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginatedActivities.map((activity, index) => (
                    <TableRow key={activity.id || index}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {activity.property_name || "Unknown Property"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {activity.property_id || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {activity.location_id || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {activity.searched_filter_desc || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDateTime(activity.searched_on_date, activity.searched_on_time)}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {interestedStatusMap[activity.interested_status] || "N/A"}
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
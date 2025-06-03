import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumbList from "../../components/common/PageBreadCrumbLists";
import FilterBar from "../../components/common/FilterBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { AppDispatch, RootState } from "../../store/store";
import { fetchUserSearchDataByCity, LeadsState } from "../../store/slices/leads";

const MostSearchedDetail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { city } = useParams<{ city: string }>();
  const { userSearchData, userSearchDataCount, loading, error } = useSelector(
    (state: RootState) => state.leads as LeadsState
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
   const userType = useSelector((state: RootState) => state.auth.user?.user_type);
  const [filterValue, setFilterValue] = useState<string>("");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Fetch user search data by city
  useEffect(() => {
    if (city) {
      console.log("Fetching user search data for city:", city);
      dispatch(fetchUserSearchDataByCity({ city }))
        .unwrap()
        .then((response) => console.log("Fetch successful:", response))
        .catch((err) => console.error("Fetch failed:", err));
    } else {
      console.warn("No city parameter provided in URL");
    }
  }, [dispatch, city]);

  // Clear all filters
  const clearFilters = () => {
    setFilterValue("");
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);
  };

  // Filter user search data
  const filteredData = useMemo(() => {
    if (!Array.isArray(userSearchData)) {
      console.warn("userSearchData is not an array:", userSearchData);
      return [];
    }

    return userSearchData.filter((item) => {
      const searchableFields = [
        item.user_id?.toString() || "",
        item.mobile || "",
        item.name || "",
        item.searched_location || "",
        item.searched_for || "",
        item.created_date || "",
        item.created_time || "",
        item.email || "",
        item.sub_type || "",
        item.searched_city || "",
        item.property_in || "",
      ];
      const matchesSearch = searchableFields.some((field) =>
        field.toLowerCase().includes(filterValue.toLowerCase())
      );

      let matchesDate = true;
      if (startDate || endDate) {
        if (!item.created_date) {
          matchesDate = false;
        } else {
          try {
            const itemDate = item.created_date.split("T")[0];
            matchesDate =
              (!startDate || itemDate >= startDate) &&
              (!endDate || itemDate <= endDate);
          } catch {
            matchesDate = false;
          }
        }
      }

      return matchesSearch && matchesDate;
    });
  }, [userSearchData, filterValue, startDate, endDate]);

  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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

  const handleFilter = (value: string) => {
    setFilterValue(value);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Loading...</h2>
      </div>
    );
  }

  if (error || userSearchDataCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <PageMeta
          title={`Meet Owner Most Searched Details - ${city || "Unknown"}`}
          description="This is the Most Searched Location Details page"
        />
        <PageBreadcrumbList
          pageTitle={`Most Searched Details - ${city || "Unknown"}`}
          pagePlacHolder="Filter by user ID, mobile, name, location, searched for, date, time, email, sub type, city, or property in"
          onFilter={handleFilter}
        />
        <ComponentCard title={`Most Searched Details - ${city || "Unknown"}`}>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {error ? `Error: ${error}` : "No Data Available"}
          </h2>
        </ComponentCard>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
      <PageMeta
        title={`Meet Owner Most Searched Details - ${city}`}
        description="This is the Most Searched Location Details page"
      />
      <PageBreadcrumbList
        pageTitle={`Most Searched Details - ${city}`}
        pagePlacHolder="Filter by user ID, mobile, name, location, searched for, date, time, email, sub type, city, or property in"
        onFilter={handleFilter}
      />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <FilterBar
            showUserTypeFilter={false}
            showDateFilters={true}
            showStateFilter={false}
            showCityFilter={false}
            userFilterOptions={[]}
            onUserTypeChange={() => {}}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onStateChange={() => {}}
            onCityChange={() => {}}
            onClearFilters={clearFilters}
            selectedUserType={null}
            startDate={startDate}
            endDate={endDate}
            stateValue=""
            cityValue=""
          />
        </div>

        {(filterValue || startDate || endDate) && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Filters: Search: {filterValue || "None"} | Date: {startDate || "Any"} to{" "}
            {endDate || "Any"}
          </div>
        )}

        <ComponentCard title={`Most Searched Details - ${city}`}>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Sl. No
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      User ID
                    </TableCell>
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
                      Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Searched Location
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Searched For
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Created Time
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Created Date
                    </TableCell>
                  {userType === 1 && (
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Email
                    </TableCell>
                      )}
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Sub Type
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Searched City
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Property In
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginatedData.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.user_id || "N/A"}
                      </TableCell>
                    {userType === 1 && (
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.mobile || "N/A"}
                      </TableCell>
                    )}
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.name || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.searched_location || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.searched_for || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.created_time || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(item.created_date)}
                      </TableCell>
                    {userType === 1 && (
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.email || "N/A"}
                      </TableCell>
                    )}
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.sub_type || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.searched_city || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.property_in || "N/A"}
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
                {getPaginationItems().map((page, index) => (
                  page === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-3 text-gray-400 text-sm sm:text-gray-500 dark:text-gray-400"
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
                ))}
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

export default MostSearchedDetail;
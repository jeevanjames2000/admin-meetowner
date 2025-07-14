import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { AppDispatch, RootState } from "../../store/store";
import { fetchPropertyViewDetails, LeadsState } from "../../store/slices/leads";
import PageBreadcrumbList from "../../components/common/PageBreadCrumbLists";
import FilterBar from "../../components/common/FilterBar";
const MostViewedDetailsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { property_id } = useParams<{ property_id: string }>();
  const { propertyViewDetails, propertyViewDetailsCount, loading, error } =
    useSelector((state: RootState) => state.leads as LeadsState);
  const userType = useSelector(
    (state: RootState) => state.auth.user?.user_type
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filterValue, setFilterValue] = useState<string>("");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 10;
  useEffect(() => {
    if (property_id) {
      dispatch(fetchPropertyViewDetails({ property_id }))
        .unwrap()
        .then(() => console.log("Fetch successful"))
        .catch((err) => console.error("Fetch failed:", err));
    }
  }, [dispatch, property_id]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const clearFilters = () => {
    setFilterValue("");
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);
  };
  const filteredDetails = useMemo(() => {
    return propertyViewDetails.filter((detail) => {
      const searchableFields = [
        detail.user_id.toString() || "",
        detail.property_id || "",
        detail.property_name || "",
        detail.name || "",
        detail.mobile || "",
        detail.email || "",
        detail.google_address || "",
        detail.city_id || "",
      ];
      const matchesSearch = searchableFields.some((field) =>
        field.toLowerCase().includes(filterValue.toLowerCase())
      );
      let matchesDate = true;
      if (startDate || endDate) {
        if (!detail.created_date) {
          matchesDate = false;
        } else {
          try {
            const detailDate = detail.created_date.split("T")[0];
            matchesDate =
              (!startDate || detailDate >= startDate) &&
              (!endDate || detailDate <= endDate);
          } catch {
            matchesDate = false;
          }
        }
      }
      return matchesSearch && matchesDate;
    });
  }, [propertyViewDetails, filterValue, startDate, endDate]);
  const totalItems = filteredDetails.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedDetails = filteredDetails.slice(startIndex, endIndex);
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
  const handleView = (property_id: string | null) => {
    if (!property_id) {
      console.error("Property ID is missing");
      return;
    }
    try {
      const url = `https://meetowner.in/property?Id_${encodeURIComponent(
        property_id
      )}`;
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error navigating to property:", error);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Loading...
        </h2>
      </div>
    );
  }
  if (error || propertyViewDetailsCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <PageMeta
          title={`Meet Owner Most Viewed Details - ${property_id}`}
          description="This is the Most Viewed Property Details page"
        />
        <PageBreadcrumbList
          pageTitle={`Most Viewed Details - ${property_id}`}
          pagePlacHolder="Filter by user ID, property ID, name, mobile, email, address, or city"
          onFilter={handleFilter}
        />
        <ComponentCard title={`Most Viewed Details - ${property_id}`}>
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
        title={`Meet Owner Most Viewed Details - ${property_id}`}
        description="This is the Most Viewed Property Details page"
      />
      <PageBreadcrumbList
        pageTitle={`Most Viewed Details - ${property_id}`}
        pagePlacHolder="Filter by user ID, property ID, name, mobile, email, address, or city"
        onFilter={handleFilter}
      />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-3 ">
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
            Filters: Search: {filterValue || "None"} | Date:{" "}
            {startDate || "Any"} to {endDate || "Any"}
          </div>
        )}
        <ComponentCard title={`Most Viewed Details - ${property_id}`}>
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
                      User Id
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Property Id
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
                    {userType === 1 && (
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Mobile
                      </TableCell>
                    )}
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
                      Created Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Address
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
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginatedDetails.map((detail, index) => (
                    <TableRow key={detail.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {detail.user_id || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {detail.property_id || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {detail.property_name || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {detail.name || "N/A"}
                      </TableCell>
                      {userType === 1 && (
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {detail.mobile || "N/A"}
                        </TableCell>
                      )}
                      {userType === 1 && (
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {detail.email || "N/A"}
                        </TableCell>
                      )}
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(detail.created_date)}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {detail.google_address || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {detail.city_id || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setDropdownOpen(
                              dropdownOpen === detail.id ? null : detail.id
                            )
                          }
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
                        {dropdownOpen === detail.id && (
                          <div
                            ref={dropdownRef}
                            className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10"
                          >
                            <button
                              onClick={() => {
                                handleView(detail.property_id);
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
          {}
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
export default MostViewedDetailsPage;

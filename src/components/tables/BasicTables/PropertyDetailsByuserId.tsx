import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { getPropertyDetailsByUserId } from "../../../store/slices/propertyDetailsbyUser";
import { RootState, AppDispatch } from "../../../store/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Button from "../../ui/button/Button";
import ComponentCard from "../../common/ComponentCard";
import PageBreadcrumbList from "../../common/PageBreadCrumbLists";

// Property type mapping for display
const propertyTypeMap: { [key: string]: string } = {
  Apartment: "Apartment",
  Villa: "Villa",
  Plot: "Plot",
  Commercial: "Commercial",
};

// Format date function
const formatDate = (dateString: string | null): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

export default function PropertyDetailsByUserId() {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get("userId");
  const name = queryParams.get("name");

  const { properties, loading, error } = useSelector((state: RootState) => state.propertyDetailsByUser);
  const [filterValue, setFilterValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    if (userId) {
      const numericUserId = parseInt(userId, 10);
      if (!isNaN(numericUserId)) {
        dispatch(getPropertyDetailsByUserId(numericUserId));
      } else {
        console.error("Invalid userId:", userId);
      }
    }
  }, [dispatch, userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter properties based on search input
  const filteredProperties = properties.filter((property) => {
    const searchableFields = [
      property.property_name,
      property.google_address,
      property.city_id,
      property.sub_type,
      property.unique_property_id,
    ];
    return searchableFields
      .map((field) => field?.toLowerCase() || "")
      .some((field) => field.includes(filterValue.toLowerCase()));
  });

  // Pagination logic
  const totalItems = filteredProperties.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

  // Handle search filter
  const handleFilter = (value: string) => {
    setFilterValue(value);
    setCurrentPage(1);
  };

  const handlepropertyClick = (propertyId: string) => {
    if (propertyId) {
      navigate(`/user-activities?property_id=${propertyId}`);
    }
  };

  // Handle View action
  const handleView = (property_id: string) => {
    if (!property_id) {
      console.error("Property ID is missing");
      return;
    }
    try {
      const url = `https://meetowner.in/property?Id_${encodeURIComponent(property_id)}`;
      window.open(url, "_blank"); // Open in new tab
    } catch (error) {
      console.error("Error navigating to property:", error);
    }
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

  // Generate pagination items
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

  if (loading) return <div>Loading properties...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="relative min-h-screen p-6">
      <PageBreadcrumbList
        pageTitle={`Properties by ${name}`}
        pagePlacHolder="Filter properties by name, address, city, type, or Id"
        onFilter={handleFilter}
      />
      <div className="space-y-6">
        <ComponentCard title={`Properties by ${name}`}>
          <div className="overflow-visible relative rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
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
                      PropertyId
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
                      Type
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
                      Updated Date
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
                        Loading properties...
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && error && (
                    <TableRow>
                      <TableCell
                        className="px-5 py-4 text-center text-red-500 text-theme-sm dark:text-red-400"
                      >
                        Error: {error}
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && !error && properties.length === 0 && (
                    <TableRow>
                      <TableCell
                        className="px-5 py-4 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                      >
                        No properties found
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && !error && properties.length > 0 && paginatedProperties.map((property, index) => (
                    <TableRow key={property.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {property.unique_property_id}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <span
                          onClick={() => handlepropertyClick(property.unique_property_id)}
                          className="block font-medium text-gray-800 text-theme-sm dark:text-white/90 cursor-pointer hover:underline"
                        >
                          {property.property_name}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {propertyTypeMap[property.sub_type] || property.sub_type}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {property.google_address || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {property.city_id}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(property.updated_date)}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDropdownOpen(dropdownOpen === property.unique_property_id ? null : property.unique_property_id)}
                          aria-label="Open actions menu"
                          aria-expanded={dropdownOpen === property.unique_property_id}
                        >
                          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </Button>
                        {dropdownOpen === property.unique_property_id && (
                          <div ref={dropdownRef} className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                            <button
                              onClick={() => {
                                handleView(property.unique_property_id);
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
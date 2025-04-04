import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, useParams } from "react-router"; // Add useParams
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import { deleteListing, fetchListings, ListingState, updatePropertyStatus } from "../../../store/slices/listings";
import { AppDispatch, RootState } from "../../../store/store";

const statusMap: { [key: number]: string } = {
  0: "Review",
  1: "Approved",
  2: "Rejected",
  3: "Deleted",
};

const ResidentialTypes: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { property_for, status } = useParams<{ property_for: string; status: string }>(); // Extract params
  const dispatch = useDispatch<AppDispatch>();
  const { listings, loading, error, totalCount, totalPages } = useSelector(
    (state: RootState) => state.listings as ListingState
  );

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [filterValue, setFilterValue] = useState<string>("");

  // Define filters based on URL params
  const filters = {
    page: currentPage,
    property_in: "Residential",
    property_for: property_for === "buy" ? "Sell" : "Rent", // Map "buy" to "Sell", "rent" to "Rent"
    status: parseInt(status || "0", 10), // Convert status to number, default to 0
  };

  const getPageTitle = () => {
    const baseTitle = `Residential ${filters.property_for}`;
    return `${baseTitle} ${statusMap[filters.status] || "Unknown"}`;
  };
  // Fetch listings when component mounts or page/property_for/status changes
  useEffect(() => {
    dispatch(fetchListings(filters));
  }, [dispatch, currentPage, property_for, status,refreshTrigger]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

 

  const handleEdit = (item: any) => {
    console.log("Edit:", item);
    const editPath = property_for === "buy" ? "/residential-buy-edit" : "/residential-rent-edit";
    navigate(editPath, { state: { property: item } });
    setDropdownOpen(null);
  };

 const handleDelete = (unique_property_id: string) => {
     dispatch(deleteListing({ unique_property_id }))
       .unwrap()
       .then(() => {
         setRefreshTrigger((prev) => prev + 1); // Trigger refetch
       })
       .catch((err) => {
         console.error("Delete failed:", err);
       });
     setDropdownOpen(null);
   };
 
 
   const handleApprove = (unique_property_id: string) => {
     const property_status = filters.status === 0 ? 1 : 2; // 1 for Approve, 2 for Reject
     dispatch(
       updatePropertyStatus({
         property_status,
         unique_property_id,
       })
     )
       .unwrap()
       .then(() => {
         setRefreshTrigger((prev) => prev + 1); // Trigger refetch
       })
       .catch((err) => {
         console.error("Status update failed:", err);
       });
     setDropdownOpen(null);
   };

  // Search filter logic
  const filteredListings = listings.filter((item) =>
    [
      item.unique_property_id || item.id.toString(),
      item.property_name || "",
      item.user_type === 1
        ? "Admin"
        : item.user_type === 2
        ? "User"
        : item.user_type === 3
        ? "Builder"
        : item.user_type === 4
        ? "Agent"
        : item.user_type === 5
        ? "Owner"
        : item.user_type === 6
        ? "Channel Partner"
        : "Unknown",
    ].some((field) => field.toLowerCase().includes(filterValue.toLowerCase()))
  );

  // Pagination logic
  const totalItems = filterValue ? filteredListings.length : totalCount;
  const effectiveTotalPages = filterValue ? Math.ceil(totalItems / itemsPerPage) : totalPages;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedListings = filterValue ? filteredListings.slice(startIndex, endIndex) : listings;

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
    if (currentPage < effectiveTotalPages) setCurrentPage(currentPage + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Loading...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Error: {error}</h2>
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">No Data Available</h2>
      </div>
    );
  }
  // Inside ResidentialTypes component (before return statement)
  const getPaginationItems = () => {
    const pages = [];
    const totalVisiblePages = 7; // Adjust this based on how many numbers you want to show
    let startPage = 1;
    let endPage = effectiveTotalPages;

    if (effectiveTotalPages > totalVisiblePages) {
      const halfVisible = Math.floor(totalVisiblePages / 2);
      startPage = Math.max(1, currentPage - halfVisible);
      endPage = Math.min(effectiveTotalPages, currentPage + halfVisible);

      if (currentPage - halfVisible < 1) {
        endPage = totalVisiblePages;
      }
      if (currentPage + halfVisible > effectiveTotalPages) {
        startPage = effectiveTotalPages - totalVisiblePages + 1;
      }
    }

    // Always show first page
    if (startPage > 1) pages.push(1);
    if (startPage > 2) pages.push("...");

    // Main range
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Handle end ellipsis
    if (endPage < effectiveTotalPages - 1) pages.push("...");
    if (endPage < effectiveTotalPages) pages.push(effectiveTotalPages);

    return pages;
  };

  return (
    <div className="relative min-h-screen">
      <PageMeta
        title={`Residential ${filters.property_for} ${getPageTitle()}`}
        description={`This is the Residential ${filters.property_for} ${getPageTitle()} Table page`}
      />
      <PageBreadcrumb
        pageTitle={`Residential ${filters.property_for}`}
        pagePlacHolder="Search by ID, Project Name, or User Type"
        onFilter={handleFilter}
      />
      <div className="space-y-6">
        <ComponentCard title={getPageTitle()}>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">ID</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Sl. No</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Project Name</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Property Type</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">User Type</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Listing Time & Date</TableCell>
                 {(filters.status === 0 || filters.status === 1) &&  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>}  
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginatedListings.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.unique_property_id || item.id}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.property_name || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.sub_type || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.user_type === 1 ? "Admin" :
                         item.user_type === 2 ? "User" :
                         item.user_type === 3 ? "Builder" :
                         item.user_type === 4 ? "Agent" :
                         item.user_type === 5 ? "Owner" :
                         item.user_type === 6 ? "Channel Partner" : "Unknown"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.created_date && item.created_time ? `${item.created_date} ${item.created_time}` : "N/A"}
                      </TableCell>
                      {/* Show Actions column only for Review (0) and Approved (1) */}
                      {(filters.status === 0 || filters.status === 1) && (
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDropdownOpen(dropdownOpen === item.id.toString() ? null : item.id.toString())}
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
                          {dropdownOpen === item.id.toString() && (
                            <div
                              ref={dropdownRef}
                              className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10"
                            >
                              <button
                                onClick={() => handleEdit(item)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(item.unique_property_id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => handleApprove(item.unique_property_id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                {filters.status === 0 ? "Approve" : "Reject"}
                              </button>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          {totalItems > itemsPerPage && (
  <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 py-2 gap-4">
    <div className="text-sm text-gray-500 dark:text-gray-400">
      Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
      {totalItems} entries
    </div>
    <div className="flex gap-2 flex-wrap justify-center">
      <Button
        variant={currentPage === 1 ? "outline" : "primary"} // Outline when disabled, primary (blue) when not
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
            variant="outline"
            size="sm"
            onClick={() => goToPage(page as number)}
            isActive={page === currentPage} // Highlight current page
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant={currentPage === effectiveTotalPages ? "outline" : "primary"} // Outline when disabled, primary (blue) when not
        size="sm"
        onClick={goToNextPage}
        disabled={currentPage === effectiveTotalPages}
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

export default ResidentialTypes;
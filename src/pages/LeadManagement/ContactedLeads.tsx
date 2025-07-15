import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
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
import { fetchLeadsByContacted, LeadsState } from "../../store/slices/leads";
import PageBreadcrumbList from "../../components/common/PageBreadCrumbLists";
import FilterBar from "../../components/common/FilterBar";
const userTypeMap: { [key: string]: string } = {
  "1": "Admin",
  "3": "Builder",
  "4": "Agent",
  "5": "Owner",
  "6": "Channel Partner",
};
interface SelectOption {
  value: string;
  label: string;
}
const ContactedLeads: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { leadsByContacted, loading, error } = useSelector(
    (state: RootState) => state.leads as LeadsState
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [filterValue, setFilterValue] = useState<string>("");
  const userType = useSelector(
    (state: RootState) => state.auth.user?.user_type
  );
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);
  useEffect(() => {
    dispatch(fetchLeadsByContacted());
  }, [dispatch]);
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
  const formatTime = (timeString: string | null) => {
    if (!timeString) return "null";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${String(formattedHour).padStart(2, "0")}:${minutes} ${period}`;
  };
  const clearFilters = () => {
    setFilterValue("");
    setSelectedUserType(null);
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);
  };
  const filteredLeads = useMemo(() => {
    return leadsByContacted.filter((lead) => {
      const searchableFields = [
        lead.unique_property_id || "",
        lead.fullname || "",
        lead.mobile || "",
        lead.email || "",
        lead.property_name || "",
        lead.owner_name || "",
        lead.owner_mobile || "",
        lead.owner_email || "",
      ];
      const matchesSearch = searchableFields.some((field) =>
        field.toLowerCase().includes(filterValue.toLowerCase())
      );
      const matchesUserType =
        selectedUserType === null ||
        selectedUserType === "" ||
        (lead.owner_type !== null &&
          userTypeMap[lead.owner_type.toString()] === selectedUserType);
      let matchesDate = true;
      if (startDate || endDate) {
        if (!lead.created_date) {
          matchesDate = false;
        } else {
          try {
            const leadDate = lead.created_date.split("T")[0];
            matchesDate =
              (!startDate || leadDate >= startDate) &&
              (!endDate || leadDate <= endDate);
          } catch {
            matchesDate = false;
          }
        }
      }
      return matchesSearch && matchesUserType && matchesDate;
    });
  }, [leadsByContacted, filterValue, selectedUserType, startDate, endDate]);
  const totalItems = filteredLeads.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);
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
  const handleFilter = (value: string) => {
    setFilterValue(value);
    setCurrentPage(1);
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(null);
        setDropdownPosition(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const userFilterOptions: SelectOption[] = [
    { value: "", label: "All Users" },
    ...Object.entries(userTypeMap).map(([key, value]) => ({
      value: value,
      label: value,
    })),
  ];
  const handleView = (unique_property_id: string | null) => {
    if (!unique_property_id) {
      console.error("Property ID is missing");
      return;
    }
    try {
      const url = `https://meetowner.in/property?Id_${encodeURIComponent(
        unique_property_id
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
  if (error || !leadsByContacted || leadsByContacted.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <PageMeta
          title={`Meet Owner Lead Management Contacted`}
          description="This is the Property Leads Table page"
        />
        <PageBreadcrumbList
          pageTitle={`Lead Management Contacted`}
          pagePlacHolder="Filter leads"
          onFilter={handleFilter}
        />
        <ComponentCard title={`Lead Management Contacted`}>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {error ? `${error}` : "No Data Available"}
          </h2>
        </ComponentCard>
      </div>
    );
  }
  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
      <PageMeta
        title={`Meet Owner Lead Management Contacted`}
        description="This is the Property Leads Table page"
      />
      <PageBreadcrumbList
        pageTitle={`Lead Management`}
        pagePlacHolder="Filter leads"
        onFilter={handleFilter}
      />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-3 py-2">
          <FilterBar
            showUserTypeFilter={true}
            showDateFilters={true}
            showStateFilter={false}
            showCityFilter={false}
            userFilterOptions={userFilterOptions}
            onUserTypeChange={setSelectedUserType}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onStateChange={() => {}}
            onCityChange={() => {}}
            onClearFilters={clearFilters}
            selectedUserType={selectedUserType}
            startDate={startDate}
            endDate={endDate}
            stateValue=""
            cityValue=""
          />
        </div>
        {(filterValue || selectedUserType || startDate || endDate) && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Filters: Search: {filterValue || "None"} | User Type:{" "}
            {selectedUserType || "All"} | Date: {startDate || "Any"} to{" "}
            {endDate || "Any"}
          </div>
        )}
        <ComponentCard title={`Lead Management Contacted`}>
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
                      Customer Id
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Customer Name
                    </TableCell>
                    {userType === 1 && (
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Mobile Number
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
                      Property For
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Project Id
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Project Name
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
                      Time
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
                  {paginatedLeads.map((lead, index) => {
                    const isHotLead = (() => {
                      if (!lead.created_date) return false;
                      const today = new Date();
                      const leadDate = new Date(lead.created_date);
                      return (
                        today.getFullYear() === leadDate.getFullYear() &&
                        today.getMonth() === leadDate.getMonth() &&
                        today.getDate() === leadDate.getDate()
                      );
                    })();
                    return (
                      <TableRow
                        key={lead.id}
                        className={
                          isHotLead
                            ? "bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        }
                      >
                        <TableCell className="flex  px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {startIndex + index + 1}
                          {isHotLead && (
                            <div className="relative inline-block group">
                              <img
                                src={"/images/transparent_fire.gif"}
                                alt="Hot Lead"
                                className="inline-block w-6 h-6 mr-2 object-contain animate-fire"
                              />
                              <span className="absolute z-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-0">
                                Hot Lead
                              </span>
                              <span className="sr-only">Hot Lead</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {lead.user_id || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {lead.fullname || "N/A"}
                        </TableCell>
                        {userType === 1 && (
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {lead.mobile || "N/A"}
                          </TableCell>
                        )}
                        {userType === 1 && (
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {lead.email || "N/A"}
                          </TableCell>
                        )}
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {lead.property_for || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {lead.unique_property_id || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative group">
                          <span className="text-black dark:text-gray-400 cursor-default flex items-center gap-2">
                            {lead.property_name || "N/A"}
                          </span>
                          <div className="absolute z-10 w-64 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 left-0 top-full mt-1 hidden group-hover:block">
                            <div className="text-sm text-gray-800 dark:text-gray-200">
                              <p className="font-semibold">
                                Owner Name:{" "}
                                <span className="font-normal">
                                  {lead.owner_name || "N/A"}
                                </span>
                              </p>
                              <p className="font-semibold">
                                Phone Number:{" "}
                                <span className="font-normal">
                                  {lead.owner_mobile || "N/A"}
                                </span>
                              </p>
                              <p className="font-semibold">
                                Email:{" "}
                                <span className="font-normal">
                                  {lead.owner_email || "N/A"}
                                </span>
                              </p>
                              <p className="font-semibold">
                                Owner Type:{" "}
                                <span className="font-normal">
                                  {lead.owner_type !== null
                                    ? userTypeMap[lead.owner_type.toString()] ||
                                      "Unknown"
                                    : "N/A"}
                                </span>
                              </p>
                            </div>
                            <div className="absolute top-[-6px] left-10 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white dark:border-b-gray-800" />
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {formatDate(lead.created_date)}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {formatTime(lead.created_time)}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              if (dropdownOpen === lead.id) {
                                setDropdownOpen(null);
                                setDropdownPosition(null);
                              } else {
                                const rect = (e.target as HTMLElement)
                                  .closest("td")
                                  ?.getBoundingClientRect();
                                if (rect) {
                                  setDropdownPosition({
                                    top:
                                      rect.top + rect.height + window.scrollY,
                                    left:
                                      rect.left +
                                      rect.width -
                                      160 +
                                      window.scrollX,
                                  });
                                } else {
                                  setDropdownPosition(null);
                                }
                                setDropdownOpen(lead.id);
                              }
                            }}
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
                          {dropdownOpen === lead.id &&
                            dropdownPosition &&
                            createPortal(
                              <div
                                ref={dropdownRef}
                                style={{
                                  position: "absolute",
                                  top: dropdownPosition.top,
                                  left: dropdownPosition.left,
                                  zIndex: 9999,
                                  width: "160px",
                                }}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg"
                              >
                                <button
                                  onClick={() => {
                                    handleView(lead.unique_property_id);
                                    setDropdownOpen(null);
                                    setDropdownPosition(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  View
                                </button>
                              </div>,
                              document.body
                            )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
export default ContactedLeads;

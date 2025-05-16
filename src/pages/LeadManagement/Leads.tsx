import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router";
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
import { fetchLeads, LeadsState } from "../../store/slices/leads";
import PageBreadcrumbList from "../../components/common/PageBreadCrumbLists";
import DatePicker from "../../components/form/date-picker";
import Select from "../../components/form/Select";

const userTypeMap: { [key: string]: string } = {
  "3": "Builder",
  "4": "Agent",
  "5": "Owner",
  "6": "Channel Partner",
};

interface SelectOption {
  value: string;
  label: string;
}

const PropertyLeadsBuy: React.FC = () => {
  const { property_for, status } = useParams<{ property_for: string; status: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { leads, totalCount, loading, error } = useSelector((state: RootState) => state.leads as LeadsState);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [filterValue, setFilterValue] = useState<string>("");
  const userType = useSelector((state: RootState) => state.auth.user?.user_type);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);
  const [startDateValue, setStartDateValue] = useState<Date | null>(null);
  const [endDateValue, setEndDateValue] = useState<Date | null>(null);

  const filters = {
    property_for: status === "1" ? "Sell" : status === "2" ? "Rent" : property_for || "",
  };

  useEffect(() => {
    if (filters.property_for) {
      dispatch(fetchLeads(filters));
    }
  }, [dispatch, property_for, status]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "null";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${String(formattedHour).padStart(2, "0")}:${minutes} ${period}`;
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const searchableFields = [
        lead.property_id || "",
        lead.name || "",
        lead.mobile || "",
        lead.email || "",
        lead.interested_status === 1 ? "Interested" :
        lead.interested_status === 2 ? "Follows-up" :
        lead.interested_status === 3 ? "Site Visited" : "Contacted",
        lead.property_name || "",
        lead.owner_name || "",
        lead.owner_mobile || "",
      ];
      const matchesSearch = searchableFields.some((field) =>
        field.toLowerCase().includes(filterValue.toLowerCase())
      );

      const matchesUserType =
        selectedUserType === null ||
        selectedUserType === "" ||
        userTypeMap[lead.owner_type!] === selectedUserType;

      let matchesDate = true;
      if (startDate || endDate) {
        if (!lead.searched_on_date) {
          matchesDate = false;
        } else {
          try {
            const leadDate = lead.searched_on_date.split("T")[0]; // Extract YYYY-MM-DD
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
  }, [leads, filterValue, selectedUserType, startDate, endDate]);

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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
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

  const handleStartDateChange = (selectedDates: Date[]) => {
    const dateObj = selectedDates[0];
    let date = "";
    if (dateObj) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      date = `${year}-${month}-${day}`;
      setStartDateValue(dateObj);
    } else {
      setStartDateValue(null);
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
      setEndDateValue(dateObj);
    } else {
      setEndDateValue(null);
    }
    setEndDate(date || null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Loading...</h2>
      </div>
    );
  }

  if (error || !leads || leads.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <PageMeta
          title={`Meet Owner Lead Management ${filters.property_for === "Sell" ? "Buy" : "Rent"}`}
          description="This is the Property Leads Table page"
        />
        <PageBreadcrumbList
          pageTitle={`Lead Management ${filters.property_for === "Sell" ? "Buy" : "Rent"}`}
          pagePlacHolder="Filter leads"
          onFilter={handleFilter}
        />
        <ComponentCard title={`Lead Management ${filters.property_for === "Sell" ? "Buy" : "Rent"}`}>
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
        title={`Meet Owner Lead Management ${filters.property_for === "Sell" ? "Buy" : "Rent"}`}
        description="This is the Property Leads Table page"
      />
      <PageBreadcrumbList
        pageTitle={`Lead Management ${filters.property_for === "Sell" ? "Buy" : "Rent"}`}
        pagePlacHolder="Filter leads"
        onFilter={handleFilter}
      />
      <div className="space-y-6">
        <div className="w-auto flex gap-3">
          <div className="w-48">
            <Select
              options={userFilterOptions}
              placeholder="Select User Type"
              onChange={(value: string) => setSelectedUserType(value || null)}
              value={selectedUserType || ""}
              className="dark:bg-dark-900"
            />
          </div>
          <div className="w-48">
            <DatePicker
              id="startDate"
              placeholder="Select start date"
              onChange={handleStartDateChange}
            />
          </div>
          <div className="w-48">
            <DatePicker
              id="endDate"
              placeholder="Select end date"
              onChange={handleEndDateChange}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedUserType(null);
              setStartDate(null);
              setEndDate(null);
              setFilterValue("");
              setCurrentPage(1);
              setStartDateValue(null);
              setEndDateValue(null);
            }}
            className="px-4 py-2"
          >
            Clear Filters
          </Button>
        </div>
        {(selectedUserType || startDate || endDate || filterValue) && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Filters: {selectedUserType || "All"} | Date: {startDate || "Any"} to {endDate || "Any"} | Search: {filterValue || "None"}
          </div>
        )}
        <ComponentCard title={`Lead Management ${filters.property_for === "Sell" ? "Buy" : "Rent"}`}>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Sl. No</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Approach</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Customer Name</TableCell>
                    {userType === 1 && (
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Mobile Number</TableCell>
                    )}
                    {userType === 1 && (
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
                    )}
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Property For</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Project Id</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Project Name</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Date & Time</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginatedLeads.map((lead, index) => (
                    <TableRow key={lead.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {lead.interested_status === 1 ? "Interested" :
                         lead.interested_status === 2 ? "Follows-up" :
                         lead.interested_status === 3 ? "Site Visited" : "Closed"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {lead.name}
                      </TableCell>
                      {userType === 1 && (
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {lead.mobile}
                        </TableCell>
                      )}
                      {userType === 1 && (
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {lead.email}
                        </TableCell>
                      )}
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {lead.property_for}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {lead.property_id}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative group">
                        <span className="text-black dark:text-gray-400 cursor-default">
                          {lead.property_name}
                        </span>
                        <div className="absolute z-10 w-64 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 left-0 top-full mt-1 hidden group-hover:block">
                          <div className="text-sm text-gray-800 dark:text-gray-200">
                            <p className="font-semibold">User Name: <span className="font-normal">{lead.owner_name}</span></p>
                            <p className="font-semibold">Phone Number: <span className="font-normal">{lead.owner_mobile}</span></p>
                            <p className="font-semibold">Owner Type: <span className="font-normal">{userTypeMap[lead.owner_type!] || "Unknown"}</span></p>
                          </div>
                          <div className="absolute top-[-6px] left-10 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white dark:border-b-gray-800" />
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {`${formatDate(lead.searched_on_date)} ${formatTime(lead.searched_on_time)}`}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDropdownOpen(dropdownOpen === lead.id ? null : lead.id)}
                        >
                          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </Button>
                        {dropdownOpen === lead.id && (
                          <div ref={dropdownRef} className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                            <button
                              onClick={() => {
                                handleView(lead.property_id);
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

export default PropertyLeadsBuy;
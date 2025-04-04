import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
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

const PropertyLeadsBuy: React.FC = () => {
  const { property_for, status } = useParams<{ property_for: string; status: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { leads, totalCount, loading, error } = useSelector((state: RootState) => state.leads as LeadsState);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [filterValue, setFilterValue] = useState<string>("");

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

  const filteredLeads = leads.filter((lead) =>
    [
      lead.property_id || "",
      lead.name || "",
      lead.mobile || "",
      lead.email || "",
      lead.interested_status === 1 ? "Interested" :
      lead.interested_status === 2 ? "Follows-up" :
      lead.interested_status === 3 ? "Site Visited" : "Contacted",
    ].some((field) => field.toLowerCase().includes(filterValue.toLowerCase()))
  );

  const totalItems = filteredLeads.length;
  const effectiveTotalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= effectiveTotalPages) {
      setCurrentPage(page);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < effectiveTotalPages) setCurrentPage(currentPage + 1);
  };

  const getPaginationItems = () => {
    const pages = [];
    const totalVisiblePages = 7;
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

    if (startPage > 1) pages.push(1);
    if (startPage > 2) pages.push("...");

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < effectiveTotalPages - 1) pages.push("...");
    if (endPage < effectiveTotalPages) pages.push(effectiveTotalPages);

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
          title={`Lead Management ${filters.property_for === "Sell" ? "Buy" : "Rent"}`}
          description="This is the Property Leads Table page"
        />
        <PageBreadcrumb
          pageTitle={`Lead Management ${filters.property_for === "Sell" ? "Buy" : "Rent"}`}
          pagePlacHolder="Filter leads"
          onFilter={handleFilter}
        />
        <ComponentCard title={`Lead Management ${filters.property_for === "Sell" ? "Buy" : "Rent"}`}>
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
        title={`Lead Management ${filters.property_for === "Sell" ? "Buy" : "Rent"}`}
        description="This is the Property Leads Table page"
      />
      <PageBreadcrumb
        pageTitle={`Lead Management ${filters.property_for === "Sell" ? "Buy" : "Rent"}`}
        pagePlacHolder="Filter leads"
        onFilter={handleFilter}
      />
      <div className="space-y-6">
        <ComponentCard title={`Lead Management ${filters.property_for === "Sell" ? "Buy" : "Rent"}`}>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Sl. No</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Approach</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Customer Name</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Mobile Number</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Property For</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Project Id</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Date & Time</TableCell>
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
                         lead.interested_status === 3 ? "Site Visited" : "Contacted"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {lead.name}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {lead.mobile}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {lead.email}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {lead.property_for}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {lead.property_id}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {`${formatDate(lead.searched_on_date)} ${formatTime(lead.searched_on_time)}`}
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
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
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
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(page as number)}
                      isActive={page === currentPage}
                    >
                      {page}
                    </Button>
                  )
                )}

                <Button
                  variant={currentPage === effectiveTotalPages ? "outline" : "primary"}
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

export default PropertyLeadsBuy;
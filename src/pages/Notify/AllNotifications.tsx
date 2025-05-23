import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import DatePicker from "../../components/form/date-picker";
import { fetchNotificationHistory, clearNotify } from "../../store/slices/notifySlice";
import { toast } from "react-hot-toast";
import { NotifyState } from "../../store/slices/notifySlice";
import PageBreadcrumbList from "../../components/common/PageBreadCrumbLists";
import { formatDate } from "../../hooks/FormatDate";

// Format date function


const AllNotifications: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, notificationHistoryLoading, notificationHistoryError } = useSelector(
    (state: RootState) => state.notify
  ) as NotifyState;
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search
  const debounce = <F extends (...args: any[]) => void>(func: F, wait: number) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<F>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleDebouncedSearch = useCallback(
    debounce((query: string) => setDebouncedSearchQuery(query), 1000),
    []
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    handleDebouncedSearch(query);
    setCurrentPage(1); // Reset page on search
  };

  // Fetch notifications
  useEffect(() => {
    dispatch(fetchNotificationHistory());
  }, [dispatch, currentPage, debouncedSearchQuery]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show error toast
  useEffect(() => {
    if (notificationHistoryError) toast.error(notificationHistoryError);
  }, [notificationHistoryError]);

  // Clear notifications on unmount
  useEffect(() => {
    return () => {
      dispatch(clearNotify());
    };
  }, [dispatch]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, debouncedSearchQuery]);

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    const searchQueryLower = debouncedSearchQuery.toLowerCase();
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQueryLower) ||
      notification.message.toLowerCase().includes(searchQueryLower) ||
      notification.user_id.toLowerCase().includes(searchQueryLower);

    // Date range filter
    let matchesDate = true;
    if (startDate || endDate) {
      if (!notification.created_at) {
        matchesDate = false;
      } else {
        try {
          const notificationDate = notification.created_at.split("T")[0];
          matchesDate =
            (!startDate || notificationDate >= startDate) &&
            (!endDate || notificationDate <= endDate);
        } catch {
          matchesDate = false;
        }
      }
    }

    return matchesSearch && matchesDate;
  });

  // Pagination
  const totalItems = filteredNotifications.length;
  const totalPages = Math.ceil(totalItems / notificationsPerPage);
  const startIndex = (currentPage - 1) * notificationsPerPage;
  const endIndex = Math.min(startIndex + notificationsPerPage, totalItems);
  const currentNotifications = filteredNotifications.slice(startIndex, endIndex);

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

  const handleStartDateChange = (selectedDates: Date[]) => {
    const dateObj = selectedDates[0];
    let date = "";
    if (dateObj) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      date = `${year}-${month}-${day}`;
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
    }
    setEndDate(date || null);
  };

  // Error state
  if (notificationHistoryError && !notificationHistoryLoading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
          No notifications found
        </h2>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div>
        <PageMeta title="All Notifications" />
        <PageBreadcrumbList
          pageTitle="All Notifications"
          pagePlacHolder="Search by Title, Message, User ID"
          onFilter={handleSearch}
         
        />
       <div className="flex flex-col sm:flex-row justify-between gap-3 py-2">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <DatePicker
            id="startDate"
            placeholder="Select start date"
            onChange={handleStartDateChange}
            defaultDate={startDate ? new Date(startDate) : undefined}
          />
          <DatePicker
            id="endDate"
            placeholder="Select end date"
            onChange={handleEndDateChange}
            defaultDate={endDate ? new Date(endDate) : undefined}
          />
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setDebouncedSearchQuery("");
              setStartDate(null);
              setEndDate(null);
              setCurrentPage(1);
            }}
            className="px-4 py-2 w-full sm:w-auto"
          >
            Clear Filters
          </Button>
        </div>
      </div>
        {(searchQuery || startDate || endDate) && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Filters: Search: {searchQuery || "None"} | Date: {startDate || "Any"} to {endDate || "Any"}
          </div>
        )}
        <div className="space-y-6">
          <ComponentCard title="All Notifications">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      {["ID", "User ID", "Title", "Message", "Created At"].map((header) => (
                        <TableCell
                          key={header}
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {notificationHistoryLoading ? (
                      <TableRow>
                        <TableCell
                          className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                        >
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : currentNotifications.length === 0 ? (
                      <TableRow>
                        <TableCell
                          className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                        >
                          No Notifications Found!
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentNotifications.map((notification, index) => (
                        <TableRow key={notification.id}>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {startIndex + index + 1}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {notification.user_id}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {notification.title}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {notification.message}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {formatDate(notification.created_at)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            {totalItems > notificationsPerPage && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 py-2 gap-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {startIndex + 1} to {endIndex} of {totalItems} notifications
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
    </div>
  );
};

export default AllNotifications;
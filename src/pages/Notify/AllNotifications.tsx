import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";

import Button from "../../components/ui/button/Button";

import { fetchNotificationHistory, clearNotify } from "../../store/slices/notifySlice";
import { toast } from "react-hot-toast";
import { NotifyState } from "../../store/slices/notifySlice";

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

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    const searchQuery = debouncedSearchQuery.toLowerCase();
    return (
      notification.title.toLowerCase().includes(searchQuery) ||
      notification.message.toLowerCase().includes(searchQuery) ||
      notification.user_id.toLowerCase().includes(searchQuery)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage);
  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
  const currentNotifications = filteredNotifications.slice(
    indexOfFirstNotification,
    indexOfLastNotification
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setActiveMenu(null);
    }
  };

  const getPaginationItems = () => {
    const pages: (number | string)[] = [];
    const totalVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(totalVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + totalVisiblePages - 1);
    if (endPage - startPage + 1 < totalVisiblePages) {
      startPage = Math.max(1, endPage - totalVisiblePages + 1);
    }
    if (startPage > 1) pages.push(1);
    if (startPage > 2) pages.push("...");
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (endPage < totalPages - 1) pages.push("...");
    if (endPage < totalPages) pages.push(totalPages);
    return pages;
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
        <PageBreadcrumb
          pageTitle="All Notifications"
          pagePlacHolder="Search by Title, Message, User ID"
          onFilter={handleSearch}
          persistSearch={true}
        />
        <div className="space-y-6">
          <ComponentCard title="All Notifications">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      {["ID", "User ID", "Title", "Message", "Created At",].map((header) => (
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
                            {indexOfFirstNotification + index + 1}
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
                            {new Date(notification.created_at).toLocaleString()}
                          </TableCell>
                         
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            {filteredNotifications.length > notificationsPerPage && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 py-2 gap-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {indexOfFirstNotification + 1} to{" "}
                  {Math.min(indexOfLastNotification, filteredNotifications.length)} of{" "}
                  {filteredNotifications.length} notifications
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  <Button
                    variant={currentPage === 1 ? "outline" : "primary"}
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
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
                        onClick={() => handlePageChange(page)}
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
                    onClick={() => handlePageChange(currentPage + 1)}
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
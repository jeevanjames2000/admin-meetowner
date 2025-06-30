import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Button from "../ui/button/Button";
import ComponentCard from "../common/ComponentCard";
import PageBreadcrumbList from "../common/PageBreadCrumbLists";
import { getPropertyActivity } from "../../store/slices/propertyDetailsbyUser";
import { fetchAllSubscriptionsHistory } from "../../store/slices/paymentSlice";
import { formatDate } from "../../hooks/FormatDate";
import FilterBar from "../common/FilterBar";
export default function UserHistory() {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { propertyActivities, loading, error } = useSelector(
    (state: RootState) => state.propertyDetailsByUser
  );
  const { subscriptionHistory, historyLoading, historyError } = useSelector(
    (state: RootState) => state.payment
  );
  const userType = useSelector(
    (state: RootState) => state.auth.user?.user_type
  );
  const [filterValue, setFilterValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const itemsPerPage = 10;
  const queryParams = new URLSearchParams(location.search);
  const propertyId = queryParams.get("user_id");
  useEffect(() => {
    if (propertyId) {
      dispatch(getPropertyActivity(propertyId));
      dispatch(
        fetchAllSubscriptionsHistory({
          user_id: Number(propertyId),
          city: cityFilter,
        })
      );
    }
  }, [dispatch, propertyId, cityFilter]);
  useEffect(() => {
    setCurrentPage(1);
    setHistoryPage(1);
  }, [filterValue, startDate, endDate, cityFilter]);
  const filteredActivities = propertyActivities.filter((activity) => {
    const searchableFields = [
      activity.fullname || activity.userDetails?.name || "",
      activity.email || activity.userDetails?.email || "",
      activity.mobile || activity.userDetails?.mobile || "",
      activity.unique_property_id || "",
      formatDate(activity.created_date),
    ];
    const matchesSearch = searchableFields
      .map((field) => field.toLowerCase())
      .some((field) => field.includes(filterValue.toLowerCase()));
    let matchesDate = true;
    if (startDate || endDate) {
      if (!activity.created_date) {
        matchesDate = false;
      } else {
        try {
          const activityDate = activity.created_date.split("T")[0];
          matchesDate =
            (!startDate || activityDate >= startDate) &&
            (!endDate || activityDate <= endDate);
        } catch {
          matchesDate = false;
        }
      }
    }
    return matchesSearch && matchesDate;
  });
  const filteredHistory = subscriptionHistory.filter((subscription) => {
    const searchableFields = [
      subscription.name || "",
      subscription.email || "",
      subscription.mobile || "",
      subscription.subscription_package || "",
      subscription.city || "",
      formatDate(subscription.transaction_time || subscription.created_at),
    ];
    const matchesSearch = searchableFields
      .map((field) => field.toLowerCase())
      .some((field) => field.includes(filterValue.toLowerCase()));
    let matchesDate = true;
    if (startDate || endDate) {
      const dateField =
        subscription.transaction_time || subscription.created_at;
      if (!dateField) {
        matchesDate = false;
      } else {
        try {
          const subscriptionDate = dateField.split("T")[0];
          matchesDate =
            (!startDate || subscriptionDate >= startDate) &&
            (!endDate || subscriptionDate <= endDate);
        } catch {
          matchesDate = false;
        }
      }
    }
    return matchesSearch && matchesDate;
  });
  const totalItems = filteredActivities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex);
  const totalHistoryItems = filteredHistory.length;
  const totalHistoryPages = Math.ceil(totalHistoryItems / itemsPerPage);
  const historyStartIndex = (historyPage - 1) * itemsPerPage;
  const historyEndIndex = Math.min(
    historyStartIndex + itemsPerPage,
    totalHistoryItems
  );
  const paginatedHistory = filteredHistory.slice(
    historyStartIndex,
    historyEndIndex
  );
  const handleFilter = (value: string) => {
    setFilterValue(value);
    setCurrentPage(1);
    setHistoryPage(1);
  };
  const handleCityFilter = (city: string | null) => {
    setCityFilter(city);
    setHistoryPage(1);
  };
  const clearFilters = () => {
    setFilterValue("");
    setStartDate(null);
    setEndDate(null);
    setCityFilter(null);
    setCurrentPage(1);
    setHistoryPage(1);
  };
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };
  const goToHistoryPage = (page: number) => {
    setHistoryPage(page);
  };
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const goToPreviousHistoryPage = () => {
    if (historyPage > 1) setHistoryPage(historyPage - 1);
  };
  const goToNextHistoryPage = () => {
    if (historyPage < totalHistoryPages) setHistoryPage(historyPage + 1);
  };
  const getPaginationItems = (totalPages: number, currentPage: number) => {
    const pages = [];
    const totalVisiblePages = 7;
    let startPage = Math.max(
      1,
      currentPage - Math.floor(totalVisiblePages / 2)
    );
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
  return (
    <div className="relative min-h-screen p-6">
      <PageBreadcrumbList
        pageTitle="User History"
        pagePlacHolder="Filter by name, email, mobile, package, city, or date"
        onFilter={handleFilter}
      />
      <div className="space-y-6">
        <FilterBar
          showDateFilters={true}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onClearFilters={clearFilters}
          startDate={startDate}
          endDate={endDate}
          onCityChange={handleCityFilter}
        />
        {(startDate || endDate || filterValue || cityFilter) && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Filters: Date: {startDate || "Any"} to {endDate || "Any"} | Search:{" "}
            {filterValue || "None"} | City: {cityFilter || "Any"}
          </div>
        )}

        <ComponentCard title="Subscription History">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
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
                      Package
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Start Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Expiry Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Subscription Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Payment Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Total Amount
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      GST (18%)
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      SGST
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Leads Count
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Allowed Listings
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Uploaded Listings
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Remaining Listings
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Invoice
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 dark:divide-white/[0.05]">
                  {historyLoading && (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                        Loading subscription history...
                      </TableCell>
                    </TableRow>
                  )}
                  {!historyLoading && historyError && (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-center text-red-500 text-theme-sm dark:text-red-400">
                        {historyError}
                      </TableCell>
                    </TableRow>
                  )}
                  {!historyLoading &&
                    !historyError &&
                    paginatedHistory.length === 0 && (
                      <TableRow>
                        <TableCell className="px-5 py-4 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                          No subscription history found
                        </TableCell>
                      </TableRow>
                    )}
                  {!historyLoading &&
                    !historyError &&
                    paginatedHistory.map((subscription, index) => (
                      <TableRow key={subscription.id || `free-${index}`}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {historyStartIndex + index + 1}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {subscription.name || "N/A"}
                        </TableCell>
                        {userType === 1 && (
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {subscription.mobile || "N/A"}
                          </TableCell>
                        )}
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {subscription.city || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {subscription.subscription_package || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {formatDate(subscription.subscription_start_date) ||
                            "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {formatDate(subscription.subscription_expiry_date) ||
                            "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {subscription.subscription_status || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {subscription.payment_status || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          ₹{subscription.payment_amount || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          ₹{subscription.gst}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          ₹{subscription.sgst}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {subscription.leadsCount}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {subscription.allowedListings}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {subscription.uploadedCount}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {subscription.remaining}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {subscription.invoice_url ? (
                            <a
                              href={subscription.invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {subscription.invoice_number || "View Invoice"}
                            </a>
                          ) : (
                            subscription.invoice_number || "N/A"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
          {totalHistoryItems > itemsPerPage &&
            !historyLoading &&
            !historyError && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 py-2 gap-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {historyStartIndex + 1} to {historyEndIndex} of{" "}
                  {totalHistoryItems} entries
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  <Button
                    variant={historyPage === 1 ? "outline" : "primary"}
                    size="sm"
                    onClick={goToPreviousHistoryPage}
                    disabled={historyPage === 1}
                  >
                    Previous
                  </Button>
                  {getPaginationItems(totalHistoryPages, historyPage).map(
                    (page, index) =>
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
                          variant={page === historyPage ? "primary" : "outline"}
                          size="sm"
                          onClick={() => goToHistoryPage(page as number)}
                        >
                          {page}
                        </Button>
                      )
                  )}
                  <Button
                    variant={
                      historyPage === totalHistoryPages ? "outline" : "primary"
                    }
                    size="sm"
                    onClick={goToNextHistoryPage}
                    disabled={historyPage === totalHistoryPages}
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

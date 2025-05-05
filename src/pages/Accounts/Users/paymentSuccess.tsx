import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageMeta from "../../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { clearSubscriptions, fetchAllSubscriptions } from "../../../store/slices/paymentSlice";
import { AppDispatch, RootState } from "../../../store/store";
import ComponentCard from "../../../components/common/ComponentCard";
import PageBreadcrumbList from "../../../components/common/PageBreadCrumbLists";

// Define the Subscription interface (same as in paymentSlice)
interface Subscription {
  id: number;
  name: string;
  mobile: string;
  email: string;
  subscription_package: string;
  subscription_start_date: string;
  subscription_expiry_date: string;
  subscription_status: string;
}

const PaymentSuccessUsers: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { subscriptions, loading, error } = useSelector(
    (state: RootState) => state.payment
  );
  const [filterValue, setFilterValue] = useState<string>("");

  // Fetch subscriptions on mount
  useEffect(() => {
    dispatch(fetchAllSubscriptions());
    // Optional: Clear subscriptions on unmount
    return () => {
      dispatch(clearSubscriptions());
    };
  }, [dispatch]);

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format package name for display
  const formatPackageName = (packageName: string): string => {
    return packageName.charAt(0).toUpperCase() + packageName.slice(1).toLowerCase();
  };

  // Handle filter input
  const handleFilter = (value: string) => {
    setFilterValue(value);
  };

  // Filter subscriptions based on name and mobile
  const filteredSubscriptions = subscriptions.filter((sub) =>
    [sub.name || "", sub.mobile || ""].some((field) =>
      field.toLowerCase().includes(filterValue.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Loading subscriptions...
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-red-500">Error: {error}</h2>
      </div>
    );
  }

  if (!filteredSubscriptions || filteredSubscriptions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <PageMeta title="Meet Owner Payments" />
        <PageBreadcrumbList
          pageTitle="Payment Success Users"
          pagePlacHolder="Filter subscriptions"
          onFilter={handleFilter}
        />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {filterValue ? "No Matching Subscriptions Found" : "No Subscriptions Available"}
        </h2>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <PageMeta title="Meet Owner Payments" />
      <PageBreadcrumbList
        pageTitle="Payment Success Users"
        pagePlacHolder="Filter subscriptions"
        onFilter={handleFilter}
      />
      <div className="space-y-6">
        <ComponentCard title="Payment Success Users">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                {/* Table Header */}
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      ID
                    </TableCell>
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
                      Mobile
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Email
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
                      Status
                    </TableCell>
                  </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filteredSubscriptions.map((sub: Subscription) => (
                    <TableRow key={sub.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.id}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.name}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.mobile}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.email}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            sub.subscription_package.toLowerCase() === "basic"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : sub.subscription_package.toLowerCase() === "prime"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                              : "bg-gold-100 text-gold-800 dark:bg-gold-900 dark:text-gold-200"
                          }`}
                        >
                          {formatPackageName(sub.subscription_package)}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(sub.subscription_start_date)}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(sub.subscription_expiry_date)}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.subscription_status}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
};

export default PaymentSuccessUsers;
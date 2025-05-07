import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageMeta from "../../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { clearSubscriptions, fetchAllSubscriptions, updateSubscriptionStatus } from "../../../store/slices/paymentSlice";
import { AppDispatch, RootState } from "../../../store/store";
import ComponentCard from "../../../components/common/ComponentCard";
import PageBreadcrumbList from "../../../components/common/PageBreadCrumbLists";
import { useNavigate, useParams } from "react-router";
import Button from "../../../components/ui/button/Button";
import ConfirmStatusModal from "../../../components/common/ConfirmStatusModal";

interface SubscriptionFilters {
  payment_status?: string; // Optional payment_status
}
// Define the Subscription interface (same as in paymentSlice)
interface Subscription {
  id: number;
  user_id: number;
  name: string;
  mobile: string;
  email: string;
  subscription_package: string;
  subscription_start_date: string;
  subscription_expiry_date: string;
  subscription_status: string;
  payment_status: string;
  payment_amount: string;
  payment_reference: string;
  payment_mode: string;
  payment_gateway: string;
  transaction_time: string;
  created_at: string;
  updated_at: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  actual_amount: string;
  gst: string;
  sgst: string;
  gst_percentage: string;
  gst_number: string;
  rera_number: string;
  invoice_number: string | null; // Nullable field
}

const PaymentSuccessUsers: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { subscriptions, loading, error } = useSelector(
    (state: RootState) => state.payment
  );
  const [filterValue, setFilterValue] = useState<string>("");
  const {status } = useParams<{status:string}>();
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const subscriptionFilters: SubscriptionFilters = {
    payment_status: status, // status is string | undefined, which matches payment_status
  };
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [selectedSubscription, setSelectedSubscription] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [statusAction, setStatusAction] = useState<"approve" | "reject" | null>(null);

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  useEffect(() => {
    if (status) {
      dispatch(fetchAllSubscriptions(subscriptionFilters));
    }
    // Optional: Clear subscriptions on unmount
    return () => {
      dispatch(clearSubscriptions());
    };
  }, [dispatch, status]); // Add status to dependencies

  // Format date for display


  const handleInvoice = useCallback((sub: Subscription) => {

    navigate("/invoice", { state: { subscription: sub } });
  }, [navigate]);
  
  

  const handleApprove = useCallback(
    (
      userId: number,
      subscriptionName: string,
      action: "approve" | "reject"
    ) => {
      setSelectedSubscription({ id: userId, name: subscriptionName });
      setStatusAction(action);
      setIsStatusModalOpen(true);
      setDropdownOpen(null);
    },
    []
  );

  // Memoized confirmStatusChange function to handle the confirmation
  const confirmStatusChange = useCallback(() => {
    if (selectedSubscription && statusAction) {
      const subscriptionStatus = statusAction === "approve" ? "active" : "inactive";
      const paymentStatus = statusAction === "approve" ? "success" : "rejected";

      console.log(
        `Action: ${paymentStatus} for subscription ${selectedSubscription.name} (User ID: ${selectedSubscription.id})`
      );

      dispatch(
        updateSubscriptionStatus({
          user_id: selectedSubscription.id,
          subscription_status: subscriptionStatus,
          payment_status: paymentStatus,
        })
      ).then((result) => {
        if (result.meta.requestStatus === "fulfilled") {
          
          dispatch(fetchAllSubscriptions({ payment_status: status }));
        } else if (result.meta.requestStatus === "rejected") {
          console.error("Failed to update subscription status:", result.payload);
        }
      });

      // Close the modal and reset state
      setIsStatusModalOpen(false);
      setSelectedSubscription(null);
      setStatusAction(null);
    }
  }, [dispatch, selectedSubscription, statusAction, status]);




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

  const pageTitleStatus = status
    ? `${status.charAt(0).toUpperCase() + status.slice(1)} Subscriptions`
    : "Payments ";

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
          pageTitle={pageTitleStatus}
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
        pageTitle={pageTitleStatus}
        pagePlacHolder="Filter subscriptions"
        onFilter={handleFilter}
      />
      <div className="space-y-6">
        <ComponentCard title={pageTitleStatus}>
          <div className="overflow-visible relative rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full ">
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
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Payment Mode
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Payment Gateway
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Gst Number
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Payment Amount
                    </TableCell>
                    {status?.toLowerCase() === "success" && (
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                     Invoice Number
                    </TableCell>
                     )}
                    {(status?.toLowerCase() === "processing" || status?.toLocaleLowerCase() === 'success') && (
                    <TableCell 
                      isHeader 
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                    )}
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
                            ? "bg-[#EC9A0C] text-black dark:bg-[#EC9A0C] dark:text-white"
                            : "bg-[#1D3A76] text-white dark:bg-purple-900 dark:text-purple-200"
                        }`}
                      >
                        {formatPackageName(sub.subscription_package === 'prime_plus' ? 'Prime Plus' : sub.subscription_package)}
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
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.payment_mode}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.payment_gateway}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.gst_number}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.payment_amount}
                      </TableCell>
                      {status?.toLowerCase() === "success" && (
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.invoice_number}
                      </TableCell>
                      )}
                      {(status?.toLowerCase() === "processing" ) && (
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setDropdownOpen(
                              dropdownOpen === sub.id.toString()
                                ? null
                                : sub.id.toString()
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
                        {dropdownOpen === sub.id.toString() && (
                          <div
                            ref={dropdownRef}
                            className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10"
                          >
                            <button
                              onClick={() =>
                                handleApprove(sub.user_id, sub.name, "approve")
                              }
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleApprove(sub.user_id, sub.name, "reject")
                              }
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </>
                     </TableCell>
                     
                      )}
                      {(status?.toLowerCase() === "success") && (
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setDropdownOpen(
                              dropdownOpen === sub.id.toString()
                                ? null
                                : sub.id.toString()
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
                        {dropdownOpen === sub.id.toString() && (
                          <div
                            ref={dropdownRef}
                            className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20"
                          >
                            <button
                              onClick={() =>
                                handleInvoice(sub)
                              }
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              View Invoice
                            </button>
                           
                          </div>
                        )}
                      </>
                     </TableCell>
                     
                      )}
                      
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ComponentCard>
        <ConfirmStatusModal
            isOpen={isStatusModalOpen}
            propertyName={selectedSubscription?.name || ""}
            action={statusAction || "approve"} // Fallback to "approve" if null
            onConfirm={confirmStatusChange}
            onCancel={() => {
              setIsStatusModalOpen(false);
              setSelectedSubscription(null);
              setStatusAction(null);
            }}
        />
      </div>
    </div>
    
  );
};

export default PaymentSuccessUsers;
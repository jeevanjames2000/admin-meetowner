import {  useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsersByType } from "../../../store/slices/users";
import { RootState, AppDispatch } from "../../../store/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Button from "../../ui/button/Button";
import { MoreVertical } from "lucide-react";
import ComponentCard from "../../common/ComponentCard";
import PageBreadcrumbList from "../../common/PageBreadCrumbLists";
import { clearMessages, deleteEmployee, } from "../../../store/slices/employee";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "../../common/ConfirmDeleteModal";
import Select from "../../form/Select";
import DatePicker from "../../form/date-picker";



// User type mapping
const userTypeMap: { [key: number]: string } = {
  1: "Admin",
  2: "User",
  3: "Builder",
  4: "Agent",
  5: "Owner",
  6: "Channel Partner",
  7: "Manager",
  8: "Telecaller",
  9: "Marketing Executive",
  10: "Customer Support",
  11: "Customer Service",
};

const paymentStatusOptions: { value: string; label: string }[] = [
  { value: "All", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

// Format date function
const formatDate = (dateString: string | null): string => {
  if (!dateString) return "N/A"; // Handle null or undefined
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date"; // Handle invalid dates
    return date.toISOString().split("T")[0];
  } catch {
    return "Invalid Date"; // Handle parsing errors
  }
};

export default function BasicTableOne() {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { users, loading, error } = useSelector((state: RootState) => state.users);
  const { deleteError, deleteSuccess, } = useSelector(
    (state: RootState) => state.employee
  );
  const pageuserType = useSelector((state: RootState) => state.auth.user?.user_type);

  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [filterValue, setFilterValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<{ id: number; name: string } | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("");



  const itemsPerPage = 10;

  const queryParams = new URLSearchParams(location.search);
  const userType = queryParams.get("userType");
  const categoryLabel = userTypeMap[parseInt(userType || "0")] || "User";

  // Define specific user types for GST and RERA numbers
  const specificUserTypes = [3, 4, 5, 6]; // Builder, Agent, Owner, Channel Partner
  const showGstNumber = userType && specificUserTypes.includes(parseInt(userType));
  const showReraNumber = userType && specificUserTypes.includes(parseInt(userType));

  // Condition to show Mobile and Email columns
  const showMobileAndEmail = pageuserType === 7 && userType !== null && parseInt(userType) === 2;


  useEffect(() => {
    if (userType) {
      dispatch(fetchUsersByType({ user_type: parseInt(userType) }));
    }
  }, [dispatch, userType]);
  
  useEffect(() => {
  setCurrentPage(1); // Reset to page 1 when filters change
}, [paymentStatus, startDate, endDate]);

  useEffect(() => {
    if (deleteSuccess) {
      toast.success(deleteSuccess);
      if (userType) {
        dispatch(fetchUsersByType({ user_type: parseInt(userType) })).then(() => {
          dispatch(clearMessages());
        });
      }
    }
    if (deleteError) {
      toast.error(deleteError);
      dispatch(clearMessages());
    }
   
    
  }, [deleteSuccess, deleteError,  dispatch, userType]);

  const handleEditUser = (user: any) => {
    navigate("/edit-user-details", { state: { user } });
  };

  const handleDeleteClick = (user: { id: number; name: string }) => {
    setUserToDelete({ id: user.id, name: user.name });
    setIsDeleteModalOpen(true);
    setActiveMenu(null);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      dispatch(deleteEmployee(userToDelete.id));
    }
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const filteredUsers = useMemo(
  () =>
    users && Array.isArray(users)
      ? users.filter((user) => {
          const searchableFields = [
            user.name,
            ...(showMobileAndEmail ? [] : [user.mobile, user.email]),
            user.city,
            user.state,
            user.address,
            user.pincode,
            user.gst_number,
            user.rera_number,
          ];
          const matchesSearch = searchableFields
            .filter((field): field is string => field !== null && field !== undefined)
            .map((field) => field.toLowerCase())
            .some((field) => field.includes(filterValue.toLowerCase()));

          // Payment status filter
          const matchesPaymentStatus =
            paymentStatus === "" || // Treat empty as "All"
            paymentStatus === "All" ||
            (paymentStatus === "active" && user.subscription_status === "active") ||
            (paymentStatus === "inactive" &&
              (user.subscription_status === "inactive" || user.subscription_status === null));

          // Date range filter
          let matchesDate = true;
          if (startDate || endDate) {
            if (!user.created_date) {
              matchesDate = false; // Exclude null created_date when date filter is active
            } else {
              try {
                const userDate = user.created_date.split("T")[0]; // Extract YYYY-MM-DD
                matchesDate =
                  (!startDate || userDate >= startDate) &&
                  (!endDate || userDate <= endDate);
              } catch {
                matchesDate = false; // Exclude invalid dates
              }
            }
          }

          return matchesSearch && matchesPaymentStatus && matchesDate;
        })
      : [],
  [users, filterValue, paymentStatus, startDate, endDate, showMobileAndEmail]
);




  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const toggleMenu = (id: number) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  const handleFilter = (value: string) => {
    setFilterValue(value);
    setCurrentPage(1);
  };

  

  const handleUserClick = (userId: number, userType: number, name: string) => {
    if ([2,3, 4, 5, 6].includes(userType)) {
      navigate(`/user/propertyDetails?userId=${userId}&name=${encodeURIComponent(name)}`);
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

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  
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

  return (
    <div className="relative min-h-screen">
      <PageBreadcrumbList
        pageTitle={`${categoryLabel} Table`}
        pagePlacHolder="Filter users by name, mobile, email, city"
        onFilter={handleFilter}
      />
    
         <div className="flex justify-between gap-3 py-2">
              <div className="w-auto flex gap-3">
                <div className="w-auto">
               {[2, 3, 4, 5, 6].includes(parseInt(userType || "0")) && (
                  <div className="w-auto">
                    <Select
                      options={paymentStatusOptions}
                      placeholder="Select Payment Status"
                      onChange={(value: string) => setPaymentStatus(value)}
                      value={paymentStatus}
                      className="dark:bg-dark-900"
                    />
                  </div>
                )}
                </div>
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
                      setPaymentStatus(""); // Reset to empty for placeholder
                      setStartDate(null);
                      setEndDate(null);
                      setFilterValue("");
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2"
                  >
                    Clear Filters
                  </Button>
              </div>
            </div>
    
       
        {(paymentStatus || startDate || endDate || filterValue) && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Filters: {paymentStatus || "All"} | Date: {startDate || "Any"} to {endDate || "Any"} | Search: {filterValue || "None"}
        </div>
      )}


      {deleteSuccess && (
        <div className="p-3 bg-green-100 text-green-700 rounded-md">{deleteSuccess}</div>
      )}
      {deleteError && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">{deleteError}</div>
      )}
      

      <div className="space-y-6">
        <ComponentCard title={`${categoryLabel} Table`}>
          <div className="overflow-visible relative rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full ">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
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
                       Id
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Name
                    </TableCell>
                    {!showMobileAndEmail && (
                      <>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Mobile
                        </TableCell>
                      </>
                    )}
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
                      State
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Paynment Status
                    </TableCell>
                    {showGstNumber && (
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        GST Number
                      </TableCell>
                    )}
                    {showReraNumber && (
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        RERA Number
                      </TableCell>
                    )}
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Since
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
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginatedUsers.map((user,index) => (
                    <TableRow key={user.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {user.id}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div
                          className="flex items-center gap-3"
                          onClick={() => handleUserClick(user.id, user.user_type, user.name)}
                        >
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90 cursor-pointer hover:underline">
                              {user.name}
                            </span>
                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                              {userTypeMap[user.user_type] || "Unknown"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      {!showMobileAndEmail && (
                        <>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {user.mobile}
                          </TableCell>
                        </>
                      )}
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {user.address}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {user.city}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {user.state}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {user.subscription_status}
                      </TableCell>
                      {showGstNumber && (
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {user.gst_number || "N/A"}
                        </TableCell>
                      )}
                      {showReraNumber && (
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {user.rera_number || "N/A"}
                        </TableCell>
                      )}
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(user.created_date)}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 0
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : user.status === 2
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : user.status === 3
                              ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {user.status === 0
                            ? "Active"
                            : user.status === 2
                            ? "Suspended"
                            : user.status === 3
                            ? "Blocked"
                            : user.status === null
                            ? "N/A"
                            : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                        <Button variant="outline" size="sm" onClick={() => toggleMenu(user.id)}>
                          <MoreVertical className="size-5 text-gray-500 dark:text-gray-400" />
                        </Button>
                        {activeMenu === user.id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                            <div className="py-2">
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                 onClick={() => handleEditUser(user)}
                              >
                                Edit
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                 onClick={() => handleDeleteClick(user)}
                              >
                                Delete
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                // onClick={() => handleStatusChangeClick(user)}
                              >
                                {user.status === 0 ? "Suspend" : "Activate"}
                              </button>
                            </div>
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
                {/* Previous Button */}
                <Button
                  variant={currentPage === 1 ? "outline" : "primary"}
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                {/* Page Buttons */}
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

                {/* Next Button */}
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


          <ConfirmDeleteModal
            isOpen={isDeleteModalOpen}
            propertyName={userToDelete?.name || ""}
            onConfirm={confirmDelete}
            onCancel={() => {
              setIsDeleteModalOpen(false);
              setUserToDelete(null);
            }}
          />

         

         
        </ComponentCard>
      </div>
    </div>
  );
}



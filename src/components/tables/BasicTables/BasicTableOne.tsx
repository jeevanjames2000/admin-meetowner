import {  useEffect, useState } from "react";
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


// Format date function
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
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
  


  const filteredUsers = users.filter((user) => {
    const searchableFields = [
      user.name,
      ...(showMobileAndEmail ? [] : [user.mobile, user.email]),
      user.city,
      user.state,
    ];
    return searchableFields
      .map((field) => field?.toLowerCase() || "")
      .some((field) => field.includes(filterValue.toLowerCase()));
  });




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

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleUserClick = (userId: number, userType: number, name: string) => {
    if ([3, 4, 5, 6].includes(userType)) {
      navigate(`/user/propertyDetails?userId=${userId}&name=${encodeURIComponent(name)}`);
    }
  };

  const getPaginationItems = () => {
    const pages = [];
    const totalVisiblePages = 7;
    let startPage = Math.max(1, currentPage - Math.floor(totalVisiblePages / 2));
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

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="relative min-h-screen">
      <PageBreadcrumbList
        pageTitle={`${categoryLabel} Table`}
        pagePlacHolder="Filter users by name, mobile, email, city"
        onFilter={handleFilter}
      />

      {deleteSuccess && (
        <div className="p-3 bg-green-100 text-green-700 rounded-md">{deleteSuccess}</div>
      )}
      {deleteError && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">{deleteError}</div>
      )}
      

      <div className="space-y-6">
        <ComponentCard title={`${categoryLabel} Table`}>
          <div className="overflow-visible relative rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
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
                      User
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
                      Pincode
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
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
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
                        {user.pincode}
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
                    <span key={index} className="px-3 py-1 text-gray-500 dark:text-gray-400">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={page}
                      variant={page === currentPage ? "primary" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page as number)}
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



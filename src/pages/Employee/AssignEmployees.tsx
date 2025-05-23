import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router"; // Use useParams for route parameters
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import PageBreadcrumbList from "../../components/common/PageBreadCrumbLists";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker";
import Button from "../../components/ui/button/Button";
import ComponentCard from "../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { fetchEmployeeById } from "../../store/slices/employeeUsers";
import { formatDate } from "../../hooks/FormatDate";

const userTypeMap: { [key: number]: string } = {
  7: "Manager",
  8: "Telecaller",
  9: "Marketing Executive",
  10: "Customer Support",
};

const paymentStatusOptions: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const userTypeOptions: { value: string; label: string }[] = [
  { value: "", label: "All Users" },
  { value: "2", label: "User" },
  { value: "3", label: "Builder" },
  {value:"4",label:"Agent"},
  {value:"5",label:"Owner"},
  {value:"6",label:"Channel Partner"}
];

export default function AssignEmployees() {
  const { id } = useParams<{ id: string }>(); // Get id from route parameter
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading: usersLoading, error: usersError } = useSelector(
    (state: RootState) => state.employeeUsers
  );

  const [filterValue, setFilterValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [selectedUserType, setSelectedUserType] = useState<string>("");

  const itemsPerPage = 10;

  // Fetch employee by ID
  useEffect(() => {
    if (id) {
      dispatch(fetchEmployeeById({ id: parseInt(id) }));
    }
  }, [dispatch, id]);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterValue, paymentStatus, selectedUserType, startDate, endDate]);

  // Flatten and filter assigned_users
  const filteredAssignedUsers = useMemo(() => {
    const allAssignedUsers = users
      .flatMap((user) => user.assigned_users || [])
      .map((assignedUser) => ({
        ...assignedUser,
        parentUser: users.find((user) =>
          user.assigned_users?.some((u) => u.id === assignedUser.id)
        ),
      }));

    return allAssignedUsers.filter((assignedUser) => {
      const searchableFields = [
        assignedUser.name,
        assignedUser.mobile,
        assignedUser.email,
        assignedUser.city,
        assignedUser.address,
      ];
      const matchesSearch = searchableFields
        .filter((field): field is string => field !== null && field !== undefined)
        .map((field) => field.toLowerCase())
        .some((field) => field.includes(filterValue.toLowerCase()));

      const matchesUserType =
        selectedUserType === "" ||
        assignedUser.user_type.toString() === selectedUserType;

      const matchesPaymentStatus =
        paymentStatus === "" ||
        paymentStatus === "All" ||
        (paymentStatus === "active" && assignedUser.subscription_status === "active") ||
        (paymentStatus === "inactive" &&
          (assignedUser.subscription_status === "inactive" ||
            assignedUser.subscription_status === null));

      let matchesDate = true;
      if (startDate || endDate) {
        if (!assignedUser.created_date) {
          matchesDate = false;
        } else {
          try {
            const userDate = assignedUser.created_date.split("T")[0];
            matchesDate =
              (!startDate || userDate >= startDate) &&
              (!endDate || userDate <= endDate);
          } catch {
            matchesDate = false;
          }
        }
      }

      return matchesSearch && matchesUserType && matchesPaymentStatus && matchesDate;
    });
  }, [users, filterValue, selectedUserType, paymentStatus, startDate, endDate]);

  const totalItems = filteredAssignedUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedAssignedUsers = filteredAssignedUsers.slice(startIndex, endIndex);

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

  if (!id) return <div>Please provide an employee ID in the URL</div>;
  if (usersLoading) return <div>Loading assigned users...</div>;
  if (usersError) return <div>Error: {usersError}</div>;
  if (users.length === 0) return <div>No assigned users found for this employee</div>;

  return (
    <div className="relative min-h-screen">
      <PageBreadcrumbList
        pageTitle="Assigned Users Table"
        pagePlacHolder="Filter assigned users by name, mobile, email, city, address"
        onFilter={handleFilter}
      />

      <div className="flex flex-col sm:flex-row justify-between gap-3 py-2">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-43">
            <Select
              options={userTypeOptions}
              placeholder="Select User Type"
              onChange={(value: string) => setSelectedUserType(value)}
              value={selectedUserType}
              className="dark:bg-dark-900"
            />
          </div>
          <div className="w-full sm:w-43">
            <Select
              options={paymentStatusOptions}
              placeholder="Select Payment Status"
              onChange={(value: string) => setPaymentStatus(value)}
              value={paymentStatus}
              className="dark:bg-dark-900"
            />
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
              setFilterValue("");
              setSelectedUserType("");
              setPaymentStatus("");
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

      {(filterValue || selectedUserType || paymentStatus || startDate || endDate) && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Filters: User Type: {selectedUserType || "All"} | 
          Payment Status: {paymentStatus || "All"} | 
          Date: {startDate || "Any"} to {endDate || "Any"} | 
          Search: {filterValue || "None"}
        </div>
      )}

      <div className="space-y-6">
        <ComponentCard title="Assigned Users Table">
          <div className="overflow-visible relative rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-auto">
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
                      Payment Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Assigned Employee
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Created Date
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginatedAssignedUsers.map((assignedUser, index) => (
                    <TableRow key={`${assignedUser.id}-${index}`}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {assignedUser.id}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {assignedUser.name}
                            </span>
                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                              User Type: {userTypeOptions.find(opt => opt.value === assignedUser.user_type.toString())?.label || assignedUser.user_type}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {assignedUser.mobile}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {assignedUser.address || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {assignedUser.city || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {assignedUser.subscription_status || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                        <span className="text-gray-500">
                          {assignedUser.assigned_emp_name || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(assignedUser.created_date)}
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
}
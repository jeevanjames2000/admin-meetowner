import { useState, useEffect, useRef, useMemo } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchAllEmployees, deleteEmployee, clearMessages, updateEmployee } from "../../store/slices/employee";
import PageBreadcrumbList from "../../components/common/PageBreadCrumbLists";
import { useNavigate } from "react-router";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker";

interface SelectOption {
  value: string;
  label: string;
}

const userTypeIdMap: { [key: string]: number } = {
  Manager: 7,
  TeleCaller: 8,
  "Marketing Executive": 9,
  "Customer Support": 10,
  "Customer Service": 11,
};

const designationOptions: SelectOption[] = [
  { value: "", label: "All Designations" },
  ...Object.entries(userTypeIdMap).map(([label, value]) => ({
    value: label,
    label,
  })),
];

const AllEmployees: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { employees, fetchLoading, fetchError, deleteError, deleteSuccess, updateSuccess, updateError } = useSelector(
    (state: RootState) => state.employee
  );

  const [isLoading, setIsLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const dropdownRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [filterValue, setFilterValue] = useState<string>("");
  const [selectedDesignation, setSelectedDesignation] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const transformedEmployees = useMemo(() => {
    return employees.map(emp => {
      const designationText = Object.entries(userTypeIdMap).find(
        ([, id]) => id.toString() === emp.designation
      )?.[0] || emp.designation || '';
      return {
        id: emp.id!,
        name: emp.name,
        mobile: emp.mobile,
        email: emp.email,
        designation: designationText,
        designationValue: designationText, // Store the designation text for filtering (e.g., "Manager")
        city: [emp.city].filter(Boolean),
        state: [emp.state].filter(Boolean),
        status: emp.status,
        pincode: emp.pincode,
        created_by: emp.created_by,
        created_userID: emp.created_userID,
        created_date: emp.created_date, // Ensure this field exists in your employee data
      };
    });
  }, [employees]);

  useEffect(() => {
    setIsLoading(true);
    const userId = parseInt(localStorage.getItem("userId")!);
    dispatch(fetchAllEmployees(userId)).finally(() => {
      setIsLoading(false);
    });
  }, [dispatch]);

  useEffect(() => {
    if (deleteSuccess || updateSuccess) {
      const userId = parseInt(localStorage.getItem("userId")!);
      dispatch(fetchAllEmployees(userId)).then(() => {
        dispatch(clearMessages());
      });
    }
  }, [deleteSuccess, updateSuccess, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      let isOutside = true;
      dropdownRefs.current.forEach((ref) => {
        if (ref && ref.contains(event.target as Node)) {
          isOutside = false;
        }
      });
      if (isOutside) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset currentPage when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterValue, selectedDesignation, startDate, endDate]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return transformedEmployees.filter((employee) => {
      // Search filter
      const matchesSearch = [
        employee.name || "",
        employee.mobile || "",
        employee.designation || "",
        employee.city.join(",") || "",
        employee.state.join(",") || "",
      ].some((field) => field.toLowerCase().includes(filterValue.toLowerCase()));

      // Designation filter
      const matchesDesignation =
        selectedDesignation === null ||
        selectedDesignation === "" ||
        employee.designationValue === selectedDesignation;

      // Date range filter
      let matchesDate = true;
      if (startDate || endDate) {
        if (!employee.created_date) {
          matchesDate = false; // Exclude employees with null created_date
        } else {
          try {
            const employeeDate = employee.created_date.split("T")[0]; // Extract YYYY-MM-DD
            matchesDate =
              (!startDate || employeeDate >= startDate) &&
              (!endDate || employeeDate <= endDate);
          } catch {
            matchesDate = false; // Exclude invalid dates
          }
        }
      }

      return matchesSearch && matchesDesignation && matchesDate;
    });
  }, [transformedEmployees, filterValue, selectedDesignation, startDate, endDate]);

  // Pagination logic
  const totalItems = filteredEmployees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  const handleFilter = (value: string) => {
    setFilterValue(value);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const getPaginationItems = () => {
    const pages: (number | string)[] = [];
    const totalVisiblePages = 5; // Aligned with GeneratePayments
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

  const handleEdit = (employee: any) => {
    navigate("/all-employees/edit-employee", { state: { employee } });
    setDropdownOpen(null);
  };

  const handleDelete = (employeeId: number) => {
    dispatch(deleteEmployee(employeeId)).then((action) => {
      if (deleteEmployee.fulfilled.match(action)) {
        console.log("Delete successful, employeeId:", employeeId);
      } else if (deleteEmployee.rejected.match(action)) {
        console.log("Delete failed:", deleteError);
      }
    });
    setDropdownOpen(null);
  };

  const handleStatusChange = (employee: any) => {
    const updatedEmployee = {
      ...employee,
      status: employee.status === 0 ? 2 : 0,
      city: employee.city[0],
      state: employee.state[0],
      user_type: userTypeIdMap[employee.designation] || "7", // Use userTypeIdMap
      created_by: localStorage.getItem("name"),
      created_userID: parseInt(localStorage.getItem("userId")!),
    };
    dispatch(updateEmployee(updatedEmployee)).then((action) => {
      if (updateEmployee.fulfilled.match(action)) {
        console.log("Status update successful, employeeId:", employee.id);
      } else if (updateEmployee.rejected.match(action)) {
        console.log("Status update failed:", updateError);
      }
    });
    setDropdownOpen(null);
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

  const handleClearFilters = () => {
    setFilterValue("");
    setSelectedDesignation(null);
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);
  };

  if (isLoading || fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        <div className="text-2xl font-bold text-gray-800 dark:text-white">Loading...</div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Error: {fetchError}</h2>
      </div>
    );
  }

  if (!employees.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          No Employees Available
        </h2>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <PageMeta title="Meet Owner All Employees" />
      <PageBreadcrumbList
        pageTitle="All Employees"
        pagePlacHolder="Search employees by name, mobile, designation, city, or state"
        onFilter={handleFilter}
      />
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 py-2">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-43"> {/* Aligned with GeneratePayments */}
              <Select
                options={designationOptions}
                placeholder="Select Designation"
                onChange={(value: string) => setSelectedDesignation(value || null)}
                value={selectedDesignation || ""}
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
              onClick={handleClearFilters}
              className="px-4 py-2 w-full sm:w-auto"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Filter Summary */}
        {(filterValue || selectedDesignation || startDate || endDate) && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Filters: {selectedDesignation || "All"} | 
            Date: {startDate || "Any"} to {endDate || "Any"} | 
            Search: {filterValue || "None"}
          </div>
        )}

        {deleteSuccess && (
          <div className="p-3 bg-green-100 text-green-700 rounded-md">
            {deleteSuccess}
          </div>
        )}
        {deleteError && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md">
            {deleteError}
          </div>
        )}
        {updateSuccess && (
          <div className="p-3 bg-green-100 text-green-700 rounded-md">
            {updateSuccess}
          </div>
        )}
        {updateError && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md">
            {updateError}
          </div>
        )}
        
        <ComponentCard title="All Employees">
          <div className="overflow-visible relative rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Employee ID</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Mobile</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email ID</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">City</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">State</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Since </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginatedEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{employee.id}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative group">
                        <div>

                       
                        <span className="text-black dark:text-gray-400 cursor-default">
                          {employee.name}
                        </span>
                         <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                              {employee.designation}
                            </span>
                         </div>
                        <div className="absolute z-10 w-64 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 left-0 top-full mt-1 hidden group-hover:block">
                          <div className="text-sm text-gray-800 dark:text-gray-200">
                            <p className="font-semibold">Created By: <span className="font-normal">{employee.created_by}</span></p>
                          </div>
                          <div className="absolute top-[-6px] left-10 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white dark:border-b-gray-800" />
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{employee.mobile}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{employee.email}</TableCell>
                     
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{employee.city.join(",")}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{employee.state.join(",")}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{formatDate(employee.created_date!)}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          employee.status === 0 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                          employee.status === 2 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                          employee.status === 3 ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" :
                          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}>
                          {employee.status === 0 ? "Active" :
                           employee.status === 2 ? "Suspended" :
                           employee.status === 3 ? "Deleted" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        <div className="relative" ref={(el) => el && dropdownRefs.current.set(employee.id, el)}>
                          <button
                            onClick={() => setDropdownOpen(dropdownOpen === employee.id ? null : employee.id)}
                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          {dropdownOpen === employee.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 dark:bg-gray-800">
                              <div className="py-1">
                                <button
                                  onClick={() => handleEdit(employee)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(employee.id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={() => handleStatusChange(employee)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                  {employee.status === 0 ? "Suspend" : "Activate"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
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
                    <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500 dark:text-gray-400">...</span>
                  ) : (
                    <Button
                      key={page}
                      variant={page === currentPage ? "primary" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page as number)}
                      className={page === currentPage ? "bg-[#1D3A76] text-white" : "text-gray-500"}
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

export default AllEmployees;
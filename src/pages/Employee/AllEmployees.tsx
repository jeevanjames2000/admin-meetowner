import { useState, useEffect, useRef } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button"; // Add Button import
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchAllEmployees, deleteEmployee, clearMessages, updateEmployee } from "../../store/slices/employee";
import PageBreadcrumbList from "../../components/common/PageBreadCrumbLists";
import { useNavigate } from "react-router";

interface Option {
  value: string;
  text: string;
}

const designationOptions: Option[] = [
 
  { value: "7", text: "Manager" },
  { value: "8", text: "TeleCaller" },
  { value: "9", text: "Marketing Executive" },
  { value: "10", text: "Customer Support" },
  { value: "11", text: "Customer Service" },
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const transformedEmployees = employees.map(emp => ({
    id: emp.id!,
    name: emp.name,
    mobile: emp.mobile,
    email: emp.email,
    designation: designationOptions.find(opt => opt.value === emp.designation)?.text || emp.designation || '',
    city: [emp.city],
    state: [emp.state],
    status: emp.status,
    pincode: emp.pincode,
    created_by: emp.created_by , // Ensure this field exists in your employee data
    created_userID: emp.created_userID, 
  }));
 

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

  // Search filter
  const filteredEmployees = transformedEmployees.filter((employee) =>
    [
      employee.name || "",
      employee.mobile || "",
      employee.designation || "",
      employee.city.join(",") || "",
      employee.state.join(",") || "",
    ].some((field) => field.toLowerCase().includes(filterValue.toLowerCase()))
  );

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
    const pages = [];
    const totalVisiblePages = 7;
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > totalVisiblePages) {
      const halfVisible = Math.floor(totalVisiblePages / 2);
      startPage = Math.max(1, currentPage - halfVisible);
      endPage = Math.min(totalPages, currentPage + halfVisible);

      if (currentPage - halfVisible < 1) {
        endPage = totalVisiblePages;
      }
      if (currentPage + halfVisible > totalPages) {
        startPage = totalPages - totalVisiblePages + 1;
      }
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
      user_type: designationOptions.find(opt => opt.text === employee.designation)?.value || "7",
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

  if (isLoading || fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        <div className="text-2xl font-boldРусский text-gray-800 dark:text-white">Loading...</div>
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
            <div className="max-w-full ">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Employee ID</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Mobile</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email ID</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Designation</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">City</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">State</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Pincode</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginatedEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{employee.id}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative group">
                        <span className="text-black dark:text-gray-400 cursor-default">
                          {employee.name}
                        </span>
                        <div className="absolute z-10 w-64 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 left-0 top-full mt-1 hidden group-hover:block">
                          <div className="text-sm text-gray-800 dark:text-gray-200">
                            <p className="font-semibold">Created By: <span className="font-normal">{employee.created_by}</span></p>
                           
                          </div>
                          {/* Triangle pointer */}
                          <div className="absolute top-[-6px] left-10 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white dark:border-b-gray-800" />
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{employee.mobile}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{employee.email}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{employee.designation}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{employee.city.join(",")}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{employee.state.join(",")}</TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{employee.pincode}</TableCell>
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
                    <span key={index} className="px-3 py-1 text-gray-500 dark:text-gray-400">...</span>
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
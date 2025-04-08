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
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchAllEmployees,deleteEmployee, clearMessages, updateEmployee } from "../../store/slices/employee";
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
  const { employees, fetchLoading, fetchError,deleteError,deleteSuccess,updateSuccess,updateError, } = useSelector((state: RootState) => state.employee);
  
  const [isLoading, setIsLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const dropdownRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const transformedEmployees = employees.map(emp => ({
    id: emp.id!,
    name: emp.name,
    mobile: emp.mobile,
    email: emp.email,
    designation: designationOptions.find(opt => opt.value === emp.designation)?.text || emp.designation || '',
    city: [emp.city],
    state: [emp.state],
    status: emp.status,
    pincode:emp.pincode,
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
        dispatch(clearMessages()); // Clear messages after refresh
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
    // Create a copy of the employee object with updated status
    const updatedEmployee = {
      ...employee,
     
      status: employee.status === 0 ? 2 : 0, 
      city: employee.city[0], 
      state: employee.state[0], 
      user_type: designationOptions.find(opt => opt.text === employee.designation)?.value || "7",
      created_by: localStorage.getItem("name"),
      created_userID: parseInt(localStorage.getItem("userId")!), 
    };
    console.log(updatedEmployee);

   
    dispatch(updateEmployee(updatedEmployee)).then((action) => {
      if (updateEmployee.fulfilled.match(action)) {
        console.log("Status update successful, employeeId:", employee.employeeId);
      } else if (updateEmployee.rejected.match(action)) {
        console.log("Status update failed:", updateError);
      }
    });
    setDropdownOpen(null);
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
      <PageBreadcrumbList pageTitle="All Employees" pagePlacHolder="Filter employees" />
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
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Employee ID
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
                      Email ID
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Designation
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
                  {transformedEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {employee.id}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {employee.name}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {employee.mobile}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {employee.email}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {employee.designation}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {employee.city.join(",")}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {employee.state.join(",")}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {employee.pincode}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            employee.status === 0
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : employee.status === 2
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : employee.status === 3
                              ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {employee.status === 0
                            ? "Active"
                            : employee.status === 2
                            ? "Suspended"
                            : employee.status === 3
                            ? "Deleted"
                            : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        <div
                          className="relative"
                          ref={(el) => el && dropdownRefs.current.set(employee.id, el)}
                        >
                          <button
                            onClick={() =>
                              setDropdownOpen(
                                dropdownOpen === employee.id ? null : employee.id
                              )
                            }
                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <svg
                              className="w-5 h-5 text-gray-500 dark:text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
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
                                <button onClick={()=> handleDelete(employee.id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                  Delete
                                </button>
                                <button onClick={()=> handleStatusChange(employee)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                 {employee.status === 0
                            ? "Suspend"
                            : "Activate"}
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
        </ComponentCard>
      </div>
    </div>
  );
};

export default AllEmployees;
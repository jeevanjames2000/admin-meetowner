import { useState, useEffect, useRef } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import MultiSelect from "../../components/form/MultiSelect";
import Button from "../../components/ui/button/Button";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { getCities, getStates } from "../../store/slices/propertyDetails";

// Define the type for employee data with multi-select fields
interface Employee {
  employeeId: number;
  name: string;
  mobile: string;
  emailId: string;
  designation: string[];
  city: string[];
  state: string[];
  status: "Active" | "Inactive";
}

// Interface for MultiSelect options
interface Option {
  value: string;
  text: string;
}

// Predefined options for designations
const designationOptions: Option[] = [
  { value: "manager", text: "Manager" },
  { value: "telecaller", text: "TeleCaller" },
  { value: "marketing", text: "Marketing Executive" },
  { value: "customer-support", text: "Customer Support" },
  { value: "customer-service", text: "Customer Service" },
];

// Custom city options for table
const cityOptionsCustom: Option[] = [
  { value: "hyderabad", text: "Hyderabad" },
  { value: "bangalore", text: "Bangalore" },
  { value: "chennai", text: "Chennai" },
  { value: "visakhapatnam", text: "Visakhapatnam" },
];

// Custom state options for table
const stateOptionsCustom: Option[] = [
  { value: "telangana", text: "Telangana" },
  { value: "andhra-pradesh", text: "Andhra Pradesh" },
  { value: "karnataka", text: "Karnataka" },
  { value: "tamilnadu", text: "Tamilnadu" },
];

// Generate random employee data
const generateRandomData = (
  cityOptionsCustom: Option[],
  stateOptionsCustom: Option[]
): Employee[] => {
  const names = [
    "Ravi Kumar",
    "Sneha Reddy",
    "Arjun Patel",
    "Priya Sharma",
    "Vikram Singh",
    "Anita Desai",
    "Kiran Rao",
    "Meera Nair",
    "Suresh Gupta",
    "Neha Joshi",
  ];

  const mobiles = [
    "9876543210",
    "8765432109",
    "7654321098",
    "6543210987",
    "5432109876",
    "4321098765",
    "3210987654",
    "2109876543",
    "1098765432",
    "0987654321",
  ];

  const emails = [
    "ravi.kumar@example.com",
    "sneha.reddy@example.com",
    "arjun.patel@example.com",
    "priya.sharma@example.com",
    "vikram.singh@example.com",
    "anita.desai@example.com",
    "kiran.rao@example.com",
    "meera.nair@example.com",
    "suresh.gupta@example.com",
    "neha.joshi@example.com",
  ];

  const data: Employee[] = [];
  for (let i = 1; i <= 10; i++) {
    data.push({
      employeeId: i,
      name: names[i - 1],
      mobile: mobiles[i - 1],
      emailId: emails[i - 1],
      designation: [
        designationOptions[Math.floor(Math.random() * designationOptions.length)].value,
      ],
      city: [cityOptionsCustom[Math.floor(Math.random() * cityOptionsCustom.length)].value],
      state: [
        stateOptionsCustom[Math.floor(Math.random() * stateOptionsCustom.length)].value,
      ],
      status: "Active",
    });
  }
  return data;
};

const AllEmployees: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { cities, states } = useSelector((state: RootState) => state.property);

  // Define cityOptions and stateOptions from API for edit modal
  const cityOptions: Option[] =
    cities?.map((city: any) => ({
      value: city.value,
      text: city.label,
    })) || [];

  const stateOptions: Option[] =
    states?.map((state: any) => ({
      value: state.value,
      text: state.label,
    })) || [];

  const [employeesList, setEmployeesList] = useState<Employee[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const dropdownRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Fetch cities and states for edit modal
  useEffect(() => {
    dispatch(getCities());
    dispatch(getStates());
  }, [dispatch]);

  // Generate initial data using custom options (not dependent on API)
  useEffect(() => {
    setEmployeesList(generateRandomData(cityOptionsCustom, stateOptionsCustom));
  }, []); // Empty dependency array since we only need this once on mount

  // Handle clicking outside the dropdown to close it
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

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee({ ...employee });
    setIsEditModalOpen(true);
    setDropdownOpen(null);
  };

  const handleDelete = (employeeId: number) => {
    setEmployeesList(employeesList.filter((emp) => emp.employeeId !== employeeId));
    setDropdownOpen(null);
  };

  const handleToggleSuspend = (employee: Employee) => {
    setEmployeesList(
      employeesList.map((emp) =>
        emp.employeeId === employee.employeeId
          ? { ...emp, status: emp.status === "Active" ? "Inactive" : "Active" }
          : emp
      )
    );
    setDropdownOpen(null);
  };

  const closeModal = () => {
    setIsEditModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleSave = () => {
    if (selectedEmployee) {
      setEmployeesList(
        employeesList.map((emp) =>
          emp.employeeId === selectedEmployee.employeeId ? { ...selectedEmployee } : emp
        )
      );
    }
    closeModal();
  };

  const handleInputChange = (field: keyof Employee, value: string | string[]) => {
    if (selectedEmployee) {
      setSelectedEmployee({ ...selectedEmployee, [field]: value });
    }
  };

  if (!employeesList || employeesList.length === 0) {
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
      <PageMeta title="All Employees" description="This is the All Employees Table page" />
      <PageBreadcrumb pageTitle="All Employees" pagePlacHolder="Filter employees" />
      <div className="space-y-6">
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
                  {employeesList.map((employee) => (
                    <TableRow key={employee.employeeId}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {employee.employeeId}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {employee.name}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {employee.mobile}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {employee.emailId}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {employee.designation
                          .map(
                            (val) =>
                              designationOptions.find((opt) => opt.value === val)?.text || val
                          )
                          .join(", ")}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {employee.city
                          .map(
                            (val) =>
                              cityOptionsCustom.find((opt) => opt.value === val)?.text || val
                          )
                          .join(", ")}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {employee.state
                          .map(
                            (val) =>
                              stateOptionsCustom.find((opt) => opt.value === val)?.text || val
                          )
                          .join(", ")}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            employee.status === "Active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {employee.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        <div
                          className="relative"
                          ref={(el) => el && dropdownRefs.current.set(employee.employeeId, el)} // Add ref here
                        >
                          <button
                            onClick={() =>
                              setDropdownOpen(
                                dropdownOpen === employee.employeeId ? null : employee.employeeId
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
                          {dropdownOpen === employee.employeeId && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 dark:bg-gray-800">
                              <div className="py-1">
                                <button
                                  onClick={() => handleEdit(employee)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(employee.employeeId)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={() => handleToggleSuspend(employee)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                  {employee.status === "Active" ? "Suspend" : "Unsuspend"}
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

      {/* Edit Modal */}
      {selectedEmployee && (
        <Modal isOpen={isEditModalOpen} onClose={closeModal} className="max-w-[800px] m-4">
          <div className="no-scrollbar relative w-full max-w-[800px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Edit Employee Information
              </h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                Update employee details to keep the profile up-to-date.
              </p>
            </div>
            <form className="flex flex-col">
              <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                <div className="col-span-2 lg:col-span-1">
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={selectedEmployee.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <Label>Mobile</Label>
                  <Input
                    type="text"
                    value={selectedEmployee.mobile}
                    onChange={(e) => handleInputChange("mobile", e.target.value)}
                  />
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <Label>Email ID</Label>
                  <Input
                    type="email"
                    value={selectedEmployee.emailId}
                    onChange={(e) => handleInputChange("emailId", e.target.value)}
                  />
                </div>
                <div className="col-span-2 lg:col-span-1">
                
                  <MultiSelect
                    label="Designation"
                    options={designationOptions}
                    defaultSelected={selectedEmployee.designation}
                    onChange={(values) => handleInputChange("designation", values)}
                  />
                </div>
                <div className="col-span-2 lg:col-span-1">
                
                  <MultiSelect
                    label="City"
                    options={cityOptions} // Using API-derived options
                    defaultSelected={selectedEmployee.city}
                    onChange={(values) => handleInputChange("city", values)}
                  />
                </div>
                <div className="col-span-2 lg:col-span-1">
                
                  <MultiSelect
                    label="State"
                    options={stateOptions} // Using API-derived options
                    defaultSelected={selectedEmployee.state}
                    onChange={(values) => handleInputChange("state", values)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                <Button size="sm" variant="outline" onClick={closeModal}>
                  Close
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AllEmployees;
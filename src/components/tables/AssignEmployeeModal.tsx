import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { AppDispatch, RootState } from "../../store/store";
import { fetchEmployeeUsersByType, clearEmployeeUsers } from "../../store/slices/employeeUsers";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import Select from "../form/Select";

interface AssignEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToAssign: { id: number; name: string } | null;
}

interface FormData {
  packageFor: string;
  selectedUser: string;
}

interface Errors {
  packageFor?: string;
  selectedUser?: string;
}

const userTypeIdMap: { [key: string]: number } = {
  Manager: 7,
  Telecaller: 8,
  "Marketing Executive": 9,
  "Customer Support": 10,
  "Customer Service": 11,
};

export default function AssignEmployeeModal({
  isOpen,
  onClose,
  userToAssign,
}: AssignEmployeeModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading: usersLoading, error: usersError } = useSelector(
    (state: RootState) => state.employeeUsers
  );

  const [formData, setFormData] = useState<FormData>({
    packageFor: "",
    selectedUser: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Fetch users when packageFor changes
  useEffect(() => {
    const userTypeId = userTypeIdMap[formData.packageFor];
    if (userTypeId) {
      dispatch(fetchEmployeeUsersByType({ user_type: userTypeId }));
    }
  }, [dispatch, formData.packageFor]);

  // Clear users when modal closes
  useEffect(() => {
    if (!isOpen) {
      dispatch(clearEmployeeUsers());
    }
  }, [isOpen, dispatch]);

  // Filter users based on search term
  const filteredUserOptions = users.filter(
    (user) =>
      (user.name?.toLowerCase()?.includes(userSearchTerm.toLowerCase()) ||
        user.mobile?.toLowerCase()?.includes(userSearchTerm.toLowerCase())) ??
      false
  );

  const handlePackageForChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      packageFor: value,
      selectedUser: "", // Reset selected user when package type changes
    }));
    setUserSearchTerm("");
    setIsUserDropdownOpen(false);
    setErrors((prev) => ({ ...prev, packageFor: undefined }));
  };

  const handleUserSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserSearchTerm(e.target.value);
    setIsUserDropdownOpen(true);
    setErrors((prev) => ({ ...prev, selectedUser: undefined }));
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen((prev) => !prev);
  };

  const handleUserSelect = (user: any) => {
    setFormData((prev) => ({ ...prev, selectedUser: user.id.toString() }));
    setUserSearchTerm(user.name || user.mobile || "");
    setIsUserDropdownOpen(false);
    setErrors((prev) => ({ ...prev, selectedUser: undefined }));
  };

  const validateForm = () => {
    const newErrors: Errors = {};
    if (!formData.packageFor) {
      newErrors.packageFor = "Employee type is required";
    }
    if (!formData.selectedUser) {
      newErrors.selectedUser = "Please select an employee";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && userToAssign) {
      console.log("User to assign ID:", userToAssign.id);
      console.log("Selected employee ID:", formData.selectedUser);
      console.log("Selected package type:", formData.packageFor);
      // Add your assignEmployee dispatch here when ready
      // dispatch(assignEmployee({ userId: userToAssign.id, employeeId: parseInt(formData.selectedUser) }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          aria-label="Close modal"
        >
          <X className="size-5" />
        </button>

        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Assign Employee to {userToAssign?.name || "User"}
        </h2>

        {usersError && (
          <p className="text-red-500 text-sm mb-4">{usersError}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Package For Dropdown */}
          <div className="min-h-[80px]">
            <Label htmlFor="packageFor">Employee Type</Label>
            <Select
              options={Object.keys(userTypeIdMap).map((key) => ({
                value: key,
                label: key,
              }))}
              placeholder="Select Employee Type"
              onChange={handlePackageForChange}
              value={formData.packageFor}
              className="dark:bg-dark-900 focus:ring-2 focus:ring-blue-500"
            />
            {errors.packageFor && (
              <p className="text-red-500 text-sm mt-1">{errors.packageFor}</p>
            )}
          </div>

          {/* User Search Dropdown */}
          <div className="relative min-h-[80px]">
            <Label htmlFor="user-search">Select Employee</Label>
            <div className="relative">
              <input
                id="user-search"
                type="text"
                value={userSearchTerm}
                onChange={handleUserSearchChange}
                onClick={toggleUserDropdown}
                placeholder="Search for an employee..."
                className="block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                disabled={usersLoading || !formData.packageFor}
              />
              <button
                type="button"
                onClick={toggleUserDropdown}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                aria-label="Toggle user dropdown"
                disabled={usersLoading || !formData.packageFor}
              >
                <svg
                  className={`w-4 h-4 transform ${isUserDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isUserDropdownOpen && (
                <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
                  {usersLoading ? (
                    <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      Loading employees...
                    </li>
                  ) : filteredUserOptions.length > 0 ? (
                    filteredUserOptions.map((user) => (
                      <li
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        {[user.name, user.mobile]
                          .filter(Boolean)
                          .join(" (") + (user.mobile ? ")" : "") || "Unknown User"}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      No employees found
                    </li>
                  )}
                </ul>
              )}
            </div>
            {errors.selectedUser && (
              <p className="text-red-500 text-sm mt-1">{errors.selectedUser}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
             
              variant="primary"
              className="px-4 py-2 bg-[#1D3A76] text-white"
              disabled={usersLoading}
            >
              Assign
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
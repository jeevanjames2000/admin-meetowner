import {
  useState,
  useEffect,
  useRef,
  useMemo,
  ChangeEvent,
  FormEvent,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Switch from "../../components/form/switch/Switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { MoreVertical, X } from "lucide-react";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";
import ActiveStatusModal from "../../components/common/ActiveStatusModel";
import { getAllStates } from "../../store/slices/locationsSlice";
import { editPlace } from "../../store/slices/places";
interface State {
  state: string;
  status: string;
}
interface FormData {
  state: string;
  status: string;
}
interface FormErrors {
  state?: string;
}
const StatesManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { states, statesLoading, statesError } = useSelector(
    (state: RootState) => state.locations
  );
  const [filterValue, setFilterValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 10;
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState<boolean>(false);
  const [stateToDelete, setStateToDelete] = useState<State | null>(null);
  const [stateToToggle, setStateToToggle] = useState<State | null>(null);
  const [stateToEdit, setStateToEdit] = useState<State | null>(null);
  const [formData, setFormData] = useState<FormData>({
    state: "",
    status: "inactive",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  useEffect(() => {
    dispatch(getAllStates());
  }, [dispatch]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const filteredStates = useMemo(
    () =>
      states.filter((state) =>
        state.state.toLowerCase().includes(filterValue.toLowerCase())
      ),
    [states, filterValue]
  );
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          if (data) {
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json<State>(sheet, {
              header: ["state", "status"],
              range: 1,
            });
            const validData = jsonData.filter(
              (row) =>
                row.state?.trim() && ["active", "inactive"].includes(row.status)
            );
            toast.success("States uploaded successfully!");
          }
        } catch (error) {
          console.error("Error reading Excel file:", error);
          toast.error("Failed to process Excel file");
        }
      };
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        toast.error("Error reading file");
      };
      reader.readAsBinaryString(file);
    }
  };
  const totalItems = filteredStates.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedStates = filteredStates.slice(startIndex, endIndex);
  const toggleMenu = (index: number) => {
    setActiveMenu(activeMenu === index ? null : index);
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
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const handleStatusChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      status: checked ? "active" : "inactive",
    }));
  };
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.state.trim()) {
      errors.state = "State is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleAddSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      const newState: State = {
        state: formData.state,
        status: formData.status,
      };
      toast.success("State added successfully!");
      setFormData({ state: "", status: "inactive" });
      setFormErrors({});
      setIsAddModalOpen(false);
    }
  };
  const handleEditClick = (state: State) => {
    setStateToEdit(state);
    setFormData({
      state: state.state,
      status: state.status,
    });
    setIsEditModalOpen(true);
    setActiveMenu(null);
  };
  const handleEditSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm() && stateToEdit) {
      const updatedStates = states.map((s) =>
        s.state === stateToEdit.state
          ? { state: formData.state, status: formData.status }
          : s
      );
      dispatch(editPlace(updatedStates));
      toast.success(`State ${formData.state} updated successfully!`);
      setFormData({ state: "", status: "inactive" });
      setFormErrors({});
      setIsEditModalOpen(false);
      setStateToEdit(null);
    }
  };
  const handleDeleteClick = (state: State) => {
    setStateToDelete(state);
    setIsDeleteModalOpen(true);
    setActiveMenu(null);
  };
  const confirmDelete = () => {
    if (stateToDelete) {
      const updatedStates = states.filter(
        (s) => s.state !== stateToDelete.state
      );
      toast.success(`State ${stateToDelete.state} deleted successfully!`);
      setIsDeleteModalOpen(false);
      setStateToDelete(null);
    }
  };
  const handleToggleStatus = (state: State) => {
    if (state.status === "inactive") {
      const updatedStates = states.map((s) =>
        s.state === state.state ? { ...s, status: "active" } : s
      );
      toast.success(`State ${state.state} set to Active!`);
    } else {
      setStateToToggle(state);
      setIsToggleModalOpen(true);
    }
    setActiveMenu(null);
  };
  const confirmToggleStatus = () => {
    if (stateToToggle) {
      const updatedStates = states.map((s) =>
        s.state === stateToToggle.state ? { ...s, status: "inactive" } : s
      );
      dispatch(editPlace(updatedStates));
      toast.success(`State ${stateToToggle.state} set to Inactive!`);
      setIsToggleModalOpen(false);
      setStateToToggle(null);
    }
  };
  if (statesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <ComponentCard title="States Manager">
          <div className="text-center text-gray-500 dark:text-gray-400">
            Loading states...
          </div>
        </ComponentCard>
      </div>
    );
  }
  if (statesError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <ComponentCard title="States Manager">
          <div className="text-center text-red-500 dark:text-red-400">
            Error: {statesError}
          </div>
        </ComponentCard>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
      <ComponentCard title="States Manager">
        {/* <div className="mt-6">
          <Label htmlFor="excelUpload">Upload Excel File</Label>
          <input
            type="file"
            id="excelUpload"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-800 dark:file:text-gray-300 dark:hover:file:bg-gray-700"
          />
          <p className="mt-2 text-sm text-gray-500">
            Excel file should contain columns: state, status (active/inactive)
          </p>
        </div> */}
        {}
        <div className="flex justify-between mb-4">
          <Input
            type="text"
            placeholder="Search states by name..."
            value={filterValue}
            onChange={(e) => handleFilter(e.target.value)}
            className="w-full max-w-md dark:bg-dark-900"
          />
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-1 bg-[#1D3A76] text-white rounded-md hover:bg-brand-600 transition-colors duration-200"
          >
            Add State
          </Button>
        </div>
        {}
        {paginatedStates.length > 0 ? (
          <div className="mt-6">
            <div className="overflow-visible relative rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Sl. No.
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
                  {paginatedStates.map((state, index) => (
                    <TableRow
                      key={state.state || `state-${startIndex + index}`}
                    >
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {state.state}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {state.status === "active" ? "Active" : "Inactive"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleMenu(index)}
                        >
                          <MoreVertical className="size-5 text-gray-500 dark:text-gray-400" />
                        </Button>
                        {activeMenu === index && (
                          <div
                            ref={dropdownRef}
                            className="absolute mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50"
                          >
                            <div className="py-1">
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => handleEditClick(state)}
                              >
                                Edit
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => handleDeleteClick(state)}
                              >
                                Delete
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => handleToggleStatus(state)}
                              >
                                {state.status === "active"
                                  ? "Set Inactive"
                                  : "Set Active"}
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
        ) : (
          <div className="mt-6 text-center text-gray-500 dark:text-gray-400">
            No states available
          </div>
        )}
        {}
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
        {}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Add State
                </h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <X className="size-6" />
                </button>
              </div>
              <form onSubmit={handleAddSubmit} className="space-y-6">
                <div className="flex flex-col gap-4">
                  {}
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="dark:bg-dark-900"
                      placeholder="Enter state"
                    />
                    {formErrors.state && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {formErrors.state}
                      </p>
                    )}
                  </div>
                  {}
                  <div className="min-h-[80px]">
                    <Label>Status</Label>
                    <Switch
                      label={
                        formData.status === "active" ? "Active" : "Inactive"
                      }
                      defaultChecked={formData.status === "active"}
                      onChange={handleStatusChange}
                    />
                  </div>
                </div>
                {}
                <div className="flex justify-between">
                  <Button
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cancel
                  </Button>
                  <Button className="px-6 py-2 bg-[#1D3A76] text-white rounded-lg hover:bg-brand-600 transition-colors duration-200">
                    Submit
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
        {}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Edit State
                </h2>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setFormData({ state: "", status: "inactive" });
                    setFormErrors({});
                    setStateToEdit(null);
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <X className="size-6" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="flex flex-col gap-4">
                  {}
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="dark:bg-dark-900"
                      placeholder="Enter state"
                    />
                    {formErrors.state && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {formErrors.state}
                      </p>
                    )}
                  </div>
                  {}
                  <div className="min-h-[80px]">
                    <Label>Status</Label>
                    <Switch
                      label={
                        formData.status === "active" ? "Active" : "Inactive"
                      }
                      defaultChecked={formData.status === "active"}
                      onChange={handleStatusChange}
                    />
                  </div>
                </div>
                {}
                <div className="flex justify-between">
                  <Button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setFormData({ state: "", status: "inactive" });
                      setFormErrors({});
                      setStateToEdit(null);
                    }}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cancel
                  </Button>
                  <Button className="px-6 py-2 bg-[#1D3A76] text-white rounded-lg hover:bg-brand-600 transition-colors duration-200">
                    Submit
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
        {}
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          propertyName={stateToDelete?.state || ""}
          onConfirm={confirmDelete}
          onCancel={() => {
            setIsDeleteModalOpen(false);
            setStateToDelete(null);
          }}
        />
        {}
        <ActiveStatusModal
          isOpen={isToggleModalOpen}
          propertyName={stateToToggle?.state || ""}
          action="Suspend"
          onConfirm={confirmToggleStatus}
          onCancel={() => {
            setIsToggleModalOpen(false);
            setStateToToggle(null);
          }}
        />
      </ComponentCard>
    </div>
  );
};
export default StatesManager;

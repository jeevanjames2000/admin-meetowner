import { useState, useEffect, useRef, useMemo, ChangeEvent, FormEvent } from "react";
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
import { getAllCities } from "../../store/slices/locationsSlice";

interface City {
  city: string;
  state: string;
  status: string; // "active" or "inactive"
}

interface FormData {
  city: string;
  state: string;
  status: string; // "active" or "inactive"
}

interface FormErrors {
  city?: string;
  state?: string;
}

const CitiesManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { cities, citiesLoading, citiesError } = useSelector(
    (state: RootState) => state.locations // Updated to use state.location
  );

  // Component state
  const [filterValue, setFilterValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeMenu, setActiveMenu] = useState<number | null>(null); // Use index for dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 10;

  // Modal and form state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState<boolean>(false);
  const [cityToDelete, setCityToDelete] = useState<City | null>(null);
  const [cityToToggle, setCityToToggle] = useState<City | null>(null);
  const [cityToEdit, setCityToEdit] = useState<City | null>(null);
  const [formData, setFormData] = useState<FormData>({
    city: "",
    state: "",
    status: "inactive",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Fetch cities on mount
  useEffect(() => {
    dispatch(getAllCities());
  }, [dispatch]);

  // Handle click outside dropdown
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
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter cities
  const filteredCities = useMemo(
    () =>
      cities.filter((city) =>
        city.city.toLowerCase().includes(filterValue.toLowerCase())
      ),
    [cities, filterValue]
  );

  // Handle Excel file upload
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
            const jsonData = XLSX.utils.sheet_to_json<City>(sheet, {
              header: ["city", "state", "status"],
              range: 1, // Skip header row if it exists
            });
            // Filter out invalid rows (empty city or invalid status)
            const validData = jsonData.filter(
              (row) =>
                row.city?.trim() &&
                row.state?.trim() &&
                ["active", "inactive"].includes(row.status)
            );
            // dispatch(setCityDetails([...cities, ...validData])); // Update Redux store
            toast.success("Cities uploaded successfully!");
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

  // Pagination
  const totalItems = filteredCities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedCities = filteredCities.slice(startIndex, endIndex);

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

  // Form handlers
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
    if (!formData.city.trim()) {
      errors.city = "City is required";
    }
    if (!formData.state.trim()) {
      errors.state = "State is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      const newCity: City = {
        city: formData.city,
        state: formData.state,
        status: formData.status,
      };
      // dispatch(setCityDetails([...cities, newCity])); // Update Redux store
      toast.success("City added successfully!");
      setFormData({ city: "", state: "", status: "inactive" });
      setFormErrors({});
      setIsAddModalOpen(false);
      console.log("Add City:", newCity); // Replace with addCity thunk
    }
  };

  const handleEditClick = (city: City) => {
    setCityToEdit(city);
    setFormData({
      city: city.city,
      state: city.state,
      status: city.status,
    });
    setIsEditModalOpen(true);
    setActiveMenu(null);
  };

  const handleEditSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm() && cityToEdit) {
      const updatedCities = cities.map((c) =>
        c.city === cityToEdit.city && c.state === cityToEdit.state
          ? { city: formData.city, state: formData.state, status: formData.status }
          : c
      );
      // dispatch(setCityDetails(updatedCities)); // Update Redux store
      toast.success(`City ${formData.city} updated successfully!`);
      console.log("Edit City:", { city: formData.city, state: formData.state, status: formData.status });
      setFormData({ city: "", state: "", status: "inactive" });
      setFormErrors({});
      setIsEditModalOpen(false);
      setCityToEdit(null);
    }
  };

  const handleDeleteClick = (city: City) => {
    setCityToDelete(city);
    setIsDeleteModalOpen(true);
    setActiveMenu(null);
  };

  const confirmDelete = () => {
    if (cityToDelete) {
      const updatedCities = cities.filter(
        (c) => !(c.city === cityToDelete.city && c.state === cityToDelete.state)
      );
      // dispatch(setCityDetails(updatedCities)); // Update Redux store
      toast.success(`City ${cityToDelete.city} deleted successfully!`);
      console.log("Delete City:", cityToDelete);
      setIsDeleteModalOpen(false);
      setCityToDelete(null);
    }
  };

  const handleToggleStatus = (city: City) => {
    if (city.status === "inactive") {
      // Directly activate if setting to Active
      const updatedCities = cities.map((c) =>
        c.city === city.city && c.state === city.state ? { ...c, status: "active" } : c
      );
      // dispatch(setCityDetails(updatedCities)); // Update Redux store
      toast.success(`City ${city.city} set to Active!`);
      console.log("Toggle Status:", { ...city, status: "active" });
    } else {
      // Show confirmation for setting to Inactive
      setCityToToggle(city);
      setIsToggleModalOpen(true);
    }
    setActiveMenu(null);
  };

  const confirmToggleStatus = () => {
    if (cityToToggle) {
      const updatedCities = cities.map((c) =>
        c.city === cityToToggle.city && c.state === cityToToggle.state
          ? { ...c, status: "inactive" }
          : c
      );
      // dispatch(setCityDetails(updatedCities)); // Update Redux store
      toast.success(`City ${cityToToggle.city} set to Inactive!`);
      console.log("Toggle Status:", { ...cityToToggle, status: "inactive" });
      setIsToggleModalOpen(false);
      setCityToToggle(null);
    }
  };

  // Loading and Error UI
  if (citiesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <ComponentCard title="Cities Manager">
          <div className="text-center text-gray-500 dark:text-gray-400">
            Loading cities...
          </div>
        </ComponentCard>
      </div>
    );
  }

  if (citiesError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <ComponentCard title="Cities Manager">
          <div className="text-center text-red-500 dark:text-red-400">
            Error: {citiesError}
          </div>
        </ComponentCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
      <ComponentCard title="Cities Manager">
        {/* File Upload Section */}
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
            Excel file should contain columns: city, state, status (active/inactive)
          </p>
        </div> */}

        {/* Search Input and Add City Button */}
        <div className="flex justify-between mb-4 mt-6">
          <Input
            type="text"
            placeholder="Search cities by name..."
            value={filterValue}
            onChange={(e) => handleFilter(e.target.value)}
            className="w-full max-w-md dark:bg-dark-900"
          />
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-1 bg-[#1D3A76] text-white rounded-md hover:bg-brand-600 transition-colors duration-200"
          >
            Add City
          </Button>
        </div>

        {/* Table Section */}
        {paginatedCities.length > 0 ? (
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
                      City
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
                  {paginatedCities.map((city, index) => (
                    <TableRow key={`${city.city}-${city.state}-${startIndex + index}`}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {city.state || "-"}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {city.city}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {city.status === "active" ? "Active" : "Inactive"}
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
                                onClick={() => handleEditClick(city)}
                              >
                                Edit
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => handleDeleteClick(city)}
                              >
                                Delete
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => handleToggleStatus(city)}
                              >
                                {city.status === "active" ? "Set Inactive" : "Set Active"}
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
            No cities available
          </div>
        )}

        {/* Pagination */}
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

        {/* Add City Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Add City
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
                  {/* City */}
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="dark:bg-dark-900"
                      placeholder="Enter city"
                    />
                    {formErrors.city && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {formErrors.city}
                      </p>
                    )}
                  </div>

                  {/* State */}
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

                  {/* Status */}
                  <div className="min-h-[80px]">
                    <Label>Status</Label>
                    <Switch
                      label={formData.status === "active" ? "Active" : "Inactive"}
                      defaultChecked={formData.status === "active"}
                      onChange={handleStatusChange}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-between">
                  <Button
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                 
                    className="px-6 py-2 bg-[#1D3A76] text-white rounded-lg hover:bg-brand-600 transition-colors duration-200"
                  >
                    Submit
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit City Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Edit City
                </h2>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setFormData({ city: "", state: "", status: "inactive" });
                    setFormErrors({});
                    setCityToEdit(null);
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <X className="size-6" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="flex flex-col gap-4">
                  {/* City */}
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="dark:bg-dark-900"
                      placeholder="Enter city"
                    />
                    {formErrors.city && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {formErrors.city}
                      </p>
                    )}
                  </div>

                  {/* State */}
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

                  {/* Status */}
                  <div className="min-h-[80px]">
                    <Label>Status</Label>
                    <Switch
                      label={formData.status === "active" ? "Active" : "Inactive"}
                      defaultChecked={formData.status === "active"}
                      onChange={handleStatusChange}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-between">
                  <Button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setFormData({ city: "", state: "", status: "inactive" });
                      setFormErrors({});
                      setCityToEdit(null);
                    }}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    
                    className="px-6 py-2 bg-[#1D3A76] text-white rounded-lg hover:bg-brand-600 transition-colors duration-200"
                  >
                    Submit
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          propertyName={cityToDelete?.city || ""}
          onConfirm={confirmDelete}
          onCancel={() => {
            setIsDeleteModalOpen(false);
            setCityToDelete(null);
          }}
        />

        {/* Toggle Status Confirmation Modal */}
        <ActiveStatusModal
          isOpen={isToggleModalOpen}
          propertyName={cityToToggle?.city || ""}
          action="Suspend"
          onConfirm={confirmToggleStatus}
          onCancel={() => {
            setIsToggleModalOpen(false);
            setCityToToggle(null);
          }}
        />
      </ComponentCard>
    </div>
  );
};

export default CitiesManager;
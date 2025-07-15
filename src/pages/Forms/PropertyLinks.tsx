import { useState, ChangeEvent, FormEvent, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPortal } from "react-dom";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";
import {
  fetchAllStates,
  fetchAllCities,
  fetchLocalities,
} from "../../store/slices/places";
import {
  fetchPropertyLinks,
  insertPropertyLink,
  deletePropertyLink,
  updatePropertyLink,
} from "../../store/slices/propertyLinksSlice";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";
import { AppDispatch, RootState } from "../../store/store";
interface PropertyLinkData {
  id?: number;
  link_title: string;
  city: string;
  location: string;
  property_for: string;
  property_in: string;
  sub_type: string | null;
  state: string;
}
const PropertyLinks: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    states,
    statesLoading,
    statesError,
    cities,
    citiesLoading,
    citiesError,
    localities,
    localitiesLoading,
    localitiesError,
  } = useSelector((state: RootState) => state.places);
  const {
    propertyLinks,
    loading,
    error,
    insertLoading,
    insertError,
    deleteLoading,
    deleteError,
    updateLoading,
    updateError,
  } = useSelector((state: RootState) => state.propertyLinks);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;
  const totalCount = propertyLinks.length;
  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const paginatedLinks = propertyLinks.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  useEffect(() => {
    setCurrentPage(1);
  }, [propertyLinks]);
  const [formData, setFormData] = useState<PropertyLinkData>({
    link_title: "",
    city: "",
    location: "",
    property_for: "",
    property_in: "",
    sub_type: "",
    state: "",
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [localitySearchTerm, setLocalitySearchTerm] = useState<string>("");
  const [isLocalityDropdownOpen, setIsLocalityDropdownOpen] =
    useState<boolean>(false);
  const [isStateDropdownOpen, setIsStateDropdownOpen] =
    useState<boolean>(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState<boolean>(false);
  const [stateSearchTerm, setStateSearchTerm] = useState<string>("");
  const [citySearchTerm, setCitySearchTerm] = useState<string>("");
  const [filteredStates, setFilteredStates] = useState<string[]>([]);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedProperty, setSelectedProperty] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const dropdownButtonRefs = useRef<{
    [key: number]: HTMLButtonElement | null;
  }>({});
  useEffect(() => {
    dispatch(fetchAllStates());
    dispatch(fetchPropertyLinks());
  }, [dispatch]);
  useEffect(() => {
    if (formData.state) {
      dispatch(fetchAllCities({ state: formData.state }));
    }
  }, [formData.state, dispatch]);
  useEffect(() => {
    if (formData.city) {
      dispatch(fetchLocalities({ city: formData.city, query: "" }));
      setIsLocalityDropdownOpen(true);
      setLocalitySearchTerm("");
    } else {
      setIsLocalityDropdownOpen(false);
      setLocalitySearchTerm("");
    }
  }, [formData.city, dispatch]);
  useEffect(() => {
    if (formData.city && localitySearchTerm.length > 0) {
      const handler = setTimeout(() => {
        dispatch(
          fetchLocalities({ city: formData.city, query: localitySearchTerm })
        );
      }, 300);
      return () => clearTimeout(handler);
    }
    if (formData.city && localitySearchTerm.length === 0) {
      dispatch(fetchLocalities({ city: formData.city, query: "" }));
    }
  }, [localitySearchTerm, formData.city, dispatch]);
  useEffect(() => {
    setFilteredStates(
      (states || [])
        .map((state) => state.name || "")
        .filter(
          (name) =>
            typeof name === "string" &&
            name.toLowerCase().includes((stateSearchTerm || "").toLowerCase())
        )
    );
  }, [stateSearchTerm, states]);
  useEffect(() => {
    setFilteredCities(
      (cities || [])
        .filter(
          (city) =>
            (!formData.state || city.state === formData.state) &&
            typeof city.name === "string" &&
            city.name
              .toLowerCase()
              .includes((citySearchTerm || "").toLowerCase())
        )
        .map((city) => city.name || "")
    );
  }, [citySearchTerm, cities, formData.state]);
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "state") {
      setStateSearchTerm(value);
      setFormData((prev) => ({ ...prev, city: "", location: "" }));
      setCitySearchTerm("");
      setLocalitySearchTerm("");
      setIsCityDropdownOpen(false);
      setIsLocalityDropdownOpen(false);
    } else if (name === "city") {
      setCitySearchTerm(value);
      setFormData((prev) => ({ ...prev, location: "" }));
      setLocalitySearchTerm("");
      setIsLocalityDropdownOpen(false);
    } else if (name === "location") {
      setLocalitySearchTerm(value);
      setIsLocalityDropdownOpen(true);
    }
  };
  const handleSelectSuggestion = (
    field: keyof PropertyLinkData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "state") {
      setStateSearchTerm(value);
      setIsStateDropdownOpen(false);
      setFormData((prev) => ({ ...prev, city: "", location: "" }));
      setCitySearchTerm("");
      setLocalitySearchTerm("");
      setIsCityDropdownOpen(false);
      setIsLocalityDropdownOpen(false);
      dispatch(fetchAllCities({ state: value }));
    } else if (field === "city") {
      setCitySearchTerm(value);
      setIsCityDropdownOpen(false);
      setFormData((prev) => ({ ...prev, location: "" }));
      setLocalitySearchTerm("");
      setIsLocalityDropdownOpen(false);
    } else if (field === "location") {
      setLocalitySearchTerm(value);
      setIsLocalityDropdownOpen(false);
    }
  };
  const toggleStateDropdown = () => {
    setIsStateDropdownOpen((prev) => !prev);
  };
  const toggleCityDropdown = () => {
    setIsCityDropdownOpen((prev) => !prev);
  };
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".state-dropdown")) {
      setIsStateDropdownOpen(false);
    }
    if (!target.closest(".city-dropdown")) {
      setIsCityDropdownOpen(false);
    }
    if (!target.closest(".locality-dropdown")) {
      setIsLocalityDropdownOpen(false);
    }
    if (
      !target.closest(".actions-dropdown") &&
      !target.closest(".dropdown-button")
    ) {
      setDropdownOpen(null);
      setDropdownPosition(null);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { id, link_title, city, location, property_for, property_in } =
      formData;
    if (!link_title || !city || !location || !property_for || !property_in) {
      toast.error("All required fields must be filled");
      return;
    }
    try {
      let resultAction;
      if (isEditing) {
        if (!id) {
          toast.error("Invalid property link ID");
          return;
        }
        resultAction = await dispatch(
          updatePropertyLink({
            ...formData,
            sub_type: formData.sub_type || null,
          })
        );
        if (updatePropertyLink.fulfilled.match(resultAction)) {
          toast.success("Property link updated successfully!");
        } else {
          const errorMessage =
            (resultAction.payload as string) ||
            "Failed to update property link";
          toast.error(errorMessage);
          return;
        }
      } else {
        resultAction = await dispatch(
          insertPropertyLink({
            ...formData,
            sub_type: formData.sub_type || null,
          })
        );
        if (insertPropertyLink.fulfilled.match(resultAction)) {
          toast.success("Property link added successfully!");
        } else {
          const errorMessage =
            (resultAction.payload as string) || "Failed to add property link";
          toast.error(errorMessage);
          return;
        }
      }
      setFormData({
        link_title: "",
        city: "",
        location: "",
        property_for: "",
        property_in: "",
        sub_type: "",
        state: "",
      });
      setIsEditing(false);
      setStateSearchTerm("");
      setCitySearchTerm("");
      setLocalitySearchTerm("");
      setIsStateDropdownOpen(false);
      setIsCityDropdownOpen(false);
      setIsLocalityDropdownOpen(false);
      dispatch(fetchPropertyLinks());
    } catch (err) {
      console.log("err: ", err);
    }
  };
  const handleEdit = (link: PropertyLinkData) => {
    setFormData({
      ...link,
      sub_type: link.sub_type || "",
    });
    setIsEditing(true);
    setStateSearchTerm(link.state);
    setCitySearchTerm(link.city);
    setLocalitySearchTerm(link.location);
    setDropdownOpen(null);
    setDropdownPosition(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleDelete = (id: number, link_title: string) => {
    setSelectedProperty({ id, name: link_title });
    setIsDeleteModalOpen(true);
    setDropdownOpen(null);
    setDropdownPosition(null);
  };
  const confirmDelete = async () => {
    if (selectedProperty) {
      try {
        const resultAction = await dispatch(
          deletePropertyLink({ id: selectedProperty.id })
        );
        if (deletePropertyLink.fulfilled.match(resultAction)) {
          setIsDeleteModalOpen(false);
          setSelectedProperty(null);
          dispatch(fetchPropertyLinks());
        }
      } catch (err) {
        console.log("err: ", err);
      }
    }
  };
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = event.target?.result;
        if (!data) return;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<PropertyLinkData>(sheet, {
          header: [
            "state",
            "city",
            "location",
            "link_title",
            "property_for",
            "property_in",
            "sub_type",
          ],
          range: 1,
        });
        const validRows = jsonData.filter(
          (row) =>
            row.state &&
            row.city &&
            row.location &&
            row.link_title &&
            row.property_for &&
            row.property_in
        );
        if (validRows.length === 0) {
          toast.error("No valid rows found in Excel file");
          return;
        }
        const formattedRows = validRows.map((row) => ({
          ...row,
          sub_type: row.sub_type || null,
        }));
        // Wait for all inserts to finish, then fetchPropertyLinks
        await Promise.all(
          formattedRows.map((row) => dispatch(insertPropertyLink(row)))
        );
        await dispatch(fetchPropertyLinks());
        toast.success("Property links uploaded successfully!");
      } catch (error) {
        console.error("Error reading Excel file:", error);
        toast.error("Error reading Excel file");
      }
    };
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      toast.error("Error reading Excel file");
    };
    reader.readAsBinaryString(file);
  };
  const handleDownloadTemplate = () => {
    const worksheetData = [
      {
        state: "Telangana",
        city: "Hyderabad",
        location: "Madhuranagar",
        link_title: "Sample Property",
        property_for: "Buy",
        property_in: "Residential",
        sub_type: "Apartment",
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "property_links_template.xlsx");
  };
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);
  const getPaginationItems = () => {
    const pages = [];
    const totalVisiblePages = 7;
    let startPage = Math.max(
      1,
      currentPage - Math.floor(totalVisiblePages / 2)
    );
    let endPage = Math.min(totalPages, startPage + totalVisiblePages - 1);
    if (endPage - startPage + 1 < totalVisiblePages) {
      startPage = Math.max(1, endPage - totalVisiblePages + 1);
    }
    if (startPage > 1) pages.push(1);
    if (startPage > 2) pages.push("...");
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (endPage < totalPages - 1) pages.push("...");
    if (endPage < totalPages) pages.push(totalPages);
    return pages;
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
      <ComponentCard title="Property Links">
        <form onSubmit={handleSubmit} className="space-y-6">
          {}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="mb-6 max-w-xs state-dropdown">
              <Label
                htmlFor="state-search"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Select State
              </Label>
              <div className="relative">
                <Input
                  id="state-search"
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  onFocus={() => {
                    setIsStateDropdownOpen(true);
                  }}
                  placeholder="Search for a state..."
                  className="dark:bg-dark-900"
                  disabled={insertLoading || updateLoading || statesLoading}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    toggleStateDropdown();
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  disabled={insertLoading || updateLoading || statesLoading}
                  tabIndex={-1}
                >
                  <svg
                    className={`w-4 h-4 transform ${
                      isStateDropdownOpen ? "rotate-180" : ""
                    }`}
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
                {isStateDropdownOpen && filteredStates.length > 0 && (
                  <ul className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
                    {filteredStates.map((state) => (
                      <li
                        key={state}
                        onClick={() => handleSelectSuggestion("state", state)}
                        className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        {state}
                      </li>
                    ))}
                  </ul>
                )}
                {statesError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {statesError}
                  </p>
                )}
              </div>
            </div>
            <div className="mb-6 max-w-xs city-dropdown">
              <Label
                htmlFor="city-search"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Select City
              </Label>
              <div className="relative">
                <Input
                  id="city-search"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  onFocus={() => {
                    setIsCityDropdownOpen(true);
                  }}
                  placeholder="Search for a city..."
                  className="dark:bg-dark-900"
                  disabled={
                    insertLoading ||
                    updateLoading ||
                    citiesLoading ||
                    !formData.state
                  }
                  autoComplete="off"
                />
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    toggleCityDropdown();
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  disabled={
                    insertLoading ||
                    updateLoading ||
                    citiesLoading ||
                    !formData.state
                  }
                >
                  <svg
                    className={`w-4 h-4 transform ${
                      isCityDropdownOpen ? "rotate-180" : ""
                    }`}
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
                {isCityDropdownOpen && filteredCities.length > 0 && (
                  <ul className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
                    {filteredCities.map((city) => (
                      <li
                        key={city}
                        onClick={() => handleSelectSuggestion("city", city)}
                        className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        {city}
                      </li>
                    ))}
                  </ul>
                )}
                {citiesError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {citiesError}
                  </p>
                )}
              </div>
            </div>
            <div className="mb-6 max-w-xs locality-dropdown">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <Input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  onFocus={() => setIsLocalityDropdownOpen(true)}
                  placeholder="Enter location"
                  className="dark:bg-dark-900"
                  disabled={insertLoading || updateLoading || !formData.city}
                  autoComplete="off"
                />
                {isLocalityDropdownOpen &&
                  !localitiesLoading &&
                  localities.length > 0 && (
                    <ul className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
                      {localities.map((item, index) => (
                        <li
                          key={`${item.locality}-${index}`}
                          onClick={() =>
                            handleSelectSuggestion("location", item.locality)
                          }
                          className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        >
                          {item.locality}
                        </li>
                      ))}
                    </ul>
                  )}
                {isLocalityDropdownOpen && localitiesLoading && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-2 text-sm text-gray-500 dark:text-gray-300">
                    Loading...
                  </div>
                )}
                {isLocalityDropdownOpen &&
                  !localitiesLoading &&
                  localities.length === 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-2 text-sm text-gray-500 dark:text-gray-300">
                      No suggestions found
                    </div>
                  )}
                {localitiesError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {localitiesError}
                  </p>
                )}
              </div>
            </div>
            <div className="mb-6 max-w-xs">
              <Label htmlFor="link_title">Link Title</Label>
              <Input
                type="text"
                id="link_title"
                name="link_title"
                value={formData.link_title}
                onChange={handleInputChange}
                className="dark:bg-dark-900"
                placeholder="Enter link title"
                disabled={insertLoading || updateLoading}
              />
            </div>
            <div className="mb-6 max-w-xs">
              <Label htmlFor="property_for">Property For</Label>
              <select
                id="property_for"
                name="property_for"
                value={formData.property_for}
                onChange={handleInputChange}
                className="block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
                disabled={insertLoading || updateLoading}
              >
                <option value="">Select Property For</option>
                <option value="Buy">Sell</option>
                <option value="Rent">Rent</option>
              </select>
            </div>
            <div className="mb-6 max-w-xs">
              <Label htmlFor="property_in">Property In</Label>
              <select
                id="property_in"
                name="property_in"
                value={formData.property_in}
                onChange={handleInputChange}
                className="block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
                disabled={insertLoading || updateLoading}
              >
                <option value="">Select Property In</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            <div className="mb-6 max-w-xs">
              <Label htmlFor="sub_type">Sub Type</Label>
              <select
                id="sub_type"
                name="sub_type"
                value={formData.sub_type || ""}
                onChange={handleInputChange}
                className="block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
                disabled={insertLoading || updateLoading}
              >
                <option value="">Select Sub Type</option>
                <option value="Apartment">Apartment</option>
                <option value="Plot">Plot</option>
                <option value="Independent House">Independent House</option>
                <option value="Independent Villa">Independent Villa</option>
                <option value="Retail Shop">Retail Shop</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormData({
                    link_title: "",
                    city: "",
                    location: "",
                    property_for: "",
                    property_in: "",
                    sub_type: "",
                    state: "",
                  });
                  setIsEditing(false);
                  setStateSearchTerm("");
                  setCitySearchTerm("");
                  setLocalitySearchTerm("");
                  setIsStateDropdownOpen(false);
                  setIsCityDropdownOpen(false);
                  setIsLocalityDropdownOpen(false);
                }}
                disabled={insertLoading || updateLoading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={insertLoading || updateLoading}
            >
              {insertLoading || updateLoading
                ? isEditing
                  ? "Updating..."
                  : "Adding..."
                : isEditing
                ? "Update Property Link"
                : "Add Property Link"}
            </Button>
          </div>
          {(insertError || updateError) && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {insertError || updateError}
            </p>
          )}
        </form>
        <div className="flex justify-between items-center gap-4 flex-wrap mt-6">
          <div>
            <Label htmlFor="excelUpload">Upload Excel File</Label>
            <input
              type="file"
              id="excelUpload"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-800 dark:file:text-gray-300 dark:hover:file:bg-gray-700"
              disabled={insertLoading || updateLoading}
            />
            <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
              <span>
                Excel file should contain columns:{" "}
                <strong>
                  state, city, location, link_title, property_for, property_in,
                  sub_type
                </strong>
              </span>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleDownloadTemplate}
              >
                Download Template
              </Button>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="mt-10">
            <h3 className="text-lg font-semibold mb-2">Loading...</h3>
          </div>
        ) : error ? (
          <div className="mt-10">
            <h3 className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">
              Error: {error}
            </h3>
          </div>
        ) : propertyLinks.length === 0 ? (
          <div className="mt-10">
            <h3 className="text-lg font-semibold mb-2">
              No Property Links Found
            </h3>
          </div>
        ) : (
          <div className="mt-10">
            <h3 className="text-lg font-semibold mb-2">Property Links</h3>
            <div className="overflow-visible relative rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Sl. No
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Link Title
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
                        Location
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Property For
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Property In
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Sub Type
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
                    {paginatedLinks.map((link, index) => (
                      <TableRow key={link.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {(currentPage - 1) * rowsPerPage + index + 1}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {link.link_title}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {link.city}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {link.location}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {link.property_for}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {link.property_in}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {link.sub_type || "-"}
                        </TableCell>
                        <TableCell className="relative px-5 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            className="dropdown-button"
                            onClick={(e) => {
                              const btn = e.currentTarget;
                              const rect = btn.getBoundingClientRect();
                              setDropdownOpen(
                                dropdownOpen === link.id.toString()
                                  ? null
                                  : link.id.toString()
                              );
                              setDropdownPosition(
                                dropdownOpen === link.id.toString()
                                  ? null
                                  : {
                                      top: rect.bottom + window.scrollY,
                                      left: rect.left + window.scrollX,
                                    }
                              );
                              dropdownButtonRefs.current[link.id] = btn;
                            }}
                            ref={(el) => {
                              dropdownButtonRefs.current[link.id] = el;
                            }}
                          >
                            <svg
                              className="w-5 h-5 text-gray-500 dark:text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </Button>
                          {dropdownOpen === link.id.toString() &&
                            dropdownPosition &&
                            createPortal(
                              <div
                                id={`dropdown-portal-${link.id}`}
                                style={{
                                  position: "absolute",
                                  top: dropdownPosition.top,
                                  left: dropdownPosition.left,
                                  zIndex: 9999,
                                  width: "160px",
                                }}
                                className="actions-dropdown bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg"
                              >
                                <button
                                  onClick={() => {
                                    handleEdit(link);
                                    setDropdownOpen(null);
                                    setDropdownPosition(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    handleDelete(link.id, link.link_title);
                                    setDropdownOpen(null);
                                    setDropdownPosition(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  Delete
                                </button>
                              </div>,
                              document.body
                            )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalCount > rowsPerPage && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 py-2 gap-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
                    {Math.min(currentPage * rowsPerPage, totalCount)} of{" "}
                    {totalCount} entries
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
                    {getPaginationItems().map((page, index) => {
                      const uniqueKey = `${page}-${index}`;
                      return page === "..." ? (
                        <span
                          key={uniqueKey}
                          className="px-3 py-1 text-gray-500 dark:text-gray-400"
                        >
                          ...
                        </span>
                      ) : (
                        <Button
                          key={uniqueKey}
                          variant="outline"
                          size="sm"
                          onClick={() => goToPage(page as number)}
                          isActive={page === currentPage}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    <Button
                      variant={
                        currentPage === totalPages ? "outline" : "primary"
                      }
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {deleteError && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">
            {deleteError}
          </p>
        )}
      </ComponentCard>
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        propertyName={selectedProperty?.name || ""}
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedProperty(null);
        }}
      />
    </div>
  );
};
export default PropertyLinks;

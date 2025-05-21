import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";
import { fetchAllStates, fetchAllCities, insertPlace, PlacesState, insertPlaceWithExcell } from "../../store/slices/places";

interface LocationData {
  locality: string;
  city: string;
  state: string;
  status: string;
}

interface RootState {
  places: PlacesState;
}

const LocationManager: React.FC = () => {
  const dispatch = useDispatch();
  const {
    states,
    statesLoading,
    statesError,
    cities,
    citiesLoading,
    citiesError,
    insertLoading,
    insertError,
  } = useSelector((state: RootState) => state.places);

  const [formData, setFormData] = useState<LocationData>({
    locality: "",
    city: "",
    state: "",
    status: "inactive",
  });
  const [tableData, setTableData] = useState<LocationData[]>([]);
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState<boolean>(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState<boolean>(false);
  const [stateSearchTerm, setStateSearchTerm] = useState<string>("");
  const [citySearchTerm, setCitySearchTerm] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<LocationData[]>([]);

  useEffect(() => {
    dispatch(fetchAllStates());
    // Only fetch all cities without a state initially
    dispatch(fetchAllCities());
  }, [dispatch]);

  useEffect(() => {
    setFilteredStates(
      states
        .map((state) => state.name)
        .filter((name) =>
          name.toLowerCase().includes(stateSearchTerm.toLowerCase())
        )
    );
  }, [stateSearchTerm, states]);

  useEffect(() => {
    setFilteredCities(
      cities
        .filter((city) => 
          // Only include cities that match the selected state (if any) and search term
          (!formData.state || city.state === formData.state) &&
          city.name.toLowerCase().includes(citySearchTerm.toLowerCase())
        )
        .map((city) => city.name)
    );
  }, [citySearchTerm, cities, formData.state]);

  const [filteredStates, setFilteredStates] = useState<string[]>([]);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "state") {
      setStateSearchTerm(value);
    } else if (name === "city") {
      setCitySearchTerm(value);
    }
  };

  const handleSelectSuggestion = (field: keyof LocationData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "state") {
      setStateSearchTerm(value);
      setIsStateDropdownOpen(false);
      // Reset city and fetch cities for the selected state
      setFormData((prev) => ({ ...prev, city: "" }));
      setCitySearchTerm("");
      setIsCityDropdownOpen(false);
      dispatch(fetchAllCities({ state: value }));
    } else if (field === "city") {
      setCitySearchTerm(value);
      setIsCityDropdownOpen(false);
    }
  };

  const toggleStateDropdown = () => {
    setIsStateDropdownOpen((prev) => !prev);
  };

  const toggleCityDropdown = () => {
    setIsCityDropdownOpen((prev) => !prev);
  };

  // Handle clicks outside dropdowns to close them
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".state-dropdown")) {
      setIsStateDropdownOpen(false);
    }
    if (!target.closest(".city-dropdown")) {
      setIsCityDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { state, city, locality, status } = formData;
    if (!state || !city || !locality || !status) {
      toast.error("State, City, Locality, and Status are required");
      return;
    }
    try {
      const resultAction = await dispatch(insertPlace(formData));
      if (insertPlace.fulfilled.match(resultAction)) {
        toast.success("Place added successfully!");
        setTableData((prev) => [...prev, formData]);
        setFormData({ locality: "", city: "", state: "", status: "inactive" });
        setStateSearchTerm("");
        setCitySearchTerm("");
        setIsStateDropdownOpen(false);
        setIsCityDropdownOpen(false);
        dispatch(fetchAllStates());
        dispatch(fetchAllCities()); // Fetch all cities without state filter after insert
      } else {
        const errorMessage =
          (resultAction.payload as any)?.message || "Failed to add place";
        toast.error(errorMessage);
      }
    } catch (err) {
      toast.error("Failed to add place");
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        if (!data) return;

        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<LocationData>(sheet, {
          header: ["locality", "city", "state","status"],
          range: 1,
        });

        const validRows = jsonData.filter(row => row.state && row.city && row.locality);
        if (validRows.length === 0) {
          toast.error("No valid rows found in Excel file");
          return;
        }

        setPreviewData(validRows);
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

  const handleUploadLocations = async () => {
    if (!selectedFile || previewData.length === 0) {
      toast.error("Please upload a valid Excel file first");
      return;
    }

    const resultAction = await dispatch(insertPlaceWithExcell(selectedFile));
    if (insertPlaceWithExcell.fulfilled.match(resultAction)) {
      toast.success(resultAction.payload.message || "Places uploaded successfully!");
      setTableData((prev) => [...prev, ...previewData]);
      setSelectedFile(null);
      setPreviewData([]);
      dispatch(fetchAllStates());
      dispatch(fetchAllCities()); // Fetch all cities without state filter after upload
    } else {
      const errorMessage = (resultAction.payload as any)?.message || "Failed to upload Excel";
      toast.error(errorMessage);
    }
  };

  const handleDownloadTemplate = () => {
    const worksheetData = [
      {
        state: "Andhra Pradesh",
        city: "Visakhapatnam",
        locality: "Gajuwaka",
        status: "active",
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "location_template.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
      <ComponentCard title="Location Manager">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="mb-6 max-w-xs state-dropdown">
              <Label htmlFor="state-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select State
              </Label>
              <div className="relative">
                <input
                  id="state-search"
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  onClick={() => setIsStateDropdownOpen(true)}
                  onFocus={() => setIsStateDropdownOpen(true)}
                  placeholder="Search for a state..."
                  className="block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
                  disabled={insertLoading || statesLoading}
                />
                <button
                  type="button"
                  onClick={toggleStateDropdown}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  disabled={insertLoading || statesLoading}
                >
                  <svg
                    className={`w-4 h-4 transform ${isStateDropdownOpen ? "rotate-180" : ""}`}
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
                  <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
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
              <Label htmlFor="city-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select City
              </Label>
              <div className="relative">
                <input
                  id="city-search"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  onClick={() => setIsCityDropdownOpen(true)}
                  onFocus={() => setIsCityDropdownOpen(true)}
                  placeholder="Search for a city..."
                  className="block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
                  disabled={insertLoading || citiesLoading || !formData.state}
                />
                <button
                  type="button"
                  onClick={toggleCityDropdown}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  disabled={insertLoading || citiesLoading || !formData.state}
                >
                  <svg
                    className={`w-4 h-4 transform ${isCityDropdownOpen ? "rotate-180" : ""}`}
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
                  <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
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

            <div>
              <Label htmlFor="locality">Locality</Label>
              <Input
                type="text"
                id="locality"
                name="locality"
                value={formData.locality}
                onChange={handleInputChange}
                className="dark:bg-dark-900"
                placeholder="Enter locality"
                disabled={insertLoading}
              />
            </div>

            <div className="mb-6 max-w-xs status-dropdown">
              <Label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Status
              </Label>
              <div className="relative">
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
                  disabled={insertLoading}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-[#1D3A76] text-white rounded-lg hover:bg-brand-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={insertLoading}
            >
              {insertLoading ? "Adding..." : "Add Location"}
            </button>
          </div>

          {insertError && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {insertError}
            </p>
          )}
        </form>
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div>
            <Label htmlFor="excelUpload">Upload Excel File</Label>
            <input
              type="file"
              id="excelUpload"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-800 dark:file:text-gray-300 dark:hover:file:bg-gray-700"
              disabled={insertLoading}
            />
            <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
              <span>Excel file should contain columns: <strong>locality, city, state</strong></span>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3 py-1 bg-[#1D3A76] text-white text-sm rounded-md hover:bg-brand-600 transition-colors duration-200"
              >
                Download
              </button>
            </div>
          </div>
          <div>
            <button
              type="button"
              onClick={handleUploadLocations}
              className="px-6 py-2 h-10 bg-[#1D3A76] text-white rounded-lg hover:bg-brand-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload Locations
            </button>
          </div>
        </div>

        {previewData.length > 0 && (
          <div className="mt-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-dark-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Locality
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      State
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-dark-900 dark:divide-gray-700">
                  {previewData.map((row, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {row.locality || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {row.city || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {row.state || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {row.status || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </ComponentCard>
    </div>
  );
};

export default LocationManager;
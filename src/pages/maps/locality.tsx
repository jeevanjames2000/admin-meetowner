import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";
import { fetchAllStates, fetchAllCities, insertPlace, PlacesState } from "../../store/slices/places";
interface LocationData {
  locality: string;
  city: string;
  state: string;
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
  });
  const [tableData, setTableData] = useState<LocationData[]>([]);
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState<boolean>(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState<boolean>(false);
  const [filteredStates, setFilteredStates] = useState<string[]>([]);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  useEffect(() => {
    dispatch(fetchAllStates());
    dispatch(fetchAllCities());
  }, [dispatch]);
  useEffect(() => {
  }, [states]);
  useEffect(() => {
  }, [cities]);
  useEffect(() => {
  }, [statesLoading, citiesLoading, insertLoading]);
  useEffect(() => {
    if (states.length > 0) {
      const stateNames = states.map((state) => state.name);
      const filtered = stateNames.filter((name) =>
        name.toLowerCase().includes(formData.state.toLowerCase())
      );
      setFilteredStates(filtered);
    } else {
      setFilteredStates([]);
    }
  }, [formData.state, states]);
  useEffect(() => {
    if (cities.length > 0) {
      const cityNames = cities.map((city) => city.name);
      const filtered = cityNames.filter((name) =>
        name.toLowerCase().includes(formData.city.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  }, [formData.city, cities]);
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSelectSuggestion = (field: keyof LocationData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "state") {
      setIsStateDropdownOpen(false);
      setFormData((prev) => ({ ...prev, city: "" }));
    } else if (field === "city") {
      setIsCityDropdownOpen(false);
    }
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { state, city, locality } = formData;
    if (!state || !city || !locality) {
      toast.error("State, City, and Locality are required");
      return;
    }
    try {
      const resultAction = await dispatch(insertPlace(formData));
      if (insertPlace.fulfilled.match(resultAction)) {
        toast.success("Place added successfully!");
        setTableData((prev) => [...prev, formData]);
        setFormData({ locality: "", city: "", state: "" });
        setIsStateDropdownOpen(false);
        setIsCityDropdownOpen(false);
        dispatch(fetchAllStates());
        dispatch(fetchAllCities());
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
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = event.target?.result;
          if (data) {
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json<LocationData>(sheet, {
              header: ["locality", "city", "state"],
              range: 1,
            });
            const insertPromises = jsonData.map(async (row) => {
              if (!row.state || !row.city || !row.locality) {
                toast.error(
                  `Skipping row: State, City, and Locality are required - ${JSON.stringify(row)}`
                );
                return null;
              }
              try {
                const resultAction = await dispatch(insertPlace(row));
                if (insertPlace.fulfilled.match(resultAction)) {
                  return row;
                } else {
                  const errorMessage =
                    (resultAction.payload as any)?.message || "Failed to add place";
                  toast.error(`Failed to add place: ${JSON.stringify(row)} - ${errorMessage}`);
                  return null;
                }
              } catch (err) {
                toast.error(`Failed to add place: ${JSON.stringify(row)}`);
                return null;
              }
            });
            const insertedRows = (await Promise.all(insertPromises)).filter(
              (row): row is LocationData => row !== null
            );
            if (insertedRows.length > 0) {
              setTableData((prev) => [...prev, ...insertedRows]);
              toast.success(`${insertedRows.length} places added successfully!`);
              dispatch(fetchAllStates());
              dispatch(fetchAllCities());
            } else {
              toast.error("No places were added from the Excel file.");
            }
          }
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
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
      <ComponentCard title="Location Manager">
        {}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {}
            <div className="relative">
              <Label htmlFor="state">State</Label>
              <Input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                onFocus={() => {
                  setIsStateDropdownOpen(true);
                }}
                onBlur={() => {
                  setIsStateDropdownOpen(false);
                }}
                className="dark:bg-dark-900"
                placeholder="Type or select a state"
                disabled={insertLoading || statesLoading}
              />
              {isStateDropdownOpen && filteredStates.length > 0 ? (
                <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-dark-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredStates.map((state) => (
                    <li
                      key={state}
                      onMouseDown={() => {
                        handleSelectSuggestion("state", state);
                      }}
                      className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      {state}
                    </li>
                  ))}
                </ul>
              ) : (
                isStateDropdownOpen && <p className="text-sm text-gray-500">No states available</p>
              )}
              {statesError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {statesError}
                </p>
              )}
            </div>
            {}
            <div className="relative">
              <Label htmlFor="city">City</Label>
              <Input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                onFocus={() => {
                  setIsCityDropdownOpen(true);
                }}
                onBlur={() => {
                  setIsCityDropdownOpen(false);
                }}
                className="dark:bg-dark-900"
                placeholder="Type or select a city"
                disabled={insertLoading || citiesLoading}
              />
              {isCityDropdownOpen && filteredCities.length > 0 ? (
                <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-dark-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredCities.map((city) => (
                    <li
                      key={city}
                      onMouseDown={() => {
                        handleSelectSuggestion("city", city);
                      }}
                      className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      {city}
                    </li>
                  ))}
                </ul>
              ) : (
                isCityDropdownOpen && <p className="text-sm text-gray-500">No cities available</p>
              )}
              {citiesError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {citiesError}
                </p>
              )}
            </div>
            {}
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
          </div>
          {}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-[#1D3A76] text-white rounded-lg hover:bg-brand-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={insertLoading}
            >
              {insertLoading ? "Adding..." : "Add Location"}
            </button>
          </div>
          {}
          {insertError && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {insertError}
            </p>
          )}
        </form>
        {}
        <div className="mt-6">
          <Label htmlFor="excelUpload">Upload Excel File</Label>
          <input
            type="file"
            id="excelUpload"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-800 dark:file:text-gray-300 dark:hover:file:bg-gray-700"
            disabled={insertLoading}
          />
          <p className="mt-2 text-sm text-gray-500">
            Excel file should contain columns: locality, city, state
          </p>
        </div>
        {}
        {tableData.length > 0 && (
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-dark-900 dark:divide-gray-700">
                  {tableData.map((row, index) => (
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
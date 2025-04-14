import { useState, ChangeEvent, FormEvent } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Switch from "../../components/form/switch/Switch";
import * as XLSX from "xlsx";

// Define types for state data
interface StateData {
  state: string;
  status: boolean;
}

interface FormErrors {
  state?: string;
}

const StatesManager: React.FC = () => {
  // State for form inputs
  const [formData, setFormData] = useState<StateData>({
    state: "",
    status: false,
  });

  // State for form errors
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // State for table data
  const [tableData, setTableData] = useState<StateData[]>([]);

  // Handle input changes for text fields
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle status switch change
  const handleStatusChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, status: checked }));
  };

  // Validate form inputs
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.state.trim()) {
      errors.state = "State is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setTableData((prev) => [...prev, formData]);
      setFormData({ state: "", status: false }); // Reset form
      setFormErrors({}); // Clear errors
    }
  };

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
            const jsonData = XLSX.utils.sheet_to_json<StateData>(sheet, {
              header: ["state", "status"], // Explicitly map column headers
              range: 1, // Skip header row if it exists
            });
            // Ensure status is boolean
            const normalizedData = jsonData.map((row) => ({
              state: row.state || "",
              status: row.status === true, // Convert to boolean
            }));
            // Filter out invalid rows (empty state)
            const validData = normalizedData.filter((row) => row.state.trim());
            setTableData(validData);
          }
        } catch (error) {
          console.error("Error reading Excel file:", error);
        }
      };
      reader.onerror = (error) => console.error("FileReader error:", error);
      reader.readAsBinaryString(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
      <ComponentCard title="States Manager">
        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.state}</p>
              )}
            </div>

            {/* Status */}
            <div className="min-h-[80px]">
              <Label>Status</Label>
              <Switch
                label={formData.status ? "Active" : "Inactive"}
                defaultChecked={formData.status}
                onChange={handleStatusChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-[#1D3A76] text-white rounded-lg hover:bg-brand-600 transition-colors duration-200"
            >
              Add State
            </button>
          </div>
        </form>

        {/* File Upload Section */}
        <div className="mt-6">
          <Label htmlFor="excelUpload">Upload Excel File</Label>
          <input
            type="file"
            id="excelUpload"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-800 dark:file:text-gray-300 dark:hover:file:bg-gray-700"
          />
          <p className="mt-2 text-sm text-gray-500">
            Excel file should contain columns: state, status (true/false)
          </p>
        </div>

        {/* Table Section */}
        {tableData.length > 0 && (
          <div className="mt-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-dark-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      State
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-dark-900 dark:divide-gray-700">
                  {tableData.map((row, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {row.state || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {row.status ? "Active" : "Inactive"}
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

export default StatesManager;
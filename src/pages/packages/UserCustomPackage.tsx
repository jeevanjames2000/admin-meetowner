import React, { useState, useEffect, ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { toast } from "react-hot-toast";
import ComponentCard from "../../components/common/ComponentCard";
import { AppDispatch } from "../../store/store";
import {
  fetchCustomPackagesByUser,
  insertRules,
  editRule,
  deleteRule,
  editPackage,
  clearMessages,
} from "../../store/slices/packagesSlice";

// Define interfaces
interface Rule {
  id?: number;
  rule_name: string; // Changed from 'name' to 'rule_name' to match API
  included: boolean;
}

interface CustomPackage {
  package_id: number;
  user_id: number;
  user_name: string;
  user_mobile: string;
  name: string;
  price: string;
  duration_days: number;
  button_text: string;
  actual_amount: string;
  gst: string;
  sgst: string;
  gst_percentage: string;
  gst_number: string;
  rera_number: string;
  package_for: string;
  created_by: string;
  created_date: string;
  city: string;
  rules: Rule[];
}

interface RootState {
  package: {
    userCustomPackages: CustomPackage[];
    userCustomPackagesLoading: boolean;
    userCustomPackagesError: string | null;
    insertLoading: boolean;
    insertError: string | null;
    insertSuccess: string | null;
    editLoading: boolean;
    editError: string | null;
    editSuccess: string | null;
    deleteLoading: boolean;
    deleteError: string | null;
    deleteSuccess: string | null;
    editPackageLoading: boolean;
    editPackageError: string | null;
    editPackageSuccess: string | null;
  };
}

interface EditPackageProps {
  pkg: CustomPackage;
  onSave: (updatedPackage: CustomPackage) => void;
  onCancel: () => void;
}

// EditPackage Component
const EditPackage: React.FC<EditPackageProps> = ({ pkg, onSave, onCancel }) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    insertSuccess,
    insertError,
    editSuccess,
    editError,
    deleteSuccess,
    deleteError,
    editPackageSuccess,
    editPackageError,
  } = useSelector((state: RootState) => state.package);

  const [formData, setFormData] = useState<CustomPackage>({
    ...pkg,
    rules: pkg.rules.map((rule) => ({
      id: rule.id,
      rule_name: rule.rule_name, // Use rule_name
      included: rule.included,
    })),
  });
  const [originalRules] = useState<Rule[]>(pkg.rules);
  const [originalPackage] = useState<CustomPackage>(pkg);

  // Handle API response toasts
  useEffect(() => {
    if (insertSuccess) {
      toast.success(insertSuccess);
      dispatch(clearMessages());
    }
    if (insertError) {
      toast.error(insertError);
      dispatch(clearMessages());
    }
    if (editSuccess) {
      toast.success(editSuccess);
      dispatch(clearMessages());
    }
    if (editError) {
      toast.error(editError);
      dispatch(clearMessages());
    }
    if (deleteSuccess) {
      toast.success(deleteSuccess);
      dispatch(fetchCustomPackagesByUser(formData.user_id));
      dispatch(clearMessages());
    }
    if (deleteError) {
      toast.error(deleteError);
      dispatch(clearMessages());
    }
    if (editPackageSuccess) {
      toast.success(editPackageSuccess);
      dispatch(clearMessages());
      onCancel();
    }
    if (editPackageError) {
      toast.error(editPackageError);
      dispatch(clearMessages());
    }
  }, [
    insertSuccess,
    insertError,
    editSuccess,
    editError,
    deleteSuccess,
    deleteError,
    editPackageSuccess,
    editPackageError,
    dispatch,
    onCancel,
    formData.user_id,
  ]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const cleanValue = name === "price" || name === "actual_amount" ? value.replace("/-", "").trim() : value;
    setFormData((prev) => ({ ...prev, [name]: cleanValue }));
  };

  const handleRuleChange = (
    index: number,
    field: "rule_name" | "included", // Update to rule_name
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.map((rule, i) =>
        i === index ? { ...rule, [field]: value } : rule
      ),
    }));
  };

  const handleAddRule = () => {
    setFormData((prev) => ({
      ...prev,
      rules: [...prev.rules, { rule_name: "", included: false }],
    }));
  };

  const handleRemoveRule = (index: number) => {
    const rule = formData.rules[index];
    if (rule.id) {
      console.log("Delete rule id:", rule.id);
      dispatch(deleteRule(rule.id)); // Uncomment when ready
    }
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRules = formData.rules.filter((rule) => !rule.id);
    const existingRules = formData.rules.filter((rule) => rule.id);

    // Insert new rules
    if (newRules.length > 0) {
      const insertPayload = {
        package_name: "Custom",
        package_id: formData.package_id,
        package_for: formData.package_for,
        rules: newRules.map((rule) => ({
          name: rule.rule_name, // Use rule_name
          included: rule.included,
        })),
      };
      console.log("Insert rules payload:", insertPayload);
      await dispatch(insertRules(insertPayload)); // Uncomment when ready
    }

    // Edit existing rules
    const editedRules = existingRules
      .filter((rule) => {
        const originalRule = originalRules.find((orig) => orig.id === rule.id);
        return (
          originalRule &&
          (rule.rule_name !== originalRule.rule_name || rule.included !== originalRule.included)
        );
      })
      .map((rule) => ({
        id: rule.id!.toString(),
        rule_name: rule.rule_name, // Use rule_name
        included: rule.included,
      }));

    if (editedRules.length > 0) {
      const editRulePayload = { rules: editedRules };
      console.log("Edit rules payload:", editRulePayload);
      await dispatch(editRule(editRulePayload)); // Uncomment when ready
    }

    // Edit package if changed
    if (
      formData.name !== originalPackage.name ||
      formData.price !== originalPackage.price ||
      formData.duration_days !== originalPackage.duration_days ||
      formData.button_text !== originalPackage.button_text ||
      formData.actual_amount !== originalPackage.actual_amount ||
      formData.gst !== originalPackage.gst ||
      formData.sgst !== originalPackage.sgst ||
      formData.gst_percentage !== originalPackage.gst_percentage ||
      formData.gst_number !== originalPackage.gst_number ||
      formData.rera_number !== originalPackage.rera_number
    ) {
      const editPackagePayload = {
        packageNameId: formData.package_id,
        name: "Custom",
        duration_days: formData.duration_days,
        price: parseInt(formData.price),
        button_text: formData.button_text,
        actual_amount: parseInt(formData.actual_amount),
        gst: parseInt(formData.gst),
        sgst: parseInt(formData.sgst),
        gst_percentage: parseInt(formData.gst_percentage),
        gst_number: formData.gst_number,
        rera_number: formData.rera_number,
      };
      console.log("Edit package payload:", editPackagePayload);
      await dispatch(editPackage(editPackagePayload)); // Uncomment when ready
    }

    dispatch(fetchCustomPackagesByUser(formData.user_id));
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-none flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Edit Package: {pkg.name}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Package For
            </label>
            <input
              type="text"
              name="package_for"
              value={formData.package_for}
              readOnly
              className="mt-1 block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Package Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              readOnly
              className="mt-1 block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Duration (Days)
            </label>
            <input
              type="number"
              name="duration_days"
              value={formData.duration_days}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Price
            </label>
            <div className="relative">
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                /-
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Actual Amount
            </label>
            <div className="relative">
              <input
                type="text"
                name="actual_amount"
                value={formData.actual_amount}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                /-
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              GST Amount
            </label>
            <input
              type="text"
              name="gst"
              value={formData.gst}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              SGST Amount
            </label>
            <input
              type="text"
              name="sgst"
              value={formData.sgst}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              GST Percentage
            </label>
            <input
              type="text"
              name="gst_percentage"
              value={formData.gst_percentage}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              GST Number
            </label>
            <input
              type="text"
              name="gst_number"
              value={formData.gst_number}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              RERA Number
            </label>
            <input
              type="text"
              name="rera_number"
              value={formData.rera_number}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Button Text
            </label>
            <input
              type="text"
              name="button_text"
              value={formData.button_text}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Rules
              </h3>
              <button
                type="button"
                onClick={handleAddRule}
                className="px-3 py-1 bg-[#1D3A76] text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Add Rule
              </button>
            </div>
            {formData.rules.map((rule, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  checked={rule.included}
                  onChange={(e) =>
                    handleRuleChange(index, "included", e.target.checked)
                  }
                  className="h-4 w-4 text-[#1D3A76] focus:ring-[#1D3A76] border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={rule.rule_name} // Use rule_name
                  onChange={(e) =>
                    handleRuleChange(index, "rule_name", e.target.value)
                  }
                  placeholder="Enter rule name"
                  className="block w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#1D3A76]"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveRule(index)}
                  className="text-red-500 hover:text-red-700 text-lg font-bold"
                  aria-label={`Remove rule ${rule.rule_name}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#1D3A76] text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main UserCustomPackage Component
const UserCustomPackage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userId } = useParams<{ userId: string }>();
  const { userCustomPackages, userCustomPackagesLoading, userCustomPackagesError } = useSelector(
    (state: RootState) => state.package
  );
  console.log("userCustomPackages:", userCustomPackages);
  const [editingPackage, setEditingPackage] = useState<CustomPackage | null>(null);

  useEffect(() => {
    if (userId) {
      dispatch(fetchCustomPackagesByUser(parseInt(userId)));
    }
  }, [dispatch, userId]);

  const formatPrice = (price: string): string => {
    const priceNumber = parseFloat(price);
    if (priceNumber === 0) {
      return "Free";
    }
    return `${Math.floor(priceNumber)} /-`;
  };

  const handleEditPackage = (pkg: CustomPackage) => {
    setEditingPackage(pkg);
  };

  const handleSavePackage = (updatedPackage: CustomPackage) => {
    setEditingPackage(null);
  };

  const handleCancelEdit = () => {
    setEditingPackage(null);
  };

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className={`transition-all duration-300 ${editingPackage ? "blur-sm" : ""}`}>
        <ComponentCard title={`Custom Packages for User ${userId}`}>
          {userCustomPackagesLoading && <p>Loading custom packages...</p>}
          {userCustomPackagesError && <p className="text-red-500">Error: {userCustomPackagesError}</p>}
          {!userCustomPackagesLoading && !userCustomPackagesError && userCustomPackages.length === 0 && (
            <p>No custom packages available for this user.</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {userCustomPackages.map((pkg) => (
              <div
                key={pkg.package_id}
                className="relative p-6 rounded-lg shadow-lg border bg-[#1D3A76] text-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-white dark:text-white">
                    {pkg.name}
                  </h3>
                </div>
                <div className="text-center mb-2">
                  <p className="text-sm text-white dark:text-gray-400">
                    {pkg.duration_days} Days
                  </p>
                </div>
                <div className="text-center mb-4">
                  <p className="text-2xl font-semibold text-white dark:text-white">
                    {formatPrice(pkg.price)}
                  </p>
                </div>
                <ul className="space-y-2 mb-6">
                  {pkg.rules.map((rule, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      {rule.included ? (
                        <svg
                          className="w-5 h-5 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                      <span className="text-sm text-white dark:text-white">
                        {rule.rule_name || "Unnamed Rule"} 
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleEditPackage(pkg)}
                  className="w-full py-2 mb-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Edit Package
                </button>
              </div>
            ))}
          </div>
        </ComponentCard>
      </div>
      {editingPackage && (
        <EditPackage
          pkg={editingPackage}
          onSave={handleSavePackage}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default UserCustomPackage;
// components/common/EditUserModal.tsx
import React, { ChangeEvent, FormEvent } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

interface EditUserFormData {
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gst_number?: string;
  rera_number?: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditUserFormData) => void;
  formData: EditUserFormData;
  formErrors: Partial<EditUserFormData>;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  sourcePage: string; // "AllUsers" or "BasicTableOne"
  userType: number; // User type to determine GST/RERA visibility
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  formErrors,
  onInputChange,
  isLoading,
  sourcePage,
  userType,
}) => {
  const specificUserTypes = [3, 4, 5, 6]; // Builder, Agent, Owner, Channel Partner
  const showGstAndRera = sourcePage === "BasicTableOne" && specificUserTypes.includes(userType);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-none flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Edit User Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg
              className="w-6 h-6"
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
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              className="dark:bg-dark-900"
              placeholder="Enter full name"
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={onInputChange}
              className="dark:bg-dark-900"
              placeholder="Enter email address"
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={onInputChange}
              className="dark:bg-dark-900"
              placeholder="Enter address"
            />
            {formErrors.address && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.address}</p>
            )}
          </div>

          <div>
            <Label htmlFor="city">City</Label>
            <Input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={onInputChange}
              className="dark:bg-dark-900"
              placeholder="Enter city"
            />
            {formErrors.city && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.city}</p>
            )}
          </div>

          <div>
            <Label htmlFor="state">State</Label>
            <Input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={onInputChange}
              className="dark:bg-dark-900"
              placeholder="Enter state"
            />
            {formErrors.state && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.state}</p>
            )}
          </div>

          <div>
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              type="text"
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={onInputChange}
              className="dark:bg-dark-900"
              placeholder="Enter pincode"
            />
            {formErrors.pincode && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.pincode}</p>
            )}
          </div>

          {showGstAndRera && (
            <>
              <div>
                <Label htmlFor="gst_number">GST Number</Label>
                <Input
                  type="text"
                  id="gst_number"
                  name="gst_number"
                  value={formData.gst_number || ""}
                  onChange={onInputChange}
                  className="dark:bg-dark-900"
                  placeholder="Enter GST number"
                />
                {formErrors.gst_number && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.gst_number}</p>
                )}
              </div>

              <div>
                <Label htmlFor="rera_number">RERA Number</Label>
                <Input
                  type="text"
                  id="rera_number"
                  name="rera_number"
                  value={formData.rera_number || ""}
                  onChange={onInputChange}
                  className="dark:bg-dark-900"
                  placeholder="Enter RERA number"
                />
                {formErrors.rera_number && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.rera_number}</p>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3">
            <Button onClick={onClose} variant="outline" size="sm" className="px-4 py-2">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="px-4 py-2 bg-[#1D3A76] text-white hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
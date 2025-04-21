import React, { ChangeEvent, FormEvent } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";


interface LeadPullFormData {
  mobile: string;
  email: string;
  name: string;
  sourceType: string;
}

interface LeadPullModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeadPullFormData) => void;
  formData: LeadPullFormData;
  formErrors: Partial<LeadPullFormData>;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const LeadPullModal: React.FC<LeadPullModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  formErrors,
  onInputChange,
}) => {
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
            Enter Lead Pull Details
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
              placeholder="Enter user name"
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {formErrors.name}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              type="text"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={onInputChange}
              className="dark:bg-dark-900"
              placeholder="Enter 10-digit mobile number"
            />
            {formErrors.mobile && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {formErrors.mobile}
              </p>
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
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {formErrors.email}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="sourceType">Lead Source</Label>
            <Input
              type="text"
              id="sourceType"
              name="sourceType"
              value={formData.sourceType}
              onChange={onInputChange}
              className="dark:bg-dark-900"
              placeholder="Enter lead source"
            />
            {formErrors.sourceType && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {formErrors.sourceType}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button
             
              onClick={onClose}
              variant="outline"
              size="sm"
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
             
              variant="primary"
              size="sm"
              className="px-4 py-2 bg-[#1D3A76] text-white hover:bg-blue-700"
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadPullModal;
import React from "react";
import Button from "../ui/button/Button";

interface ActiveStatusModalProps {
  isOpen: boolean;
  propertyName: string;
  action:  "Active" | "Suspend"; // Specify the action type
  onConfirm: () => void;
  onCancel: () => void;
}

const ActiveStatusModal: React.FC<ActiveStatusModalProps> = ({
  isOpen,
  propertyName,
  action,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  
  const actionColor = action === "Active" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700";

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Confirm {action}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to {action.toLowerCase()} <strong>{propertyName}</strong>?
        </p>
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-200"
          >
            No
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onConfirm}
            className={`px-4 py-2 text-white ${actionColor}`}
          >
            Yes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActiveStatusModal;
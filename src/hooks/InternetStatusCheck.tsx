import React, { useState, useEffect } from "react";

// InternetStatusCheck component to monitor online/offline status
const InternetStatusCheck: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    // Update state when online/offline events fire
    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOnline);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Show offline popup when not online
  if (!isOnline) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            You Are Offline
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Please check your internet connection and try again.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              className="px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600"
              onClick={() => {
                // Retry by checking navigator.onLine
                setIsOnline(navigator.onLine);
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default InternetStatusCheck;

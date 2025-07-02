import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import axiosInstance from "../utils/axiosInstance";

// Singleton to manage server status
const serverStatusManager = {
  isChecking: false,
  lastCallTime: 0,
  callCount: 0,
  subscribers: new Set<(serverDown: boolean) => void>(),
  intervalId: null as NodeJS.Timeout | null,

  startChecking(isOnline: boolean) {
    if (this.isChecking || !isOnline) {
      return;
    }
    this.isChecking = true;

    const checkServerStatus = async () => {
      if (!navigator.onLine) {
        return;
      }
      const now = Date.now();
      if (now - this.lastCallTime < 30000) {
        return;
      }

      try {
        await axiosInstance.get("/user/v1/getAllUsersCount");
        this.lastCallTime = now;
        this.callCount += 1;

        this.notifySubscribers(false);
      } catch (error) {
        this.lastCallTime = now;
        this.callCount += 1;

        this.notifySubscribers(true);
      }
    };

    checkServerStatus();
    this.intervalId = setInterval(checkServerStatus, 300000);
  },

  stopChecking() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isChecking = false;
      console.log("ServerStatusCheck: Stopped global interval");
    }
  },

  subscribe(callback: (serverDown: boolean) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  },

  notifySubscribers(serverDown: boolean) {
    this.subscribers.forEach((callback) => callback(serverDown));
  },
};

const ServerStatusCheck: React.FC<{
  children: React.ReactNode;
  isOnline: boolean;
}> = ({ children, isOnline }) => {
  const [serverDown, setServerDown] = useState(false);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !isOnline) {
      return;
    }

    if (!isMounted.current) {
      isMounted.current = true;

      serverStatusManager.startChecking(isOnline);
    }

    const unsubscribe = serverStatusManager.subscribe((down) => {
      setServerDown(down);
    });

    return () => {
      unsubscribe();
      if (isMounted.current) {
        isMounted.current = false;
        console.log("ServerStatusCheck: Component unmounted");
      }
    };
  }, [isAuthenticated, isOnline]);

  if (serverDown && isOnline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Server Unavailable
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Our servers are currently down. Please try again later.
          </p>
          <button
            className="px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ServerStatusCheck;

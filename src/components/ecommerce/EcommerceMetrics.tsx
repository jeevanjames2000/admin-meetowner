import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsersCount } from "../../store/slices/authSlice"; // Adjust path as needed
import { RootState, AppDispatch } from "../../store/store";

import { GroupIcon } from "../../icons";
import { BoxIconLine } from "../../icons";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import Badge from "../ui/badge/Badge";
import { useNavigate } from "react-router";

// Mapping of user_type to user names
const userTypeMap: { [key: string]: string } = {
  "1": "Admin",
  "2": "User",
  "3": "Builder",
  "4": "Agent",
  "5": "Owner",
  "6": "Channel Partner",
  "7": "Manager",
  "8": "Telecaller",
  "9": "Marketing Executive",
  "10": "Customer Support",
  "11": "Customer Service",
  Total: "Total",
};

// Define allowed user types for each user_type
const allowedUserTypes: { [key: string]: string[] } = {
  "1": Object.keys(userTypeMap), // Admin sees all
  "7": ["2", "4", "6", "8", "9", "10", "11"], // Channel Partners, Agents, Users, Marketing Executives, Telecallers, Customer Support, Customer Service
  "9": ["3", "4", "6"], // Channel Partners, Agents, Builders
};

// Define a type for the user count item
interface UserCountItem {
  user_type: string;
  count: number;
  trend?: "up" | "down";
  percentage?: number;
}

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { userCounts, loading, error } = useSelector((state: RootState) => state.auth);
  const userType = useSelector((state: RootState) => state.auth.user?.user_type);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userCounts) {
      dispatch(getAllUsersCount());
    }
  }, [dispatch, userCounts]);

  // Handle card click (only for non-"Total" user types)
  const handleCardClick = (item: UserCountItem) => {
    console.log(`Clicked on ${userTypeMap[item.user_type]} with count ${item.count}`);
    navigate(`/basic-tables-one?userType=${item.user_type}`);
  };

  // Filter user counts based on the logged-in user's user_type
  const filteredUserCounts = userCounts?.filter((item) =>
    allowedUserTypes[userType ?? ""]?.includes(item.user_type)
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white">
        Dashboard
      </h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filteredUserCounts && filteredUserCounts.length > 0 ? (
          filteredUserCounts.map((item, index) => (
            <div
              key={item.user_type}
              onClick={item.user_type !== "Total" ? () => handleCardClick(item) : undefined}
              className={`rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 ${
                item.user_type !== "Total" ? "cursor-pointer hover:shadow-lg" : "cursor-default"
              } transition-shadow duration-200`}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                {index % 2 === 0 ? (
                  <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
                ) : (
                  <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
                )}
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {userTypeMap[item.user_type] || "Unknown"}
                  </span>
                  <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {item.count.toLocaleString()}
                  </h4>
                </div>
                <Badge color={index % 2 === 0 ? "success" : "error"}>
                  {index % 2 === 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                  {index % 2 === 0 ? "5" : "3"}%
                </Badge>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            No user count data available.
          </p>
        )}
      </div>
    </div>
  );
}
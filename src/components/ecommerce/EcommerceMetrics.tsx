import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsersCount } from "../../store/slices/authSlice";
import { RootState, AppDispatch } from "../../store/store";
import { GroupIcon } from "../../icons";
import { BoxIconLine } from "../../icons";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import Badge from "../ui/badge/Badge";
import { useNavigate } from "react-router";

// Mapping of user_type to user names
const userTypeMap: { [key: string]: string } = {
  "1": "Admin",
  "2":"User",
  "3":"Builder",
  "4":"Agent",
  "5": "Owner",
  "6":"Channel Partner",
  "7": "Manager",
  "8": "Telecaller",
  "9": "Marketing Executive",
  "10": "Customer Support",
  "11": "Customer Service",
  Total: "Total",
};
interface Option {
  value: number;
  text: string;
}

const designationOptions: Option[] = [
  { value: 1, text: "Admin" },
  { value: 2, text: "User" },
  { value: 3, text: "Builder" },
  { value: 4, text: "Agent" },
  { value: 5, text: "Owner" },
  { value: 6, text: "Channel Partner" },
  { value: 7, text: "Manager" },
  { value: 8, text: "TeleCaller" },
  { value: 9, text: "Marketing Executive" },
  { value: 10, text: "Customer Support" },
  { value: 11, text: "Customer Service" },
];

// Define allowed user types for each user_type
const allowedUserTypes: { [key: string]: string[] } = {
  "1": Object.keys(userTypeMap), // Admin sees all
  "2":Object.keys(userTypeMap),
  "3":Object.keys(userTypeMap),
  "4":Object.keys(userTypeMap),
  "5":Object.keys(userTypeMap),
  "6":Object.keys(userTypeMap),
  // "7": ["2", "3", "4", "5", "6", "8", "9", "10", "11"], // Manager
  // "9": ["3", "4", "6"], // Marketing Executive
  // "3": ["3", "4", "6"], // Builder

};

interface UserCountItem {
  user_type: string;
  count: number;
}

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { userCounts, loading, error, user } = useSelector((state: RootState) => state.auth);
  const userType = user?.user_type?.toString();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userCounts && !loading && !error) {
      dispatch(getAllUsersCount());
    }
  }, [ userCounts, loading, error]);

  const handleCardClick = (item: UserCountItem) => {
    if (item.user_type !== "Total") {
      navigate(`/basic-tables-one?userType=${item.user_type}`);
    }
  };

  const getDesignationText = (userType:number | undefined):string => {
    const designation = designationOptions.find((option) => option.value === userType);
    return designation ? designation.text :'Unknow Designation';
  }

  // Filter user counts based on the logged-in user's user_type
  const filteredUserCounts = userCounts?.filter((item) =>
    allowedUserTypes[userType ?? ""]?.includes(item.user_type)
  );

  // Separate "Owner Employees" (user types 7, 8, 9, 10, 11) from other user types
  const ownerEmployeesUserTypes = ["7", "8", "9", "10", "11"];
  const ownerEmployeesCounts = filteredUserCounts?.filter((item) =>
    ownerEmployeesUserTypes.includes(item.user_type)
  );
  const otherUserCounts = filteredUserCounts?.filter(
    (item) => !ownerEmployeesUserTypes.includes(item.user_type)
  );

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold text-[#1D3A76] dark:text-white">
        Welcome {user?.name || "User"}! Your role is {getDesignationText(user?.user_type)}
      </h1>
      <h1 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white">
        Dashboard
      </h1>

      {/* Row for Other User Types */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {otherUserCounts && otherUserCounts.length > 0 ? (
          otherUserCounts.map((item, index) => (
            <div
              key={item.user_type}
              onClick={() => handleCardClick(item)}
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
                {/* Mock trend and percentage since not provided by API */}
                <Badge color={index % 2 === 0 ? "success" : "error"}>
                  {index % 2 === 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                  {index % 2 === 0 ? "5" : "3"}%
                </Badge>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 col-span-full">
            No user count data available for your role.
          </p>
        )}
      </div>

      {/* Row for Owner Employees */}
      {ownerEmployeesCounts && ownerEmployeesCounts.length > 0 && (
        <div className="mt-6">
          <h2 className="m-4 text-2xl font-semibold text-gray-800 dark:text-white underline decoration-[#1D3A76] dark:decoration-white">
            Meet Owner Employees
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ownerEmployeesCounts.map((item, index) => (
              <div
                key={item.user_type}
                onClick={() => handleCardClick(item)}
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
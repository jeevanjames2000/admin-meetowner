import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsersCount } from "../../store/slices/authSlice";
import { fetchEmployeeCounts, fetchCurrentActiveUsers } from "../../store/slices/employeeUsers";
import { RootState, AppDispatch } from "../../store/store";
import { GroupIcon } from "../../icons";
import { BoxIconLine } from "../../icons";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import Badge from "../ui/badge/Badge";
import { useNavigate } from "react-router";

const userTypeMap: { [key: string]: string } = {
  "1": "Admin",
  "2": "User",
  "3": "Builder",
  "4": "Agent",
  "5": "Owner",
  "6": "Channel Partner",
  Total: "Total",
};

const EmployeeTypeMap: { [key: string]: string } = {
  "1": "Admin",
  "7": "Manager",
  "8": "Telecaller",
  "9": "Marketing Executive",
  "10": "Customer Support",
  Total: "Total",
};

interface Option {
  value: number;
  text: string;
}

const designationOptions: Option[] = [
  { value: 1, text: "Admin" },
  { value: 7, text: "Manager" },
  { value: 8, text: "Telecaller" },
  { value: 9, text: "Marketing Executive" },
  { value: 10, text: "Customer Support" },
];

interface UserCountItem {
  user_type: string;
  count: number;
}

interface EmployeeCountItem {
  user_type: string;
  count: number;
}

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { userCounts, loading, error, user } = useSelector((state: RootState) => state.auth);
  const { employeeCounts, countsLoading, countsError, activeUsers, activeUsersLoading, activeUsersError } = useSelector(
    (state: RootState) => state.employeeUsers
  );
  const navigate = useNavigate();

  // Fetch user counts, employee counts, and active users
  useEffect(() => {
    // Fetch user counts
    if (!userCounts && !loading && !error) {
      dispatch(getAllUsersCount());
    }

    // Fetch employee counts
    if (!employeeCounts && !countsLoading && !countsError) {
      dispatch(fetchEmployeeCounts());
    }

    // Fetch active users
    if (!activeUsers.length && !activeUsersLoading && !activeUsersError) {
      dispatch(fetchCurrentActiveUsers());
    }
  }, [
    userCounts, loading, error,
    employeeCounts, countsLoading, countsError,
    activeUsers, activeUsersLoading, activeUsersError,
    dispatch
  ]);

  const handleCardClick = (item: UserCountItem) => {
    if (item.user_type !== "Total") {
      navigate(`/basic-tables-one?userType=${item.user_type}`);
    }
  };

  const handleActiveCardClick = () => {
     navigate('/activeusers');
  }

  const handleEmployeeCardClick = (item: EmployeeCountItem) => {
    if (item.user_type !== "Total") {
      navigate(`/basic-tables-employees?userType=${item.user_type}`);
    }
  };

  const getDesignationText = (userType: number | undefined): string => {
    const designation = designationOptions.find((option) => option.value === userType);
    return designation ? designation.text : "Unknown Designation";
  };

  // Show loading or error states
  if (loading || countsLoading || activeUsersLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error || countsError || activeUsersError) {
    return (
      <div className="p-6 text-red-500">
        Error: {error || countsError || activeUsersError}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold text-[#1D3A76] dark:text-white">
        Welcome {user?.name || "User"}! Your role is {getDesignationText(user?.user_type)}
      </h1>
      <div className="flex flex-col sm:flex-row gap-6 mb-6">
     
        <div  onClick={() => handleActiveCardClick()}
          className="w-full sm:w-[20%] rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800
           dark:bg-white/[0.03] md:p-6 transition-shadow duration-200 cursor-pointer hover:shadow-lg"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Current Active Users
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {activeUsers.length}
              </h4>
            </div>
          </div>
        </div>

       
       
      </div>
      <h1 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white">
        Dashboard
      </h1>

      {/* Row for Non-Employee User Types */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {userCounts && userCounts.length > 0 ? (
          userCounts.map((item, index) => (
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
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 col-span-full">
            No user count data available for your role.
          </p>
        )}
      </div>

      {/* Row for Employees */}
      {employeeCounts && employeeCounts.length > 0 && (
        <div className="mt-6">
          <h2 className="m-4 text-2xl font-semibold text-gray-800 dark:text-white underline decoration-[#1D3A76] dark:decoration-white">
            Employees
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {employeeCounts.map((item, index) => (
              <div
                key={item.user_type}
                onClick={() => handleEmployeeCardClick(item)}
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
                      {EmployeeTypeMap[item.user_type] || "Unknown"}
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
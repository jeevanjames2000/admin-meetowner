import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsersCount } from "../../store/slices/authSlice";
import { fetchEmployeeCounts } from "../../store/slices/employeeUsers";
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
  "1":"Admin",
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
  { value: 2, text: "User" },
  { value: 3, text: "Builder" },
  { value: 4, text: "Agent" },
  { value: 5, text: "Owner" },
  { value: 6, text: "Channel Partner" },
];



// const allowedUserTypes: { [key: string]: string[] } = {
//   "1": Object.keys(userTypeMap), // Admin sees all
//   "6": Object.keys(userTypeMap),
//   "7": ["2", "3", "4", "5", "6", "8", "9", "10"], // Manager
//   "8": ["2", "3", "4", "5", "6"], // Telecaller
//   "9": ["2", "3", "4", "6", "9", "10"], // Marketing Executive
//   "10": ["2", "3", "4", "5", "6"], // Customer Support
// };

interface UserCountItem {
  user_type: string;
  count: number;
}

interface EmployeeCountItem {
  user_type:string;
  count:number;
}

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { userCounts, loading, error, user } = useSelector((state: RootState) => state.auth);
  const { employeeCounts, countsLoading, countsError } = useSelector(
    (state: RootState) => state.employeeUsers
  );
  // const userType = user?.user_type?.toString();
  const navigate = useNavigate();

  // Fetch user counts
  useEffect(() => {
    console.log("Checking user counts fetch", { userCounts, loading, error });
    if (!userCounts && !loading && !error) {
      dispatch(getAllUsersCount());
    }
  }, [userCounts, loading, error, dispatch]);

  // Fetch employee counts
  useEffect(() => {
    
    if (!employeeCounts && !countsLoading && !countsError) {
      dispatch(fetchEmployeeCounts());
    }
  }, [employeeCounts, countsLoading, countsError, dispatch]);

  const handleCardClick = (item: UserCountItem) => {
    if (item.user_type !== "Total" ) {
      navigate(`/basic-tables-one?userType=${item.user_type}`);
    }
    
  };

  const handleEmployeeCardClick = (item: EmployeeCountItem) => {
    if (item.user_type !== "Total"){
      navigate(`/basic-tables-employees?userType=${item.user_type}`)
    }
  }

  const getDesignationText = (userType: number | undefined): string => {
    const designation = designationOptions.find((option) => option.value === userType);
    return designation ? designation.text : "Unknown Designation";
  };

  

 

  if (loading || countsLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (countsError) return <div className="p-6 text-red-500">Error: {countsError}</div>;

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold text-[#1D3A76] dark:text-white">
        Welcome {user?.name || "User"}! Your role is {getDesignationText(user?.user_type)}
      </h1>
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
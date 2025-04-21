import { RootState } from "../../store/store";
import { useSelector } from "react-redux";

interface Option {
  value: number;  // Changed to number to match user_type
  text: string;
}

const designationOptions: Option[] = [
  { value: 1, text: "Admin" },
  {value : 2,text:"User"},
  {value : 3,text :"Builder"},
  {value : 4,text:"Agent"},
  {value : 5,text:"Owner"},
  {value:6,text:"Channel Partner"},
  { value: 7, text: "Manager" },

  { value: 8, text: "TeleCaller" },
  { value: 9, text: "Marketing Executive" },
  { value: 10, text: "Customer Support" },
  { value: 11, text: "Customer Service" },
];

export default function UserInfoCard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const userType = useSelector((state: RootState) => state.auth.user?.user_type);

  // Function to get designation text based on user_type
  const getDesignationText = (userType: number | undefined): string => {
    const designation = designationOptions.find(option => option.value === userType);
    return designation ? designation.text : "Unknown Designation";
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                First Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.name || "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.email || "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                +91 {user?.mobile || localStorage.getItem('mobile') || "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Bio
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {getDesignationText(userType)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
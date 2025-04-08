

import { useSelector } from "react-redux";
import { RootState } from "../../store/store";


interface Option {
  value: number;  
  text: string;
}

const designationOptions: Option[] = [
  { value: 1, text: "Admin" },
  { value: 7, text: "Manager" },
  { value: 8, text: "TeleCaller" },
  { value: 9, text: "Marketing Executive" },
  { value: 10, text: "Customer Support" },
  { value: 11, text: "Customer Service" },
];

export default function UserMetaCard() {
 
  const {  user } = useSelector((state: RootState) => state.auth);
  const getDesignationText = (userType: number | undefined): string => {
    const designation = designationOptions.find(option => option.value === userType);
    return designation ? designation.text : "Unknown Designation";
  };
  
  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img src="/images/user/owner.jpg" alt="user" />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {user?.name}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                {getDesignationText(user?.user_type)}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {localStorage.getItem('city')}
                </p>
              </div>
            </div>
           
          </div>
        
        </div>
      </div>
      
    </>
  );
}

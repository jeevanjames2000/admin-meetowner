import { useState, useRef, useEffect } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useNavigate } from "react-router";

// Define the type for the commercial rent review data
interface CommercialRentData {
  id: string;
  slNo: number;
  projectName: string;
  propertySubType: "Office" | "Retail Shop" | "Show Room" | "Ware House" | "Plot" | "Others";
  userType: "Owner" | "Builder" | "Agent" | "Channel Partner";
  listingTimeAndDate: string;
}

// Generate random data
const generateRandomData = (): CommercialRentData[] => {
  const propertySubTypes: ("Office" | "Retail Shop" | "Show Room" | "Ware House" | "Plot" | "Others")[] = [
    "Office",
    "Retail Shop",
    "Show Room",
    "Ware House",
    "Plot",
    "Others",
  ];
  const userTypes: ("Owner" | "Builder" | "Agent" | "Channel Partner")[] = [
    "Owner",
    "Builder",
    "Agent",
    "Channel Partner",
  ];
  const projectNames = [
    "Green Valley",
    "Sunset Heights",
    "Blue Horizon",
    "Golden Towers",
    "Silver Oaks",
    "Emerald Gardens",
    "Pine Crest",
    "Maple Grove",
    "Riverfront Plaza",
    "Skyline Residences",
  ];

  const data: CommercialRentData[] = [];
  for (let i = 1; i <= 10; i++) {
    const randomDate = new Date(
      Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
    ).toLocaleString();

    data.push({
      id: `ID-${i.toString().padStart(3, "0")}`,
      slNo: i,
      projectName: projectNames[i - 1],
      propertySubType: propertySubTypes[Math.floor(Math.random() * propertySubTypes.length)],
      userType: userTypes[Math.floor(Math.random() * userTypes.length)],
      listingTimeAndDate: randomDate,
    });
  }
  return data;
};

const CommercialRentReview: React.FC = () => {
  const [reviewList, setReviewList] = useState<CommercialRentData[]>(generateRandomData());
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEdit = (item: CommercialRentData) => {
    navigate('/commercial-rent-edit');
    setDropdownOpen(null);
  };

  const handleDelete = (id: string) => {
    setReviewList(reviewList.filter((item) => item.id !== id));
    setDropdownOpen(null);
  };

  const handleApprove = (item: CommercialRentData) => {
    setDropdownOpen(null);
  };

  if (!reviewList || reviewList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          No Data Available
        </h2>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <PageMeta
        title="Meet Owner Commercial Rent Review"
        description="This is the Commercial Rent Review Table page"
      />
      <PageBreadcrumb pageTitle="Commercial Rent Review" pagePlacHolder="Filter listings" />
      <div className="space-y-6">
        <ComponentCard title="Commercial Rent Review">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      ID
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Sl. No
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Project Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Property SubType
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      User Type
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Listing Time & Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {reviewList.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.id}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.slNo}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.projectName}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.propertySubType}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.userType}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.listingTimeAndDate}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                        <button
                          onClick={() => setDropdownOpen(dropdownOpen === item.id ? null : item.id)}
                          className="focus:outline-none"
                        >
                          <svg
                            className="w-5 h-5 text-gray-500 dark:text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        {dropdownOpen === item.id && (
                          <div
                            ref={dropdownRef}
                            className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10"
                          >
                            <button
                              onClick={() => handleEdit(item)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => handleApprove(item)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Approve
                            </button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
};

export default CommercialRentReview;
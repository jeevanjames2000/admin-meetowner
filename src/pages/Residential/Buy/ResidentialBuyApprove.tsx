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
import { useNavigate } from "react-router"; // Corrected import

// Define the type for the residential buy review data
interface ResidentialBuyData {
  id: string;
  slNo: number;
  projectName: string;
  propertyType: "Apartment" | "Independent Villa" | "Independent House" | "Plot" | "Land";
  userType: "Owner" | "Builder" | "Agent" | "Channel Partner";
  listingTimeAndDate: string;
  username: string;
  phoneNumber: string;
}

// List of Indian usernames
const indianUsernames = [
  "Aarav Sharma",
  "Priya Patel",
  "Rohan Gupta",
  "Sneha Reddy",
  "Vikram Singh",
  "Neha Kapoor",
  "Arjun Rao",
  "Kavita Desai",
  "Rahul Verma",
  "Pooja Nair",
];

// Function to generate a random Indian phone number
const generateIndianPhoneNumber = (): string => {
  const startingDigits = [6, 7, 8, 9];
  const startDigit = startingDigits[Math.floor(Math.random() * startingDigits.length)];
  const remainingDigits = Math.floor(100000000 + Math.random() * 900000000).toString(); // 9 digits
  return `+91${startDigit}${remainingDigits}`;
};

// Generate random data with Indian users
const generateRandomData = (): ResidentialBuyData[] => {
  const propertyTypes: ("Apartment" | "Independent Villa" | "Independent House" | "Plot" | "Land")[] = [
    "Apartment",
    "Independent Villa",
    "Independent House",
    "Plot",
    "Land",
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

  const data: ResidentialBuyData[] = [];
  for (let i = 1; i <= 10; i++) {
    const randomDate = new Date(
      Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
    ).toLocaleString();

    data.push({
      id: `ID-${i.toString().padStart(3, "0")}`,
      slNo: i,
      projectName: projectNames[i - 1],
      propertyType: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
      userType: userTypes[Math.floor(Math.random() * userTypes.length)],
      listingTimeAndDate: randomDate,
      username: indianUsernames[i - 1],
      phoneNumber: generateIndianPhoneNumber(),
    });
  }
  return data;
};

const ResidentialBuyApprove: React.FC = () => {
  const [reviewList, setReviewList] = useState<ResidentialBuyData[]>(generateRandomData());
  const [filteredList, setFilteredList] = useState<ResidentialBuyData[]>(reviewList);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [userInfoOpen, setUserInfoOpen] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userInfoRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle filter input
  const handleFilter = (filterValue: string) => {
    const lowerCaseFilter = filterValue.toLowerCase();
    if (filterValue.trim() === "") {
      // If filter is cleared, show all data
      setFilteredList(reviewList);
    } else {
      const filtered = reviewList.filter(
        (item) =>
          item.id.toLowerCase().includes(lowerCaseFilter) ||
          item.slNo.toString().includes(lowerCaseFilter) ||
          item.projectName.toLowerCase().includes(lowerCaseFilter) ||
          item.propertyType.toLowerCase().includes(lowerCaseFilter) ||
          item.userType.toLowerCase().includes(lowerCaseFilter) ||
          item.username.toLowerCase().includes(lowerCaseFilter) ||
          item.phoneNumber.toLowerCase().includes(lowerCaseFilter)
      );
      setFilteredList(filtered);
    }
  };

  // Handle clicking outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
      if (userInfoRef.current && !userInfoRef.current.contains(event.target as Node)) {
        setUserInfoOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Action handlers
  const handleEdit = (item: ResidentialBuyData) => {
    console.log("Edit:", item);
    navigate("/residential-buy-edit");
    setDropdownOpen(null);
  };

  const handleDelete = (id: string) => {
    const updatedList = reviewList.filter((item) => item.id !== id);
    setReviewList(updatedList);
    setFilteredList(updatedList);
    setDropdownOpen(null);
  };

  const handleApprove = (item: ResidentialBuyData) => {
    console.log("Approve:", item);
    setDropdownOpen(null);
  };

  const handleUserTypeClick = (id: string) => {
    setUserInfoOpen(userInfoOpen === id ? null : id);
  };

  return (
    <div className="relative min-h-screen">
      <PageMeta
        title="Residential Buy Approve"
        description="This is the Residential Buy Approve Table page"
      />
      <PageBreadcrumb
        pageTitle="Residential Buy Approve"
        pagePlacHolder="Filter listings"
        onFilter={handleFilter}
      />
      <div className="space-y-6">
        <ComponentCard title="Residential Buy Approve">
          {filteredList.length === 0 ? (
            <div className="py-6 text-center">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                No matching data found
              </h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Try adjusting your filter or clear it to see all listings.
              </p>
            </div>
          ) : (
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
                        Property Type
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
                    {filteredList.map((item) => (
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
                          {item.propertyType}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                          <button
                            onClick={() => handleUserTypeClick(item.id)}
                            className="focus:outline-none text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {item.userType}
                          </button>
                          {userInfoOpen === item.id && (
                            <div
                              ref={userInfoRef}
                              className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 p-2"
                            >
                              <div className="text-sm text-gray-700 dark:text-gray-200">
                                <p>
                                  <strong>Username:</strong> {item.username}
                                </p>
                                <p>
                                  <strong>Phone:</strong> {item.phoneNumber}
                                </p>
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {item.listingTimeAndDate}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                          <button
                            onClick={() =>
                              setDropdownOpen(dropdownOpen === item.id ? null : item.id)
                            }
                            className="focus:outline-none"
                          >
                            <svg
                              className="w-5 h-5 text-gray-500 dark:text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
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
          )}
        </ComponentCard>
      </div>
    </div>
  );
};

export default ResidentialBuyApprove;
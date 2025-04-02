import { useState, useEffect, useRef } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

// Define the type for the property lead data with mobileNumber added
interface PropertyLead {
  slNo: number;
  approach: "Scheduled" | "Interested" | "Contacted";
  customerName: string;
  mobileNumber: string;
  propertyType: "Residential" | "Commercial";
  propertySubType: "Apartment" | "Independent Villa" | "Independent House" | "Plot" | "Land";
  projectName: string;
  location: string;
  bhk: "1BHK" | "2BHK" | "3BHK" | "4BHK";
  city: string;
  state: string;
  leadStatus: "Opened" | "Pending" | "Closed";
  dateTime: string;
}

// Generate random data with mobileNumber included
const generateRandomData = (): PropertyLead[] => {
  const approaches: ("Scheduled" | "Interested" | "Contacted")[] = ["Scheduled", "Interested", "Contacted"];
  const propertyTypes: ("Residential" | "Commercial")[] = ["Residential", "Commercial"];
  const propertySubTypes: ("Apartment" | "Independent Villa" | "Independent House" | "Plot" | "Land")[] = [
    "Apartment",
    "Independent Villa",
    "Independent House",
    "Plot",
    "Land",
  ];
  const bhks: ("1BHK" | "2BHK" | "3BHK" | "4BHK")[] = ["1BHK", "2BHK", "3BHK", "4BHK"];
  const leadStatuses: ("Opened" | "Pending" | "Closed")[] = ["Opened", "Pending", "Closed"];
  const customerNames = [
    "John Doe",
    "Jane Smith",
    "Michael Brown",
    "Emily Davis",
    "Robert Wilson",
    "Sarah Johnson",
    "David Lee",
    "Laura Adams",
    "Chris Evans",
    "Anna Taylor",
    "John Doe",
    "Jane Smith",
    "Michael Brown",
    "Emily Davis",
    "Robert Wilson",
    "Sarah Johnson",
    "David Lee",
    "Laura Adams",
    "Chris Evans",
    "Anna Taylor",
    "John Doe",
    "Jane Smith",
    "Michael Brown",
    "Emily Davis",
    "Robert Wilson",
    "Sarah Johnson",
    "David Lee",
    "Laura Adams",
    "Chris Evans",
    "Anna Taylor",
    "John Doe",
    "Jane Smith",
    "Michael Brown",
    "Emily Davis",
    "Robert Wilson",
    "Sarah Johnson",
    "David Lee",
    "Laura Adams",
    "Chris Evans",
    "Anna Taylor",
  ];
  const mobileNumbers = [
    "9876543210",
    "8765432109",
    "7654321098",
    "6543210987",
    "5432109876",
    "4321098765",
    "3210987654",
    "2109876543",
    "1098765432",
    "0987654321",
    "9876543210",
    "8765432109",
    "7654321098",
    "6543210987",
    "5432109876",
    "4321098765",
    "3210987654",
    "2109876543",
    "1098765432",
    "0987654321",
    "9876543210",
    "8765432109",
    "7654321098",
    "6543210987",
    "5432109876",
    "4321098765",
    "3210987654",
    "2109876543",
    "1098765432",
    "0987654321",
    "9876543210",
    "8765432109",
    "7654321098",
    "6543210987",
    "5432109876",
    "4321098765",
    "3210987654",
    "2109876543",
    "1098765432",
    "0987654321",
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
  const locations = [
    "Downtown",
    "Suburbs",
    "East Side",
    "West End",
    "North Hills",
    "South Park",
    "Central Avenue",
    "Lakeside",
    "Hilltop",
    "Riverside",
    "Downtown",
    "Suburbs",
    "East Side",
    "West End",
    "North Hills",
    "South Park",
    "Central Avenue",
    "Lakeside",
    "Hilltop",
    "Riverside",
    "Downtown",
    "Suburbs",
    "East Side",
    "West End",
    "North Hills",
    "South Park",
    "Central Avenue",
    "Lakeside",
    "Hilltop",
    "Riverside",
    "Downtown",
    "Suburbs",
    "East Side",
    "West End",
    "North Hills",
    "South Park",
    "Central Avenue",
    "Lakeside",
    "Hilltop",
    "Riverside",
  ];

  const cities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Hyderabad",
    "Kolkata",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Lucknow",
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Hyderabad",
    "Kolkata",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Lucknow",
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Hyderabad",
    "Kolkata",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Lucknow",
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Hyderabad",
    "Kolkata",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Lucknow",
  ];
  const states = [
    "Maharashtra",
    "Delhi",
    "Karnataka",
    "Tamil Nadu",
    "Telangana",
    "West Bengal",
    "Maharashtra",
    "Gujarat",
    "Rajasthan",
    "Uttar Pradesh",
    "Maharashtra",
    "Delhi",
    "Karnataka",
    "Tamil Nadu",
    "Telangana",
    "West Bengal",
    "Maharashtra",
    "Gujarat",
    "Rajasthan",
    "Uttar Pradesh",
    "Maharashtra",
    "Delhi",
    "Karnataka",
    "Tamil Nadu",
    "Telangana",
    "West Bengal",
    "Maharashtra",
    "Gujarat",
    "Rajasthan",
    "Uttar Pradesh",
    "Maharashtra",
    "Delhi",
    "Karnataka",
    "Tamil Nadu",
    "Telangana",
    "West Bengal",
    "Maharashtra",
    "Gujarat",
    "Rajasthan",
    "Uttar Pradesh",
  ];

  const data: PropertyLead[] = [];
  for (let i = 1; i <= 40; i++) {
    const randomDate = new Date(
      Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
    ).toLocaleString();

   data.push({
      slNo: i,
      approach: approaches[Math.floor(Math.random() * approaches.length)],
      customerName: customerNames[i - 1],
      mobileNumber: mobileNumbers[i - 1],
      propertyType: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
      propertySubType: propertySubTypes[Math.floor(Math.random() * propertySubTypes.length)],
      projectName: projectNames[i - 1],
      location: locations[i - 1],
      bhk: bhks[Math.floor(Math.random() * bhks.length)],
      city: cities[i - 1],
      state: states[i - 1],
      leadStatus: leadStatuses[Math.floor(Math.random() * leadStatuses.length)],
      dateTime: randomDate,
    });
  }
  return data;
};

const PropertyLeadsBuy: React.FC = () => {
  const [leadsList, setLeadsList] = useState<PropertyLead[]>(generateRandomData());
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const itemsPerPage = 10; // Number of items per page
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [editLead, setEditLead] = useState<PropertyLead | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate total pages
  const totalPages = Math.ceil(leadsList.length / itemsPerPage);

  // Get the current page's data
  const paginatedLeads = leadsList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close modal on "Esc" key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setEditLead(null);
      }
    };
    if (editLead) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [editLead]);

  if (!leadsList || leadsList.length === 0) {
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
      {/* Main content */}
      <div className={editLead ? "blur-sm pointer-events-none" : ""}>
        <PageMeta
          title="Lead Management Buy"
          description="This is the Property Leads Table page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
        />
        <PageBreadcrumb pageTitle="Lead Management Buy" pagePlacHolder="Filter projects, Sellers" />
        <div className="space-y-6">
          <ComponentCard title="Lead Management Buy">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  {/* Table Header */}
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
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
                        Approach
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Customer Name
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Mobile Number
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
                        Property SubType
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
                        Location
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        BHK
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        City
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        State
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Lead Status
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Date & Time
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  {/* Table Body */}
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {paginatedLeads.map((lead) => (
                      <TableRow key={lead.slNo}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {lead.slNo}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {lead.approach}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {lead.customerName}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {lead.mobileNumber}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {lead.propertyType}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {lead.propertySubType}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {lead.projectName}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {lead.location}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {lead.bhk}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {lead.city}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {lead.state}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              lead.leadStatus === "Opened"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : lead.leadStatus === "Pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {lead.leadStatus}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {lead.dateTime}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4 px-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
};

export default PropertyLeadsBuy;
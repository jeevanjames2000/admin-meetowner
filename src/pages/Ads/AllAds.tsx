import React, { useState, useEffect, useRef } from "react";
import PageBreadcrumbList from "../../components/common/PageBreadCrumbLists";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { Table ,TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";


import { MoreVertical } from "lucide-react"; // For the action menu icon
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";


// Define the type for the ads data
interface Ad {
  slNo: number;
  propertyId: string;
  propertyName: string;
  adsType: string;
  city: string;
  status: "Active" | "Suspended";
}

// Generate 30 sample ads
const generateSampleAds = (): Ad[] => {
  const adsTypes = ["Banner", "Sidebar", "Popup", "Slider", "Video"];
  const cities = ["Hyderabad", "Bangalore", "Mumbai", "Delhi", "Chennai"];
  const propertyNames = [
    "Sunrise Villa", "Green Meadows", "Ocean Breeze", "Skyline Towers", "Golden Nest",
    "Palm Grove", "Riverfront Residency", "Hilltop Haven", "Urban Oasis", "Lakeview Apartments",
    "Starlight Residency", "Moonlit Gardens", "Crystal Palace", "Emerald Heights", "Serenity Homes",
    "Majestic Manor", "Twilight Towers", "Harmony Homes", "Blissful Bungalows", "Paradise Plaza",
    "Silver Springs", "Golden Horizon", "Tranquil Terrace", "Elite Estates", "Royal Residency",
    "Vibrant Villas", "Lush Landscapes", "Pinnacle Properties", "Zenith Zones", "Dream Dwellings"
  ];

  const data: Ad[] = [];
  for (let i = 1; i <= 30; i++) {
    data.push({
      slNo: i,
      propertyId: `PROP${String(i).padStart(4, "0")}`,
      propertyName: propertyNames[i - 1],
      adsType: adsTypes[Math.floor(Math.random() * adsTypes.length)],
      city: cities[Math.floor(Math.random() * cities.length)],
      status: Math.random() > 0.5 ? "Active" : "Suspended",
    });
  }
  return data;
};

const AllAdsPage: React.FC = () => {
  const [adsList, setAdsList] = useState<Ad[]>(generateSampleAds());
  const [filteredAds, setFilteredAds] = useState<Ad[]>(adsList);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const adsPerPage = 10;

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle search
  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = adsList.filter(
      (ad) =>
        ad.propertyId.toLowerCase().includes(lowerQuery) ||
        ad.propertyName.toLowerCase().includes(lowerQuery) ||
        ad.city.toLowerCase().includes(lowerQuery) ||
        ad.adsType.toLowerCase().includes(lowerQuery)
    );
    setFilteredAds(filtered);
    setCurrentPage(1); // Reset to first page on search
  }, [searchQuery, adsList]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAds.length / adsPerPage);
  const indexOfLastAd = currentPage * adsPerPage;
  const indexOfFirstAd = indexOfLastAd - adsPerPage;
  const currentAds = filteredAds.slice(indexOfFirstAd, indexOfLastAd);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setActiveMenu(null); // Close any open menus
    }
  };

  const toggleMenu = (propertyId: string) => {
    setActiveMenu(activeMenu === propertyId ? null : propertyId);
  };

  const handleEdit = (propertyId: string) => {
    console.log(`Edit ad with Property ID: ${propertyId}`);
    // Implement edit logic (e.g., navigate to edit page)
    setActiveMenu(null);
  };

  const handleDelete = (propertyId: string) => {
    setAdsList(adsList.filter((ad) => ad.propertyId !== propertyId));
    setActiveMenu(null);
  };

  const handleStatusChange = (ad: Ad) => {
    setAdsList(
      adsList.map((item) =>
        item.propertyId === ad.propertyId
          ? { ...item, status: item.status === "Active" ? "Suspended" : "Active" }
          : item
      )
    );
    setActiveMenu(null);
  };

  if (!filteredAds || filteredAds.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          No Ads Available
        </h2>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Main content */}
      <div>
        <PageMeta title="All Ads" />
        <PageBreadcrumbList pageTitle="All Ads" pagePlacHolder="Search ads" />
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="flex justify-between items-center">
            <Input
              type="text"
              placeholder="Search by Property ID, Name, City, or Ads Type"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[300px] p-2 border rounded-lg dark:bg-dark-900 dark:text-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <ComponentCard title="All Ads">
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
                        Property ID
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Property Name
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Ads Type
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
                        Status
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  {/* Table Body */}
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {currentAds.map((ad) => (
                      <TableRow key={ad.propertyId}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {ad.slNo}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {ad.propertyId}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {ad.propertyName}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              ad.adsType === "Banner"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : ad.adsType === "Sidebar"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                : ad.adsType === "Popup"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : ad.adsType === "Slider"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                          >
                            {ad.adsType}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {ad.city}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              ad.status === "Active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {ad.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleMenu(ad.propertyId)}
                          >
                            <MoreVertical className="size-5 text-gray-500 dark:text-gray-400" />
                          </Button>
                          {activeMenu === ad.propertyId && (
                            <div
                              ref={dropdownRef}
                              className="absolute right-2 top-10 z-10 w-32 rounded-lg shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                            >
                              <div className="py-2">
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => handleEdit(ad.propertyId)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => handleDelete(ad.propertyId)}
                                >
                                  Delete
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => handleStatusChange(ad)}
                                >
                                  {ad.status === "Active" ? "Suspend" : "Activate"}
                                </button>
                              </div>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {indexOfFirstAd + 1} to{" "}
                {Math.min(indexOfLastAd, filteredAds.length)} of {filteredAds.length}{" "}
                ads
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "primary" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={
                      currentPage === page
                        ? "bg-[#1D3A76] text-white"
                        : "text-gray-500"
                    }
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
};

export default AllAdsPage;
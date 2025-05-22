import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { MoreVertical, X } from "lucide-react";
import Button from "../../components/ui/button/Button";
import { fetchAds, clearAds, AdsState, deleteAd } from "../../store/slices/adSlice";
import { toast } from "react-hot-toast";
import Input from "../../components/form/input/InputField";
import { useParams } from "react-router";
import DatePicker from "../../components/form/date-picker";
import PageBreadcrumbList from "../../components/common/PageBreadCrumbLists";

interface Ad {
  id: number;
  unique_property_id: string;
  property_name: string;
  property_type: string | null;
  google_address: string;
  address: string | null;
  property_cost: string;
  monthly_rent: string | null;
  admin_approved_status: string | null;
  city_id: string;
  ads_page?: string;
  ads_title?: string;
  ads_description?: string;
  display_cities?: string;
  ads_order?: string;
  created_date?: string;
  
  status?: number;
}

const editAd = (payload: {
  id: number;
  property_name: string;
  property_type: string;
  google_address: string;
}) => {
  return async (dispatch: AppDispatch) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Ad updated successfully!");
      return { success: true };
    } catch (error) {
      toast.error("Failed to update ad");
      throw error;
    }
  };
};

interface FetchAdsParams {
  ads_page?: string;
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toISOString().split("T")[0];
  } catch {
    return "Invalid Date";
  }
};

const AllAdsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { ads, loading, error } = useSelector((state: RootState) => state.ads) as AdsState;
  const { status } = useParams<{ status: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [adsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [newPropertyName, setNewPropertyName] = useState<string>("");
  const [newPropertyType, setNewPropertyType] = useState<string>("");
  const [newGoogleAddress, setNewGoogleAddress] = useState<string>("");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce function
  const debounce = <F extends (...args: any[]) => void>(func: F, wait: number) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<F>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Debounced search handler
  const handleDebouncedSearch = useCallback(
    debounce((query: string) => setDebouncedSearchQuery(query), 1000),
    []
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    handleDebouncedSearch(query);
    setCurrentPage(1); // Reset page on search
  };

  const fetchAdsParams: FetchAdsParams = {
    ads_page: status,
  };

  // Fetch ads
  useEffect(() => {
    if (status) {
      dispatch(fetchAds(fetchAdsParams));
    }
  }, [dispatch, status]);

  // Handle click outside for action menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show error toast
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // Clear ads on unmount
  useEffect(() => {
    return () => {
      dispatch(clearAds());
    };
  }, [dispatch]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, startDate, endDate]);

  // Filter ads
  const filteredAds = useMemo(
    () =>
      ads && Array.isArray(ads)
        ? ads.filter((ad) => {
            const searchQuery = debouncedSearchQuery.toLowerCase();
            const matchesSearch =
              (ad.property_name && ad.property_name.toLowerCase().includes(searchQuery)) ||
              (ad.display_cities && ad.display_cities.toLowerCase().includes(searchQuery)) ||
              (ad.property_type && ad.property_type.toLowerCase().includes(searchQuery));

            // Date range filter
            let matchesDate = true;
            if (startDate || endDate) {
              if (!ad.created_date) {
                matchesDate = false;
              } else {
                try {
                  const adDate = ad.created_date.split("T")[0];
                  matchesDate =
                    (!startDate || adDate >= startDate) &&
                    (!endDate || adDate <= endDate);
                } catch {
                  matchesDate = false;
                }
              }
            }

            return matchesSearch && matchesDate;
          })
        : [],
    [ads, debouncedSearchQuery, startDate, endDate]
  );

  // Pagination
  const totalPages = Math.ceil(filteredAds.length / adsPerPage);
  const indexOfLastAd = currentPage * adsPerPage;
  const indexOfFirstAd = indexOfLastAd - adsPerPage;
  const currentAds = filteredAds.slice(indexOfFirstAd, indexOfLastAd);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setActiveMenu(null);
    }
  };

  const getPaginationItems = () => {
    const pages: (number | string)[] = [];
    const totalVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(totalVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + totalVisiblePages - 1);
    if (endPage - startPage + 1 < totalVisiblePages) {
      startPage = Math.max(1, endPage - totalVisiblePages + 1);
    }
    if (startPage > 1) pages.push(1);
    if (startPage > 2) pages.push("...");
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (endPage < totalPages - 1) pages.push("...");
    if (endPage < totalPages) pages.push(totalPages);
    return pages;
  };

  const toggleMenu = (id: number) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  const handleView = (property_id: string) => {
    if (!property_id) {
      console.error("Property ID is missing");
      return;
    }
    try {
      const url = `https://meetowner.in/property?Id_${encodeURIComponent(property_id)}`;
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error navigating to property:", error);
    }
  };

  const handleEdit = (id: number) => {
    const ad = ads.find((a) => a.id === id);
    if (ad) {
      setSelectedAd(ad);
      setNewPropertyName(ad.property_name || "");
      setNewPropertyType(ad.property_in || "");
      setNewGoogleAddress(ad.google_address || "");
      setEditModalOpen(true);
    }
    setActiveMenu(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAd) return;
    const payload = {
      id: selectedAd.id,
      property_name: newPropertyName,
      property_type: newPropertyType,
      google_address: newGoogleAddress,
    };
    try {
      await dispatch(editAd(payload));
      setEditModalOpen(false);
      dispatch(fetchAds(fetchAdsParams));
    } catch (err) {
      toast.error("Failed to update ad");
    }
  };

  const handleDelete = async (ad: Ad) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${ad.property_name || "this ad"}?`
    );
    if (!confirmDelete) return;

    try {
      const payload = {
        ads_page: ad.ads_page,
        unique_property_id: ad.unique_property_id || undefined,
        property_name: ad.property_name || undefined,
      };
      await dispatch(deleteAd(payload)).unwrap();
      dispatch(fetchAds(fetchAdsParams));
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete ad");
    }
    setActiveMenu(null);
  };

  const handleStartDateChange = (selectedDates: Date[]) => {
    const dateObj = selectedDates[0];
    let date = "";
    if (dateObj) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      date = `${year}-${month}-${day}`;
    }
    setStartDate(date || null);
  };

  const handleEndDateChange = (selectedDates: Date[]) => {
    const dateObj = selectedDates[0];
    let date = "";
    if (dateObj) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      date = `${year}-${month}-${day}`;
      if (startDate && date < startDate) {
        alert("End date cannot be before start date");
        return;
      }
    }
    setEndDate(date || null);
  };

  if (error && !loading && ads.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
          {error}
        </h2>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <PageMeta title="Meet owner All Ads" />
      <PageBreadcrumbList
        pageTitle="All Ads"
        pagePlacHolder="Search by Property Name, Type, Address"
        onFilter={handleSearch}
        
      />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-3 py-2">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <DatePicker
              id="startDate"
              placeholder="Select start date"
              onChange={handleStartDateChange}
              defaultDate={startDate ? new Date(startDate) : undefined}
            />
            <DatePicker
              id="endDate"
              placeholder="Select end date"
              onChange={handleEndDateChange}
              defaultDate={endDate ? new Date(endDate) : undefined}
            />
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setDebouncedSearchQuery("");
                setStartDate(null);
                setEndDate(null);
                setCurrentPage(1);
              }}
              className="px-4 py-2 w-full sm:w-auto"
            >
              Clear Filters
            </Button>
          </div>
        </div>
        {(searchQuery || startDate || endDate) && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Filters: Search: {searchQuery || "None"} | Date: {startDate || "Any"} to {endDate || "Any"}
          </div>
        )}
        <ComponentCard title="All Ads">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    {["ID", "Property Id", "Property Name", "Ad Page", "Ad Title", "Description", "Location", "Order", "Created Date", "Status", "Actions"].map((header) => (
                      <TableCell
                        key={header}
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {loading ? (
                    <TableRow>
                      <TableCell
                        
                        className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                      >
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : currentAds.length === 0 ? (
                    <TableRow>
                      <TableCell
                       
                        className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                      >
                        No Ads Found!
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentAds.map((ad, index) => (
                      <TableRow key={ad.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {(currentPage - 1) * adsPerPage + index + 1}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {ad.unique_property_id}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {ad.property_name}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {ad.ads_page || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {ad.ads_title || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {ad.ads_description || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {ad.display_cities || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {ad.ads_order || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {formatDate(ad.created_date)}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {ad.status === 1 ? "Approved" : "Pending"}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleMenu(ad.id)}
                          >
                            <MoreVertical className="size-5 text-gray-500 dark:text-gray-400" />
                          </Button>
                          {activeMenu === ad.id && (
                            <div
                              ref={dropdownRef}
                              className="absolute right-2 top-10 z-50 w-32 rounded-lg shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                            >
                              <div className="py-2">
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => handleEdit(ad.id)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => handleDelete(ad)}
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={() => handleView(ad.unique_property_id!)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  View
                                </button>
                              </div>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          {filteredAds.length > adsPerPage && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 py-2 gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {indexOfFirstAd + 1} to {Math.min(indexOfLastAd, filteredAds.length)} of {filteredAds.length} ads
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                <Button
                  variant={currentPage === 1 ? "outline" : "primary"}
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {getPaginationItems().map((page, index) =>
                  page === "..." ? (
                    <span
                      key={index}
                      className="px-3 py-1 text-gray-500 dark:text-gray-400"
                    >
                      ...
                    </span>
                  ) : (
                    <Button
                      key={page}
                      variant={page === currentPage ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page as number)}
                      className={
                        page === currentPage ? "bg-[#1D3A76] text-white" : "text-gray-500"
                      }
                    >
                      {page}
                    </Button>
                  )
                )}
                <Button
                  variant={currentPage === totalPages ? "outline" : "primary"}
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </ComponentCard>
      </div>
      {editModalOpen && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Edit Ad</h2>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="size-6" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Property Name
                </label>
                <Input
                  type="text"
                  value={newPropertyName}
                  onChange={(e) => setNewPropertyName(e.target.value)}
                  className="dark:bg-dark-900"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Property Type
                </label>
                <Input
                  type="text"
                  value={newPropertyType}
                  onChange={(e) => setNewPropertyType(e.target.value)}
                  className="dark:bg-dark-900"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <Input
                  type="text"
                  value={newGoogleAddress}
                  onChange={(e) => setNewGoogleAddress(e.target.value)}
                  className="dark:bg-dark-900"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                
                  variant="primary"
                  size="sm"
                  disabled={loading}
                  className={loading ? "opacity-50 cursor-not-allowed" : ""}
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAdsPage;
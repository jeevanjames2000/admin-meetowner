import { useState, useRef, useEffect, ChangeEvent, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router";
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
import Button from "../../../components/ui/button/Button";
import { fetchListings, ListingState, updatePropertyStatus } from "../../../store/slices/listings";
import { AppDispatch, RootState } from "../../../store/store";
import { TableLoader } from "../../../components/Loaders/LoadingLisings";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";

const statusMap: { [key: number]: string } = {
  0: "Review",
  1: "Approved",
  2: "Rejected",
  3: "Deleted",
};

const userTypeMap: { [key: string]: string } = {
  "1": "Admin",
  "2": "User",
  "3": "Builder",
  "4": "Agent",
  "5": "Owner",
  "6": "Channel Partner",
  "7": "Manager",
  "8": "Telecaller",
  "9": "Marketing Executive",
  "10": "Customer Support",
  "11": "Customer Service",
};

const userTypeReverseMap: { [key: string]: string } = Object.keys(userTypeMap).reduce(
  (acc, key) => {
    acc[userTypeMap[key].toLowerCase()] = key;
    return acc;
  },
  {} as { [key: string]: string }
);

// Define the type for the lead pull form data
interface LeadPullFormData {
  mobile: string;
  email: string;
  name: string;
}

const CommercialTypes: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [localPage, setLocalPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [initialSearch, setInitialSearch] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State for modal visibility
  const [leadPullFormData, setLeadPullFormData] = useState<LeadPullFormData>({
    mobile: "",
    email: "",
    name: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<LeadPullFormData>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { property_for, status } = useParams<{ property_for: string; status: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const pageUserType = useSelector((state: RootState) => state.auth.user?.user_type);
  const { listings, loading, error, totalCount, currentPage, currentCount, totalPages } = useSelector(
    (state: RootState) => state.listings as ListingState
  );

  const excludedUserTypes = [9, 10, 11];

  useEffect(() => {
    const savedSearch = localStorage.getItem("searchQuery") || "";
    setInitialSearch(savedSearch);
    handleSearch(savedSearch);
  }, []);

  useEffect(() => {
    localStorage.removeItem("searchQuery");
    setSearchQuery("");
    setInitialSearch("");
    setLocalPage(1);
  }, [location.pathname]);

  useEffect(() => {
    if (!loading && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [loading]);

  const getPageTitle = () => {
    const baseTitle = `Commercial ${property_for === "buy" ? "Sell" : "Rent"}`;
    return `${baseTitle} ${statusMap[parseInt(status || "0", 10)] || "Unknown"}`;
  };

  const formatDateTime = (date: string | undefined, time: string | undefined): string => {
    if (!date || !time) return "N/A";
    const dateTime = new Date(`${date.split("T")[0]}T${time}Z`);
    const timeZoneOffset = dateTime.getTimezoneOffset();
    dateTime.setMinutes(dateTime.getMinutes() - timeZoneOffset);
    const day = String(dateTime.getUTCDate()).padStart(2, "0");
    const month = String(dateTime.getUTCMonth() + 1).padStart(2, "0");
    const year = dateTime.getUTCFullYear();
    let hours = dateTime.getUTCHours();
    const minutes = String(dateTime.getUTCMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const hoursStr = String(hours).padStart(2, "0");
    return `${day}-${month}-${year} ${hoursStr}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    const filters = {
      property_status: parseInt(status || "0", 10),
      property_for: property_for === "buy" ? "Sell" : "Rent",
      property_in: "Commercial",
      page: localPage,
      search: searchQuery,
    };
    dispatch(fetchListings(filters));
  }, [dispatch, property_for, status, searchQuery, refreshTrigger, localPage]);

  useEffect(() => {
    setLocalPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const handleStorageChange = () => {
      const currentSearch = localStorage.getItem("searchQuery") || "";
      if (currentSearch === "" && initialSearch !== "") {
        setSearchQuery("");
        setLocalPage(1);
        setInitialSearch("");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [initialSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEdit = (item: any) => {
    const editPath = property_for === "buy" ? "/commercial-buy-edit" : "/commercial-rent-edit";
    navigate(editPath, { state: { property: item } });
    setDropdownOpen(null);
  };

  const handleDelete = (unique_property_id: string) => {
    const property_status = 3;
    dispatch(updatePropertyStatus({ property_status, unique_property_id }))
      .unwrap()
      .then(() => setRefreshTrigger((prev) => prev + 1))
      .catch((err) => console.error("Status update failed:", err));
    setDropdownOpen(null);
  };

  const handleApprove = (unique_property_id: string) => {
    const property_status = parseInt(status || "0", 10) === 0 ? 1 : 2;
    dispatch(updatePropertyStatus({ property_status, unique_property_id }))
      .unwrap()
      .then(() => setRefreshTrigger((prev) => prev + 1))
      .catch((err) => console.error("Status update failed:", err));
    setDropdownOpen(null);
  };

  const handleLead = (item: any) => {
    setIsModalOpen(true); // Open the modal
    setDropdownOpen(null);
  };

  const handleSearch = (value: string) => {
    let searchValue = value.trim();
    const userTypeKey = userTypeReverseMap[searchValue.toLowerCase()];
    if (userTypeKey) {
      searchValue = userTypeKey;
    }
    setSearchQuery(searchValue);
  };

  const goToPage = (page: number) => {
    setLocalPage(page);
  };

  const goToPreviousPage = () => currentPage > 1 && goToPage(currentPage - 1);
  const goToNextPage = () => currentPage < totalPages && goToPage(currentPage + 1);

  const getPaginationItems = () => {
    const pages = [];
    const totalVisiblePages = 7;
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

  const shouldShowActions = (userType: number | undefined) => {
    if (userType === undefined) return false;
    return !excludedUserTypes.includes(userType) && (parseInt(status || "0", 10) === 0 || parseInt(status || "0", 10) === 1);
  };

  // Modal Form Handlers
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLeadPullFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateLeadPullForm = (): boolean => {
    const newErrors: Partial<LeadPullFormData> = {};

    // Mobile validation (must be 10 digits)
    if (!leadPullFormData.mobile) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(leadPullFormData.mobile)) {
      newErrors.mobile = "Mobile number must be exactly 10 digits";
    }

    // Email validation
    if (!leadPullFormData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadPullFormData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Name validation
    if (!leadPullFormData.name) {
      newErrors.name = "Name is required";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLeadPullSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateLeadPullForm()) {
      console.log("Lead Pull Form Data:", leadPullFormData);
      // Add your API call here to submit the lead pull data
      alert("Lead pull submitted successfully!");
      setIsModalOpen(false);
      setLeadPullFormData({ mobile: "", email: "", name: "" });
      setFormErrors({});
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setLeadPullFormData({ mobile: "", email: "", name: "" });
    setFormErrors({});
  };

  return (
    <div className="relative min-h-screen">
      <PageMeta
        title={`Meet Owner Commercial ${property_for === "buy" ? "Sell" : "Rent"} ${getPageTitle()}`}
        description={`This is the Commercial ${property_for === "buy" ? "Sell" : "Rent"} ${getPageTitle()} Table page`}
      />
      <PageBreadcrumb
        pageTitle={`Commercial ${property_for === "buy" ? "Sell" : "Rent"}`}
        pagePlacHolder="Search by ID, Project Name, User Type, Name, Mobile, or Email"
        onFilter={handleSearch}
        inputRef={searchInputRef}
      />
      {loading ? (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
          <ComponentCard title={getPageTitle()}>
            <TableLoader
              title={getPageTitle()}
              hasActions={parseInt(status || "0", 10) === 0 || parseInt(status || "0", 10) === 1}
            />
          </ComponentCard>
        </div>
      ) : error ? (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Error: {error}</h2>
        </div>
      ) : !listings || listings.length === 0 ? (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">No Users Found</h2>
        </div>
      ) : (
        <>
          <h2 className="p-2">Search result - {totalCount}</h2>
          <div className="space-y-6">
            <ComponentCard title={getPageTitle()}>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">ID</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Sl. No</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Project Name</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Property SubType</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">User Type</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Listing Time & Date</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Location</TableCell>
                        {shouldShowActions(pageUserType) && (
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {listings.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{item.unique_property_id || item.id}</TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{(currentPage - 1) * currentCount + index + 1}</TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{item.property_name || "N/A"}</TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">{item.sub_type || "N/A"}</TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                            <div
                              onMouseEnter={() => setHoveredUserId(item.id.toString())}
                              onMouseLeave={() => setHoveredUserId(null)}
                              className="inline-block"
                            >
                              <span style={{ color: "#1D3A76", fontWeight: "bold" }}>
                                {item.user?.user_type === 1 ? "Admin" :
                                 item.user?.user_type === 2 ? "User" :
                                 item.user?.user_type === 3 ? "Builder" :
                                 item.user?.user_type === 4 ? "Agent" :
                                 item.user?.user_type === 5 ? "Owner" :
                                 item.user?.user_type === 6 ? "Channel Partner" : "Unknown"}
                              </span>
                              {hoveredUserId === item.id.toString() && item.user && (
                                <div className="absolute z-10 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                                    <p><strong>Name:</strong> {item.user.name || "N/A"}</p>
                                    <p><strong>Mobile:</strong> {item.user.mobile || "N/A"}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {formatDateTime(item.created_date!, item.created_time!)}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {item.location_id}
                          </TableCell>
                          {shouldShowActions(pageUserType) && (
                            <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDropdownOpen(dropdownOpen === item.id.toString() ? null : item.id.toString())}
                              >
                                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </Button>
                              {dropdownOpen === item.id.toString() && (
                                <div ref={dropdownRef} className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                                  <button onClick={() => handleEdit(item)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Edit</button>
                                  <button onClick={() => handleDelete(item.unique_property_id)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Delete</button>
                                  <button onClick={() => handleApprove(item.unique_property_id)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    {parseInt(status || "0", 10) === 0 ? "Approve" : "Reject"}
                                  </button>
                                  {parseInt(status || "0", 10) === 1 && (
                                    <button onClick={() => handleLead(item)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Lead Pull</button>
                                  )}
                                </div>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              {totalCount > currentCount && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 py-2 gap-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {(currentPage - 1) * currentCount + 1} to {Math.min(currentPage * currentCount, totalCount)} of {totalCount} entries
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    <Button
                      variant={currentPage === 1 ? "outline" : "primary"}
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {getPaginationItems().map((page, index) => {
                      const uniqueKey = `${page}-${index}`;
                      return page === "..." ? (
                        <span key={uniqueKey} className="px-3 py-1 text-gray-500 dark:text-gray-400">
                          ...
                        </span>
                      ) : (
                        <Button
                          key={uniqueKey}
                          variant="outline"
                          size="sm"
                          onClick={() => goToPage(page as number)}
                          isActive={page === currentPage}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    <Button
                      variant={currentPage === totalPages ? "outline" : "primary"}
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </ComponentCard>
          </div>
          {/* Lead Pull Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-white/30 backdrop-blur-none flex items-center justify-center z-10">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md relative">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Enter Lead Pull Details</h2>
                  <button
                    onClick={handleModalClose}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleLeadPullSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={leadPullFormData.name}
                      onChange={handleInputChange}
                      className="dark:bg-dark-900"
                      placeholder="Enter user name"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Mobile */}
                  <div>
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      type="text"
                      id="mobile"
                      name="mobile"
                      value={leadPullFormData.mobile}
                      onChange={handleInputChange}
                      className="dark:bg-dark-900"
                      placeholder="Enter 10-digit mobile number"
                    />
                    {formErrors.mobile && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.mobile}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={leadPullFormData.email}
                      onChange={handleInputChange}
                      className="dark:bg-dark-900"
                      placeholder="Enter email address"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleModalClose}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#1D3A76] text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommercialTypes;
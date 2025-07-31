import { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { createPortal } from "react-dom";
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
import Button from "../../components/ui/button/Button";
import { AppDispatch, RootState } from "../../store/store";
import { TableLoader } from "../../components/Loaders/LoadingLisings";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";
import DateFilter from "../../components/common/DateFilter";
import {
  deleteUpComingProject,
  getAllUpcomingProjects,
} from "../../store/slices/upcoming";

interface UpcomingProject {
  unique_property_id: string;
  property_name: string;
  builder_name: string;
  mobile?: string;
  state: string;
  city: string;
  location: string;
  property_type: string;
  property_for: string;
  sub_type: string;
  possession_status: string;
  brochure?: string | null;
  price_sheet?: string | null;
  launch_type: string;
  launch_date?: string | null;
  possession_end_date?: string | null;
  is_rera_registered: boolean;
  rera_number?: string | null;
  otp_options?: string[] | null;
  created_at: string;
  sizes?: {
    size_id: number;
    buildup_area: number;
    carpet_area: number;
    sqft_price?: number;
    floor_plan?: string | null;
  }[];
}

const UpcomingProjects: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [localPage, setLocalPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [initialSearch, setInitialSearch] = useState<string>("");
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownButtonRefs = useRef<{
    [key: string]: HTMLButtonElement | null;
  }>({});
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { projects, loading, error } = useSelector(
    (state: RootState) => state.upcoming
  );

  // Client-side filtering
  const filteredProjects = projects.filter((item) => {
    // Search filter
    const searchMatch =
      !searchQuery ||
      item.unique_property_id
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.property_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.builder_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    // Date filter (based on created_at)
    const createdAt = new Date(item.created_at).toISOString().split("T")[0];
    const fromDateMatch = !fromDate || createdAt >= fromDate;
    const toDateMatch = !toDate || createdAt <= toDate;

    return searchMatch && fromDateMatch && toDateMatch;
  });

  const currentCount = 10;
  const totalCount = filteredProjects.length;
  const totalPages = Math.ceil(totalCount / currentCount);
  const currentPage = localPage;

  // Slice filtered projects for pagination
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * currentCount,
    currentPage * currentCount
  );

  useEffect(() => {
    const savedSearch = localStorage.getItem("searchQuery") || "";
    setInitialSearch(savedSearch);
    handleSearch(savedSearch);
  }, []);

  useEffect(() => {
    if (!loading && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [loading]);

  useEffect(() => {
    localStorage.removeItem("searchQuery");
    setSearchQuery("");
    setInitialSearch("");
    setLocalPage(1);
    setFromDate(null);
    setToDate(null);
  }, []);

  useEffect(() => {
    const filters: any = {
      page: localPage,
      search: searchQuery,
    };
    if (fromDate) filters.from_date = fromDate;
    if (toDate) filters.to_date = toDate;
    dispatch(getAllUpcomingProjects(filters));
  }, [dispatch, refreshTrigger]);

  useEffect(() => {
    setLocalPage(1);
  }, [searchQuery, fromDate, toDate]);

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
      if (
        dropdownOpen &&
        dropdownPosition &&
        !document
          .getElementById(`dropdown-portal-${dropdownOpen}`)
          ?.contains(event.target as Node)
      ) {
        setDropdownOpen(null);
        setDropdownPosition(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen, dropdownPosition]);

  const handleEdit = (item: UpcomingProject) => {
    navigate("/projects/add-projects", { state: { project: item } });
    setDropdownOpen(null);
  };

  const handleDelete = useCallback(
    (unique_property_id: string, property_name: string) => {
      setSelectedProject({ id: unique_property_id, name: property_name });
      setIsDeleteModalOpen(true);
      setDropdownOpen(null);
    },
    []
  );

  const confirmDelete = useCallback(() => {
    if (selectedProject) {
      dispatch(deleteUpComingProject(selectedProject.id))
        .unwrap()
        .then(() => setRefreshTrigger((prev) => prev + 1))
        .catch((err) => console.error("Delete failed:", err));
      setIsDeleteModalOpen(false);
      setSelectedProject(null);
    }
  }, [dispatch, selectedProject]);

  const handleSearch = (value: string) => {
    setSearchQuery(value.trim());
  };

  const goToPage = (page: number) => {
    setLocalPage(page);
  };

  const goToPreviousPage = () => currentPage > 1 && goToPage(currentPage - 1);
  const goToNextPage = () =>
    currentPage < totalPages && goToPage(currentPage + 1);

  const getPaginationItems = () => {
    const pages = [];
    const totalVisiblePages = 7;
    let startPage = Math.max(
      1,
      currentPage - Math.floor(totalVisiblePages / 2)
    );
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

  return (
    <div className="relative min-h-screen">
      <PageMeta title="Meet Owner | Upcoming Projects" />
      <PageBreadcrumb
        pageTitle="Upcoming Projects"
        pagePlacHolder="Search by ID, Project Name, Builder Name, or Location"
        onFilter={handleSearch}
        inputRef={searchInputRef}
      />
      <DateFilter
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onClear={() => {
          setFromDate(null);
          setToDate(null);
        }}
        className="mb-4"
      />
      {loading ? (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
          <ComponentCard title="Upcoming Projects">
            <TableLoader title="Upcoming Projects" hasActions={true} />
          </ComponentCard>
        </div>
      ) : error ? (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Error: {error}
          </h2>
        </div>
      ) : !filteredProjects || filteredProjects.length === 0 ? (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            No Upcoming Projects Found
          </h2>
        </div>
      ) : (
        <>
          <h2 className="p-2">Search result - {totalCount}</h2>
          <div className="space-y-6">
            <ComponentCard title="Upcoming Projects">
              <div className="overflow-visible relative rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-auto">
                  <Table>
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
                          ID
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
                          Builder Name
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
                          Property Type
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Launch Date
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Possession Date
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Created At
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
                      {paginatedProjects.map((item, index) => (
                        <TableRow key={item.unique_property_id}>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {(currentPage - 1) * currentCount + index + 1}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {item.unique_property_id}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {item.property_name || "N/A"}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {item.builder_name || "N/A"}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {item.location || "N/A"}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {item.sub_type || "N/A"}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {item.launch_date || "N/A"}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {item.possession_end_date
                              ? new Date(
                                  item.possession_end_date
                                ).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {new Date(item.created_at).toLocaleDateString() ||
                              "N/A"}
                          </TableCell>
                          <TableCell className="relative px-5 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(
                                e: React.MouseEvent<HTMLButtonElement>
                              ) => {
                                const btn = e.currentTarget;
                                const rect = btn.getBoundingClientRect();
                                setDropdownOpen(
                                  dropdownOpen === item.unique_property_id
                                    ? null
                                    : item.unique_property_id
                                );
                                setDropdownPosition(
                                  dropdownOpen === item.unique_property_id
                                    ? null
                                    : {
                                        top: rect.bottom + window.scrollY,
                                        left: rect.left + window.scrollX,
                                      }
                                );
                                dropdownButtonRefs.current[
                                  item.unique_property_id
                                ] = btn;
                              }}
                              ref={(el: HTMLButtonElement | null) => {
                                dropdownButtonRefs.current[
                                  item.unique_property_id
                                ] = el;
                              }}
                            >
                              <svg
                                className="w-5 h-5 text-gray-500 dark:text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </Button>
                            {dropdownOpen === item.unique_property_id &&
                              dropdownPosition &&
                              createPortal(
                                <div
                                  id={`dropdown-portal-${item.unique_property_id}`}
                                  style={{
                                    position: "absolute",
                                    top: dropdownPosition.top,
                                    left: dropdownPosition.left,
                                    zIndex: 9999,
                                    width: "160px",
                                  }}
                                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg"
                                >
                                  <button
                                    onClick={() => {
                                      handleEdit(item);
                                      setDropdownOpen(null);
                                      setDropdownPosition(null);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDelete(
                                        item.unique_property_id,
                                        item.property_name
                                      );
                                      setDropdownOpen(null);
                                      setDropdownPosition(null);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    Delete
                                  </button>
                                </div>,
                                document.body
                              )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              {totalCount > currentCount && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 py-2 gap-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {(currentPage - 1) * currentCount + 1} to{" "}
                    {Math.min(currentPage * currentCount, totalCount)} of{" "}
                    {totalCount} entries
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
                        <span
                          key={uniqueKey}
                          className="px-3 py-1 text-gray-500 dark:text-gray-400"
                        >
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
                      variant={
                        currentPage === totalPages ? "outline" : "primary"
                      }
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
        </>
      )}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        propertyName={selectedProject?.name || ""}
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedProject(null);
        }}
      />
    </div>
  );
};

export default UpcomingProjects;

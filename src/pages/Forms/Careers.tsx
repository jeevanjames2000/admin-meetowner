import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumbList from "../../components/common/PageBreadCrumbLists";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { MoreVertical } from "lucide-react";
import { AppDispatch, RootState } from "../../store/store";
import { fetchAllCareers, deleteCareer } from "../../store/slices/careerSlice";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal"; // Adjust path as needed
import { toast } from "react-hot-toast";
import { clearMessages } from "../../store/slices/employee";
import { formatDate } from "@fullcalendar/core/index.js";

const itemsPerPage = 10; // Define items per page


;

const CareersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [filterValue, setFilterValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [careerToDelete, setCareerToDelete] = useState<{ id: number; job_title: string } | null>(null);

  const { careers, fetchLoading, fetchError, deleteLoading, deleteError, deleteSuccess } = useSelector(
    (state: RootState) => state.career
  );

  useEffect(() => {
    dispatch(fetchAllCareers());
  }, [dispatch]);

  // Handle filter input change
  const handleFilter = (value: string) => {
    setFilterValue(value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Filter careers based on search input
  const filteredCareers = careers?.filter((career) => {
    const searchableFields = [
      career.job_title,
      career.description,
      career.preferred_location,
      career.experience,
      career.salary,
    ];
    return searchableFields
      .filter((field): field is string => field !== null && field !== undefined)
      .map((field) => field.toLowerCase())
      .some((field) => field.includes(filterValue.toLowerCase()));
  }) || [];

  // Pagination logic
  const totalItems = filteredCareers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedCareers = filteredCareers.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const getPaginationItems = () => {
    const pages: (number | string)[] = [];
    const totalVisiblePages = 5;

    if (totalPages <= totalVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(2, currentPage - 2);
      let end = Math.min(totalPages - 1, currentPage + 2);

      if (currentPage <= 3) {
        start = 2;
        end = 5;
      }

      if (currentPage >= totalPages - 2) {
        start = totalPages - 4;
        end = totalPages - 1;
      }

      pages.push(1);
      if (start > 2) pages.push("...");

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) pages.push("...");
      if (totalPages > 1) pages.push(totalPages);
    }

    return pages;
  };

  // Toggle actions menu
  const toggleMenu = (id: number | undefined) => {
    if (id === undefined) return;
    setActiveMenu(activeMenu === id ? null : id);
  };

  // Open delete confirmation modal
  const openDeleteModal = (career: { id: number; job_title: string }) => {
    setCareerToDelete(career);
    setIsDeleteModalOpen(true);
    setActiveMenu(null);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!careerToDelete) return;

    try {
      await dispatch(deleteCareer(careerToDelete.id)).unwrap();
      setIsDeleteModalOpen(false);
      setCareerToDelete(null);
      toast.success("Career deleted successfully!");
      dispatch(clearMessages());
    } catch (error) {
      toast.error(error as string);
    }
  };

  // Navigate to edit page
  const handleEdit = (careerId: number) => {
    navigate(`/careers/edit/${careerId}`); // Adjust route as needed
    setActiveMenu(null);
  };

  // Navigate to create page
  const handleCreate = () => {
    navigate("/careers/create-career"); // Adjust route as needed
  };

  return (
    <div className="relative min-h-screen">
      <PageBreadcrumbList
        pageTitle="All Careers"
        pagePlacHolder="Filter careers by job title, description, location, experience, or salary"
        onFilter={handleFilter}
      />

      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={handleCreate}
            className="bg-[#1D3A76] text-white hover:bg-blue-700"
          >
            Create New Career
          </Button>
        </div>

        <ComponentCard title="All Careers Table">
          {/* {fetchError && <p className="text-red-600 dark:text-red-400">{fetchError}</p>}
          {deleteError && <p className="text-red-600 dark:text-red-400">{deleteError}</p>}
          {deleteSuccess && <p className="text-green-600 dark:text-green-400">{deleteSuccess}</p>} */}

          <div className="overflow-visible relative rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Sl.No
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Job Title
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Description
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Upload Date
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
                      Salary
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Experience
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
                  {fetchLoading ? (
                    <TableRow>
                      <TableCell  className="text-center py-4">
                        Loading careers...
                      </TableCell>
                    </TableRow>
                  ) : paginatedCareers.length === 0 ? (
                    <TableRow>
                      <TableCell className="text-center py-4">
                        No careers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCareers.map((career, index) => (
                      <TableRow key={career.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90 cursor-pointer hover:underline">
                            {career.job_title}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {career.description.length > 50
                            ? `${career.description.substring(0, 50)}...`
                            : career.description}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {formatDate(career.upload_date)}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {career.preferred_location}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          ${parseFloat(career.salary).toLocaleString()}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {career.experience}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleMenu(career.id)}
                            disabled={deleteLoading}
                          >
                            <MoreVertical className="size-5 text-gray-500 dark:text-gray-400" />
                          </Button>
                          {activeMenu === career.id && (
                            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                              <div className="py-2">
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => handleEdit(career.id!)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() =>
                                    openDeleteModal({
                                      id: career.id!,
                                      job_title: career.job_title,
                                    })
                                  }
                                >
                                  Delete
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

          {totalItems > itemsPerPage && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 py-2 gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {startIndex + 1} to {endIndex} of {totalItems} entries
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
                {getPaginationItems().map((page, index) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-3 py-1 text-gray-500 dark:text-gray-400"
                    >
                      ...
                    </span>
                  ) : (
                    <Button
                      key={page}
                      variant={page === currentPage ? "primary" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page as number)}
                      className={
                        page === currentPage
                          ? "bg-[#1D3A76] text-white"
                          : "text-gray-500"
                      }
                    >
                      {page}
                    </Button>
                  )
                )}
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

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        propertyName={careerToDelete?.job_title || ""}
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setCareerToDelete(null);
        }}
      />
    </div>
  );
};

export default CareersPage;
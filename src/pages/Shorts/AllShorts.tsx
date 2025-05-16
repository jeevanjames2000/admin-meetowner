import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { fetchShorts, clearShorts } from "../../store/slices/shortsSlice";


import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";

import { MoreVertical, X } from "lucide-react";
import PageBreadcrumbList from "../../components/common/PageBreadCrumbLists";
import DatePicker from "../../components/form/date-picker";
import ComponentCard from "../../components/common/ComponentCard";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";
import Input from "../../components/form/input/InputField";


// Format date function
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

const AllShorts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { shorts, loading, error, } = useSelector(
    (state: RootState) => state.shorts
  );
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [filterValue, setFilterValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [shortToDelete, setShortToDelete] = useState<{ id: number; property_name: string } | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
//   const [selectedShort, setSelectedShort] = useState<Short | null>(null);
  const [newPropertyName, setNewPropertyName] = useState<string>("");
  const [newShortType, setNewShortType] = useState<string>("");
  const [newShortsOrder, setNewShortsOrder] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 10;

  // Fetch shorts
  useEffect(() => {
    dispatch(fetchShorts());
  }, [dispatch]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterValue, startDate, endDate]);

 
 
  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clear shorts on unmount
  useEffect(() => {
    return () => {
      dispatch(clearShorts());
    };
  }, [dispatch]);

  // Filter shorts
  const filteredShorts = useMemo(
    () =>
      shorts && Array.isArray(shorts)
        ? shorts.filter((short) => {
            const searchableFields = [
              short.property_name,
              short.unique_property_id,
              short.short_type,
            ];
            const matchesSearch = searchableFields
              .filter((field): field is string => field !== null && field !== undefined)
              .map((field) => field.toLowerCase())
              .some((field) => field.includes(filterValue.toLowerCase()));

            // Date range filter
            let matchesDate = true;
            if (startDate || endDate) {
              if (!short.created_at) {
                matchesDate = false;
              } else {
                try {
                  const shortDate = short.created_at.split("T")[0];
                  matchesDate =
                    (!startDate || shortDate >= startDate) &&
                    (!endDate || shortDate <= endDate);
                } catch {
                  matchesDate = false;
                }
              }
            }

            return matchesSearch && matchesDate;
          })
        : [],
    [shorts, filterValue, startDate, endDate]
  );

  // Pagination
  const totalItems = filteredShorts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedShorts = filteredShorts.slice(startIndex, endIndex);

  const toggleMenu = (id: number) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  const handleFilter = (value: string) => {
    setFilterValue(value);
    setCurrentPage(1);
  };

  const handleEditClick = (short: any) => {
    // setSelectedShort(short);
    setNewPropertyName(short.property_name);
    setNewShortType(short.short_type);
    setNewShortsOrder(short.shorts_order);
    setIsEditModalOpen(true);
    setActiveMenu(null);
  };

  const handleView = (property_id: string) => {
    if (!property_id) {
      console.error("Property ID is missing");
      return;
    }
    try {
      const url = `https://meetowner.in/property?Id_${encodeURIComponent(property_id)}`;
      window.open(url, "_blank"); // Open in new tab
    } catch (error) {
      console.error("Error navigating to property:", error);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!selectedShort) return;
    // try {
    //   await dispatch(
    //     editShort({
    //       id: selectedShort.id,
    //       property_name: newPropertyName,
    //       short_type: newShortType,
    //       shorts_order: newShortsOrder,
    //     })
    //   ).unwrap();
    //   setIsEditModalOpen(false);
    //   setSelectedShort(null);
    // } catch (err) {
    //   console.error("Edit error:", err);
    // }
  };

  const handleDeleteClick = (short: { id: number; property_name: string }) => {
    setShortToDelete({ id: short.id, property_name: short.property_name });
    setIsDeleteModalOpen(true);
    setActiveMenu(null);
  };

  const confirmDelete = () => {
    // if (shortToDelete) {
    //   dispatch(deleteShort({ id: shortToDelete.id }));
    // }
    // setIsDeleteModalOpen(false);
    // setShortToDelete(null);
  };

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

  if (loading) return <div>Loading shorts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="relative min-h-screen">
      <PageBreadcrumbList
        pageTitle="All Shorts"
        pagePlacHolder="Filter shorts by property name, ID, or type"
        onFilter={handleFilter}
      />
      <div className="flex justify-between gap-3 py-2">
        <div className="w-auto flex gap-3">
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
              setFilterValue("");
              setStartDate(null);
              setEndDate(null);
              setCurrentPage(1);
            }}
            className="px-4 py-2"
          >
            Clear Filters
          </Button>
        </div>
      </div>
      {(filterValue || startDate || endDate) && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Filters: Search: {filterValue || "None"} | Date: {startDate || "Any"} to {endDate || "Any"}
        </div>
      )}
      <div className="space-y-6">
        <ComponentCard title="All Shorts">
          <div className="overflow-visible relative rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full">
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
                      Property Id
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
                      Short Type
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Short Order
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Created Date
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
                  {paginatedShorts.map((short, index) => (
                    <TableRow key={short.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {short.unique_property_id}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {short.property_name}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {short.short_type}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {short.shorts_order}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(short.created_at)}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                        <Button variant="outline" size="sm" onClick={() => toggleMenu(short.id)}>
                          <MoreVertical className="size-5 text-gray-500 dark:text-gray-400" />
                        </Button>
                        {activeMenu === short.id && (
                          <div
                            ref={dropdownRef}
                            className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10"
                          >
                            <div className="py-2">
                               <button
                              onClick={() => {
                                handleView(short.unique_property_id);
                            
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              View
                            </button>
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => handleEditClick(short)}
                              >
                                Edit
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => handleDeleteClick(short)}
                              >
                                Delete
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
          <ConfirmDeleteModal
            isOpen={isDeleteModalOpen}
            propertyName={shortToDelete?.property_name || ""}
            onConfirm={confirmDelete}
            onCancel={() => {
              setIsDeleteModalOpen(false);
              setShortToDelete(null);
            }}
          />
          {isEditModalOpen && (
            <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Edit Short
                  </h2>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
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
                      Short Type
                    </label>
                    <Input
                      type="text"
                      value={newShortType}
                    
                      className="dark:bg-dark-900"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Short Order
                    </label>
                    <Input
                      type="number"
                      value={newShortsOrder}
                     
                      className="dark:bg-dark-900"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditModalOpen(false)}
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
        </ComponentCard>
      </div>
    </div>
  );
};

export default AllShorts;
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { MoreVertical, X } from "lucide-react";
import Button from "../../components/ui/button/Button";
import { fetchAllPlaces, PlacesState, deletePlace, editPlace } from "../../store/slices/places";
import { toast } from "react-hot-toast";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
interface Place {
  id: number;
  state: string;
  city: string;
  locality: string;
  areas: string | null;
}
const AllPlaces: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    places = [],
    currentPage,
    perPage,
    totalPlaces,
    totalPages = 0,
    error,
    editLoading,
    editError,
    deleteLoading,
  } = useSelector((state: RootState) => state.places);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [newState, setNewState] = useState<string>("");
  const [newCity, setNewCity] = useState<string>("");
  const [newLocality, setNewLocality] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const debounce = <F extends (...args: any[]) => void>(func: F, wait: number) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<F>) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        func(...args);
      }, wait);
    };
  };
  const handleDebouncedSearch = useCallback(
    debounce((query: string) => {
      setDebouncedSearchQuery(query);
    }, 1000),
    []
  );
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    handleDebouncedSearch(query);
  };
  useEffect(() => {
    dispatch(fetchAllPlaces({ page: currentPage || 1, search: debouncedSearchQuery }));
  }, [dispatch, currentPage, debouncedSearchQuery]);
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
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      dispatch(fetchAllPlaces({ page, search: debouncedSearchQuery }));
      setActiveMenu(null);
    }
  };
  const getPaginationItems = () => {
    const pages: (number | string)[] = [];
    const totalVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(totalVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + totalVisiblePages - 1);
    if (endPage - startPage + 1 < totalVisiblePages) {
      startPage = Math.max(1, endPage - totalVisiblePages + 1);
    }
    if (startPage > 1) pages.push(1);
    if (startPage > 2) pages.push("...");
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    if (endPage < totalPages - 1) pages.push("...");
    if (endPage < totalPages) pages.push(totalPages);
    return pages;
  };
  const toggleMenu = (id: number) => {
    setActiveMenu(activeMenu === id ? null : id);
  };
  const handleEdit = (id: number) => {
    const place = places.find((p) => p.id === id);
    if (place) {
      setSelectedPlace(place);
      setNewState(place.state);
      setNewCity(place.city);
      setNewLocality(place.locality);
      setEditModalOpen(true);
    }
    setActiveMenu(null);
  };
const handleEditSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedPlace) return;
  const payload = {
    oldState: selectedPlace.state,
    oldCity: selectedPlace.city,
    oldLocality: selectedPlace.locality,
    newState,
    newCity,
    newLocality,
  };
  try {
    await dispatch(editPlace(payload)).unwrap();
    toast.success("Place updated successfully!");
    setEditModalOpen(false);
    dispatch(fetchAllPlaces({ page: currentPage, search: debouncedSearchQuery }));
  } catch (err) {
    toast.error((err as any)?.message || "Failed to update place");
  }
};
  const handleDelete = async (id: number) => {
    const place = places.find((p) => p.id === id);
    if (!place) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${place.state}, ${place.city}, ${place.locality}?`
    );
    if (!confirmDelete) return;
    try {
      const resultAction = await dispatch(
        deletePlace({
          state: place.state,
          city: place.city,
          locality: place.locality,
        })
      );
      if (deletePlace.fulfilled.match(resultAction)) {
        toast.success("Place deleted successfully!");
        dispatch(fetchAllPlaces({ page: currentPage, search: debouncedSearchQuery }));
      } else {
        const errorMessage =
          (resultAction.payload as any)?.error ||
          (resultAction.payload as any)?.message ||
          "Failed to delete place";
        toast.error(errorMessage);
      }
    } catch (err) {
      toast.error("Failed to delete place");
    }
    setActiveMenu(null);
  };
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">No places found</h2>
      </div>
    );
  }
  return (
    <div className="relative min-h-screen">
      <div>
        <PageMeta title="Meet owner All Places" />
        <PageBreadcrumb
          pageTitle="All Places"
          pagePlacHolder="Search by State, City, Locality"
          onFilter={handleSearch}
          persistSearch={true}
        />
        <div className="space-y-6">
          <ComponentCard title="All Places">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      {["ID", "State", "City", "Locality", "Actions"].map((header) => (
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
                    {places.length > 0 ? (
                      places.map((place) => (
                        <TableRow key={place.id}>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {place.id}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {place.state}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {place.city}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                            {place.locality}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleMenu(place.id)}
                            >
                              <MoreVertical className="size-5 text-gray-500 dark:text-gray-400" />
                            </Button>
                            {activeMenu === place.id && (
                              <div
                                ref={dropdownRef}
                                className="absolute right-0 top-2 z-50  rounded-lg shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                              >
                                <div className="py-2">
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => handleEdit(place.id)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => handleDelete(place.id)}
                                    disabled={deleteLoading}
                                  >
                                    {deleteLoading ? "Deleting..." : "Delete"}
                                  </button>
                                </div>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                          No Places Found!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            {totalPlaces > perPage && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 py-2 gap-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {(currentPage - 1) * perPage + 1} to{" "}
                  {Math.min(currentPage * perPage, totalPlaces)} of {totalPlaces} places
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
                        onClick={() => handlePageChange(page)}
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
      </div>
      {editModalOpen && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Edit Place
              </h2>
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
                  State
                </label>
                <input
                  type="text"
                  value={newState}
                  onChange={(e) => setNewState(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  City
                </label>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Locality
                </label>
                <input
                  type="text"
                  value={newLocality}
                  onChange={(e) => setNewLocality(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditModalOpen(false)}
                  disabled={editLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={editLoading}
                  className={editLoading ? "opacity-50 cursor-not-allowed" : ""}
                >
                  {editLoading ? "Saving..." : "Save"}
                </Button>
              </div>
              {editError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{editError}</p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AllPlaces;
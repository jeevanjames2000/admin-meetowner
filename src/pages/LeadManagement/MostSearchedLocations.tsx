import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumbList from "../../components/common/PageBreadCrumbLists";
import FilterBar from "../../components/common/FilterBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { AppDispatch, RootState } from "../../store/store";
import { fetchMostSearchedLocations, LeadsState } from "../../store/slices/leads";

const MostSearchedLocations: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { mostSearchedLocations, loading, error } = useSelector(
    (state: RootState) => state.leads as LeadsState
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filterValue, setFilterValue] = useState<string>("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const itemsPerPage = 10;

  // Fetch most searched locations on mount
  useEffect(() => {
    dispatch(fetchMostSearchedLocations());
  }, [dispatch]);

  // Clear all filters
  const clearFilters = () => {
    setFilterValue("");
    setCityFilter("");
    setCurrentPage(1);
  };

  // Filter most searched locations based on search and city
  const filteredLocations = useMemo(() => {
    return mostSearchedLocations.filter((location) => {
      const searchableFields = [location.searched_location || ""];
      const matchesSearch = searchableFields.some((field) =>
        field.toLowerCase().includes(filterValue.toLowerCase())
      );
      const matchesCity =
        !cityFilter ||
        (location.searched_location &&
          location.searched_location.toLowerCase().includes(cityFilter.toLowerCase()));

      return matchesSearch && matchesCity;
    });
  }, [mostSearchedLocations, filterValue, cityFilter]);

  // Pagination logic
  const totalItems = filteredLocations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedLocations = filteredLocations.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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

  // Handle search filter
  const handleFilter = (value: string) => {
    setFilterValue(value);
    setCurrentPage(1);
  };

  // Handle location click
  const handleLocationClick = (city: string) => { // Changed to city
    if (!city || city === "N/A") {
      console.error("Invalid city");
      return;
    }
    navigate(`/leads/most-searched-details/${encodeURIComponent(city)}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Loading...</h2>
      </div>
    );
  }

  // Error or no data state
  if (error || !mostSearchedLocations || mostSearchedLocations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <PageMeta
          title="Meet Owner Most Searched Locations"
          description="This is the Most Searched Locations Table page"
        />
        <PageBreadcrumbList
          pageTitle="Most Searched Locations"
          pagePlacHolder="Filter by searched location"
          onFilter={handleFilter}
        />
        <ComponentCard title="Most Searched Locations">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {error ? error : "No Data Available"}
          </h2>
        </ComponentCard>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
      <PageMeta
        title="Meet Owner Most Searched Locations"
        description="This is the Most Searched Locations Table page"
      />
      <PageBreadcrumbList
        pageTitle="Most Searched Locations"
        pagePlacHolder="Filter by searched location"
        onFilter={handleFilter}
      />
      <div className="space-y-6">
        {/* FilterBar for city */}
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <FilterBar
            showUserTypeFilter={false}
            showDateFilters={false}
            showStateFilter={false}
            showCityFilter={true}
            userFilterOptions={[]}
            onUserTypeChange={() => {}}
            onStartDateChange={() => {}}
            onEndDateChange={() => {}}
            onStateChange={() => {}}
            onCityChange={setCityFilter}
            onClearFilters={clearFilters}
            selectedUserType={null}
            startDate={null}
            endDate={null}
            stateValue=""
            cityValue={cityFilter}
          />
        </div>

        {/* Display active filters */}
        {(filterValue || cityFilter) && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Filters: Search: {filterValue || "None"} | City: {cityFilter || "Any"}
          </div>
        )}

        <ComponentCard title="Most Searched Locations">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
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
                      Searched Location
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Total Searches
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginatedLocations.map((location, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-[#1D3A76] text-theme-sm dark:text-gray-400 cursor-pointer font-bold">
                        <div onClick={() => handleLocationClick(location.searched_location)}>
                          {location.searched_location || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {location.total_searches || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
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
    </div>
  );
};

export default MostSearchedLocations;
import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import Input from "../../../components/form/input/InputField"; // Adjust path as needed
import Label from "../../../components/form/Label"; // Adjust path as needed
import Select from "../../../components/form/Select"; // Adjust path as needed

interface AroundProperty {
  id: number;
  unique_property_id: string;
  title: string;
  distance: string; // Distance in meters (as per API)
  created_date: string | null;
}

interface AroundThisPropertyProps {
  unique_property_id: string;
}

interface SelectOption {
  value: string;
  label: string;
}

const AroundThisProperty: React.FC<AroundThisPropertyProps> = ({ unique_property_id }) => {
  const [apiPlaces, setApiPlaces] = useState<AroundProperty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [placeAroundProperty, setPlaceAroundProperty] = useState<string>("");
  const [distanceFromProperty, setDistanceFromProperty] = useState<string>("");
  const [distanceUnit, setDistanceUnit] = useState<string>("Meters"); // Default to Meters
  const { user } = useSelector((state: RootState) => state.auth);

  // Distance unit options for dropdown
  const distanceUnitOptions: SelectOption[] = [
    { value: "Meters", label: "Meters" },
    { value: "Kilometers", label: "Kilometers" },
  ];

  // Convert distance to display based on selected unit
  const convertDistanceForDisplay = (distance: string): string => {
    const meters = parseFloat(distance);
    if (isNaN(meters)) return distance; // Return original if not a valid number
   
      return `${(meters / 1000).toFixed(2)} km`;
   
  };

  // Convert input distance to meters for API
  const convertToMeters = (distance: string, unit: string): string => {
    const value = parseFloat(distance);
    if (isNaN(value)) return distance; // Return original if not a valid number
    return unit === "Kilometers" ? `${value * 1000}` : distance; // Convert km to meters if needed
  };

  // Fetch places around property
  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://api.meetowner.in/listings/v1/getAroundThisProperty?id=${unique_property_id}`
        );
        if (response.data.results) {
          setApiPlaces(response.data.results);
        }
      } catch (error) {
        console.error("Error fetching places:", error);
        toast.error("Failed to fetch places around property");
      } finally {
        setLoading(false);
      }
    };

    if (unique_property_id) {
      fetchPlaces();
    }
  }, [unique_property_id]);


 

  // Delete a place around property
  const deletePlace = async (placeId: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this place?");
    if (!confirmDelete) return;

    try {
      const response = await axios.post("https://api.meetowner.in/property/deleteplacesaroundproperty", {
        placeid: placeId,
        unique_property_id,
        user_id: user!.user_id,
      });
      if (response.data.status === "success") {
        setApiPlaces((prev) => prev.filter((place) => place.id !== placeId));
        toast.success("Place removed successfully");
      } else {
        toast.error(response.data.message || "Failed to delete place");
      }
    } catch (error) {
      toast.error("Error deleting place");
    }
  };

  return (
    <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center py-3">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Around This Property</h3>
      <div>
        
        <div className="flex space-x-6 my-4 w-full">
          <Input
            type="text"
            placeholder="Place around property"
            value={placeAroundProperty}
            onChange={(e) => setPlaceAroundProperty(e.target.value)}
            className="dark:bg-dark-900 w-[45%]" // Increased width
          />
          <Input
            type="number" // Changed to number for validation
            placeholder="Distance from property"
            value={distanceFromProperty}
            onChange={(e) => setDistanceFromProperty(e.target.value)}
            className="dark:bg-dark-900 w-[25%] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" // Decreased width
          />
         <select
            value={distanceUnit}
            onChange={(e) => setDistanceUnit(e.target.value)}
            className="dark:bg-dark-900 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg p-2 w-[20%] focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>
              Select unit
            </option>
            {distanceUnitOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            // onClick={handleAddAroundProperty}
            className="px-4 py-2 bg-[#1D3A76] text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 w-[20%]"
          >
            Add
          </button>
        </div>
      </div>
      {loading ? (
        <p>Loading places...</p>
      ) : apiPlaces.length > 0 ? (
        <div className="mt-4">
          <ul className="space-y-2">
            {apiPlaces.map((place) => (
              <li
                key={place.id}
                className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                <span>
                  {place.title} - {convertDistanceForDisplay(place.distance)}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePlace(place.id);
                  }}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-gray-500 dark:text-gray-400">No places available.</p>
      )}
    </div>
  );
};

export default AroundThisProperty;
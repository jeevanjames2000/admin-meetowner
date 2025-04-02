import React, { ChangeEvent } from "react";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";

interface PropertyLocationFieldsProps {
  formData: {
    city: string;
    propertyName: string;
    locality: string;
    flatNo: string;
    floorNo: string;
    totalFloors: string;
  };
  errors: {
    city: string;
    propertyName: string;
    locality: string;
    flatNo: string;
    floorNo: string;
    totalFloors: string;
  };
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const PropertyLocationFields: React.FC<PropertyLocationFieldsProps> = ({
  formData,
  errors,
  handleInputChange,
}) => {
  return (
    <>
      {/* City */}
      <div>
        <Label htmlFor="city">City *</Label>
        <Input
          type="text"
          id="city"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          placeholder="Enter city"
          className="dark:bg-dark-900"
        />
        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
      </div>

      {/* Property/Project Name */}
      <div>
        <Label htmlFor="propertyName">Property/Project Name *</Label>
        <Input
          type="text"
          id="propertyName"
          name="propertyName"
          value={formData.propertyName}
          onChange={handleInputChange}
          placeholder="Enter property/project name"
          className="dark:bg-dark-900"
        />
        {errors.propertyName && (
          <p className="text-red-500 text-sm mt-1">{errors.propertyName}</p>
        )}
      </div>

      {/* Locality */}
      <div>
        <Label htmlFor="locality">Locality *</Label>
        <Input
          type="text"
          id="locality"
          name="locality"
          value={formData.locality}
          onChange={handleInputChange}
          placeholder="Enter locality"
          className="dark:bg-dark-900"
        />
        {errors.locality && (
          <p className="text-red-500 text-sm mt-1">{errors.locality}</p>
        )}
      </div>

      {/* Flat No. */}
      <div>
        <Label htmlFor="flatNo">Flat No. *</Label>
        <Input
          type="text"
          id="flatNo"
          name="flatNo"
          value={formData.flatNo}
          onChange={handleInputChange}
          placeholder="Enter flat number"
          className="dark:bg-dark-900"
        />
        {errors.flatNo && (
          <p className="text-red-500 text-sm mt-1">{errors.flatNo}</p>
        )}
      </div>

      {/* Floor No. */}
      <div>
        <Label htmlFor="floorNo">Floor No. *</Label>
        <Input
          type="number"
          id="floorNo"
          name="floorNo"
          value={formData.floorNo}
          onChange={handleInputChange}
          placeholder="Enter floor number"
          className="dark:bg-dark-900"
        />
        {errors.floorNo && (
          <p className="text-red-500 text-sm mt-1">{errors.floorNo}</p>
        )}
      </div>

      {/* Total Floors */}
      <div>
        <Label htmlFor="totalFloors">Total Floors *</Label>
        <Input
          type="number"
          id="totalFloors"
          name="totalFloors"
          value={formData.totalFloors}
          onChange={handleInputChange}
          placeholder="Enter total floors"
          className="dark:bg-dark-900"
        />
        {errors.totalFloors && (
          <p className="text-red-500 text-sm mt-1">{errors.totalFloors}</p>
        )}
      </div>
    </>
  );
};

export default PropertyLocationFields;
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import MultiSelect from "../../components/form/MultiSelect";
import { AppDispatch, RootState } from "../../store/store";
import PageMeta from "../../components/common/PageMeta";
import { getAllApprovedListing } from "../../store/slices/approve_listings";
import { createShort } from "../../store/slices/shortsSlice";
import toast from "react-hot-toast";

interface FormData {
  unique_property_id: string;
  property_name: string;
  shorts_order: string;
}

interface Errors {
  unique_property_id?: string;
  property_name?: string;
 
  shorts_order?: string;
}

interface Option {
  value: string;
  text: string;
}

const CreateShorts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { listings } = useSelector((state: RootState) => state.approved);
  const { createLoading, createError, createSuccess } = useSelector(
    (state: RootState) => state.shorts
  );
  const [formData, setFormData] = useState<FormData>({
    unique_property_id: "",
    property_name: "",
   
    shorts_order: "",
  });
  const [errors, setErrors] = useState<Errors>({});

  // Fetch approved listings on mount
  useEffect(() => {
    dispatch(getAllApprovedListing());
  }, [dispatch]);

  // Show toast for create error or success
  useEffect(() => {
    if (createError) {
      toast.error(createError);
    }
    if (createSuccess) {
      toast.success(createSuccess);
    }
  }, [createError, createSuccess]);

  // Property options for MultiSelect
  const propertyOptions: Option[] = listings.map((property) => ({
    value: property.unique_property_id,
    text: `${property.property_name || "Unnamed Property"} - (${property.unique_property_id})`,
  }));

  // Handle property selection
  const handlePropertyChange = (values: string[]) => {
    const selectedId = values.length > 0 ? values[0] : "";
    const selectedProperty = listings.find((p) => p.unique_property_id === selectedId);
    setFormData({
      ...formData,
      unique_property_id: selectedId,
      property_name: selectedProperty?.property_name || "",
    });
    if (errors.unique_property_id || errors.property_name) {
      setErrors({ ...errors, unique_property_id: undefined, property_name: undefined });
    }
  };
   const defaultSelected = useMemo(() => {
    return formData.unique_property_id ? [formData.unique_property_id] : [];
  }, [formData.unique_property_id]);

  // Handle text input changes
  const handleChange = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const validateForm = () => {
    const newErrors: Errors = {};
    if (!formData.unique_property_id.trim()) {
      newErrors.unique_property_id = "Please select a property";
    }
    if (!formData.property_name.trim()) {
      newErrors.property_name = "Property Name is required";
    }
    
    if (!formData.shorts_order.trim()) {
      newErrors.shorts_order = "Short Order is required";
    } else if (isNaN(Number(formData.shorts_order)) || Number(formData.shorts_order) < 0) {
      newErrors.shorts_order = "Short Order must be a non-negative number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const promise = dispatch(
          createShort({
            unique_property_id: formData.unique_property_id,
            property_name: formData.property_name,
            short_type: "image",
            shorts_order: Number(formData.shorts_order),
          })
        );
        await promise.unwrap();
        // Reset form on success
        setFormData({
          unique_property_id: "",
          property_name: "",
         
          shorts_order: "",
        });
      } catch (error) {
        console.error("Failed to create short:", error);
      }
    }
  };

  return (
    <div className="relative min-h-screen">
      <PageMeta title="Meet Owner Create Short" />
      <ComponentCard title="Create Short">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative mb-10 min-h-[80px]">
            <MultiSelect
              label="Property"
              options={propertyOptions}
                defaultSelected={defaultSelected}
              onChange={handlePropertyChange}
              singleSelect={true}
            />
            {errors.unique_property_id && (
              <p className="text-red-500 text-sm mt-1">{errors.unique_property_id}</p>
            )}
          </div>
          <div className="min-h-[80px]">
            <Label htmlFor="shorts_order">Short Order</Label>
            <Input
              type="text"
              id="shorts_order"
              value={formData.shorts_order}
              onChange={handleChange("shorts_order")}
              placeholder="Enter short order (e.g., 5)"
              className="dark:bg-dark-900"
            />
            {errors.shorts_order && (
              <p className="text-red-500 text-sm mt-1">{errors.shorts_order}</p>
            )}
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-[60%] px-4 py-2 text-white bg-[#1D3A76] rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={createLoading}
            >
              {createLoading ? "Submitting..." : "Create Short"}
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default CreateShorts;
import React, { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaTrash } from "react-icons/fa";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import MultiSelect from "../../components/form/MultiSelect";
import { AppDispatch, RootState } from "../../store/store";
import { getCities } from "../../store/slices/propertyDetails";
import Switch from "../../components/form/switch/Switch";
import PageMeta from "../../components/common/PageMeta";
import { getAllApprovedListing } from "../../store/slices/approve_listings";
import { createAd, AdsState } from "../../store/slices/adSlice";
import  toast  from "react-hot-toast";


interface FormData {
  name: string;
  places: string[];
  media: File | null;
  order: string;
  visibilityCities: string[];
  title: string;
  description: string;
  adsButton: string;
  adsButtonLink: string;
  status: boolean;
}
interface Errors {
  name?: string;
  places?: string;
  media?: string;
  order?: string;
  visibilityCities?: string;
  title?: string;
  description?: string;
  adsButton?: string;
  adsButtonLink?: string;
}
interface Option {
  value: string;
  text: string;
}
export default function CreateAds() {
  const dispatch = useDispatch<AppDispatch>();
  const { cities } = useSelector((state: RootState) => state.property);
  const { listings } = useSelector((state: RootState) => state.approved);
  const { createLoading, createError } = useSelector((state: RootState) => state.ads) as AdsState;
  const [formData, setFormData] = useState<FormData>({
    name: "",
    places: [],
    media: null,
    order: "",
    visibilityCities: [],
    title: "",
    description: "",
    adsButton: "",
    adsButtonLink: "",
    status: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [localMediaError, setLocalMediaError] = useState<string>("");
  useEffect(() => {
    dispatch(getCities());
    dispatch(getAllApprovedListing());
  }, [dispatch]);
  useEffect(() => {
    if (createError) {
      toast.error(createError);
    }
  }, [createError]);
  const placeOptions: Option[] = [
    { value: "best deal", text: "Best Deal" },
    { value: "best meetowner", text: "Best MeetOwner" },
    { value: "best_demanded", text: "Best Demanded Projects" },
    { value: "meetowner exclusive", text: "MeetOwner Exclusive" },
    { value: "listing_ads", text: "Listing Side Ad" },
    { value: "property_ads", text: "Property View" },
    { value: "main_slider", text: "Main Slider" },
  ];
  const cityOptions: Option[] =
    cities?.map((city: any) => ({
      value: city.value,
      text: city.label,
    })) || [];
  const propertyOptions: Option[] = listings.map((property) => ({
    value: property.unique_property_id,
    text: `${property.property_name || "Unnamed Property"}`,
  }));
  const handleSingleChange =
    (field: "order" | "title" | "description" | "adsButton" | "adsButtonLink") =>
    (value: string) => {
      setFormData({ ...formData, [field]: value });
      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined });
      }
    };
  const handleMultiSelectChange =
    (field: "places" | "visibilityCities") =>
    (values: string[]) => {
      setFormData({ ...formData, [field]: values });
      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined });
      }
    };
  const handleNameChange = (values: string[]) => {
    const selectedValue = values.length > 0 ? values[0] : "";
    setFormData({ ...formData, name: selectedValue });
   
  };
  const handleStatusChange = (checked: boolean) => {
    setFormData({ ...formData, status: checked });
  };
  const handleMediaUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png"];
    const validVideoTypes = ["video/mp4"];
    const isImage = validImageTypes.includes(file.type);
    const isVideo = validVideoTypes.includes(file.type);
    if (!isImage && !isVideo) {
      setLocalMediaError("Only JPG, JPEG, PNG, or MP4 files are allowed.");
      return;
    }
    if (isImage && file.size > 10 * 1024 * 1024) {
      setLocalMediaError("Photo size must be less than 10MB.");
      return;
    }
    if (isVideo && file.size > 30 * 1024 * 1024) {
      setLocalMediaError("Video size must be less than 30MB.");
      return;
    }
    setLocalMediaError("");
    setFormData({ ...formData, media: file });
    if (errors.media) {
      setErrors({ ...errors, media: undefined });
    }
  };
  const handleDeleteMedia = () => {
    setFormData({ ...formData, media: null });
    setLocalMediaError("");
  };
  const validateForm = () => {
    let newErrors: Errors = {};
    if (formData.places.length === 0) newErrors.places = "At least one place is required";
  
    if (formData.visibilityCities.length === 0)
      newErrors.visibilityCities = "At least one city is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const selectedListing = listings.find(
          (listing) => listing.unique_property_id === formData.name
        );
  
        if (!selectedListing) {
          toast.error("Selected property not found");
          return;
        }
  
        const selectedCityId = formData.visibilityCities[0];
        const selectedCity = cityOptions.find((city) => city.value === selectedCityId);
        const cityName = selectedCity ? selectedCity.text : null;
  
        // Create FormData to handle file upload
        const adData = new FormData();
        adData.append("unique_property_id", selectedListing.unique_property_id || "");
        adData.append("property_name", selectedListing.property_name || "");
        adData.append("ads_page", formData.places[0] || "");
        adData.append("ads_order", formData.order || "");
        adData.append("city", cityName || "");
        adData.append("display_cities", cityName || "");
        adData.append("ads_title", formData.title || "");
        adData.append("ads_button_text", formData.adsButton || "");
        adData.append("ads_button_link", formData.adsButtonLink || "");
        adData.append("ads_description", formData.description || "");
        adData.append("user_id", selectedListing.user_id || "");
        adData.append("property_type", selectedListing.property_type || "");
        adData.append("sub_type", selectedListing.sub_type || "");
        adData.append("property_for", selectedListing.property_for || "");
        adData.append("property_cost", selectedListing.property_cost || "");
        adData.append("property_in", selectedListing.property_in || "");
        adData.append("google_address", selectedListing.google_address || "");
  
        // Append media file if it exists
        if (formData.media) {
          adData.append("photo", formData.media);
        }
        const promise = dispatch(createAd(adData));
        toast.promise(promise, {
          loading: "Creating ad...",
          success: "Ad created successfully!",
          error: "Failed to create ad",  
        },
   
      );
  
        await promise.unwrap();
        setFormData({
          name: "",
          places: [],
          media: null,
          order: "",
          visibilityCities: [],
          title: "",
          description: "",
          adsButton: "",
          adsButtonLink: "",
          status: false,
        });
      } catch (error) {
        console.error("Failed to create ad:", error);
      }
    }
  };
  return (
    <div className="relative min-h-screen">
      <PageMeta title="Meet Owner Create Ads" />
      <ComponentCard title="Create Ad">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative mb-10 min-h-[80px]">
            <MultiSelect
              label="Property"
              options={propertyOptions}
              defaultSelected={formData.name ? [formData.name] : []}
              onChange={handleNameChange}
              singleSelect={true}
            />
            
          </div>
          <div className="relative mb-10 min-h-[80px]">
            <MultiSelect
              label="Places"
              options={placeOptions}
              defaultSelected={formData.places}
              onChange={handleMultiSelectChange("places")}
            />
            {errors.places && (
              <p className="text-red-500 text-sm mt-1">{errors.places}</p>
            )}
          </div>
          <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Add Photo or Video
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Upload one file (Photo: max 10MB, JPG, JPEG, PNG; Video: max 30MB, MP4)
            </p>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.mp4"
              onChange={handleMediaUpload}
              className="hidden"
              id="media-upload"
            />
            <label
              htmlFor="media-upload"
              className="mt-4 inline-block px-6 py-2 bg-[#1D3A76] text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors duration-200"
            >
              Upload Photo or Video
            </label>
            {(errors.media || localMediaError) && (
              <p className="mt-2 text-red-500 text-sm">{errors.media || localMediaError}</p>
            )}
            {formData.media && (
              <div className="mt-4 relative max-w-[50%] mx-auto">
                {formData.media.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(formData.media)}
                    alt="Uploaded Media"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={URL.createObjectURL(formData.media)}
                    controls
                    className="w-full h-50 object-cover rounded-lg"
                  />
                )}
                <button
                  onClick={handleDeleteMedia}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
                >
                  <FaTrash />
                </button>
              </div>
            )}
          </div>
          <div className="min-h-[80px]">
            <Label htmlFor="order">Order</Label>
            <Input
              type="text"
              id="order"
              value={formData.order}
              onChange={(e) => handleSingleChange("order")(e.target.value)}
              placeholder="Enter order (e.g., 1, 2, 3)"
            />
            {errors.order && (
              <p className="text-red-500 text-sm mt-1">{errors.order}</p>
            )}
          </div>
          <div className="relative mb-10 min-h-[80px]">
            <MultiSelect
              label="Visibility Cities"
              options={cityOptions}
              defaultSelected={formData.visibilityCities}
              onChange={handleMultiSelectChange("visibilityCities")}
            />
            {errors.visibilityCities && (
              <p className="text-red-500 text-sm mt-1">{errors.visibilityCities}</p>
            )}
          </div>
          <div className="min-h-[80px]">
            <Label htmlFor="title">Title</Label>
            <Input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleSingleChange("title")(e.target.value)}
              placeholder="Enter ad title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>
          <div className="min-h-[80px]">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleSingleChange("description")(e.target.value)}
              className="w-full p-2 m-1 border rounded-lg dark:bg-dark-900 dark:text-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Enter ad description"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>
          <div className="min-h-[80px]">
            <Label htmlFor="adsButton">Ads Button Text</Label>
            <Input
              type="text"
              id="adsButton"
              value={formData.adsButton}
              onChange={(e) => handleSingleChange("adsButton")(e.target.value)}
              placeholder="Enter button text"
            />
            {errors.adsButton && (
              <p className="text-red-500 text-sm mt-1">{errors.adsButton}</p>
            )}
          </div>
          <div className="min-h-[80px]">
            <Label htmlFor="adsButtonLink">Ads Button Link</Label>
            <Input
              type="text"
              id="adsButtonLink"
              value={formData.adsButtonLink}
              onChange={(e) => handleSingleChange("adsButtonLink")(e.target.value)}
              placeholder="Enter button link (e.g., https://example.com)"
            />
            {errors.adsButtonLink && (
              <p className="text-red-500 text-sm mt-1">{errors.adsButtonLink}</p>
            )}
          </div>
          <div className="min-h-[80px]">
            <Label>Status</Label>
            <Switch
              label={formData.status ? "Active" : "Inactive"}
              defaultChecked={formData.status}
              onChange={handleStatusChange}
            />
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-[60%] px-4 py-2 text-white bg-[#1D3A76] rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={createLoading}
            >
              {createLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}
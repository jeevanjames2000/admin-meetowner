import React, { ChangeEvent, useState } from "react";
import { FaPlay, FaTrash } from "react-icons/fa";

interface MediaUploadSectionProps {
  photos: File[];
  setPhotos: (photos: File[]) => void;
  video: File | null;
  setVideo: (video: File | null) => void;
  floorPlan: File | null;
  setFloorPlan: (floorPlan: File | null) => void;
  featuredImageIndex: number | null;
  setFeaturedImageIndex: (index: number | null) => void;
  photoError?: string; // New prop for photo error from parent
  videoError?: string; // New prop for video error from parent
  floorPlanError?: string; // New prop for floor plan error from parent
  featuredImageError?: string; // New prop for featured image error from parent
}

const MediaUploadSection: React.FC<MediaUploadSectionProps> = ({
  photos,
  setPhotos,
  video,
  setVideo,
  floorPlan,
  setFloorPlan,
  featuredImageIndex,
  setFeaturedImageIndex,
  photoError,
  videoError,
  floorPlanError,
  featuredImageError,
}) => {
  const [localPhotoErrors, setLocalPhotoErrors] = useState<string[]>([]);
  const [localVideoError, setLocalVideoError] = useState<string>("");
  const [localFloorPlanError, setLocalFloorPlanError] = useState<string>("");

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos: File[] = [];
    const errors: string[] = [];

    files.forEach((file, index) => {
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        errors[index] = "Only JPG, JPEG, and PNG files are allowed.";
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        errors[index] = "File size must be less than 10MB.";
        return;
      }
      newPhotos.push(file);
    });

    const totalPhotos = photos.length + newPhotos.length;
    if (totalPhotos > 5) {
      setLocalPhotoErrors(["You can only upload a maximum of 5 photos."]);
      return;
    }

    setLocalPhotoErrors(errors);
    if (errors.length === 0) {
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const handleVideoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["video/mp4"];
    if (!validTypes.includes(file.type)) {
      setLocalVideoError("Only MP4 files are allowed.");
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      setLocalVideoError("File size must be less than 30MB.");
      return;
    }
    setLocalVideoError("");
    setVideo(file);
  };

  const handleFloorPlanUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setLocalFloorPlanError("Only JPG, JPEG, and PNG files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setLocalFloorPlanError("File size must be less than 10MB.");
      return;
    }
    setLocalFloorPlanError("");
    setFloorPlan(file);
  };

  const handleDeletePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    if (featuredImageIndex === index) {
      setFeaturedImageIndex(null);
    } else if (featuredImageIndex !== null && index < featuredImageIndex) {
      setFeaturedImageIndex(featuredImageIndex - 1);
    }
  };

  const handleDeleteVideo = () => {
    setVideo(null);
    setLocalVideoError("");
  };

  const handleDeleteFloorPlan = () => {
    setFloorPlan(null);
    setLocalFloorPlanError("");
  };

  const handleSetFeaturedImage = (index: number) => {
    setFeaturedImageIndex(index);
  };

  return (
    <div className="space-y-6">
      {/* Photos Section */}
      <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <svg className="w-12 h-12 text-blue-500" /* ... */ />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          + Add Photos
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Upload exactly 5 photos of max size 10 MB in format JPG, JPEG & PNG
        </p>
        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png"
          onChange={handlePhotoUpload}
          className="hidden"
          id="photo-upload"
        />
        <label
          htmlFor="photo-upload"
          className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors duration-200"
        >
          Upload Photos
        </label>
        {(photoError || localPhotoErrors.length > 0) && (
          <div className="mt-2 text-red-500 text-sm">
            {photoError && <p>{photoError}</p>}
            {localPhotoErrors.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}
        {photos.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Uploaded ${index}`}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleSetFeaturedImage(index)}
                  className={`absolute top-2 left-2 px-3 py-1 rounded-lg text-sm ${
                    featuredImageIndex === index
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Set as Featured Image
                </button>
                <button
                  onClick={() => handleDeletePhoto(index)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
        {featuredImageError && (
          <p className="mt-2 text-red-500 text-sm">{featuredImageError}</p>
        )}
      </div>

      {/* Videos Section */}
      <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <svg className="w-12 h-12 text-blue-500" /* ... */ />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          + Add Videos
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Upload a video of max size of 30MB in format MP4 (Required)
        </p>
        <input
          type="file"
          accept=".mp4"
          onChange={handleVideoUpload}
          className="hidden"
          id="video-upload"
        />
        <label
          htmlFor="video-upload"
          className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors duration-200"
        >
          Upload Video
        </label>
        {(videoError || localVideoError) && (
          <p className="mt-2 text-red-500 text-sm">{videoError || localVideoError}</p>
        )}
        {video && (
          <div className="mt-4 flex justify-center">
            <div className="relative max-w-[80%]">
              <video
                src={URL.createObjectURL(video)}
                controls
                className="w-full h-50 object-cover rounded-lg"
              />
              <button
                onClick={handleDeleteVideo}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floor Plans Section */}
      <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <svg className="w-12 h-12 text-blue-500" /* ... */ />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          + Add Floor Plans
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Upload a floor plan of max size 10 MB in format JPG, JPEG & PNG (Required)
        </p>
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={handleFloorPlanUpload}
          className="hidden"
          id="floor-plan-upload"
        />
        <label
          htmlFor="floor-plan-upload"
          className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors duration-200"
        >
          Upload Floor Plan
        </label>
        {(floorPlanError || localFloorPlanError) && (
          <p className="mt-2 text-red-500 text-sm">{floorPlanError || localFloorPlanError}</p>
        )}
        {floorPlan && (
          <div className="mt-4 flex justify-center">
            <div className="relative max-w-[50%]">
              <img
                src={URL.createObjectURL(floorPlan)}
                alt="Floor Plan"
                className="w-full h-50 object-cover rounded-lg"
              />
              <button
                onClick={handleDeleteFloorPlan}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaUploadSection;
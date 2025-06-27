import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";

interface MediaUploadSectionProps {
  unique_property_id: string;
}

interface ApiImage {
  id: number;
  url: string;
}

interface ApiVideo {
  id: number;
  url: string;
  type: string;
}

const MediaUploadSection: React.FC<MediaUploadSectionProps> = ({ unique_property_id }) => {
  const [apiPhotos, setApiPhotos] = useState<ApiImage[]>([]);
  const [apiVideo, setApiVideo] = useState<ApiVideo | null>(null);
  const [apiFloorPlan, setApiFloorPlan] = useState<ApiImage | null>(null);
  const [featuredImageIndex, setFeaturedImageIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch media from APIs when component mounts or unique_property_id changes
  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        // Fetch photos
        const photosResponse = await axios.get(
          `https://api.meetowner.in/property/getpropertyphotos?unique_property_id=${unique_property_id}`
        );
        if (photosResponse.data.status === "success") {
          setApiPhotos(photosResponse.data.images);
          setFeaturedImageIndex(photosResponse.data.featuredImageIndex);
        }

        // Fetch videos
        const videosResponse = await axios.get(
          `https://api.meetowner.in/property/getpropertyvideos?unique_property_id=${unique_property_id}`
        );
        if (videosResponse.data.status === "success" && videosResponse.data.videos.length > 0) {
          setApiVideo(videosResponse.data.videos[0]);
        }

        // Fetch floor plans
        const floorPlansResponse = await axios.get(
          `https://api.meetowner.in/property/getfloorplansphotos?unique_property_id=${unique_property_id}`
        );
        if (floorPlansResponse.data.status === "success" && floorPlansResponse.data.images.length > 0) {
          setApiFloorPlan(floorPlansResponse.data.images[0]);
        }
      } catch (error) {
        console.error("Error fetching media:", error);
      } finally {
        setLoading(false);
      }
    };

    if (unique_property_id) {
      fetchMedia();
    }
  }, [unique_property_id]);

  console.log(featuredImageIndex, "featuredImageIndex");

  const deletePropertyImage = async (image_id: number) => {
    try {
      const response = await axios.post("https://api.meetowner.in/property/deletePropertyPhoto", {
        photo_id: image_id,
        user_id: user!.user_id,
        unique_property_id,
      });
      if (response.data.status === "error") {
        toast.error(response.data.message || "Failed to delete image");
        return;
      }
      setApiPhotos((prev) => prev.filter((photo) => photo.id !== image_id));
      if (featuredImageIndex !== null && apiPhotos[featuredImageIndex]?.id === image_id) {
        setFeaturedImageIndex(null);
      }
      toast.success("Image removed successfully");
    } catch (error) {
      toast.error("Error deleting image");
    }
  };

  const deletePropertyVideo = async (video_id: number) => {
    try {
      const response = await axios.post("https://api.meetowner.in/property/deletepropertyvideo", {
        video_id,
        user_id: user!.user_id,
        unique_property_id,
      });
      if (response.data.status === "error") {
        toast.error(response.data.message || "Failed to delete video");
        return;
      }
      setApiVideo(null);
      toast.success("Video removed successfully");
    } catch (error) {
      toast.error("Error deleting video");
    }
  };

  const deletePropertyFloorPlan = async (image_id: number) => {
    try {
      const response = await axios.post("https://api.meetowner.in/property/deletepropertyfloorplan", {
        photo_id: image_id,
        user_id: user!.user_id,
        unique_property_id,
      });
      if (response.data.status === "error") {
        toast.error(response.data.message || "Failed to delete floor plan");
        return;
      }
      setApiFloorPlan(null);
      toast.success("Floorplan removed successfully");
    } catch (error) {
      toast.error("Error deleting floor plan");
    }
  };

  const handleDeletePhoto = async (index: number) => {
    const photoToDelete = apiPhotos[index];
    const confirmDelete = window.confirm("Are you sure you want to delete this photo?");
    if (confirmDelete) {
      await deletePropertyImage(photoToDelete.id);
    }
  };

  const handleDeleteVideo = async () => {
    if (apiVideo) {
      const confirmDelete = window.confirm("Are you sure you want to delete this video?");
      if (confirmDelete) {
        await deletePropertyVideo(apiVideo.id);
      }
    }
  };

  const handleDeleteFloorPlan = async () => {
    if (apiFloorPlan) {
      const confirmDelete = window.confirm("Are you sure you want to delete this floor plan?");
      if (confirmDelete) {
        await deletePropertyFloorPlan(apiFloorPlan.id);
      }
    }
  };

  const hasVideo = !!apiVideo;
  const hasFloorPlan = !!apiFloorPlan;

  return (
    <div className="space-y-6">
      {/* Photos Section */}
      <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Photos</h3>
        {loading ? (
          <p>Loading media...</p>
        ) : apiPhotos.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {apiPhotos.map((photo, index) => (
              <div key={`api-${photo.id}`} className="relative">
                <img
                  src={photo.url}
                  alt={`Property ${index}`}
                  className="w-full h-40 object-cover rounded-lg"
                  crossOrigin="anonymous"
                />
                {featuredImageIndex === index && (
                  <span className="absolute top-2 left-2 px-3 py-1 bg-green-500 text-white rounded-lg text-sm">
                    Featured Image
                  </span>
                )}
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePhoto(index);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-gray-500 dark:text-gray-400">No photos available.</p>
        )}
      </div>

      {/* Videos Section */}
      <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Videos</h3>
        {loading ? (
          <p>Loading media...</p>
        ) : hasVideo ? (
          <div className="mt-4 flex justify-center">
            <div className="relative max-w-[80%]">
              <video
                src={apiVideo.url}
                controls
                className="w-full h-50 object-cover rounded-lg"
                crossOrigin="anonymous"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteVideo();
                }}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-gray-500 dark:text-gray-400">No video available.</p>
        )}
      </div>

      {/* Floor Plans Section */}
      <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Floor Plan</h3>
        {loading ? (
          <p>Loading media...</p>
        ) : hasFloorPlan ? (
          <div className="mt-4 flex justify-center">
            <div className="relative max-w-[50%]">
              <img
                src={apiFloorPlan.url}
                alt="Floor Plan"
                className="w-full h-50 object-cover rounded-lg"
                crossOrigin="anonymous"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFloorPlan();
                }}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-gray-500 dark:text-gray-400">No floor plan available.</p>
        )}
      </div>
    </div>
  );
};

export default MediaUploadSection;
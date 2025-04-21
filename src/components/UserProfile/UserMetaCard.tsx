import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { useState, ChangeEvent } from "react";
import { uploadUserImage } from "../../store/slices/uploadSlice";
import { toast } from "react-hot-toast";
import { getProfile } from "../../store/slices/authSlice";

interface Option {
  value: number;
  text: string;
}

const designationOptions: Option[] = [
  { value: 1, text: "Admin" },
  { value: 2, text: "User" },
  { value: 3, text: "Builder" },
  { value: 4, text: "Agent" },
  { value: 5, text: "Owner" },
  { value: 6, text: "Channel Partner" },
  { value: 7, text: "Manager" },
  { value: 8, text: "TeleCaller" },
  { value: 9, text: "Marketing Executive" },
  { value: 10, text: "Customer Support" },
  { value: 11, text: "Customer Service" },
];

export default function UserMetaCard() {
  const { user } = useSelector((state: RootState) => state.auth);
 
  const { uploadLoading, uploadError, uploadSuccess } = useSelector(
    (state: RootState) => state.upload
  );
  const dispatch = useDispatch<AppDispatch>();
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // To reset file input

  const getDesignationText = (userType: number | undefined): string => {
    const designation = designationOptions.find((option) => option.value === userType);
    return designation ? designation.text : "Unknown Designation";
  };

  const getPlaceholderImage = (): string => {
    const name = user?.name || "User";
    return `https://placehold.co/100x100?text=${encodeURIComponent(name[0]?.toUpperCase() || "U")}`;
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    // Basic validation
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, and PNG files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB.");
      return;
    }
  
    if (!user?.user_id) {
      toast.error("User ID is not available.");
      return;
    }
  
    try {
      const result = await dispatch(
        uploadUserImage({ user_id: user.user_id, image: file })
      ).unwrap();
  
      console.log("uploadUserImage result:", result);
  
      if (result.photo) {
        toast.success("Image uploaded successfully!");
        await dispatch(getProfile(user.user_id)); // Dispatch getProfile
      } else {
        toast.error("No photo URL returned from upload.");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Failed to upload image.");
    }
  
    // Reset file input
    setFileInputKey(Date.now());
  };


  // Helper to determine if photo is valid
  const hasValidPhoto = (): boolean => {
    return !!user?.photo && user.photo !== "null" && user.photo !== "";
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <div className="relative w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 flex items-center justify-center bg-gray-200 dark:bg-gray-700 group">
          <img
              src={hasValidPhoto() ? `https://api.meetowner.in/${user?.photo}` : getPlaceholderImage()}
              alt="User profile"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              onError={(e) => {
                e.currentTarget.src = getPlaceholderImage(); // Fallback to placeholder
              }}
            />
            {/* Edit Button - Always Available */}
            <label
              htmlFor="photo-upload"
              className="absolute bottom-2 right-1 bg-blue-500 text-white rounded-full p-1 cursor-pointer hover:bg-blue-600 transition-colors opacity-0 group-hover:opacity-100"
              title="Edit profile photo"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              <input
                type="file"
                id="photo-upload"
                key={fileInputKey}
                accept=".jpg,.jpeg,.png"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadLoading}
              />
            </label>
          </div>
          <div className="order-3 xl:order-2">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {user?.name || "Unknown User"}
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getDesignationText(user?.user_type)}
              </p>
              <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {localStorage.getItem("city") || "Unknown City"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
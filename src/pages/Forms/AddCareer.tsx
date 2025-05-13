import { useState, ChangeEvent, FormEvent } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { AppDispatch, RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { clearMessages, createCareer } from "../../store/slices/careerSlice";
import { useNavigate } from "react-router";

interface FormData {
  description: string;
  job_title: string;
  preferred_location: string;
  salary: string;
  experience: string;
}

const AddCareer: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    description: "",
    job_title: "",
    preferred_location: "",
    salary: "",
    experience: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [apiError, setApiError] = useState<string>("");
  const dispatch = useDispatch<AppDispatch>();
  const { createLoading, createError } = useSelector((state: RootState) => state.career);
  const navigate = useNavigate();

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.job_title.trim()) {
      newErrors.job_title = "Job title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.preferred_location.trim()) {
      newErrors.preferred_location = "Location is required";
    }

    if (!formData.salary) {
      newErrors.salary = "Salary is required";
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.salary)) {
      newErrors.salary = "Please enter a valid salary (e.g., 50000 or 50000.00)";
    }

    if (!formData.experience.trim()) {
      newErrors.experience = "Experience is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) {
      return;
    }

    try {
      const payload: FormData = {
        job_title: formData.job_title,
        description: formData.description,
        preferred_location: formData.preferred_location,
        salary: formData.salary,
        experience: formData.experience,
      };

      console.log("Form Data Submitted:", payload);

      await dispatch(createCareer(payload)).unwrap();
      setFormData({
        job_title: "",
        description: "",
        preferred_location: "",
        salary: "",
        experience: "",
      });
      dispatch(clearMessages());
      navigate(-1); // Navigate back to the previous page
    } catch (error) {
      setApiError((error as string) || "Failed to create career");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
      <ComponentCard title="Add New Career">
        <form onSubmit={handleSubmit} className="space-y-6">
          {(apiError || createError) && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {apiError || createError}
            </p>
          )}
          <div>
            <Label htmlFor="job_title">Job Title</Label>
            <Input
              type="text"
              id="job_title"
              name="job_title"
              value={formData.job_title}
              onChange={handleInputChange}
              className="dark:bg-dark-900"
              placeholder="Enter job title"
            />
            {errors.job_title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.job_title}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full h-24 p-3 border border-gray-200 rounded-lg dark:border-gray-800 dark:bg-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Enter job description here..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="preferred_location">Location</Label>
            <Input
              type="text"
              id="preferred_location"
              name="preferred_location"
              value={formData.preferred_location}
              onChange={handleInputChange}
              className="dark:bg-dark-900"
              placeholder="Enter preferred location (e.g., WFO, Remote)"
            />
            {errors.preferred_location && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.preferred_location}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="salary">Salary (₹)</Label>
            <Input
              type="text"
              id="salary"
              name="salary"
              value={formData.salary}
              onChange={handleInputChange}
              className="dark:bg-dark-900"
              placeholder="Enter salary in rupees (e.g., 50000)"
            />
            {errors.salary && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.salary}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="experience">Experience</Label>
            <Input
              type="text"
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              className="dark:bg-dark-900"
              placeholder="Enter experience (e.g., 2-4 years)"
            />
            {errors.experience && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.experience}
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createLoading}
              className={`px-6 py-2 rounded-lg text-white transition-colors duration-200 ${
                createLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#1D3A76] hover:bg-blue-700"
              }`}
            >
              {createLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default AddCareer;
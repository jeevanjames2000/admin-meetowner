import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { updateEmployee, clearMessages } from "../../../store/slices/employee";
import toast from "react-hot-toast";
import { updateUser } from "../../../store/slices/userEditSlicet";

// Define interfaces for form data and errors
interface FormData {
  name: string;
  email: string;
  designation: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber: string;
  reraNumber: string;
}

interface Errors {
  name?: string;
  email?: string;
  designation?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstNumber?: string;
  reraNumber?: string;
}

interface Option {
  value: string;
  text: string;
}

export default function EditUserDetails() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const pageUserType = useSelector((state: RootState) => state.auth.user?.user_type);
  const { updateLoading, updateSuccess, updateError } = useSelector((state: RootState) => state.userEdit);
  const user = location.state?.user; // Get user data from navigation state

  console.log(user);


  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    designation: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstNumber: "",
    reraNumber: "",
  });

  const [errors, setErrors] = useState<Errors>({});

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        designation: user.user_type?.toString() || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
        gstNumber: user.gst_number || "",
        reraNumber: user.rera_number || "",
      });
    }
  }, [user]);

//   Handle update success/error and redirect
  useEffect(() => {
    if (updateSuccess) {
      toast.success(updateSuccess);
      dispatch(clearMessages());
      navigate(-1);
    }
    if (updateError) {
      toast.error(updateError);
      dispatch(clearMessages());
    }
  }, [updateSuccess, updateError, dispatch, navigate, user.user_type]);

  // Designation options
  const allDesignationOptions: Option[] = [
    {value :"2",text:"User"},
    { value: "3", text: "Builder" },
    { value: "4", text: "Agent" },
    { value: "5", text: "Owner" },
    { value: "6", text: "Channel Partner" },
  ];

  const designationOptions: Option[] = (() => {
    
    return allDesignationOptions;
  })();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name as keyof Errors]) {
      setErrors({ ...errors, [name as keyof Errors]: undefined });
    }
  };

  const validateForm = () => {
    let newErrors: Errors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.designation) newErrors.designation = "Designation is required";
    // if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }
    // if (!formData.gstNumber.trim()) {
    //   newErrors.gstNumber = "GST Number is required";
    // } 
    
    // if (!formData.reraNumber.trim()) newErrors.reraNumber = "Rera Number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const createdBy = localStorage.getItem("name");
      const createdUserIdRaw = localStorage.getItem("userId");

      const selectedDesignationId = formData.designation;
      const designationName = designationOptions.find((option) => option.value === selectedDesignationId)?.text || selectedDesignationId;

      const profileData = {
        id: user?.id,
        name: formData.name,
        email: formData.email,
        designation: designationName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        gst_number: formData.gstNumber,
        rera_number: formData.reraNumber,
        user_type: parseInt(selectedDesignationId),
        created_by: createdBy || "Unknown",
        created_userID: createdUserIdRaw ? parseInt(createdUserIdRaw) : 1,
        mobile: user?.mobile || "",
        status: user?.status || 0,
      };
      console.log(profileData);

      dispatch(updateUser(profileData));
    }
  };

  const handleCancel = () => {
     navigate(-1);
  };

  if (!user) {
    return <div>No user data available. Please select a user to edit.</div>;
  }

  return (
    <ComponentCard title="Edit User Details">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="min-h-[80px]">
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your name"
            className="dark:bg-dark-900"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div className="min-h-[80px]">
          <Label htmlFor="email">Email ID</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="example@domain.com"
            className="dark:bg-dark-900"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div className="min-h-[80px]">
          <Label htmlFor="designation">Designation</Label>
          <select
            id="designation"
            name="designation"
            value={formData.designation}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D3A76] dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          >
            <option value="">Select designation</option>
            {designationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
          {errors.designation && (
            <p className="text-red-500 text-sm mt-1">{errors.designation}</p>
          )}
        </div>

        <div className="min-h-[80px]">
          <Label htmlFor="address">Address</Label>
          <Input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter address"
            className="dark:bg-dark-900"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
          )}
        </div>

        <div className="min-h-[80px]">
          <Label htmlFor="city">City</Label>
          <Input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="Enter city"
            className="dark:bg-dark-900"
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
          )}
        </div>

        <div className="min-h-[80px]">
          <Label htmlFor="state">State</Label>
          <Input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            placeholder="Enter state"
            className="dark:bg-dark-900"
          />
          {errors.state && (
            <p className="text-red-500 text-sm mt-1">{errors.state}</p>
          )}
        </div>

        <div className="min-h-[80px]">
          <Label htmlFor="pincode">Pincode</Label>
          <Input
            type="text"
            id="pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleInputChange}
            placeholder="Enter pincode"
            className="dark:bg-dark-900"
          />
          {errors.pincode && (
            <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
          )}
        </div>

        <div className="min-h-[80px]">
          <Label htmlFor="gstNumber">GST Number</Label>
          <Input
            type="text"
            id="gstNumber"
            name="gstNumber"
            value={formData.gstNumber}
            onChange={handleInputChange}
            placeholder="Enter GST number"
            className="dark:bg-dark-900"
          />
          {errors.gstNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.gstNumber}</p>
          )}
        </div>

        <div className="min-h-[80px]">
          <Label htmlFor="reraNumber">Rera Number</Label>
          <Input
            type="text"
            id="reraNumber"
            name="reraNumber"
            value={formData.reraNumber}
            onChange={handleInputChange}
            placeholder="Enter Rera number"
            className="dark:bg-dark-900"
          />
          {errors.reraNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.reraNumber}</p>
          )}
        </div>

        <div className="flex justify-center space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="w-[30%] px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-[30%] px-4 py-2 text-white bg-[#1D3A76] rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={updateLoading}
          >
            {updateLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </ComponentCard>
  );
}
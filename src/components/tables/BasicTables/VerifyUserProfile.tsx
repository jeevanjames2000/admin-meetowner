import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import {
  updateProfileStatus,
  clearMessages,
} from "../../../store/slices/userEditSlicet";
import { fetchUsersByType, profileVerified } from "../../../store/slices/users";
import toast from "react-hot-toast";
import ComponentCard from "../../common/ComponentCard";
import { ArrowLeft, BadgeCheck, XCircle } from "lucide-react"; // Assuming you're using lucide-react for icons

interface User {
  id: number;
  name: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gst_number: string;
  rera_number: string;
  gst_document?: string;
  rera_document?: string;
  user_type: number;
  verified: number;
}

const VerifyUserProfile: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { profileStatusLoading, profileStatusError, profileStatusSuccess } =
    useSelector((state: RootState) => state.employee);

  const user: User = location.state?.user;
  const userType: string = location.state?.userType;

  const [rejectionReason, setRejectionReason] = useState(
    user.rejection_reason || ""
  );
  console.log("user: ", user);
  const [showRejectionInput, setShowRejectionInput] = useState(false);

  useEffect(() => {
    if (profileStatusSuccess) {
      toast.success(profileStatusSuccess);
      dispatch(clearMessages());
      navigate(-1); // Navigate back to BasicTableOne
    }
    if (profileStatusError) {
      toast.error(profileStatusError);
      dispatch(clearMessages());
    }
  }, [profileStatusSuccess, profileStatusError, dispatch, navigate]);

  const handleVerify = async () => {
    try {
      dispatch(
        updateProfileStatus({
          user_id: user.id,
          verified: 1,
          rejection_reason: "",
        })
      );
      navigate(-1);
      toast.success("Profile verified successfully");
      dispatch(clearMessages());
    } catch (err) {
      console.error("Verify profile error:", err);
    }
  };

  const handleReject = async () => {
    if (!showRejectionInput) {
      setShowRejectionInput(true);
      return;
    }
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    try {
      dispatch(
        updateProfileStatus({
          user_id: user.id,
          verified: 0,
          rejection_reason: rejectionReason,
        })
      );
      toast.success("Profile rejected successfully");
      dispatch(clearMessages());
      setRejectionReason("");
      setShowRejectionInput(false);
      navigate(-1);
    } catch (err) {
      navigate(-1);
      console.error("Reject profile error:", err);
    }
  };

  const handleBack = () => {
    setRejectionReason("");
    setShowRejectionInput(false);
    dispatch(clearMessages());
    navigate(-1);
  };

  const baseURL = "https://api.meetowner.in/aws/v1/s3/";

  if (!user) {
    return <div>No user data available. Please select a user to verify.</div>;
  }

  return (
    <div className="relative min-h-screen">
      <ComponentCard title="Verify User Profile">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
        <div className="space-y-4">
          {profileStatusSuccess && (
            <div
              style={{
                padding: "0.75rem",
                backgroundColor: "#d1fae5",
                color: "#065f46",
                borderRadius: "0.5rem",
              }}
            >
              {profileStatusSuccess}
            </div>
          )}
          {profileStatusError && (
            <div
              style={{
                padding: "0.75rem",
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                borderRadius: "0.5rem",
              }}
            >
              {profileStatusError}
            </div>
          )}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                paddingBottom: "0.5rem",
                borderBottom: "1px solid #bfdbfe",
                marginBottom: "0.75rem",
              }}
            >
              <span>👤</span>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  color: "#1e3a8a",
                }}
              >
                Personal Information
              </h3>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div style={{ marginBottom: "0.75rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#4b5563",
                    marginBottom: "0.25rem",
                  }}
                >
                  Name
                </label>
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  {user.name}
                </p>
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#4b5563",
                    marginBottom: "0.25rem",
                  }}
                >
                  Phone Number
                </label>
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "#111827",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span style={{ marginRight: "0.5rem" }}>📞</span>
                  {user.mobile}
                </p>
              </div>
              <div style={{ gridColumn: "span 2", marginBottom: "0.75rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#4b5563",
                    marginBottom: "0.25rem",
                  }}
                >
                  Email Address
                </label>
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "#111827",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span style={{ marginRight: "0.5rem" }}>✉️</span>
                  {user.email}
                </p>
              </div>
            </div>
          </div>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                paddingBottom: "0.5rem",
                borderBottom: "1px solid #6ee7b7",
                marginBottom: "0.75rem",
              }}
            >
              <span>📍</span>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  color: "#065f46",
                }}
              >
                Address Information
              </h3>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div style={{ gridColumn: "span 2", marginBottom: "0.75rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#4b5563",
                    marginBottom: "0.25rem",
                  }}
                >
                  Address
                </label>
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  {user.address || "N/A"}
                </p>
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#4b5563",
                    marginBottom: "0.25rem",
                  }}
                >
                  City
                </label>
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  {user.city || "N/A"}
                </p>
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#4b5563",
                    marginBottom: "0.25rem",
                  }}
                >
                  State
                </label>
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  {user.state || "N/A"}
                </p>
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#4b5563",
                    marginBottom: "0.25rem",
                  }}
                >
                  Pin Code
                </label>
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  {user.pincode || "N/A"}
                </p>
              </div>
            </div>
          </div>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                paddingBottom: "0.5rem",
                borderBottom: "1px solid #c4b5fd",
                marginBottom: "0.75rem",
              }}
            >
              <span>🏢</span>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  color: "#6b7280",
                }}
              >
                Business Information
              </h3>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div style={{ marginBottom: "0.75rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#4b5563",
                    marginBottom: "0.25rem",
                  }}
                >
                  GST Number
                </label>
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "#111827",
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span style={{ marginRight: "0.5rem", fontSize: "1rem" }}>
                    💳
                  </span>
                  {user.gst_number || "N/A"}
                </p>
                {user.gst_document && (
                  <a
                    href={`${baseURL}${user.gst_document}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 1rem",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#2563eb",
                      backgroundColor: "#eff6ff",
                      border: "1px solid #2563eb",
                      borderRadius: "0.375rem",
                      textDecoration: "none",
                      transition: "all 0.2s ease-in-out",
                      cursor: "pointer",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#dbeafe";
                      e.currentTarget.style.color = "#1e40af";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "#eff6ff";
                      e.currentTarget.style.color = "#2563eb";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                    aria-label="View GST Document"
                  >
                    <span>📄</span> View GST Document
                  </a>
                )}
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#4b5563",
                    marginBottom: "0.25rem",
                  }}
                >
                  RERA Number
                </label>
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "#111827",
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span style={{ marginRight: "0.5rem", fontSize: "1rem" }}>
                    🏢
                  </span>
                  {user.rera_number || "N/A"}
                </p>
                {user.rera_document && (
                  <a
                    href={`${baseURL}${user.rera_document}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 1rem",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#2563eb",
                      backgroundColor: "#eff6ff",
                      border: "1px solid #2563eb",
                      borderRadius: "0.375rem",
                      textDecoration: "none",
                      transition: "all 0.2s ease-in-out",
                      cursor: "pointer",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#dbeafe";
                      e.currentTarget.style.color = "#1e40af";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "#eff6ff";
                      e.currentTarget.style.color = "#2563eb";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                    aria-label="View RERA Document"
                  >
                    <span>📄</span> View RERA Document
                  </a>
                )}
              </div>
            </div>
          </div>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                paddingBottom: "0.5rem",
                borderBottom: "1px solid #6ee7b7",
                marginBottom: "0.75rem",
              }}
            >
              <span>
                {user?.verified === 1 ? (
                  <BadgeCheck className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </span>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  color: "#6b7280",
                }}
              >
                Profile Status{" "}
                <span
                  className={
                    user?.verified === 1
                      ? "ml-10 text-green-500"
                      : "ml-10 text-red-500"
                  }
                >
                  {user?.verified === 1 ? "Verified" : "Not Verified"}
                </span>
              </h3>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div style={{ marginBottom: "0.75rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#4b5563",
                    marginBottom: "0.25rem",
                  }}
                >
                  Rejection Reason
                </label>
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  {user?.rejection_reason || "N/A"}
                </p>
              </div>
            </div>
          </div>
          {showRejectionInput && (
            <div>
              <label
                htmlFor="rejection_reason"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#4b5563",
                  marginBottom: "0.25rem",
                }}
              >
                Rejection Reason *
              </label>
              <textarea
                id="rejection_reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection"
                required
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  minHeight: "80px",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#ef4444")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>
          )}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleVerify}
              disabled={profileStatusLoading || user.verified === 1}
              style={{
                width: "30%",
                backgroundColor: "#16a34a",
                color: "#fff",
                padding: "0.5rem",
                borderRadius: "0.375rem",
                fontWeight: "500",
                fontSize: "0.875rem",
                cursor:
                  profileStatusLoading || user.verified === 1
                    ? "not-allowed"
                    : "pointer",
                opacity: profileStatusLoading || user.verified === 1 ? 0.5 : 1,
                border: "none",
              }}
            >
              ✅ {profileStatusLoading ? "Processing..." : "Verify Profile"}
            </button>
            <button
              onClick={handleReject}
              disabled={profileStatusLoading || user.verified === 0}
              style={{
                width: "30%",
                backgroundColor: "#dc2626",
                color: "#fff",
                padding: "0.5rem",
                borderRadius: "0.375rem",
                fontWeight: "500",
                fontSize: "0.875rem",
                cursor:
                  profileStatusLoading || user.verified === 0
                    ? "not-allowed"
                    : "pointer",
                opacity: profileStatusLoading || user.verified === 0 ? 0.5 : 1,
                border: "none",
              }}
            >
              ❌{" "}
              {profileStatusLoading
                ? "Processing..."
                : showRejectionInput
                ? "Submit Rejection"
                : "Reject Profile"}
            </button>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
};

export default VerifyUserProfile;

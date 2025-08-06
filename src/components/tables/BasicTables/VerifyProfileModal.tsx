import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import {
  updateProfileStatus,
  clearMessages,
} from "../../../store/slices/userEditSlicet";
import { fetchUsersByType, profileVerified } from "../../../store/slices/users";
import toast from "react-hot-toast";
interface VerifyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
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
  };
  userType: string;
}
const VerifyProfileModal: React.FC<VerifyProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  userType,
}) => {
  console.log("user: ", user);
  const dispatch = useDispatch<AppDispatch>();
  const { profileStatusLoading, profileStatusError, profileStatusSuccess } =
    useSelector((state: RootState) => state.employee);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const handleVerify = async () => {
    try {
      await dispatch(
        updateProfileStatus({
          user_id: user.id,
          verified: 1,
          rejection_reason: "",
        })
      ).unwrap();
      await dispatch(profileVerified(true));
      await dispatch(
        fetchUsersByType({ user_type: parseInt(userType) })
      ).unwrap();
      toast.success("Profile verified successfully");
      dispatch(clearMessages());
      onClose();
    } catch (err) {
      const errorMessage = profileStatusError || "Failed to verify profile";
      toast.error(errorMessage);
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
      await dispatch(
        updateProfileStatus({
          user_id: user.id,
          verified: 0,
          rejection_reason: rejectionReason,
        })
      ).unwrap();
      await dispatch(profileVerified(false));
      await dispatch(
        fetchUsersByType({ user_type: parseInt(userType) })
      ).unwrap();
      toast.success("Profile rejected successfully");
      dispatch(clearMessages());
      setRejectionReason("");
      setShowRejectionInput(false);
      onClose();
    } catch (err) {
      const errorMessage = profileStatusError || "Failed to reject profile";
      toast.error(errorMessage);
      console.error("Reject profile error:", err);
    }
  };
  const handleCancel = () => {
    setRejectionReason("");
    setShowRejectionInput(false);
    dispatch(clearMessages());
    onClose();
  };
  const baseURL = "https://api.meetowner.in/aws/v1/s3/";
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          width: "90%",
          maxWidth: "800px",
          maxHeight: "80vh",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {}
        <div
          style={{
            background: "linear-gradient(to right, #1D37A6, #3b82f6)",
            color: "#fff",
            padding: "1rem",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ marginRight: "0.5rem" }}>👤</span> Profile Details
          </h2>
          <button
            onClick={handleCancel}
            disabled={profileStatusLoading}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              cursor: profileStatusLoading ? "not-allowed" : "pointer",
              opacity: profileStatusLoading ? 0.5 : 1,
              fontSize: "1rem",
            }}
          >
            ❌
          </button>
        </div>
        {}
        <div
          style={{
            padding: "1rem",
            overflowY: "auto",
            flex: 1,
            scrollbarWidth: "thin",
            scrollbarColor: "#bfdbfe #f3f4f6",
          }}
        >
          {profileStatusSuccess && (
            <div
              style={{
                marginBottom: "1rem",
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
                marginBottom: "1rem",
                padding: "0.75rem",
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                borderRadius: "0.5rem",
              }}
            >
              {profileStatusError}
            </div>
          )}
          {}
          <div style={{ marginBottom: "1.5rem" }}>
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
          {}
          <div style={{ marginBottom: "1.5rem" }}>
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
          {}
          <div style={{ marginBottom: "1.5rem" }}>
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
          {}
          {showRejectionInput && (
            <div style={{ marginBottom: "1rem" }}>
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
        </div>
        {}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "0.5rem",
            padding: "1rem",
            borderTop: "1px solid #d1d5db",
            backgroundColor: "#f9fafb",
            borderBottomLeftRadius: "8px",
            borderBottomRightRadius: "8px",
            flexShrink: 0,
          }}
        >
          <button
            onClick={handleVerify}
            disabled={profileStatusLoading || user.verified === 1}
            style={{
              flex: 1,
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
              flex: 1,
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
    </div>
  );
};
export default VerifyProfileModal;

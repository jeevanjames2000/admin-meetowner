import { AuthState, isTokenExpired } from "../store/slices/authSlice";

export const initializeAuthState = (): AuthState => {
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");
  const userType = localStorage.getItem("userType");
  const email = localStorage.getItem("email");
  const mobile = localStorage.getItem("mobile");
  const city = localStorage.getItem("city");
  const state = localStorage.getItem("state");
  const userId = localStorage.getItem("userId");
  const photo = localStorage.getItem("photo");

  // Required fields: token, name, userType, userId
  if (token && name && userType && userId && !isTokenExpired(token)) {
    return {
      isAuthenticated: true,
      user: {
        user_id: parseInt(userId),
        name,
        user_type: parseInt(userType),
        email: email || "",
        mobile: mobile || "",
        state: state || "",
        city: city || "",
        pincode: "",
        status: 0,
        created_userID: 0,
        created_by: "",
        photo: photo || "",
      },
      token,
      loading: false,
      error: null,
      userCounts: null,
    };
  }

  // Clear authentication-related localStorage items only if token is invalid or missing
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  localStorage.removeItem("userType");
  localStorage.removeItem("email");
  localStorage.removeItem("mobile");
  localStorage.removeItem("city");
  localStorage.removeItem("state");
  localStorage.removeItem("userId");
  localStorage.removeItem("photo");

  return {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null,
    userCounts: null,
  };
};
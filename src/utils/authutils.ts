import { AuthState } from "../store/slices/authSlice";

export const initializeAuthState = (): AuthState => {
  const token = localStorage.getItem('token');
  const name = localStorage.getItem('name');
  const userType = localStorage.getItem('userType');
  const email = localStorage.getItem('email');
  const mobile = localStorage.getItem('mobile');
  const city = localStorage.getItem('city');
  const state = localStorage.getItem('state');
  const userId = localStorage.getItem('userId');
  const photo = localStorage.getItem('photo')!;

  if (token && name && userType && email && mobile && city && state && userId) {
    return {
      isAuthenticated: true,
      user: {
        user_id: parseInt(userId),
        name,
        user_type: parseInt(userType),
        email,
        mobile,
        state,
        city,
        pincode: '', // Add default value or get from localStorage if needed
        status: 0,   // Default value
        created_userID: 0, // Default value
        created_by: '' ,
        photo,   // Default empty string
      },
      token,
      loading: false,
      error: null,
      userCounts: null
    };
  }

  // If no token exists or any required field is missing
  return {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null,
    userCounts: null
  };
};
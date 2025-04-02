import { AuthState } from "../store/slices/authSlice";

// authUtils.ts
export const initializeAuthState = (): AuthState => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('name');
    const userType = localStorage.getItem('userType');
    const email = localStorage.getItem('email');
  
    if (token && name && userType && email) {
      return {
        isAuthenticated: true,
        user: {
          name,
          user_type: parseInt(userType),
          email,
          // Add other required user fields with default values
          id: 0,
          mobile: '',
          alt_mobile: '',
          photo: '',
          status: 0,
          created_date: '',
          created_time: '',
          updated_date: '',
          updated_time: '',
          state: '',
          city: '',
          location: 0,
          address: '',
          pincode: '',
          from_app: 0,
          gst_number: null,
          rera_number: null,
          uploaded_from_seller_panel: ''
        },
        token,
        loading: false,
        error: null
      };
    }
  
    return {
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null
    };
  };
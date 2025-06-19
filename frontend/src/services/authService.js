import { api, API_ENDPOINTS } from "../config/api";

const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      return response;
    } catch (err) {
      throw err;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return response;
    } catch (err) {
      throw err;
    }
  },

  // Logout function
  logout: async () => {
    try {
      await api.post(
        API_ENDPOINTS.AUTH.LOGOUT,
        {},
        localStorage.getItem("educonnect_token")
      );
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("educonnect_token");
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const token = localStorage.getItem("educonnect_token");
      const data = await api.patch(
        API_ENDPOINTS.USERS.UPDATE_PROFILE,
        userData,
        token
      );
      return data;
    } catch (err) {
      throw err;
    }
  },

  // Update password
  updatePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      const token = localStorage.getItem("educonnect_token");
      const data = await api.patch(
        API_ENDPOINTS.USERS.UPDATE_PASSWORD,
        { currentPassword, newPassword, confirmPassword },
        token
      );
      return data;
    } catch (err) {
      throw err;
    }
  },

  // Upload profile photo
  uploadPhoto: async (file) => {
    try {
      const token = localStorage.getItem("educonnect_token");
      const data = await api.upload(
        API_ENDPOINTS.USERS.UPLOAD_PHOTO,
        file,
        token
      );
      return data;
    } catch (err) {
      throw err;
    }
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    try {
      const token = localStorage.getItem("educonnect_token");
      const data = await api.patch(
        API_ENDPOINTS.USERS.UPDATE_PREFERENCES,
        { preferences },
        token
      );
      return data;
    } catch (err) {
      throw err;
    }
  },

  // Delete account
  deleteAccount: async () => {
    try {
      const token = localStorage.getItem("educonnect_token");
      await api.delete(API_ENDPOINTS.USERS.DELETE_ACCOUNT, token);
    } catch (err) {
      throw err;
    }
  },
};

export default authService;

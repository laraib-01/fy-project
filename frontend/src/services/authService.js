import { api, API_ENDPOINTS } from "../config/api";

// Helper function to get user info from token
const getUserFromToken = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(window.atob(base64));
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      school_id: payload.school_id,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

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
      // Clear all auth-related data
      localStorage.removeItem("educonnect_token");
      localStorage.removeItem("educonnect_user");
      localStorage.removeItem("educonnect_subscription_status");
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email,
      });
      return response;
    } catch (err) {
      throw err;
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

  // Get current authenticated user
  getCurrentUser: () => {
    const userJson = localStorage.getItem("educonnect_user");
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
      }
    }
    return null;
  },

  // Store user data after successful authentication
  storeAuthData: (token, hasActiveSubscription, userData) => {
    if (token) {
      localStorage.setItem("educonnect_token", token);
      localStorage.setItem(
        "educonnect_hasActiveSubscription",
        hasActiveSubscription
      );

      // Store user data
      const user = {
        id: userData.user_id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        school_id: userData.school_id,
        hasActiveSubscription: hasActiveSubscription,
      };

      localStorage.setItem("educonnect_user", JSON.stringify(user));
      localStorage.setItem("educonnect_role", userData?.role);
      return user;
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem("educonnect_token");
    if (!token) return false;

    const user = getUserFromToken(token);
    if (!user) return false;

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    return user.exp > currentTime;
  },

  // Check if user has required role
  hasRole: (requiredRole) => {
    const user = authService.getCurrentUser();
    return user && user.role === requiredRole;
  },

  // Check if user has any of the required roles
  hasAnyRole: (requiredRoles = []) => {
    const user = authService.getCurrentUser();
    return user && requiredRoles.includes(user.role);
  },

  // Get auth token
  getToken: () => {
    return localStorage.getItem("educonnect_token");
  },

  // Store subscription status
  setSubscriptionStatus: (status) => {
    localStorage.setItem(
      "educonnect_subscription_status",
      JSON.stringify(status)
    );
  },

  // Get subscription status
  getSubscriptionStatus: () => {
    const status = localStorage.getItem("educonnect_subscription_status");
    return status ? JSON.parse(status) : null;
  },

  // Clear all auth data
  clearAuthData: () => {
    localStorage.removeItem("educonnect_token");
    localStorage.removeItem("educonnect_user");
    localStorage.removeItem("educonnect_subscription_status");
  },

  // Request password reset
  forgotPassword: async (email) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email,
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to process password reset request",
        }
      );
    }
  },

  // Reset password with token
  resetPassword: async (token, password) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to reset password" };
    }
  },

  // Validate reset token
  validateResetToken: async (token) => {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.AUTH.VALIDATE_TOKEN}/${token}`
      );
      return response;
    } catch (error) {
      console.error("Error validating token:", error);
      return false;
    }
  },
};

export default authService;

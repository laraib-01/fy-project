import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api, API_ENDPOINTS } from "../config/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("educonnect_token");

        if (!token) {
          return;
        }

        const response = await api.get(API_ENDPOINTS.AUTH.ME);

        const user = response?.data;
        if (user) {
          setUser(user);
          localStorage.setItem("educonnect_role", user.role); 
        }
      } catch (err) {
        console.error("Authentication check failed:", err);
        localStorage.removeItem("educonnect_token");
      }
    };

    checkAuth();
  }, [location.pathname]);

  // Login function
  const login = async (email, password, rememberMe) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      if (response?.data?.status === "success") {
        localStorage.setItem("educonnect_token", response?.data?.token);
        localStorage.setItem("educonnect_role", response?.data?.user?.role);
        setUser(response?.data?.user);
      }

      return response;
    } catch (err) {
      throw err;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);

      if (response?.status === "success") {
        localStorage.setItem("educonnect_token", response?.data?.token);
        localStorage.setItem("educonnect_role", response?.data?.user?.role);
        setUser(response?.data?.user);
      }

      return response;
    } catch (err) {
      throw err;
    }
  };

  // Logout function
  const logout = useCallback(async () => {
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
      setUser(null);
      navigate("/login");
    }
  }, [navigate]);

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const token = localStorage.getItem("educonnect_token");
      const data = await api.patch(
        API_ENDPOINTS.USERS.UPDATE_PROFILE,
        userData,
        token
      );
      setUser(data.data.user);
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Update password
  const updatePassword = async (
    currentPassword,
    newPassword,
    confirmPassword
  ) => {
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
  };

  // Upload profile photo
  const uploadPhoto = async (file) => {
    try {
      const token = localStorage.getItem("educonnect_token");
      const data = await api.upload(
        API_ENDPOINTS.USERS.UPLOAD_PHOTO,
        file,
        token
      );

      // Update user in context
      setUser((prev) => ({
        ...prev,
        photo: data.data.photo,
      }));

      return data;
    } catch (err) {
      throw err;
    }
  };

  // Update user preferences
  const updatePreferences = async (preferences) => {
    try {
      const token = localStorage.getItem("educonnect_token");
      const data = await api.patch(
        API_ENDPOINTS.USERS.UPDATE_PREFERENCES,
        { preferences },
        token
      );

      // Update user in context
      setUser((prev) => ({
        ...prev,
        preferences: data.data.user.preferences,
      }));

      return data;
    } catch (err) {
      throw err;
    }
  };

  // Delete account
  const deleteAccount = async () => {
    try {
      const token = localStorage.getItem("educonnect_token");
      await api.delete(API_ENDPOINTS.USERS.DELETE_ACCOUNT, token);
      await logout();
    } catch (err) {
      throw err;
    }
  };

  // Value to be provided by the context
  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    uploadPhoto,
    updatePreferences,
    deleteAccount,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

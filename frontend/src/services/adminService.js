import { api, API_ENDPOINTS } from "../config/api";

const adminService = {
  // Get all admins
  getAllAdmins: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.ADMINS.BASE);
      return response;
    } catch (error) {
      console.error("Error fetching admins:", error);
      throw error;
    }
  },

  // Create a new admin
  createAdmin: async (adminData) => {
    try {
      const response = await api.post(API_ENDPOINTS.ADMINS.BASE, adminData);
      return response;
    } catch (error) {
      console.error("Error creating admin:", error);
      throw error;
    }
  },

  // Update an admin
  updateAdmin: async (id, adminData) => {
    try {
      const response = await api.put(
        API_ENDPOINTS.ADMINS.BY_ID(id),
        adminData
      );
      return response;
    } catch (error) {
      console.error(`Error updating admin ${id}:`, error);
      throw error;
    }
  },

  // Delete an admin
  deleteAdmin: async (id) => {
    try {
      const response = await api.delete(API_ENDPOINTS.ADMINS.BY_ID(id));
      return response;
    } catch (error) {
      console.error(`Error deleting admin ${id}:`, error);
      throw error;
    }
  },
};

export default adminService;

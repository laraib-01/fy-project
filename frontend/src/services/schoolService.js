import { api, API_ENDPOINTS } from "../config/api";

const schoolService = {
  getAllSchools: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.SCHOOLS.BASE);
      return response.data;
    } catch (error) {
      console.error("Error fetching schools:", error);
      throw error;
    }
  },

  createSchool: async (schoolData) => {
    try {
      const response = await api.post(API_ENDPOINTS.SCHOOLS.BASE, schoolData);
      return response.data;
    } catch (error) {
      console.error("Error creating school:", error);
      throw error;
    }
  },

  updateSchool: async (id, schoolData) => {
    try {
      const response = await api.put(
        API_ENDPOINTS.SCHOOLS.BY_ID(id),
        schoolData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating school ${id}:`, error);
      throw error;
    }
  },

  deleteSchool: async (id) => {
    try {
      const response = await api.delete(API_ENDPOINTS.SCHOOLS.BY_ID(id));
      return response.data;
    } catch (error) {
      console.error(`Error deleting school ${id}:`, error);
      throw error;
    }
  },

  getSchoolById: async (id) => {
    try {
      const response = await api.get(API_ENDPOINTS.SCHOOLS.BY_ID(id));
      return response.data;
    } catch (error) {
      console.error(`Error fetching school ${id}:`, error);
      throw error;
    }
  },

  getSchoolStats: async (id) => {
    try {
      const response = await api.get(API_ENDPOINTS.SCHOOLS.STATS);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stats for school ${id}:`, error);
      throw error;
    }
  },
};

export default schoolService;

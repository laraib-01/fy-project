import { api, API_ENDPOINTS } from "../config/api";

const dashboardService = {
  fetchDashboardStats: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.DASHBOARD.STATS);
      return response;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },
};

export default dashboardService;

import { api, API_ENDPOINTS } from "../config/api";

const dashboardService = {
  fetchDashboardStats: async () => {
    try {
      console.log('Fetching dashboard stats from:', API_ENDPOINTS.DASHBOARD.STATS);
      const response = await api.get(API_ENDPOINTS.DASHBOARD.STATS);
      console.log('Dashboard stats response:', response);
      
      // Ensure upcomingEvents is always an array
      if (response?.data?.upcomingEvents === undefined) {
        console.warn('upcomingEvents is undefined in response, setting to empty array');
        response.data = {
          ...response.data,
          upcomingEvents: []
        };
      }
      
      return response;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Return a default response structure to prevent frontend crashes
      return {
        data: {
          stats: {},
          upcomingEvents: [],
          recentActivities: [],
          classStats: [],
          userGrowth: []
        }
      };
    }
  },
};

export default dashboardService;

import { api, API_ENDPOINTS } from "../config/api";

const eventsService = {
  getEvents: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();

      const response = await api.get(
        `${API_ENDPOINTS.EVENTS.BASE}?${queryString}`
      );

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getEventById: async (id, options = {}) => {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.EVENTS.BASE}/${id}`,
        null,
        { params: options }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching event ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  createEvent: async (eventData) => {
    try {
      const response = await api.post(API_ENDPOINTS.EVENTS.BASE, {
        event_name: eventData.event_name,
        event_date: eventData.event_date,
        event_time: eventData.event_time,
        event_location: eventData.event_location,
        description: eventData.description || "",
      });
      return response.data;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error.response?.data || error.message;
    }
  },

  updateEvent: async (id, updates) => {
    try {
      const allowedFields = [
        "event_name",
        "event_date",
        "event_time",
        "event_location",
        "description",
      ];

      const updateData = {};
      allowedFields.forEach((field) => {
        if (updates[field] !== undefined) {
          updateData[field] = updates[field];
        }
      });

      const response = await api.put(
        `${API_ENDPOINTS.EVENTS.BASE}/${id}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating event ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  deleteEvent: async (id) => {
    try {
      await api.delete(`${API_ENDPOINTS.EVENTS.BASE}/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting event ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  getUpcomingEvents: async (limit = 5) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await api.get(API_ENDPOINTS.EVENTS.BASE, null, {
        params: {
          event_date_gte: today,
          _sort: "event_date,event_time",
          _limit: limit,
        },
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      throw error.response?.data || error.message;
    }
  },

  getEventDashboard: async (eventId) => {
    try {
      const response = await api.get(API_ENDPOINTS.EVENTS.DASHBOARD(eventId));
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching event dashboard for event ${eventId}:`,
        error
      );
      throw error.response?.data || error.message;
    }
  },
};

export default eventsService;

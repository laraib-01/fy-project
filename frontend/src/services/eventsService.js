import { api, API_ENDPOINTS } from "../config/api";

/**
 * Service for handling event-related API calls
 */
const eventsService = {
  /**
   * Get all events
   * @param {Object} params - Query parameters (page, limit, status, from_date, to_date)
   * @returns {Promise<Object>} - Object containing events and pagination info
   */
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

  /**
   * Get a single event by ID
   * @param {string|number} id - Event ID
   * @param {Object} options - Additional options (e.g., include registrations)
   * @returns {Promise<Object>} - Event details
   */
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

  /**
   * Create a new event (Admin only)
   * @param {Object} eventData - Event data
   * @returns {Promise<Object>} - Created event details
   */
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

  /**
   * Update an existing event (Admin only)
   * @param {string|number} id - Event ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated event details
   */
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

  /**
   * Delete an event (Admin only)
   * @param {string|number} id - Event ID
   * @returns {Promise<boolean>} - True if successful
   */
  deleteEvent: async (id) => {
    try {
      await api.delete(`${API_ENDPOINTS.EVENTS.BASE}/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting event ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get upcoming events
   * @param {number} limit - Maximum number of events to return
   * @returns {Promise<Array>} - Array of upcoming events
   */
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

  /**
   * Get event dashboard data
   * @param {string|number} eventId - Event ID
   * @returns {Promise<Object>} - Event dashboard data
   */
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

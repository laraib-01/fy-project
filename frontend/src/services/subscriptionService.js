import { api, API_ENDPOINTS } from "../config/api";

export const subscriptionService = {
  getSubscriptionPlans: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.SUBSCRIPTION_PLANS.BASE);
      return response;
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      throw error;
    }
  },

  getSubscriptionPlan: async (id) => {
    try {
      const response = await api.get(
        API_ENDPOINTS.SUBSCRIPTION_PLANS.BY_ID(id)
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching subscription plan ${id}:`, error);
      throw error;
    }
  },

  createSubscriptionPlan: async (planData) => {
    try {
      const response = await api.post(API_ENDPOINTS.SUBSCRIPTION_PLANS.BASE, {
        plan_name: planData.plan_name,
        monthly_price: parseFloat(planData.monthly_price),
        yearly_price: parseFloat(planData.yearly_price),
        max_teachers: planData.max_teachers
          ? parseInt(planData.max_teachers)
          : null,
        max_parents: planData.max_parents
          ? parseInt(planData.max_parents)
          : null,
        features: Array.isArray(planData.features) ? planData.features : [],
        is_active: planData.is_active !== false, // Default to true if not specified
      });
      return response.data.data;
    } catch (error) {
      console.error("Error creating subscription plan:", error);
      throw error;
    }
  },

  updateSubscriptionPlan: async (id, updates) => {
    try {
      const updateData = {};
      const allowedFields = [
        "plan_name",
        "monthly_price",
        "yearly_price",
        "max_teachers",
        "max_parents",
        "features",
        "is_active",
      ];

      allowedFields.forEach((field) => {
        if (field in updates) {
          if (field.endsWith("_price")) {
            updateData[field] = parseFloat(updates[field]);
          } else if (field.startsWith("max_")) {
            updateData[field] = updates[field]
              ? parseInt(updates[field])
              : null;
          } else {
            updateData[field] = updates[field];
          }
        }
      });

      const response = await api.put(
        API_ENDPOINTS.SUBSCRIPTION_PLANS.BY_ID(id),
        updateData
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error updating subscription plan ${id}:`, error);
      throw error;
    }
  },

  deleteSubscriptionPlan: async (id) => {
    try {
      await api.delete(API_ENDPOINTS.SUBSCRIPTION_PLANS.BY_ID(id));
      return true;
    } catch (error) {
      console.error(`Error deleting subscription plan ${id}:`, error);
      throw error;
    }
  },

  togglePlanStatus: async (id, isActive) => {
    return subscriptionService.updateSubscriptionPlan(id, {
      is_active: isActive,
    });
  },

  // Get all available subscription plans
  getPlans: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.SUBSCRIPTIONS.PLANS);
      return response;
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      throw error;
    }
  },

  // Get current active subscription for the authenticated school
  getCurrentSubscription: async () => {
    try {
      const response = await api.get(
        API_ENDPOINTS.SUBSCRIPTIONS.CURRENT
      );
      return response || null;
    } catch (error) {
      // If no subscription found, return null instead of throwing
      if (error.response?.status === 404) {
        return null;
      }
      console.error("Error fetching current subscription:", error);
      throw error;
    }
  },

  // Create a new subscription
  createSubscription: async (subscriptionData) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.SUBSCRIPTIONS.BASE,
        subscriptionData
      );
      return response;
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }
  },

  // Cancel a subscription
  cancelSubscription: async (subscriptionId) => {
    try {
      const response = await api.delete(
        `${API_ENDPOINTS.SUBSCRIPTIONS.BASE}/${subscriptionId}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      throw error;
    }
  },

  // Get subscription history for the school
  getSubscriptionHistory: async () => {
    try {
      const response = await api.get(
        API_ENDPOINTS.SUBSCRIPTIONS.HISTORY
      );
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching subscription history:", error);
      throw error;
    }
  },

  // Check if subscription is required for the current user
  checkSubscriptionRequired: async () => {
    try {
      const response = await api.get(
        API_ENDPOINTS.SUBSCRIPTIONS.REQUIRED
      );
      return response.data.requiresSubscription || false;
    } catch (error) {
      console.error("Error checking subscription requirement:", error);
      return false; // Default to not requiring subscription on error
    }
  },
};

export default subscriptionService;

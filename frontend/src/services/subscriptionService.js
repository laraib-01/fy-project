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
      const payload = {
        plan_name: planData.plan_name,
        description: planData.description || '',
        monthly_price: parseFloat(planData.monthly_price),
        yearly_price: planData.yearly_price !== undefined ? parseFloat(planData.yearly_price) : 0,
        max_teachers: planData.max_teachers ? parseInt(planData.max_teachers) : null,
        max_parents: planData.max_parents ? parseInt(planData.max_parents) : null,
        features: Array.isArray(planData.features) ? planData.features : [],
        currency: planData.currency || 'USD',
        is_active: planData.is_active !== false, // Default to true if not specified
      };

      const response = await api.post(API_ENDPOINTS.SUBSCRIPTION_PLANS.BASE, payload);
      return response.data;
    } catch (error) {
      console.error("Error creating subscription plan:", error);
      throw error;
    }
  },

  // Alias for createSubscriptionPlan for backward compatibility
  createPlan: async (planData) => {
    return subscriptionService.createSubscriptionPlan(planData);
  },

  updateSubscriptionPlan: async (id, updates) => {
    try {
      // Prepare the update payload with proper type conversion
      const payload = {};
      
      // Handle all possible fields that can be updated
      if ('plan_name' in updates) payload.plan_name = updates.plan_name;
      if ('description' in updates) payload.description = updates.description;
      if ('currency' in updates) payload.currency = updates.currency;
      if ('is_active' in updates) payload.is_active = updates.is_active;
      
      // Handle numeric fields with proper parsing
      if ('monthly_price' in updates) {
        payload.monthly_price = updates.monthly_price !== '' ? 
          parseFloat(updates.monthly_price) : 0;
      }
      
      if ('yearly_price' in updates) {
        payload.yearly_price = updates.yearly_price !== '' ? 
          parseFloat(updates.yearly_price) : 0;
      }
      
      if ('max_teachers' in updates) {
        payload.max_teachers = updates.max_teachers !== '' ? 
          parseInt(updates.max_teachers) : null;
      }
      
      if ('max_parents' in updates) {
        payload.max_parents = updates.max_parents !== '' ? 
          parseInt(updates.max_parents) : null;
      }
      
      // Handle features array
      if ('features' in updates) {
        payload.features = Array.isArray(updates.features) ? 
          updates.features : [];
      }

      const response = await api.put(
        API_ENDPOINTS.SUBSCRIPTION_PLANS.BY_ID(id),
        payload
      );
      
      // Return the full response to access any metadata
      return response.data;
    } catch (error) {
      console.error(`Error updating subscription plan ${id}:`, error);
      throw error;
    }
  },

  togglePlanStatus: async (id, isActive) => {
    try {
      const response = await api.put(
        `${API_ENDPOINTS.SUBSCRIPTION_PLANS.BY_ID(id)}/status`,
        { is_active: isActive }
      );
      return response.data;
    } catch (error) {
      console.error(`Error toggling status for plan ${id}:`, error);
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
      const response = await api.get(API_ENDPOINTS.SUBSCRIPTIONS.CURRENT);
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

  // Create a payment intent for subscription
  createPaymentIntent: async (planName, billingCycle) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.SUBSCRIPTIONS.CREATE_PAYMENT_INTENT,
        {
          plan_name: planName,
          billing_cycle: billingCycle,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating payment intent:", error);
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
      return response.data;
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }
  },

  // Confirm card payment
  confirmCardPayment: async (clientSecret, paymentMethod) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.SUBSCRIPTIONS.CONFIRM_PAYMENT,
        {
          payment_method_id: paymentMethod.id,
          client_secret: clientSecret,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error confirming card payment:", error);
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
      const response = await api.get(API_ENDPOINTS.SUBSCRIPTIONS.HISTORY);
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching subscription history:", error);
      throw error;
    }
  },

  // Check if subscription is required for the current user
  checkSubscriptionRequired: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.SUBSCRIPTIONS.REQUIRED);
      return response.data.requiresSubscription || false;
    } catch (error) {
      console.error("Error checking subscription requirement:", error);
      return false; // Default to not requiring subscription on error
    }
  },
};

export default subscriptionService;

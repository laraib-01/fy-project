// src/api/api.js

// Base API URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${API_BASE_URL}/login`,
    REGISTER: `${API_BASE_URL}/register`,
    LOGOUT: `${API_BASE_URL}/logout`,
    REFRESH_TOKEN: `${API_BASE_URL}/refresh-token`,
    FORGOT_PASSWORD: `${API_BASE_URL}/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/reset-password`,
    ME: `${API_BASE_URL}/me`,
  },

  // Users
  USERS: {
    PROFILE: `${API_BASE_URL}/users/me`,
    UPDATE_PROFILE: `${API_BASE_URL}/users/update-me`,
    UPDATE_PASSWORD: `${API_BASE_URL}/users/update-password`,
    UPLOAD_PHOTO: `${API_BASE_URL}/users/upload-photo`,
    UPDATE_PREFERENCES: `${API_BASE_URL}/users/update-preferences`,
    DELETE_ACCOUNT: `${API_BASE_URL}/users/delete-me`,
  },

  // Events
  EVENTS: {
    BASE: `${API_BASE_URL}/events`,
    BY_ID: (id) => `${API_BASE_URL}/events/${id}`,
  },

  // Classes
  CLASSES: {
    BASE: `${API_BASE_URL}/classes`,
  },

  // Schools
  SCHOOLS: {
    BASE: `${API_BASE_URL}/schools`,
    STATS: `${API_BASE_URL}/schools/stats`,
  },

  // Subscription Plans
  SUBSCRIPTION_PLANS: {
    BASE: `${API_BASE_URL}/subscription-plans`,
    BY_ID: (id) => `${API_BASE_URL}/subscription-plans/${id}`,
  },

  // Transactions
  TRANSACTIONS: {
    BASE: `${API_BASE_URL}/transactions`,
    BY_ID: (id) => `${API_BASE_URL}/transactions/${id}`,
    SCHOOL: (schoolId) => `${API_BASE_URL}/transactions/school/${schoolId}`,
    STATUS: (id) => `${API_BASE_URL}/transactions/${id}/status`,
    SUMMARY: `${API_BASE_URL}/transactions/summary`
  },

  // Students
  STUDENTS: {
    BASE: `${API_BASE_URL}/students`,
    DASHBOARD: (id) => `${API_BASE_URL}/students/${id}/dashboard`,
  },
};

// Default headers
export const getDefaultHeaders = (token = null) => {
  const finalToken = token || localStorage.getItem("educonnect_token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (finalToken) {
    headers["Authorization"] = `Bearer ${finalToken}`;
  }

  return headers;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(
      data?.message || response.statusText || "Request failed"
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const api = {
  get: async (url, token = null) => {
    const response = await fetch(url, {
      method: "GET",
      headers: getDefaultHeaders(token),
    });
    return handleResponse(response);
  },

  post: async (url, data, token = null) => {
    const response = await fetch(url, {
      method: "POST",
      headers: getDefaultHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  put: async (url, data, token = null) => {
    const response = await fetch(url, {
      method: "PUT",
      headers: getDefaultHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  patch: async (url, data, token = null) => {
    const response = await fetch(url, {
      method: "PATCH",
      headers: getDefaultHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (url, token = null) => {
    const response = await fetch(url, {
      method: "DELETE",
      headers: getDefaultHeaders(token),
    });
    return handleResponse(response);
  },

  upload: async (url, file, token = null) => {
    const formData = new FormData();
    formData.append("file", file);

    const finalToken = token || localStorage.getItem("educonnect_token");

    const headers = finalToken ? { Authorization: `Bearer ${finalToken}` } : {};

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    return handleResponse(response);
  },
};

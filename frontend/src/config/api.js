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
    VALIDATE_TOKEN: `${API_BASE_URL}/validate-reset-token`,
    ME: `${API_BASE_URL}/me`,
  },

  // Dashboard
  DASHBOARD: {
    STATS: `${API_BASE_URL}/dashboard/stats`,
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

  // Admins
  ADMINS: {
    BASE: `${API_BASE_URL}/admins`,
    BY_ID: (id) => `${API_BASE_URL}/admins/${id}`,
  },

  // Events
  EVENTS: {
    BASE: `${API_BASE_URL}/events`,
    BY_ID: (id) => `${API_BASE_URL}/events/${id}`,
  },

  // Teachers
  TEACHERS: {
    BASE: `${API_BASE_URL}/teachers`,
    BY_ID: (id) => `${API_BASE_URL}/teachers/${id}`,
    CLASSES: `${API_BASE_URL}/teachers-classes`,
    
  },

  // Classes
  CLASSES: {
    BASE: `${API_BASE_URL}/classes`,
    BY_ID: (id) => `${API_BASE_URL}/classes/${id}`,
    ALL: `${API_BASE_URL}/classes/all`,
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

  // Subscriptions
  SUBSCRIPTIONS: {
    BASE: `${API_BASE_URL}/subscriptions`,
    PLANS: `${API_BASE_URL}/subscriptions/plans`,
    CURRENT: `${API_BASE_URL}/subscriptions/current`,
    HISTORY: `${API_BASE_URL}/subscriptions/history`,
    REQUIRED: `${API_BASE_URL}/subscriptions/required`,
    CREATE_PAYMENT_INTENT: `${API_BASE_URL}/subscriptions/create-payment-intent`,
  },

  // Transactions
  TRANSACTIONS: {
    BASE: `${API_BASE_URL}/transactions`,
    BY_ID: (id) => `${API_BASE_URL}/transactions/${id}`,
    SCHOOL: (schoolId) => `${API_BASE_URL}/transactions/school/${schoolId}`,
    STATUS: (id) => `${API_BASE_URL}/transactions/${id}/status`,
    SUMMARY: `${API_BASE_URL}/transactions/summary`,
  },

  // Students
  STUDENTS: {
    BASE: `${API_BASE_URL}/students`,
    BY_ID: (id) => `${API_BASE_URL}/students/${id}`,
    BY_CLASS: (classId) => `${API_BASE_URL}/students/class/${classId}`,
    ATTENDANCE: (classId, date) =>
      `${API_BASE_URL}/${classId}/attendance/${date}`,
    SUBMIT_ATTENDANCE: (classId) => `${API_BASE_URL}/${classId}/attendance`,
    ATTENDANCE_RANGE: (classId, startDate, endDate) =>
      `${API_BASE_URL}/${classId}/attendance/range?startDate=${startDate}&endDate=${endDate}`,
    ATTENDANCE_SUMMARY: (classId, startDate, endDate) =>
      `${API_BASE_URL}/${classId}/attendance/summary?startDate=${startDate}&endDate=${endDate}`,
  },

  // Assignments
  ASSIGNMENTS: {
    BASE: `${API_BASE_URL}/assignments`,
    BY_ID: (id) => `${API_BASE_URL}/assignments/${id}`,
    SUBMIT_ASSIGNMENT: (assignmentId) =>
      `${API_BASE_URL}/assignments/${assignmentId}/submissions`,
    SUBMISSIONS: (assignmentId) =>
      `${API_BASE_URL}/assignments/${assignmentId}/submissions`,
    SUBMISSION_SUMMARY: (classId, startDate, endDate) =>
      `${API_BASE_URL}/assignments/summary?classId=${classId}&startDate=${startDate}&endDate=${endDate}`,
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

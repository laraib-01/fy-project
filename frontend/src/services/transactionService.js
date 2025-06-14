import { api, API_ENDPOINTS } from "../config/api";

/**
 * Get all transactions (Admin only)
 * @param {Object} filters - Optional filters for transactions
 * @returns {Promise<Array>} - Array of transactions
 */
export const getTransactions = async (filters = {}) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.TRANSACTIONS.BASE}?${new URLSearchParams(filters)}`);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error.response?.data?.message || "Failed to fetch transactions";
  }
};

/**
 * Get transactions for a specific school
 * @param {string|number} schoolId - ID of the school
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} - Array of transactions for the school
 */
export const getSchoolTransactions = async (schoolId, filters = {}) => {
  try {
    const response = await api.get(
      API_ENDPOINTS.TRANSACTIONS.SCHOOL(schoolId),
      {
        params: filters,
      }
    );
    return response.data.data || [];
  } catch (error) {
    console.error(`Error fetching transactions for school ${schoolId}:`, error);
    throw (
      error.response?.data?.message || "Failed to fetch school transactions"
    );
  }
};

/**
 * Get transaction details by ID
 * @param {string} transactionId - ID of the transaction
 * @returns {Promise<Object>} - Transaction details
 */
export const getTransactionDetails = async (transactionId) => {
  try {
    const response = await api.get(
      API_ENDPOINTS.TRANSACTIONS.BY_ID(transactionId)
    );
    return response.data.data || null;
  } catch (error) {
    console.error(`Error fetching transaction ${transactionId}:`, error);
    throw (
      error.response?.data?.message || "Failed to fetch transaction details"
    );
  }
};

/**
 * Create a new transaction (Admin only)
 * @param {Object} transactionData - Transaction data
 * @returns {Promise<Object>} - Created transaction
 */
export const createTransaction = async (transactionData) => {
  try {
    const response = await api.post(
      API_ENDPOINTS.TRANSACTIONS.BASE,
      transactionData
    );
    return response.data.data || null;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error.response?.data?.message || "Failed to create transaction";
  }
};

/**
 * Update transaction status (Admin only)
 * @param {string} transactionId - ID of the transaction to update
 * @param {Object} statusData - New status data
 * @returns {Promise<Object>} - Updated transaction
 */
export const updateTransactionStatus = async (transactionId, statusData) => {
  try {
    const response = await api.put(
      API_ENDPOINTS.TRANSACTIONS.STATUS(transactionId),
      statusData
    );
    return response.data.data || null;
  } catch (error) {
    console.error(`Error updating transaction ${transactionId} status:`, error);
    throw (
      error.response?.data?.message || "Failed to update transaction status"
    );
  }
};

/**
 * Get transaction summary (Admin only)
 * @returns {Promise<Object>} Transaction summary data
 */
export const getTransactionSummary = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.TRANSACTIONS.SUMMARY);
    return response.data.data || {};
  } catch (error) {
    console.error("Error fetching transaction summary:", error);
    throw (
      error.response?.data?.message || "Failed to fetch transaction summary"
    );
  }
};

/**
 * Export transactions to CSV (Admin only)
 * @param {Object} filters - Filters to apply to the export
 * @returns {Promise<Blob>} CSV file as blob
 */
export const exportTransactionsToCSV = async (filters = {}) => {
  try {
    const response = await api.get(
      API_ENDPOINTS.TRANSACTIONS.BASE + "/export",
      {
        params: filters,
        responseType: "blob",
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error exporting transactions:", error);
    throw error.response?.data?.message || "Failed to export transactions";
  }
};

/**
 * Get transaction statistics (Admin only)
 * @param {string} period - Time period for statistics (day, week, month, year)
 * @returns {Promise<Object>} Transaction statistics
 */
export const getTransactionStats = async (period = "month") => {
  try {
    const response = await api.get(API_ENDPOINTS.TRANSACTIONS.BASE + "/stats", {
      params: { period },
    });
    return response.data.data || {};
  } catch (error) {
    console.error("Error fetching transaction stats:", error);
    throw (
      error.response?.data?.message || "Failed to fetch transaction statistics"
    );
  }
};

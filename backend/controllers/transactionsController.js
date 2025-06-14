import db from "../config/db.js";

// Error handler
const handleError = (res, status = 500, message = 'An error occurred') => {
  console.error(message);
  return res.status(status).json({ 
    status: 'error', 
    message 
  });
};

/**
 * Create a new transaction (Admin only)
 */
export const createTransaction = async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { 
      school_id, 
      subscription_plan_id, 
      amount, 
      currency = 'USD', 
      payment_method, 
      payment_gateway, 
      gateway_transaction_id, 
      status = 'pending', 
      description, 
      invoice_number, 
      billing_cycle, 
      metadata = null 
    } = req.body;

    // Authorization check - only EduConnect_Admin can create transactions
    if (role !== 'EduConnect_Admin') {
      return handleError(res, 403, 'You are not authorized to create transactions');
    }

    // Input validation
    const requiredFields = { school_id, amount, payment_method };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => value === undefined || value === null || value === '')
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return handleError(res, 400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Generate a transaction ID if not provided
    const transaction_id = gateway_transaction_id || `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Call the stored procedure
    const [result] = await db.query(
      'CALL Create_Transaction(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        transaction_id,
        school_id,
        subscription_plan_id || null,
        amount,
        currency,
        payment_method,
        payment_gateway || null,
        status,
        description || null,
        invoice_number || null,
        billing_cycle || null,
        metadata ? JSON.stringify(metadata) : null
      ]
    );

    // Return the transaction ID
    return res.status(201).json({
      status: 'success',
      data: {
        transaction_id: result[0][0].transaction_id
      }
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return handleError(res, 500, 'Failed to create transaction');
  }
};

/**
 * Get all transactions (Admin only)
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - status: Filter by status (e.g., 'completed', 'pending', 'failed')
 * - payment_method: Filter by payment method
 * - start_date: Filter by start date (YYYY-MM-DD)
 * - end_date: Filter by end date (YYYY-MM-DD)
 * - sort: Sort field (default: 'created_at')
 * - order: Sort order ('asc' or 'desc', default: 'desc')
 */
export const getAllTransactions = async (req, res) => {
  try {
    const { role } = req.user;
    const {
      page = 1,
      limit = 10,
      status,
      payment_method,
      start_date,
      end_date,
      sort = 'created_at',
      order = 'desc'
    } = req.query;

    // Only allow EduConnect_Admin to view all transactions
    if (role !== 'EduConnect_Admin') {
      return handleError(res, 403, 'You are not authorized to view all transactions');
    }

    // Validate sort order
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    // Validate sort field to prevent SQL injection
    const validSortFields = ['transaction_id', 'amount', 'status', 'payment_method', 'created_at', 'updated_at'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';

    // Calculate offset for pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build WHERE clause based on filters
    const whereConditions = [];
    const queryParams = [];

    if (status) {
      whereConditions.push('status = ?');
      queryParams.push(status);
    }

    if (payment_method) {
      whereConditions.push('payment_method = ?');
      queryParams.push(payment_method);
    }

    if (start_date) {
      whereConditions.push('DATE(created_at) >= ?');
      queryParams.push(start_date);
    }

    if (end_date) {
      whereConditions.push('DATE(created_at) <= ?');
      queryParams.push(end_date);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Get total count for pagination
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM View_Active_Transactions ${whereClause}`,
      queryParams
    );
    const total = countResult[0].total;

    // Add pagination to query
    queryParams.push(parseInt(limit), offset);
    
    // Get paginated results
    const [transactions] = await db.query(
      `SELECT * FROM View_Active_Transactions 
       ${whereClause}
       ORDER BY ${sortField} ${sortOrder}
       LIMIT ? OFFSET ?`,
      queryParams
    );

    return res.status(200).json({
      status: 'success',
      data: {
        transactions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return handleError(res, 500, 'Failed to fetch transactions');
  }
};

/**
 * Get transactions for a specific school
 */
export const getSchoolTransactions = async (req, res) => {
  try {
    const { role } = req.user;
    const { schoolId } = req.params;

    // Call the stored procedure with user ID and school ID
    const [results] = await db.query(
      'CALL Get_Transactions_For_School(?, ?)',
      [userId, schoolId]
    );

    return res.status(200).json({
      status: 'success',
      data: results[0]
    });
  } catch (error) {
    console.error('Error fetching school transactions:', error);
    if (error.message.includes('permission')) {
      return handleError(res, 403, 'You do not have permission to view these transactions');
    }
    return handleError(res, 500, 'Failed to fetch school transactions');
  }
};

/**
 * Get transaction details by ID
 */
export const getTransactionDetails = async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { id } = req.params;

    // Call the stored procedure
    const [results] = await db.query(
      'CALL Get_Transaction_Details(?, ?)',
      [userId, id]
    );

    if (!results[0] || results[0].length === 0) {
      return handleError(res, 404, 'Transaction not found');
    }

    return res.status(200).json({
      status: 'success',
      data: results[0][0]
    });
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    if (error.message.includes('permission')) {
      return handleError(res, 403, 'You do not have permission to view this transaction');
    }
    return handleError(res, 500, 'Failed to fetch transaction details');
  }
};

/**
 * Update transaction status (Admin only)
 */
export const updateTransactionStatus = async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { id } = req.params;
    const { status, metadata } = req.body;

    // Only allow EduConnect_Admin to update transaction status
    if (role !== 'EduConnect_Admin') {
      return handleError(res, 403, 'You are not authorized to update transaction status');
    }

    // Input validation
    if (!status) {
      return handleError(res, 400, 'Status is required');
    }

    // Call the stored procedure
    await db.query(
      'CALL Update_Transaction_Status(?, ?, ?, ?)',
      [userId, id, status, metadata ? JSON.stringify(metadata) : null]
    );

    return res.status(200).json({
      status: 'success',
      message: 'Transaction status updated successfully'
    });
  } catch (error) {
    console.error('Error updating transaction status:', error);
    if (error.message.includes('not found')) {
      return handleError(res, 404, 'Transaction not found');
    }
    return handleError(res, 500, 'Failed to update transaction status');
  }
};

/**
 * Get transaction summary (Admin only)
 */
export const getTransactionSummary = async (req, res) => {
  try {
    const { role, userId } = req.user;

    // Only allow EduConnect_Admin to view transaction summary
    if (role !== 'EduConnect_Admin') {
      return handleError(res, 403, 'You are not authorized to view transaction summary');
    }

    // Call the stored procedure
    const [results] = await db.query(
      'CALL Get_Transaction_Summary(?)',
      [userId]
    );

    // The stored procedure returns multiple result sets
    const [summary, revenueByPlan, recentTransactions] = results;

    return res.status(200).json({
      status: 'success',
      data: {
        summary: summary[0] || {},
        revenueByPlan: revenueByPlan || [],
        recentTransactions: recentTransactions || []
      }
    });
  } catch (error) {
    console.error('Error fetching transaction summary:', error);
    return handleError(res, 500, 'Failed to fetch transaction summary');
  }
};

/**
 * Export transactions to CSV (Admin only)
 */
export const exportTransactionsToCSV = async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { start_date, end_date, status, school_id } = req.query;

    // Only allow EduConnect_Admin to export transactions
    if (role !== 'EduConnect_Admin') {
      return handleError(res, 403, 'You are not authorized to export transactions');
    }

    // Build query parameters
    const queryParams = [userId];
    let whereClause = 'WHERE t.is_active = 1';
    
    if (start_date && end_date) {
      whereClause += ' AND t.created_at BETWEEN ? AND ?';
      queryParams.push(start_date, end_date);
    }
    
    if (status) {
      whereClause += ' AND t.status = ?';
      queryParams.push(status);
    }
    
    if (school_id) {
      whereClause += ' AND t.school_id = ?';
      queryParams.push(school_id);
    }

    // Query to get transactions with related data
    const [transactions] = await db.query(
      `SELECT 
        t.transaction_id,
        t.amount,
        t.currency,
        t.status,
        t.payment_method,
        t.created_at,
        s.school_name,
        sp.name as plan_name
      FROM Transactions t
      LEFT JOIN Schools s ON t.school_id = s.school_id
      LEFT JOIN Subscription_Plans sp ON t.subscription_plan_id = sp.plan_id
      ${whereClause}
      ORDER BY t.created_at DESC`,
      queryParams
    );

    if (!transactions || transactions.length === 0) {
      return handleError(res, 404, 'No transactions found for the given criteria');
    }

    // Convert to CSV
    const headers = [
      'Transaction ID',
      'Amount',
      'Currency',
      'Status',
      'Payment Method',
      'Date',
      'School',
      'Plan'
    ];

    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const tx of transactions) {
      const row = [
        `"${tx.transaction_id}"`,
        tx.amount,
        tx.currency,
        tx.status,
        tx.payment_method,
        new Date(tx.created_at).toISOString(),
        `"${tx.school_name || ''}"`,
        `"${tx.plan_name || ''}"`
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');
    const filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Send the CSV file
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting transactions:', error);
    return handleError(res, 500, 'Failed to export transactions');
  }
};

/**
 * Get transaction statistics (Admin only)
 */
export const getTransactionStats = async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { period = 'month' } = req.query;

    // Only allow EduConnect_Admin to view transaction stats
    if (role !== 'EduConnect_Admin') {
      return handleError(res, 403, 'You are not authorized to view transaction statistics');
    }

    // Validate period parameter
    const validPeriods = ['day', 'week', 'month', 'year'];
    if (!validPeriods.includes(period)) {
      return handleError(res, 400, 'Invalid period. Must be one of: day, week, month, year');
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Format dates for SQL
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    // Get transaction statistics
    const [stats] = await db.query(
      `SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_transactions,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_transactions,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_transactions,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount
      FROM Transactions
      WHERE created_at >= ? AND is_active = 1`,
      [formatDate(startDate)]
    );

    // Get transactions by status
    const [byStatus] = await db.query(
      `SELECT 
        status,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM Transactions
      WHERE created_at >= ? AND is_active = 1
      GROUP BY status`,
      [formatDate(startDate)]
    );

    // Get transactions by payment method
    const [byPaymentMethod] = await db.query(
      `SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM Transactions
      WHERE created_at >= ? AND is_active = 1
      GROUP BY payment_method`,
      [formatDate(startDate)]
    );

    // Get monthly revenue for the period
    const [monthlyRevenue] = await db.query(
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount
      FROM Transactions
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH) AND is_active = 1
      GROUP BY month
      ORDER BY month`
    );

    return res.status(200).json({
      status: 'success',
      data: {
        period: {
          start: formatDate(startDate),
          end: formatDate(now)
        },
        summary: stats[0] || {},
        by_status: byStatus || [],
        by_payment_method: byPaymentMethod || [],
        monthly_revenue: monthlyRevenue || []
      }
    });
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    return handleError(res, 500, 'Failed to fetch transaction statistics');
  }
};

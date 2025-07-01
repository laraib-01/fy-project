import db from "../config/db.js";

// Get all available subscription plans
export const getPlans = async (req, res) => {
  try {
    const [plans] = await db.query(
      "SELECT * FROM Subscription_Plans WHERE is_active = TRUE ORDER BY yearly_price ASC"
    );
    
    return res.status(200).json({
      status: "success",
      data: plans,
    });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch subscription plans",
    });
  }
};

// Get current subscription for a school
export const getCurrentSubscription = async (req, res) => {
  try {
    if (!req.user.school_id) {
      return res.status(400).json({
        status: "error",
        message: "School ID is required",
      });
    }

    const [subscriptions] = await db.query(
      `SELECT s.*, p.plan_name, p.monthly_price, p.yearly_price, p.features 
       FROM Subscriptions s
       JOIN Subscription_Plans p ON s.plan_type = p.plan_name
       WHERE s.school_id = ? 
       AND s.status = 'Active' 
       AND s.end_date >= CURDATE()
       ORDER BY s.end_date DESC 
       LIMIT 1`,
      [req.user.school_id]
    );

    if (subscriptions.length === 0) {
      return res.status(200).json({
        status: "success",
        data: null,
        message: "No active subscription found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: subscriptions[0],
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch subscription details",
    });
  }
};

// Create a new subscription
export const createSubscription = async (req, res) => {
  const { plan_name, billing_cycle, payment_method_nonce } = req.body;
  
  try {
    if (!plan_name || !billing_cycle || !payment_method_nonce) {
      return res.status(400).json({
        status: "error",
        message: "Plan name, billing cycle, and payment method are required",
      });
    }

    if (!req.user.school_id) {
      return res.status(400).json({
        status: "error",
        message: "School ID is required",
      });
    }

    // In a real app, you would process the payment here
    // For now, we'll simulate a successful payment
    const transaction_id = `TRANS-${Math.random().toString(36).substr(2, 9)}`;
    
    // Get plan details
    const [plans] = await db.query(
      "SELECT * FROM Subscription_Plans WHERE plan_name = ?",
      [plan_name]
    );

    if (plans.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Plan not found",
      });
    }

    const plan = plans[0];
    const today = new Date();
    const endDate = new Date();
    
    if (billing_cycle === 'yearly') {
      endDate.setFullYear(today.getFullYear() + 1);
    } else {
      endDate.setMonth(today.getMonth() + 1);
    }

    const [result] = await db.query(
      `INSERT INTO Subscriptions 
       (school_id, plan_type, start_date, end_date, status, payment_status, transaction_id)
       VALUES (?, ?, ?, ?, 'Active', 'Paid', ?)`,
      [
        req.user.school_id,
        plan.plan_name,
        today,
        endDate,
        transaction_id,
      ]
    );

    // Get the created subscription
    const [subscriptions] = await db.query(
      `SELECT s.*, p.monthly_price, p.yearly_price, p.features 
       FROM Subscriptions s
       JOIN Subscription_Plans p ON s.plan_type = p.plan_name
       WHERE s.subscription_id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      status: "success",
      message: "Subscription created successfully",
      data: subscriptions[0],
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to create subscription",
    });
  }
};

// Cancel a subscription
export const cancelSubscription = async (req, res) => {
  try {
    const { subscription_id } = req.params;

    if (!subscription_id) {
      return res.status(400).json({
        status: "error",
        message: "Subscription ID is required",
      });
    }

    // Verify the subscription belongs to the user's school
    const [subscriptions] = await db.query(
      "SELECT * FROM Subscriptions WHERE subscription_id = ? AND school_id = ?",
      [subscription_id, req.user.school_id]
    );

    if (subscriptions.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Subscription not found or access denied",
      });
    }

    // Update subscription status to cancelled
    await db.query(
      "UPDATE Subscriptions SET status = 'Cancelled', end_date = CURDATE() WHERE subscription_id = ?",
      [subscription_id]
    );

    return res.status(200).json({
      status: "success",
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to cancel subscription",
    });
  }
};

// Get subscription history for a school
export const getSubscriptionHistory = async (req, res) => {
  try {
    if (!req.user.school_id) {
      return res.status(400).json({
        status: "error",
        message: "School ID is required",
      });
    }

    const [subscriptions] = await db.query(
      `SELECT s.*, p.monthly_price, p.yearly_price, p.features 
       FROM Subscriptions s
       JOIN Subscription_Plans p ON s.plan_type = p.plan_name
       WHERE s.school_id = ? 
       ORDER BY s.start_date DESC`,
      [req.user.school_id]
    );

    return res.status(200).json({
      status: "success",
      data: subscriptions,
    });
  } catch (error) {
    console.error("Error fetching subscription history:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch subscription history",
    });
  }
};
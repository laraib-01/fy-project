import db from "../config/db.js";
import {
  createCustomer,
  createStripeSubscription,
  getSubscription,
  createStripePaymentIntent,
} from "../services/stripeService.js";

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
  const { plan_name, billing_cycle, payment_method_id } = req.body;

  try {
    if (!plan_name || !billing_cycle || !payment_method_id) {
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

    // Get school and user details
    const [school] = await db.query(
      "SELECT * FROM Schools WHERE school_id = ?",
      [req.user.school_id]
    );

    if (!school || school.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "School not found",
      });
    }

    // Get plan details
    const [plans] = await db.query(
      "SELECT * FROM Subscription_Plans WHERE plan_name = ? AND is_active = TRUE",
      [plan_name]
    );

    if (plans.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Plan not found or inactive",
      });
    }

    const plan = plans[0];
    const priceId =
      billing_cycle === "yearly"
        ? plan.stripe_yearly_price_id
        : plan.stripe_monthly_price_id;
    const priceAmount =
      billing_cycle === "yearly" ? plan.yearly_price : plan.monthly_price;

    // Create or get Stripe customer
    let customerId = school[0].stripe_customer_id;
    if (!customerId) {
      const customer = await createCustomer(
        {
          ...req.user,
          school_name: school[0].school_name,
          school_id: school[0].school_id,
        },
        payment_method_id
      );
      customerId = customer.id;
    }

    // Create subscription in Stripe with initial pending status
    const subscription = await createStripeSubscription(customerId, priceId, {
      plan_name,
      billing_cycle,
      school_id: req.user.school_id,
      user_id: req.user.id,
      plan_id: plan.plan_id,
      price_amount: priceAmount,
      currency: plan.currency || "USD",
    });

    // Determine subscription status based on payment status
    const paymentStatus =
      subscription.status === "active" && subscription.latest_invoice?.status === "paid"
        ? "succeeded"
        : subscription.status === "payment_failed"
        ? "failed"
        : subscription.status === "incomplete"
        ? "pending"
        : "pending";
    const subscriptionStatus =
      paymentStatus === "succeeded" ? "Active" : "Pending";

    // Calculate subscription dates
    const today = new Date();
    const endDate = new Date(today);

    if (billing_cycle === "yearly") {
      endDate.setFullYear(today.getFullYear() + 1);
    } else {
      endDate.setMonth(today.getMonth() + 1);
    }

    // Save subscription to database with dynamic statuses
    const [result] = await db.query(
      `INSERT INTO Subscriptions 
       (school_id, plan_type, plan_id, billing_cycle, start_date, end_date, 
        status, payment_status, transaction_id, stripe_subscription_id, 
        payment_method_id, amount, currency, stripe_payment_intent_id, 
        stripe_invoice_id, last_payment_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.school_id,
        plan_name,
        plan.plan_id,
        billing_cycle,
        today,
        endDate,
        subscriptionStatus, // Dynamic status based on payment
        paymentStatus, // Payment status from Stripe
        subscription.latest_invoice?.payment_intent?.id ||
          `stripe_${subscription.id}`,
        subscription.id, // Stripe subscription ID
        payment_method_id,
        priceAmount,
        plan.currency || "USD",
        subscription.latest_invoice?.payment_intent?.id, // Store payment intent ID
        subscription.latest_invoice?.id, // Store invoice ID
        subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null,
        null, // last_payment_error (added as the 16th parameter)
      ]
    );

    // If payment failed, update the status accordingly
    if (
      subscription.status === "incomplete" ||
      subscription.status === "past_due"
    ) {
      await db.query(
        `UPDATE Subscriptions 
         SET status = 'Pending', 
             payment_status = 'failed',
             failure_reason = ?
         WHERE subscription_id = ?`,
        [
          subscription.latest_invoice?.payment_intent?.last_payment_error
            ?.message || "Payment failed",
          result.insertId,
        ]
      );
    }

    // Update school's subscription status
    await db.query(
      "UPDATE Schools SET has_active_subscription = TRUE, stripe_customer_id = ? WHERE school_id = ?",
      [customerId, req.user.school_id]
    );

    // Get the full subscription details to return
    const [subscriptions] = await db.query(
      `SELECT s.*, p.monthly_price, p.yearly_price, p.features 
       FROM Subscriptions s
       JOIN Subscription_Plans p ON s.plan_type = p.plan_name
       WHERE s.subscription_id = ?`,
      [result.insertId]
    );

    const subscriptionData = {
      ...subscriptions[0],
      features: JSON.parse(subscriptions[0].features || "[]"),
    };

    return res.status(201).json({
      status: "success",
      message: "Subscription created successfully",
      data: subscriptionData,
      subscription: subscription,
    });
  } catch (error) {
    // No need to rollback as we're not using transactions with the db pool directly
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

// Create a payment intent for subscription
export const createPaymentIntent = async (req, res) => {
  const { plan_name, billing_cycle } = req.body;

  try {
    if (!plan_name || !billing_cycle) {
      return res.status(400).json({
        status: "error",
        message: "Plan name and billing cycle are required",
      });
    }

    // Get plan details to verify it exists
    const [plans] = await db.query(
      "SELECT * FROM Subscription_Plans WHERE plan_name = ? AND is_active = TRUE",
      [plan_name]
    );

    if (plans.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Plan not found or inactive",
      });
    }

    const plan = plans[0];
    const amount =
      billing_cycle === "yearly"
        ? plan.yearly_price * 100
        : plan.monthly_price * 100; // Convert to cents
    const currency = "usd";

    // Get or create customer
    let customerId = req.user.school_id
      ? await getCustomerIdForSchool(req.user.school_id)
      : null;

    // Create payment intent
    const paymentIntent = await createStripePaymentIntent({
      amount,
      currency,
      customer: customerId,
      metadata: {
        plan_name,
        billing_cycle,
        school_id: req.user.school_id || "unknown",
        user_id: req.user.id || "unknown",
      },
    });

    return res.status(200).json({
      status: "success",
      data: {
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        id: paymentIntent.id,
      },
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to create payment intent",
    });
  }
};

// Helper function to get or create customer ID for a school
async function getCustomerIdForSchool(schoolId) {
  try {
    const [school] = await db.query(
      "SELECT stripe_customer_id FROM Schools WHERE school_id = ?",
      [schoolId]
    );

    return school.length > 0 ? school[0].stripe_customer_id : null;
  } catch (error) {
    console.error("Error getting customer ID for school:", error);
    return null;
  }
}

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

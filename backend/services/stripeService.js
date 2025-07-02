import Stripe from "stripe";
import db from "../config/db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  typescript: false, // Add this line to suppress TypeScript warning if needed
});

// Defaults
const DEFAULT_CURRENCY = "usd";
const DEFAULT_INTERVAL = "month";

// Safe logger
const logError = (msg, err) => {
  console.error(msg, {
    message: err?.message,
    type: err?.type,
    code: err?.code,
  });
};

// Create a Stripe customer and link to a school
export const createCustomer = async (user, paymentMethodId) => {
  try {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.school_name || `${user.first_name} ${user.last_name}`,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
      metadata: {
        userId: user.id,
        schoolId: user.school_id,
      },
    });

    if (!user.school_id) throw new Error("Missing school_id on user");

    await db.query(
      "UPDATE Schools SET stripe_customer_id = ? WHERE school_id = ?",
      [customer.id, user.school_id]
    );

    return customer;
  } catch (error) {
    logError("Error creating Stripe customer:", error);
    throw new Error("Failed to create customer in payment system");
  }
};

// Create subscription
export const createStripeSubscription = async (
  customerId,
  priceId,
  metadata = {}
) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata,
    });

    return {
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      status: subscription.status,
    };
  } catch (error) {
    logError("Error creating subscription:", error);
    throw new Error("Failed to create subscription");
  }
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId) => {
  try {
    return await stripe.subscriptions.cancel(subscriptionId);
  } catch (error) {
    logError("Error canceling subscription:", error);
    throw new Error("Failed to cancel subscription");
  }
};

// Get subscription
export const getSubscription = async (subscriptionId) => {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["customer", "latest_invoice.payment_intent"],
    });
  } catch (error) {
    logError("Error getting subscription:", error);
    throw new Error("Failed to get subscription details");
  }
};

// Handle webhook
export const handleWebhook = async (payload, signature, webhookSecret) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
    return { event };
  } catch (error) {
    logError("Error verifying webhook signature:", error);
    throw new Error("Webhook signature verification failed");
  }
};

// Update Stripe product
export const updateStripeProduct = async (productId, updates) => {
  try {
    if (!stripe) throw new Error("Stripe not initialized");

    // Archive prices if deactivating product
    if (updates.active === false) {
      const prices = await stripe.prices.list({
        product: productId,
        active: true,
        limit: 100,
      });
      await Promise.all(
        prices.data.map((price) =>
          stripe.prices
            .update(price.id, { active: false })
            .catch((err) =>
              logError(`Failed to archive price ${price.id}`, err)
            )
        )
      );
    }

    // Reactivate price if activating product
    if (updates.active === true) {
      const prices = await stripe.prices.list({
        product: productId,
        active: false,
        limit: 1,
      });
      if (prices.data.length > 0) {
        await stripe.prices.update(prices.data[0].id, { active: true });
      }
    }

    // Filter undefined fields
    const updateData = { ...updates };
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    return await stripe.products.update(productId, updateData);
  } catch (error) {
    logError("Error updating product:", error);
    throw error;
  }
};

// Create new price for existing product
export const createPriceForProduct = async ({
  productId,
  unitAmount,
  currency = DEFAULT_CURRENCY,
  interval = DEFAULT_INTERVAL,
  metadata = {},
}) => {
  try {
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: unitAmount,
      currency: currency.toLowerCase(),
      recurring: { interval },
      metadata,
    });

    return price;
  } catch (error) {
    logError("Error creating price:", error);
    throw new Error("Failed to create price in Stripe");
  }
};

// Archive price
export const archiveStripePrice = async (priceId) => {
  try {
    await stripe.prices.update(priceId, { active: false });
    return true;
  } catch (error) {
    logError(`Error archiving price ${priceId}:`, error);
    throw new Error("Failed to archive price in Stripe");
  }
};

// Create new product and price
export const createStripeProductAndPrice = async ({
  name,
  description = "",
  unitAmount,
  currency = DEFAULT_CURRENCY,
  interval = DEFAULT_INTERVAL,
  metadata = {},
}) => {
  try {
    // Create product in Stripe
    const product = await stripe.products.create({
      name,
      description,
      metadata,
    });

    const price = await createPriceForProduct({
      productId: product.id,
      unitAmount,
      currency,
      interval,
      metadata,
    });

    return {
      productId: product.id,
      priceId: price.id,
      ...price,
    };
  } catch (error) {
    logError("Error creating product/price:", error);
    throw new Error("Failed to create product/price in Stripe");
  }
};

// Create payment intent
export const createStripePaymentIntent = async ({
  amount,
  currency = DEFAULT_CURRENCY,
  customer,
  metadata = {},
}) => {
  try {
    const params = {
      amount,
      currency,
      metadata,
      payment_method_types: ["card"],
      setup_future_usage: customer ? "off_session" : undefined,
    };

    if (customer) params.customer = customer;

    const paymentIntent = await stripe.paymentIntents.create(params);

    return {
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      created: paymentIntent.created,
      metadata: paymentIntent.metadata,
    };
  } catch (error) {
    logError("Error creating payment intent:", error);
    throw new Error(`Failed to create payment intent: ${error.message}`);
  }
};

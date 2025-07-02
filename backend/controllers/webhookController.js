import { handleWebhook } from '../services/stripeService.js';
import db from '../config/db.js';

/**
 * Handle Stripe webhook events
 */
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const payload = req.rawBody || req.body;

  try {
    // Verify the webhook signature
    const event = await handleWebhook(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);

    // Handle the event
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(invoice) {
  const subscriptionId = invoice.subscription;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // Update subscription in database
  await db.query(
    `UPDATE Subscriptions 
     SET payment_status = 'Paid', status = 'Active'
     WHERE stripe_subscription_id = ?`,
    [subscriptionId]
  );
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice) {
  const subscriptionId = invoice.subscription;
  
  // Update subscription status to past due
  await db.query(
    `UPDATE Subscriptions 
     SET payment_status = 'Failed', status = 'Past Due'
     WHERE stripe_subscription_id = ?`,
    [subscriptionId]
  );
  
  // TODO: Send notification to admin/user about payment failure
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription) {
  const { id: subscriptionId, status, cancel_at_period_end, current_period_end } = subscription;
  
  // Map Stripe status to our status
  let subscriptionStatus = status.charAt(0).toUpperCase() + status.slice(1);
  if (cancel_at_period_end) {
    subscriptionStatus = 'Canceling';
  }
  
  // Update subscription in database
  await db.query(
    `UPDATE Subscriptions 
     SET status = ?, end_date = ?
     WHERE stripe_subscription_id = ?`,
    [subscriptionStatus, new Date(current_period_end * 1000), subscriptionId]
  );
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(subscription) {
  const subscriptionId = subscription.id;
  
  // Update subscription status to canceled
  await db.query(
    `UPDATE Subscriptions 
     SET status = 'Canceled', end_date = NOW()
     WHERE stripe_subscription_id = ?`,
    [subscriptionId]
  );
  
  // Update school's subscription status
  await db.query(
    `UPDATE Schools s
     JOIN Subscriptions sub ON s.school_id = sub.school_id
     SET s.has_active_subscription = FALSE
     WHERE sub.stripe_subscription_id = ?`,
    [subscriptionId]
  );
}

import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Spinner,
} from "@heroui/react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { addToast } from "@heroui/toast";
import subscriptionService from "../../services/subscriptionService";
import { Icon } from "@iconify/react";
// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ plan, billingCycle, onSuccess, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment method
      const { error: stripeError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: elements.getElement(CardElement),
          billing_details: {
            name: "Customer Name", // You can get this from user profile
          },
        });

      if (stripeError) {
        setError(stripeError.message);
        return;
      }

      const subscriptionData = {
        plan_name: plan.plan_name,
        billing_cycle: billingCycle,
        payment_method_id: paymentMethod.id,
      };

      const subscription = await subscriptionService.createSubscription(
        subscriptionData
      );

      addToast({
        description: "Subscription created successfully!",
        color: "success",
      });

      onSuccess(subscription);
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "An error occurred during payment processing");
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="py-4">
      <div className="space-y-6">
        {/* Plan summary */}
        <div className="bg-slate-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium text-slate-900">{plan.plan_name}</h3>
              <p className="text-sm text-slate-600">
                {billingCycle === "yearly"
                  ? "Yearly subscription"
                  : "Monthly subscription"}
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-semibold text-slate-900">
                $
                {billingCycle === "yearly"
                  ? plan.yearly_price
                  : plan.monthly_price}
              </span>
              <span className="text-slate-600 text-sm">
                /{billingCycle === "yearly" ? "year" : "month"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <Icon icon="heroicons:check" />
            <span>Cancel anytime • No setup fees</span>
          </div>
        </div>

        <Divider />

        {/* Payment details */}
        <div className="space-y-5">
          <div>
            <label
              htmlFor="card-minimal"
              className="text-sm font-medium text-slate-700 mb-3 block"
            >
              Payment Details
            </label>
            <div className="border rounded-lg p-3">
              <CardElement options={cardElementOptions} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 space-y-3">
          <Button
            type="submit"
            color="primary"
            className="w-full h-14 text-base font-medium rounded-xl text-white"
            isDisabled={!stripe || isProcessing}
          >
            {isProcessing ? (
              <Spinner size="sm" color="current" className="mr-2" />
            ) : null}
            {isProcessing ? "Processing..." : "Complete Subscription"}
          </Button>
          <Button
            variant="ghost"
            onPress={onCancel}
            isDisabled={isProcessing}
            className="w-full border-none h-12 text-slate-600 hover:text-slate-800 font-normal"
          >
            Maybe later
          </Button>
        </div>

        <p className="text-xs text-slate-500 text-center pt-4">
          By subscribing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </form>
  );
};

const StripePaymentForm = ({ plan, billingCycle, onSuccess, onCancel }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        plan={plan}
        billingCycle={billingCycle}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
};

export default StripePaymentForm;

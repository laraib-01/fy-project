import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Spinner,
} from '@heroui/react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { addToast } from '@heroui/toast';
import subscriptionService from '../../services/subscriptionService';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ plan, billingCycle, onSuccess, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        setIsProcessing(true);
        const { clientSecret } = await subscriptionService.createPaymentIntent(
          plan.plan_name,
          billingCycle
        );
        setClientSecret(clientSecret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        addToast({
          description: 'Failed to initialize payment. Please try again.',
          color: 'danger',
        });
        onCancel();
      } finally {
        setIsProcessing(false);
      }
    };

    createPaymentIntent();
  }, [plan, billingCycle, onCancel]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Confirm card payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: 'Customer Name', // You can get this from user profile
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Payment successful, create subscription
        const subscriptionData = {
          plan_name: plan.plan_name,
          billing_cycle: billingCycle,
          payment_method_id: paymentIntent.payment_method,
        };

        const subscription = await subscriptionService.createSubscription(subscriptionData);
        
        addToast({
          description: 'Subscription created successfully!',
          color: 'success',
        });
        
        onSuccess(subscription);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred during payment processing');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <h3 className="text-lg font-medium">Payment Details</h3>
          <p className="text-sm text-foreground-500">
            {plan.plan_name} Plan ({billingCycle === 'yearly' ? 'Yearly' : 'Monthly'})
          </p>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground-700">
              Card Information
            </label>
            <div className="border rounded-lg p-3">
              <CardElement options={cardElementOptions} />
            </div>
            {error && <p className="text-sm text-danger-500 mt-2">{error}</p>}
          </div>
          
          <div className="bg-content2 p-4 rounded-lg">
            <div className="flex justify-between">
              <span>Plan:</span>
              <span className="font-medium">{plan.plan_name}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span>Billing Cycle:</span>
              <span className="font-medium">
                {billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}
              </span>
            </div>
            <Divider className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>
                ${billingCycle === 'yearly' ? plan.yearly_price : plan.monthly_price}
                <span className="text-sm font-normal text-foreground-500">
                  /{billingCycle === 'yearly' ? 'year' : 'month'}
                </span>
              </span>
            </div>
          </div>
        </CardBody>
        <Divider />
        <CardFooter className="flex justify-between">
          <Button variant="flat" onPress={onCancel} isDisabled={isProcessing}>
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            isDisabled={!stripe || isProcessing || !clientSecret}
            isLoading={isProcessing}
          >
            {isProcessing ? 'Processing...' : `Pay $${billingCycle === 'yearly' ? plan.yearly_price : plan.monthly_price}`}
          </Button>
        </CardFooter>
      </Card>
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

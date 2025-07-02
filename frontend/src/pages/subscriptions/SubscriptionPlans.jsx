import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Button,
  Divider,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ToastProvider,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { subscriptionService } from "../../services/subscriptionService";
import { addToast } from "@heroui/toast";
import authService from "../../services/authService";
import StripePaymentForm from "../../components/payment/StripePaymentForm";

export const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processingPlan, setProcessingPlan] = useState(null);

  const {
    isOpen: isPaymentModalOpen,
    onOpen: onPaymentModalOpen,
    onOpenChange: onPaymentModalOpenChange,
  } = useDisclosure();

  // Check if user is a school admin
  const isSchoolAdmin = authService.getCurrentUser()?.role === "School_Admin";

  useEffect(() => {
    if (!isSchoolAdmin) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await subscriptionService.getPlans();
        setPlans(response.data || []);

        const currentSub = await subscriptionService.getCurrentSubscription();
        if (currentSub.data) {
          setCurrentPlan(currentSub.data);
          setSelectedPlan(currentSub.data.plan_name);
          localStorage.setItem("educonnect_hasActiveSubscription", true);
        } else {
          setCurrentPlan(null);
          setSelectedPlan(null);
          addToast({
            description: currentSub?.message,
            color: "danger",
          });
        }
      } catch (error) {
        console.error("Error fetching subscription data:", error);
        addToast({
          description: "Failed to load subscription plans",
          color: "danger",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isSchoolAdmin, navigate]);

  const handleSubscribe = (plan) => {
    if (!isSchoolAdmin) return;
    setSelectedPlan(plan);
    setProcessingPlan(plan.plan_name);
    onPaymentModalOpen();
  };

  const handlePaymentSuccess = (subscription) => {
    setCurrentPlan(subscription);
    setSelectedPlan(subscription.plan_type);
    setProcessingPlan(null);
    localStorage.setItem("educonnect_hasActiveSubscription", true);
    onPaymentModalOpenChange(false);

    addToast({
      description: "Subscription activated successfully!",
      color: "success",
    });

    // Redirect to dashboard after a short delay
    setTimeout(() => {
      navigate("/school");
    }, 1500);
  };

  const handlePaymentCancel = () => {
    onPaymentModalOpenChange(false);
    setSelectedPlan(null);
    setProcessingPlan(null);
  };

  const getPrice = (plan) => {
    return billingCycle === "yearly" ? plan.yearly_price : plan.monthly_price;
  };

  const getBillingPeriod = () => {
    return billingCycle === "yearly" ? "year" : "month";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ToastProvider placement="bottom-center" toastOffset={0} />

        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {currentPlan ? "Your Current Plan" : "Choose Your Plan"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {currentPlan
                ? "Manage your subscription or upgrade to a different plan."
                : "Select the plan that works best for your school."}
            </p>

            {currentPlan && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg inline-block">
                <p className="text-blue-800 dark:text-blue-200">
                  <span className="font-medium">Current Plan:</span>{" "}
                  {currentPlan.plan_name} • ${getPrice(currentPlan)}/
                  {getBillingPeriod()}
                </p>
                {currentPlan.end_date && (
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Renews on:{" "}
                    {new Date(currentPlan.end_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  billingCycle === "monthly"
                    ? "bg-white dark:bg-gray-700 shadow-md text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  billingCycle === "yearly"
                    ? "bg-white dark:bg-gray-700 shadow-md text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Yearly Billing (Save 20%)
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const features = JSON.parse(plan.features ?? "[]");
              return (
                <Card
                  key={plan.plan_id}
                  className={`relative transition-all duration-200 hover:shadow-lg ${
                    currentPlan?.plan_name === plan.plan_name
                      ? "ring-2 ring-blue-500 dark:ring-blue-400 scale-105"
                      : "border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <CardBody className="p-6">
                    {currentPlan?.plan_name === plan.plan_name && (
                      <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                        Current Plan
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.plan_name}
                    </h3>

                    <div className="mb-6">
                      <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                        ${getPrice(plan)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        /{getBillingPeriod()}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      {features?.map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <Icon
                            icon="heroicons:check-circle"
                            className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                          />
                          <span className="text-gray-700 dark:text-gray-300">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        color="primary"
                        className="w-full mt-4"
                        onPress={() => handleSubscribe(plan)}
                        isDisabled={
                          processingPlan ||
                          (currentPlan &&
                            currentPlan.plan_type === plan.plan_name)
                        }
                      >
                        {processingPlan === plan.plan_name ? (
                          <Spinner size="sm" color="current" />
                        ) : currentPlan?.plan_name === plan.plan_name ? (
                          "Current Plan"
                        ) : (
                          `Subscribe ${
                            billingCycle === "yearly"
                              ? `($${plan.yearly_price}/yr)`
                              : `($${plan.monthly_price}/mo)`
                          }`
                        )}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          <div className="mt-16 text-center text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Need help choosing a plan?
            </h3>
            <p className="mb-6">
              Our team is here to help you find the perfect plan for your
              school's needs. Contact us for a personalized recommendation.
            </p>
            <Button color="primary" variant="bordered">
              <Icon icon="heroicons:envelope" className="mr-2" />
              Contact Sales
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isPaymentModalOpen}
        onOpenChange={onPaymentModalOpenChange}
        size="lg"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Complete Your Subscription
          </ModalHeader>
          <ModalBody>
            {selectedPlan && (
              <StripePaymentForm
                plan={selectedPlan}
                billingCycle={billingCycle}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

import React, { useState, useEffect } from "react";
import { subscriptionService } from "../../services/subscriptionService";
import {
  Card,
  CardBody,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  ToastProvider,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";

export const Subscriptions = () => {
  const {
    isOpen: isAddPlanModalOpen,
    onOpen: onAddPlanModalOpen,
    onOpenChange: onAddPlanModalOpenChange,
  } = useDisclosure();

  const [searchQuery, setSearchQuery] = useState("");
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [isLoading, setIsLoading] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    plan_id: null,
    plan_name: "",
    monthly_price: "",
    yearly_price: "",
    max_teachers: "",
    max_parents: "",
    features: [],
    is_active: true,
  });
  const [featureInput, setFeatureInput] = useState("");
  const isAdmin = localStorage.getItem("educonnect_role") === "EduConnect_Admin";

  // Form mode: 'create' or 'edit'
  const [formMode, setFormMode] = useState("create");

  const filteredPlans = subscriptionPlans?.filter(
    (plan) =>
      plan.plan_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plan.features &&
        plan.features.some(
          (feature) =>
            typeof feature === "string" &&
            feature.toLowerCase().includes(searchQuery.toLowerCase())
        ))
  );

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.endsWith("price") || name.startsWith("max_")
          ? value === ""
            ? ""
            : parseFloat(value)
          : value,
    }));
  };

  // Handle adding a feature
  const handleAddFeature = () => {
    if (
      featureInput.trim() &&
      !formData.features.includes(featureInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, featureInput.trim()],
      }));
      setFeatureInput("");
    }
  };

  // Handle removing a feature
  const handleRemoveFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  // Format currency for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Reset form to default values
  const resetForm = () => {
    setFormData({
      plan_id: null,
      plan_name: "",
      monthly_price: "",
      yearly_price: "",
      max_teachers: "",
      max_parents: "",
      features: [],
      is_active: true,
    });
    setFeatureInput("");
    setFormMode("create");
  };

  // Handle edit plan
  const handleEditPlan = (plan) => {
    setFormData({
      plan_id: plan.plan_id,
      plan_name: plan.plan_name,
      monthly_price: plan.monthly_price,
      yearly_price: plan.yearly_price,
      max_teachers: plan.max_teachers || "",
      max_parents: plan.max_parents || "",
      features: Array.isArray(plan.features) ? [...plan.features] : [],
      is_active: plan.is_active,
    });
    setFormMode("edit");
    onAddPlanModalOpen();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    setIsSubmitting(true);

    try {
      if (formMode === "create") {
        await subscriptionService.createSubscriptionPlan(formData);
        addToast({
          description: "Subscription plan created successfully",
          color: "success",
          hideIcon: true,
        });
      } else {
        await subscriptionService.updateSubscriptionPlan(
          formData.plan_id,
          formData
        );
        addToast({
          description: "Subscription plan updated successfully",
          color: "success",
          hideIcon: true,
        });
      }

      fetchPlans();
      resetForm();
      onAddPlanModalOpenChange(false);
    } catch (error) {
      console.error("Error saving subscription plan:", error);
      addToast({
        description: error.message || "Failed to save subscription plan",
        color: "error",
        hideIcon: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle plan status toggle
  const handleTogglePlanStatus = async (planId, currentStatus) => {
    if (!isAdmin) return;

    try {
      setIsLoading({ ...isLoading, [planId]: true });
      await subscriptionService.togglePlanStatus(planId, !currentStatus);

      setSubscriptionPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan.plan_id === planId
            ? { ...plan, is_active: !currentStatus }
            : plan
        )
      );

      addToast({
        description: `Plan ${
          !currentStatus ? "activated" : "deactivated"
        } successfully`,
        color: "success",
        hideIcon: true,
      });
    } catch (error) {
      console.error("Failed to update plan status:", error);
      addToast({
        description: `Failed to ${
          !currentStatus ? "activate" : "deactivate"
        } plan`,
        color: "error",
        hideIcon: true,
      });
    } finally {
      setIsLoading({ ...isLoading, [planId]: false });
    }
  };

  // Handle delete plan
  const handleDeletePlan = async (planId) => {
    if (
      !isAdmin ||
      !window.confirm(
        "Are you sure you want to delete this plan? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setIsLoading({ ...isLoading, [planId]: true });
      await subscriptionService.deleteSubscriptionPlan(planId);

      setSubscriptionPlans((prevPlans) =>
        prevPlans.filter((plan) => plan.plan_id !== planId)
      );

      addToast({
        description: "Plan deleted successfully",
        color: "success",
        hideIcon: true,
      });
    } catch (error) {
      console.error("Failed to delete plan:", error);
      addToast({
        description: "Failed to delete plan",
        color: "error",
        hideIcon: true,
      });
    } finally {
      setIsLoading({ ...isLoading, [planId]: false });
    }
  };

  const fetchPlans = async () => {
    setIsLoading({ ...isLoading, ["all"]: true });
    try {
      const response = await subscriptionService.getSubscriptionPlans();
      setSubscriptionPlans(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch subscription plans");
    } finally {
      setIsLoading({ ...isLoading, ["all"]: false });
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <>
      <ToastProvider placement="bottom-center" toastOffset={0} />{" "}
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Subscriptions Plans</h1>
            <p className="text-foreground-600">Manage subscriptions plans</p>
          </div>

          <Button
            color="primary"
            startContent={<Icon icon="lucide:plus" />}
            onPress={() => {
              resetForm();
              onAddPlanModalOpen();
            }}
            isDisabled={!isAdmin}
          >
            Add Plan
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <Card key={plan.plan_id} className="overflow-visible">
              <CardBody className="p-6">
                <div className="flex justify-between items-start">
                  <h4 className="text-xl font-bold">{plan.plan_name}</h4>
                  <Chip color={plan.is_active ? "success" : "danger"} size="sm">
                    {plan.is_active ? "Active" : "Inactive"}
                  </Chip>
                </div>

                <div className="mt-4">
                  <div className="flex items-end">
                    <span className="text-3xl font-bold">
                      {plan.monthly_price}
                    </span>
                    <span className="text-foreground-500 ml-2">/month</span>
                  </div>
                  <p className="text-foreground-500 text-sm mt-1">
                    ${plan.yearly_price}/year (save $
                    {(plan.monthly_price * 12 - plan.yearly_price).toFixed(2)})
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-foreground-500">Max Teachers:</span>
                    <span className="font-medium">
                      {!plan.max_teachers ? "Unlimited" : plan.max_teachers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-500">Max Parents:</span>
                    <span className="font-medium">
                      {!plan.max_parents ? "Unlimited" : plan.max_parents}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <h5 className="font-medium mb-2">Features:</h5>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Icon
                          icon="lucide:check-circle"
                          className="text-success mt-0.5 mr-2"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button
                    variant="flat"
                    className="flex-1"
                    onPress={() => handleEditPlan(plan)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="flat"
                    color={plan.is_active ? "danger" : "success"}
                    className="flex-1"
                    onPress={() =>
                      handleTogglePlanStatus(plan.plan_id, plan.is_active)
                    }
                    isLoading={isLoading[plan.plan_id]}
                  >
                    {plan.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Add/Edit Plan Modal */}
      <Modal
        isOpen={isAddPlanModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            resetForm();
          }
          onAddPlanModalOpenChange();
        }}
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">
                {formMode === "create" ? "Add New" : "Edit"} Subscription Plan
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Plan Name"
                    name="plan_name"
                    value={formData.plan_name}
                    onChange={handleInputChange}
                    placeholder="Enter plan name"
                    isRequired
                    isDisabled={isSubmitting}
                  />
                  <Input
                    label="Monthly Price ($)"
                    name="monthly_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.monthly_price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    isRequired
                    isDisabled={isSubmitting}
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">$</span>
                      </div>
                    }
                  />
                  <Input
                    label="Annual Price ($)"
                    name="yearly_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.yearly_price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    isRequired
                    isDisabled={isSubmitting}
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">$</span>
                      </div>
                    }
                  />
                  <div className="flex flex-col gap-2">
                    <Input
                      label="Max Teachers"
                      name="max_teachers"
                      type="number"
                      min="0"
                      value={formData.max_teachers}
                      onChange={handleInputChange}
                      placeholder="Leave empty for unlimited"
                      isDisabled={isSubmitting}
                    />
                    <p className="text-xs text-foreground-500">
                      Leave empty for unlimited
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Input
                      label="Max Parents"
                      name="max_parents"
                      type="number"
                      min="0"
                      value={formData.max_parents}
                      onChange={handleInputChange}
                      placeholder="Leave empty for unlimited"
                      isDisabled={isSubmitting}
                    />
                    <p className="text-xs text-foreground-500">
                      Leave empty for unlimited
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Features</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a feature"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      isDisabled={isSubmitting}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddFeature())
                      }
                    />
                    <Button
                      color="primary"
                      onPress={handleAddFeature}
                      isDisabled={!featureInput.trim() || isSubmitting}
                    >
                      Add
                    </Button>
                  </div>

                  {formData.features.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {formData.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-default-100 rounded"
                        >
                          <span>{feature}</span>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => handleRemoveFeature(index)}
                            isDisabled={isSubmitting}
                          >
                            <Icon icon="lucide:x" className="text-danger" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={() => {
                    resetForm();
                    onClose();
                  }}
                  isDisabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={isSubmitting}
                  isDisabled={
                    !formData.plan_name ||
                    !formData.monthly_price ||
                    !formData.yearly_price
                  }
                >
                  {formMode === "create" ? "Create Plan" : "Update Plan"}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

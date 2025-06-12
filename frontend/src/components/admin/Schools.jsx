import React, { useEffect, useState } from "react";
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Progress,
  ToastProvider,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import { AdminLayout } from "./AdminLayout";
import axios from "axios";

export default function AdminSchools() {
  const {
    isOpen: isAddEditSchoolModalOpen,
    onOpen: onAddEditSchoolModalOpen,
    onOpenChange: onAddEditSchoolModalOpenChange,
  } = useDisclosure();

  const {
    isOpen: isDeleteSchoolModalOpen,
    onOpen: onDeleteSchoolModalOpen,
    onOpenChange: onDeleteSchoolModalOpenChange,
  } = useDisclosure();

  const [schools, setSchools] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    schoolName: "",
    email: "",
    phone: "",
    address: "",
    adminName: "",
    adminEmail: "",
    subscriptionPlan: "Basic",
    billingCycle: "Monthly",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSchoolId, setCurrentSchoolId] = useState(null);

  console.log(currentSchoolId);

  const subscriptionPlans = [
    {
      id: 1,
      name: "Basic",
      monthlyPrice: 49,
      annualPrice: 490,
      maxTeachers: 20,
      maxParents: 500,
      features: [
        "Student performance tracking",
        "Attendance management",
        "Basic announcements",
        "Email support",
      ],
      active: true,
    },
    {
      id: 2,
      name: "Standard",
      monthlyPrice: 99,
      annualPrice: 990,
      maxTeachers: 50,
      maxParents: 1500,
      features: [
        "All Basic features",
        "Event calendar",
        "Document sharing",
        "Automated notifications",
        "Priority email support",
      ],
      active: true,
    },
    {
      id: 3,
      name: "Premium",
      monthlyPrice: 199,
      annualPrice: 1990,
      maxTeachers: -1, // Unlimited
      maxParents: -1, // Unlimited
      features: [
        "All Standard features",
        "Custom branding",
        "Advanced analytics",
        "API access",
        "Dedicated support",
        "Training sessions",
      ],
      active: true,
    },
  ];

  const fetchSchools = async () => {
    try {
      const token = localStorage.getItem("educonnect_token");
      const response = await axios.get("http://localhost:5000/api/schools", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchools(response.data?.schools || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching schools:", error);
      addToast({
        title: "Error",
        description: "Unable to load schools.",
        color: "error",
        hideIcon: true,
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const resetForm = () => {
    setFormData({
      schoolName: "",
      email: "",
      phone: "",
      address: "",
      adminName: "",
      adminEmail: "",
    });
    setIsEditing(false);
    setCurrentSchoolId(null);
  };

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddSchool = async () => {
    const token = localStorage.getItem("educonnect_token");
    setIsLoading(true);
    try {
      const payload = {
        name: formData.schoolName,
        address: formData.address,
        phone_number: formData.phone,
        email: formData.email,
        admin_name: formData.adminName,
        admin_email: formData.adminEmail,
      };

      let res;
      if (isEditing && currentSchoolId) {
        res = await axios.put(
          `http://localhost:5000/api/schools/${currentSchoolId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        res = await axios.post("http://localhost:5000/api/schools", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      addToast({
        title: "Success",
        description: res?.data?.message,
        color: "success",
        hideIcon: true,
      });

      fetchSchools();
      resetForm();
      onAddSchoolModalOpenChange(false);
    } catch (error) {
      console.error("Failed to save school:", error);
      addToast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Could not save school. Please try again.",
        color: "error",
        hideIcon: true,
      });
      setIsLoading(false);
    }
  };

  const handleEditClick = (school) => {
    setFormData({
      schoolName: school.name,
      email: school.email,
      phone: school.phone_number,
      address: school.address,
      adminName: school.admin_name,
      adminEmail: school.admin_email,
    });
    setIsEditing(true);
    setCurrentSchoolId(school.school_id);
    onAddEditSchoolModalOpen();
  };

  const handleDeleteSchool = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("educonnect_token");
      await axios.delete(
        `http://localhost:5000/api/schools/${currentSchoolId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      addToast({
        title: "Deleted",
        description: "School deleted successfully.",
        color: "success",
      });

      fetchSchools();
      onDeleteSchoolModalOpenChange(false);
      
    } catch (error) {
      console.error("Delete failed:", error);
      addToast({
        title: "Error",
        description: "Failed to delete school.",
        status: "error",
      });
      setIsLoading(false);
    }
  };

  const filteredSchools = schools.filter(
    (school) =>
      school?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school?.plan?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <AdminLayout>
      <ToastProvider placement="bottom-center" toastOffset={0} />
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Registered Schools</h1>
            <p className="text-foreground-600">
              Manage schools, subscriptions, and platform analytics
            </p>
          </div>

          <Button
            color="primary"
            startContent={<Icon icon="lucide:plus" />}
            onPress={onAddEditSchoolModalOpen}
          >
            Add School
          </Button>
        </div>

        <Card>
          <CardBody>
            <div className="flex gap-2 w-full md:w-auto mb-4">
              <Input
                placeholder="Search schools..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={
                  <Icon icon="lucide:search" className="text-foreground-400" />
                }
                className="w-full"
              />
            </div>

            <Table removeWrapper aria-label="Schools table">
              <TableHeader>
                <TableColumn>SCHOOL NAME</TableColumn>
                {/* <TableColumn>SCHOOL EMAIL</TableColumn>
                <TableColumn>PHONE NUMBER</TableColumn>
                <TableColumn>ADMIN NAME</TableColumn> */}
                <TableColumn>PLAN</TableColumn>
                <TableColumn>USERS</TableColumn>
                <TableColumn>SUBSCRIPTION DATE</TableColumn>
                <TableColumn>NEXT BILLING</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredSchools.map((school) => (
                  <TableRow key={school.school_id}>
                    <TableCell>{school.name}</TableCell>
                    <TableCell>{school.plan_type}</TableCell>
                    <TableCell>{school.users}</TableCell>
                    <TableCell>
                      {new Date(school.start_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>
                          {new Date(school.end_date).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-foreground-500">
                          {formatCurrency(school.amount)}/month
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={
                          school.subscription_status === "Active"
                            ? "success"
                            : school.subscription_status === "Trial"
                            ? "primary"
                            : "danger"
                        }
                        size="sm"
                      >
                        {school.subscription_status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="flat"
                          isIconOnly
                          onPress={() => handleEditClick(school)}
                        >
                          <Icon icon="lucide:edit" />
                        </Button>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button size="sm" variant="flat" isIconOnly>
                              <Icon icon="lucide:more-vertical" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="School actions">
                            <DropdownItem key="view">View Details</DropdownItem>
                            <DropdownItem key="change-plan">
                              Change Plan
                            </DropdownItem>
                            <DropdownItem key="contact">
                              Contact Admin
                            </DropdownItem>
                            <DropdownItem
                              key="suspend"
                              className="text-danger"
                              color="danger"
                            >
                              Suspend Account
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              onPress={() => {
                                onDeleteSchoolModalOpen();
                                setCurrentSchoolId(school.school_id);
                              }}
                            >
                              Delete School
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      <Modal
        isOpen={isAddEditSchoolModalOpen}
        onOpenChange={onAddEditSchoolModalOpenChange}
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add New School
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="School Name"
                    placeholder="Enter school name"
                    isRequired
                    value={formData.schoolName}
                    onValueChange={(val) =>
                      handleInputChange("schoolName", val)
                    }
                  />
                  <Input
                    label="Email Address"
                    placeholder="Enter school email"
                    type="email"
                    isRequired
                    value={formData.email}
                    onValueChange={(val) => handleInputChange("email", val)}
                  />
                </div>
                <Input
                  label="Phone Number"
                  placeholder="Enter phone number"
                  type="tel"
                  isRequired
                  value={formData.phone}
                  onValueChange={(val) => handleInputChange("phone", val)}
                />
                <Input
                  label="Address"
                  placeholder="Enter school address"
                  isRequired
                  value={formData.address}
                  onValueChange={(val) => handleInputChange("address", val)}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Admin Name"
                    placeholder="Enter admin name"
                    isRequired
                    value={formData.adminName}
                    onValueChange={(val) => handleInputChange("adminName", val)}
                  />
                  <Input
                    label="Admin Email"
                    placeholder="Enter admin email"
                    type="email"
                    isRequired
                    value={formData.adminEmail}
                    onValueChange={(val) =>
                      handleInputChange("adminEmail", val)
                    }
                  />
                </div>
                {/* <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Subscription Plan</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {subscriptionPlans.map((plan) => (
                      <Card
                        key={plan.id}
                        isPressable
                        className="border-2 border-divider hover:border-primary"
                      >
                        <CardBody className="p-4">
                          <h5 className="font-bold">{plan.name}</h5>
                          <div className="flex items-end mt-1">
                            <span className="text-lg font-semibold">
                              ${plan.monthlyPrice}
                            </span>
                            <span className="text-foreground-500 text-sm ml-1">
                              /month
                            </span>
                          </div>
                          <p className="text-xs text-foreground-500 mt-1">
                            {plan.maxTeachers === -1
                              ? "Unlimited"
                              : plan.maxTeachers}{" "}
                            teachers,
                            {plan.maxParents === -1
                              ? " unlimited"
                              : ` ${plan.maxParents}`}{" "}
                            parents
                          </p>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Billing Cycle</p>
                  <div className="flex gap-4">
                    <Card
                      isPressable
                      className="border-2 border-primary flex-1"
                    >
                      <CardBody className="p-4">
                        <h5 className="font-bold">Monthly</h5>
                        <p className="text-xs text-foreground-500 mt-1">
                          Billed every month
                        </p>
                      </CardBody>
                    </Card>
                    <Card
                      isPressable
                      className="border-2 border-divider hover:border-primary flex-1"
                    >
                      <CardBody className="p-4">
                        <h5 className="font-bold">Annual</h5>
                        <p className="text-xs text-foreground-500 mt-1">
                          Save 20% with annual billing
                        </p>
                      </CardBody>
                    </Card>
                  </div>
                </div> */}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleAddSchool}
                  isLoading={isLoading}
                >
                  {isEditing ? "Update School" : "Add School"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isDeleteSchoolModalOpen}
        onOpenChange={onDeleteSchoolModalOpenChange}
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete School
              </ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this school?</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={handleDeleteSchool}
                  isLoading={isLoading}
                >
                  Delete School
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </AdminLayout>
  );
}

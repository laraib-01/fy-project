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
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AdminLayout } from "./AdminLayout";
import axios from "axios";

export default function AdminSchools() {
  const {
    isOpen: isAddSchoolModalOpen,
    onOpen: onAddSchoolModalOpen,
    onOpenChange: onAddSchoolModalOpenChange,
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

  console.log("formData", formData);

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
    } catch (error) {
      console.error("Error fetching schools:", error);
      addToast({
        title: "Error",
        description: "Unable to load schools.",
        status: "error",
      });
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddSchool = async () => {
    const token = localStorage.getItem("educonnect_token");

    try {
      await axios.post(
        "http://localhost:5000/api/schools",
        {
          name: formData.schoolName,
          address: formData.address,
          phone_number: formData.phone,
          email: formData.email,
          admin_name: formData.adminName,
          admin_email: formData.adminEmail,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      addToast({
        title: "Success",
        description: "School added successfully.",
        status: "success",
      });

      fetchSchools();
      onAddSchoolModalOpenChange(false);
    } catch (error) {
      console.error("Failed to add school:", error);
      addToast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Could not add school. Please try again.",
        status: "error",
      });
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

  console.log("first")

  return (
    <AdminLayout>
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
            onPress={onAddSchoolModalOpen}
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
                <TableColumn>SCHOOL EMAIL</TableColumn>
                <TableColumn>PHONE NUMBER</TableColumn>
                <TableColumn>ADMIN NAME</TableColumn>
                {/* <TableColumn>PLAN</TableColumn>
                <TableColumn>USERS</TableColumn>
                <TableColumn>SUBSCRIPTION DATE</TableColumn>
                <TableColumn>NEXT BILLING</TableColumn> */}
                {/* <TableColumn>STATUS</TableColumn> */}
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredSchools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell>{school.name}</TableCell>
                    <TableCell>{school.email}</TableCell>
                    <TableCell>{school.phone_number}</TableCell>
                    <TableCell>{school.admin_name}</TableCell>
                    {/* <TableCell>{school.plan}</TableCell>
                    <TableCell>{school.users}</TableCell>
                    <TableCell>
                      {new Date(school.subscriptionDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>
                          {new Date(school.nextBilling).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-foreground-500">
                          {formatCurrency(school.amount)}/month
                        </span>
                      </div>
                    </TableCell> */}
                    {/* <TableCell>
                      <Chip
                        color={
                          school.status === "active"
                            ? "success"
                            : school.status === "trial"
                            ? "primary"
                            : "danger"
                        }
                        size="sm"
                      >
                        {school.status}
                      </Chip>
                    </TableCell> */}
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="flat" isIconOnly>
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
        isOpen={isAddSchoolModalOpen}
        onOpenChange={onAddSchoolModalOpenChange}
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
                <Button color="primary" onPress={handleAddSchool}>
                  Add School
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </AdminLayout>
  );
}

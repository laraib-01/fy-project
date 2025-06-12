import React, { useState } from "react";
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
import { AdminLayout } from "../components/admin/AdminLayout";

export const AnalyticsAndReport = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const {
    isOpen: isAddSchoolModalOpen,
    onOpen: onAddSchoolModalOpen,
    onOpenChange: onAddSchoolModalOpenChange,
  } = useDisclosure();
  const {
    isOpen: isAddPlanModalOpen,
    onOpen: onAddPlanModalOpen,
    onOpenChange: onAddPlanModalOpenChange,
  } = useDisclosure();

  const [searchQuery, setSearchQuery] = useState("");

  const subscriptionData = [
    { month: "Jan", value: 12000 },
    { month: "Feb", value: 15000 },
    { month: "Mar", value: 18000 },
    { month: "Apr", value: 22000 },
    { month: "May", value: 24000 },
    { month: "Jun", value: 28000 },
    { month: "Jul", value: 32000 },
    { month: "Aug", value: 38000 },
    { month: "Sep", value: 42000 },
    { month: "Oct", value: 48000 },
    { month: "Nov", value: 52000 },
    { month: "Dec", value: 58000 },
  ];

  const userGrowthData = [
    { month: "Jan", teachers: 45, parents: 120 },
    { month: "Feb", teachers: 52, parents: 145 },
    { month: "Mar", teachers: 61, parents: 178 },
    { month: "Apr", teachers: 67, parents: 210 },
    { month: "May", teachers: 75, parents: 245 },
    { month: "Jun", teachers: 80, parents: 280 },
    { month: "Jul", teachers: 87, parents: 320 },
    { month: "Aug", teachers: 95, parents: 380 },
    { month: "Sep", teachers: 102, parents: 420 },
    { month: "Oct", teachers: 110, parents: 460 },
    { month: "Nov", teachers: 118, parents: 510 },
    { month: "Dec", teachers: 125, parents: 550 },
  ];

  const planDistributionData = [
    { name: "Basic", value: 35, color: "#4f46e5" },
    { name: "Standard", value: 45, color: "#06b6d4" },
    { name: "Premium", value: 20, color: "#10b981" },
  ];

  const schools = [
    {
      id: 1,
      name: "Westview Elementary",
      plan: "Premium",
      users: 125,
      subscriptionDate: "2024-05-15",
      status: "active",
      nextBilling: "2024-12-15",
      amount: 199,
    },
    {
      id: 2,
      name: "Lincoln High School",
      plan: "Standard",
      users: 210,
      subscriptionDate: "2024-06-20",
      status: "active",
      nextBilling: "2024-12-20",
      amount: 99,
    },
    {
      id: 3,
      name: "Oakridge Academy",
      plan: "Premium",
      users: 180,
      subscriptionDate: "2024-04-10",
      status: "active",
      nextBilling: "2024-12-10",
      amount: 199,
    },
    {
      id: 4,
      name: "Springfield Elementary",
      plan: "Basic",
      users: 85,
      subscriptionDate: "2024-07-05",
      status: "active",
      nextBilling: "2024-12-05",
      amount: 49,
    },
    {
      id: 5,
      name: "Riverside Prep",
      plan: "Standard",
      users: 150,
      subscriptionDate: "2024-08-12",
      status: "active",
      nextBilling: "2024-12-12",
      amount: 99,
    },
    {
      id: 6,
      name: "Greenfield School",
      plan: "Basic",
      users: 65,
      subscriptionDate: "2024-09-18",
      status: "trial",
      nextBilling: "2024-12-18",
      amount: 0,
    },
    {
      id: 7,
      name: "Sunset High",
      plan: "Standard",
      users: 175,
      subscriptionDate: "2024-03-25",
      status: "overdue",
      nextBilling: "2024-11-25",
      amount: 99,
    },
  ];

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

  const transactions = [
    {
      id: 1,
      school: "Westview Elementary",
      date: "2024-11-15",
      amount: 199,
      plan: "Premium",
      status: "completed",
      method: "Credit Card",
    },
    {
      id: 2,
      school: "Lincoln High School",
      date: "2024-11-20",
      amount: 99,
      plan: "Standard",
      status: "completed",
      method: "PayPal",
    },
    {
      id: 3,
      school: "Oakridge Academy",
      date: "2024-11-10",
      amount: 199,
      plan: "Premium",
      status: "completed",
      method: "Credit Card",
    },
    {
      id: 4,
      school: "Springfield Elementary",
      date: "2024-11-05",
      amount: 49,
      plan: "Basic",
      status: "completed",
      method: "Bank Transfer",
    },
    {
      id: 5,
      school: "Riverside Prep",
      date: "2024-11-12",
      amount: 99,
      plan: "Standard",
      status: "pending",
      method: "Credit Card",
    },
    {
      id: 6,
      school: "Sunset High",
      date: "2024-10-25",
      amount: 99,
      plan: "Standard",
      status: "failed",
      method: "Credit Card",
    },
  ];

  const filteredSchools = schools.filter(
    (school) =>
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.plan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSchool = () => {
    // In a real app, this would be an API call
    addToast({
      title: "School Added",
      description: "The new school has been successfully added.",
      color: "success",
    });

    onAddSchoolModalOpenChange(false);
  };

  const handleAddPlan = () => {
    // In a real app, this would be an API call
    addToast({
      title: "Plan Added",
      description: "The new subscription plan has been successfully added.",
      color: "success",
    });

    onAddPlanModalOpenChange(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Analytics & Reports</h1>
            <p className="text-foreground-600">Manage platform analytics</p>
          </div>

          <div className="flex gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  endContent={<Icon icon="lucide:chevron-down" />}
                >
                  This Year
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Time period selection">
                <DropdownItem key="this-month">This Month</DropdownItem>
                <DropdownItem key="this-quarter">This Quarter</DropdownItem>
                <DropdownItem key="this-year">This Year</DropdownItem>
                <DropdownItem key="all-time">All Time</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Button
              variant="flat"
              startContent={<Icon icon="lucide:download" />}
            >
              Export
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardBody>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-foreground-500">Total Revenue</p>
                    <h3 className="text-3xl font-bold mt-1">
                      {formatCurrency(58000)}
                    </h3>
                  </div>
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <Icon
                      icon="lucide:dollar-sign"
                      className="text-primary text-xl"
                    />
                  </div>
                </div>
                <Progress
                  value={85}
                  color="primary"
                  className="mt-4"
                  aria-label="Revenue progress"
                />
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-foreground-500">
                    Target: {formatCurrency(68000)}
                  </span>
                  <span className="text-primary font-medium">85%</span>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-foreground-500">New Schools</p>
                    <h3 className="text-3xl font-bold mt-1">12</h3>
                  </div>
                  <div className="bg-success-100 p-2 rounded-lg">
                    <Icon
                      icon="lucide:building"
                      className="text-success text-xl"
                    />
                  </div>
                </div>
                <Progress
                  value={60}
                  color="success"
                  className="mt-4"
                  aria-label="New schools progress"
                />
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-foreground-500">Target: 20</span>
                  <span className="text-success font-medium">60%</span>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-foreground-500">Retention Rate</p>
                    <h3 className="text-3xl font-bold mt-1">95%</h3>
                  </div>
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <Icon
                      icon="lucide:repeat"
                      className="text-primary text-xl"
                    />
                  </div>
                </div>
                <Progress
                  value={95}
                  color="primary"
                  className="mt-4"
                  aria-label="Retention rate progress"
                />
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-foreground-500">Target: 90%</span>
                  <span className="text-primary font-medium">105%</span>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-foreground-500">Avg. Subscription</p>
                    <h3 className="text-3xl font-bold mt-1">
                      {formatCurrency(115)}
                    </h3>
                  </div>
                  <div className="bg-warning-100 p-2 rounded-lg">
                    <Icon
                      icon="lucide:credit-card"
                      className="text-warning text-xl"
                    />
                  </div>
                </div>
                <Progress
                  value={76}
                  color="warning"
                  className="mt-4"
                  aria-label="Average subscription progress"
                />
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-foreground-500">
                    Target: {formatCurrency(150)}
                  </span>
                  <span className="text-warning font-medium">76%</span>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardBody>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Revenue by Plan</h3>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Basic", value: 14000 },
                        { name: "Standard", value: 25000 },
                        { name: "Premium", value: 19000 },
                      ]}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e4e4e7"
                      />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `$${value / 1000}k`}
                      />
                      <Tooltip
                        formatter={(value) => [
                          formatCurrency(value),
                          "Revenue",
                        ]}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#4f46e5"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">School Growth</h3>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { month: "Jan", value: 30 },
                        { month: "Feb", value: 32 },
                        { month: "Mar", value: 33 },
                        { month: "Apr", value: 35 },
                        { month: "May", value: 36 },
                        { month: "Jun", value: 37 },
                        { month: "Jul", value: 38 },
                        { month: "Aug", value: 40 },
                        { month: "Sep", value: 41 },
                        { month: "Oct", value: 42 },
                        { month: "Nov", value: 42 },
                        { month: "Dec", value: 42 },
                      ]}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e4e4e7"
                      />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(value) => [`${value} schools`, "Total"]}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        fill="url(#colorSchools)"
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient
                          id="colorSchools"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardBody>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Top Performing Schools
                </h3>
                <Button
                  size="sm"
                  variant="light"
                  endContent={<Icon icon="lucide:arrow-right" />}
                >
                  View All
                </Button>
              </div>

              <Table removeWrapper aria-label="Top performing schools table">
                <TableHeader>
                  <TableColumn>SCHOOL NAME</TableColumn>
                  <TableColumn>USERS</TableColumn>
                  <TableColumn>SUBSCRIPTION</TableColumn>
                  <TableColumn>MONTHLY REVENUE</TableColumn>
                  <TableColumn>GROWTH</TableColumn>
                  <TableColumn>RETENTION</TableColumn>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Westview Elementary</TableCell>
                    <TableCell>125</TableCell>
                    <TableCell>Premium</TableCell>
                    <TableCell>{formatCurrency(199)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Icon
                          icon="lucide:trending-up"
                          className="text-success mr-1"
                        />
                        <span>15%</span>
                      </div>
                    </TableCell>
                    <TableCell>98%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Lincoln High School</TableCell>
                    <TableCell>210</TableCell>
                    <TableCell>Standard</TableCell>
                    <TableCell>{formatCurrency(99)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Icon
                          icon="lucide:trending-up"
                          className="text-success mr-1"
                        />
                        <span>12%</span>
                      </div>
                    </TableCell>
                    <TableCell>95%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Oakridge Academy</TableCell>
                    <TableCell>180</TableCell>
                    <TableCell>Premium</TableCell>
                    <TableCell>{formatCurrency(199)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Icon
                          icon="lucide:trending-up"
                          className="text-success mr-1"
                        />
                        <span>18%</span>
                      </div>
                    </TableCell>
                    <TableCell>97%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Riverside Prep</TableCell>
                    <TableCell>150</TableCell>
                    <TableCell>Standard</TableCell>
                    <TableCell>{formatCurrency(99)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Icon
                          icon="lucide:trending-up"
                          className="text-success mr-1"
                        />
                        <span>10%</span>
                      </div>
                    </TableCell>
                    <TableCell>93%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Springfield Elementary</TableCell>
                    <TableCell>85</TableCell>
                    <TableCell>Basic</TableCell>
                    <TableCell>{formatCurrency(49)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Icon
                          icon="lucide:trending-down"
                          className="text-danger mr-1"
                        />
                        <span>3%</span>
                      </div>
                    </TableCell>
                    <TableCell>89%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Add School Modal */}
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
                  />
                  <Input
                    label="Email Address"
                    placeholder="Enter school email"
                    type="email"
                    isRequired
                  />
                  <Input
                    label="Phone Number"
                    placeholder="Enter phone number"
                    type="tel"
                  />
                  <Input label="Website" placeholder="Enter school website" />
                  <Input
                    label="Admin Name"
                    placeholder="Enter admin name"
                    isRequired
                  />
                  <Input
                    label="Admin Email"
                    placeholder="Enter admin email"
                    type="email"
                    isRequired
                  />
                </div>

                <div className="mt-4">
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
                </div>
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

      {/* Add Plan Modal */}
      <Modal
        isOpen={isAddPlanModalOpen}
        onOpenChange={onAddPlanModalOpenChange}
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add New Subscription Plan
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Plan Name"
                    placeholder="Enter plan name"
                    isRequired
                  />
                  <Input
                    label="Monthly Price"
                    placeholder="Enter monthly price"
                    type="number"
                    startContent="$"
                    isRequired
                  />
                  <Input
                    label="Annual Price"
                    placeholder="Enter annual price"
                    type="number"
                    startContent="$"
                    isRequired
                  />
                  <Input
                    label="Max Teachers"
                    placeholder="Enter max teachers (or -1 for unlimited)"
                    type="number"
                    isRequired
                  />
                  <Input
                    label="Max Parents"
                    placeholder="Enter max parents (or -1 for unlimited)"
                    type="number"
                    isRequired
                  />
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">
                    Features (one per line)
                  </p>
                  <Input
                    placeholder="Enter features, one per line"
                    isRequired
                    multiple
                    minRows={4}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleAddPlan}>
                  Add Plan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </AdminLayout>
  );
};

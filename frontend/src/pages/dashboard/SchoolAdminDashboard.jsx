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
} from "recharts";

export const SchoolAdminDashboard = () => {
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
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">School Admin Dashboard</h1>
            <p className="text-foreground-600">
              Manage teachers, students, events and subscription
            </p>
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
                      {formatCurrency(3400)}
                    </h3>
                  </div>
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <Icon
                      icon="lucide:dollar-sign"
                      className="text-primary text-xl"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-foreground-500">Total Students</p>
                    <h3 className="text-3xl font-bold mt-1">480</h3>
                  </div>
                  <div className="bg-success-100 p-2 rounded-lg">
                    <Icon
                      icon="lucide:users"
                      className="text-success text-xl"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-foreground-500">Total Teachers</p>
                    <h3 className="text-3xl font-bold mt-1">32</h3>
                  </div>
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <Icon
                      icon="lucide:users"
                      className="text-primary text-xl"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-foreground-500">Upcoming Events</p>
                    <h3 className="text-3xl font-bold mt-1">
                    4
                    </h3>
                  </div>
                  <div className="bg-warning-100 p-2 rounded-lg">
                    <Icon
                      icon="lucide:calendar"
                      className="text-warning text-xl"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardBody>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Monthly Revenue</h3>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        variant="bordered"
                        endContent={<Icon icon="lucide:chevron-down" />}
                        size="sm"
                      >
                        This Year
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Time period selection">
                      <DropdownItem key="this-year">This Year</DropdownItem>
                      <DropdownItem key="last-year">Last Year</DropdownItem>
                      <DropdownItem key="all-time">All Time</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={subscriptionData}
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
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        formatter={(value) => [`$${value}`, "Revenue"]}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#4f46e5"
                        fill="url(#colorRevenue)"
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#4f46e5"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#4f46e5"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">User Growth</h3>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        variant="bordered"
                        endContent={<Icon icon="lucide:chevron-down" />}
                        size="sm"
                      >
                        This Year
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Time period selection">
                      <DropdownItem key="this-year">This Year</DropdownItem>
                      <DropdownItem key="last-year">Last Year</DropdownItem>
                      <DropdownItem key="all-time">All Time</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={userGrowthData}
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
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="teachers"
                        name="Teachers"
                        fill="#4f46e5"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="parents"
                        name="Students"
                        fill="#17c964"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
  );
};

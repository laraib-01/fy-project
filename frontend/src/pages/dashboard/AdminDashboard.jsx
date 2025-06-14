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

export const AdminDashboard = () => {
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
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-foreground-600">
              Manage schools, subscriptions, and platform analytics
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
                <div className="mt-4 flex items-center text-sm">
                  <Icon icon="lucide:arrow-up" className="text-success mr-1" />
                  <span className="text-success font-medium">12%</span>
                  <span className="text-foreground-500 ml-1">
                    from last month
                  </span>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-foreground-500">Active Schools</p>
                    <h3 className="text-3xl font-bold mt-1">42</h3>
                  </div>
                  <div className="bg-success-100 p-2 rounded-lg">
                    <Icon
                      icon="lucide:building"
                      className="text-success text-xl"
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Icon icon="lucide:arrow-up" className="text-success mr-1" />
                  <span className="text-success font-medium">8%</span>
                  <span className="text-foreground-500 ml-1">
                    from last month
                  </span>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-foreground-500">Total Users</p>
                    <h3 className="text-3xl font-bold mt-1">675</h3>
                  </div>
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <Icon
                      icon="lucide:users"
                      className="text-primary text-xl"
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Icon icon="lucide:arrow-up" className="text-success mr-1" />
                  <span className="text-success font-medium">15%</span>
                  <span className="text-foreground-500 ml-1">
                    from last month
                  </span>
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
                <div className="mt-4 flex items-center text-sm">
                  <Icon icon="lucide:arrow-up" className="text-success mr-1" />
                  <span className="text-success font-medium">5%</span>
                  <span className="text-foreground-500 ml-1">
                    from last month
                  </span>
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
                        name="Parents"
                        fill="#06b6d4"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardBody>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Plan Distribution</h3>
                </div>

                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={planDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {planDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Percentage"]}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  {planDistributionData.map((plan, index) => (
                    <div key={index} className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: plan.color }}
                        ></div>
                        <span className="font-medium">{plan.name}</span>
                      </div>
                      <p className="text-sm text-foreground-500">
                        {plan.value}%
                      </p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card className="lg:col-span-2">
              <CardBody>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Recent Transactions</h3>
                  <Button
                    size="sm"
                    variant="light"
                    endContent={<Icon icon="lucide:arrow-right" />}
                  >
                    View All
                  </Button>
                </div>

                <Table removeWrapper aria-label="Recent transactions table">
                  <TableHeader>
                    <TableColumn>SCHOOL</TableColumn>
                    <TableColumn>DATE</TableColumn>
                    <TableColumn>AMOUNT</TableColumn>
                    <TableColumn>PLAN</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 5).map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.school}</TableCell>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>{transaction.plan}</TableCell>
                        <TableCell>
                          <Chip
                            color={
                              transaction.status === "completed"
                                ? "success"
                                : transaction.status === "pending"
                                ? "warning"
                                : "danger"
                            }
                            size="sm"
                          >
                            {transaction.status}
                          </Chip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
  );
};

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

export const AnalyticsAndReport = () => {
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
          <Button variant="flat" startContent={<Icon icon="lucide:download" />}>
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
                  <Icon icon="lucide:repeat" className="text-primary text-xl" />
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
                      formatter={(value) => [formatCurrency(value), "Revenue"]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
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
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
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
      </div>
    </div>
  );
};

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
} from "recharts";
import dashboardService from "../../services/dashboardService";
import { useNavigate } from "react-router-dom";

export const SchoolAdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  console.log("dashboardData", dashboardData);

  const fetchClasses = async () => {
    try {
      const response = await dashboardService.fetchDashboardStats();

      console.log("response", response);
      setDashboardData(response?.data);
    } catch (error) {
      console.error("Error fetching events:", error);
      addToast({
        description: error.message || "Unable to load events",
        color: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardBody>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-foreground-500">Total Students</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {dashboardData?.stats?.totalStudents}
                  </h3>
                </div>
                <div className="bg-success-100 p-2 rounded-lg">
                  <Icon icon="lucide:users" className="text-success text-xl" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-foreground-500">Total Teachers</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {dashboardData?.stats?.totalTeachers}
                  </h3>
                </div>
                <div className="bg-primary-100 p-2 rounded-lg">
                  <Icon icon="lucide:users" className="text-primary text-xl" />
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
                    {dashboardData?.stats?.totalUpcomingEvents}
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
                <h3 className="text-lg font-semibold">User Growth</h3>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData?.userGrowth}
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
                      dataKey="students"
                      name="Students"
                      fill="#17c964"
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
                <h3 className="text-lg font-semibold">Upcoming Events</h3>
                <Button
                  size="sm"
                  variant="light"
                  endContent={<Icon icon="lucide:arrow-right" />}
                  onPress={() => navigate("/school/events")}
                >
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {dashboardData?.upcomingEvents.slice(0, 3).map((event) => {
                  const formatTimeTo12Hour = (time24) => {
                    const [hours, minutes] = time24.split(":").map(Number);
                    const period = hours >= 12 ? "PM" : "AM";
                    const hours12 = hours % 12 || 12; // Convert 0 to 12 for midnight
                    return `${hours12}:${minutes
                      .toString()
                      .padStart(2, "0")} ${period}`;
                  };
                  return (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 border-b border-divider pb-4 last:border-0"
                    >
                      <div className="bg-content2 rounded p-2 text-center min-w-[48px]">
                        <div className="text-xs text-foreground-500">
                          {new Date(event.event_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                            }
                          )}
                        </div>
                        <div className="text-lg font-bold">
                          {new Date(event.event_date).getDate()}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium">{event.event_name}</h4>
                        <p className="text-xs text-foreground-500 mt-1">
                          {formatTimeTo12Hour(event.event_time)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

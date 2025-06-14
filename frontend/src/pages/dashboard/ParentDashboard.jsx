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
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Progress,
  Avatar,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import ParentLayout from "../../layouts/ParentLayout";

export const ParentDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedChild, setSelectedChild] = useState("child-1");

  const children = [
    {
      id: "child-1",
      name: "Ahmed Khan",
      grade: "5th Grade",
      class: "Class 5-A",
      avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=child1",
    },
    {
      id: "child-2",
      name: "Fatima Khan",
      grade: "3rd Grade",
      class: "Class 3-B",
      avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=child2",
    },
  ];

  const selectedChildData = children.find(
    (child) => child.id === selectedChild
  );

  const attendanceData = [
    { month: "Sep", present: 20, absent: 2, late: 0 },
    { month: "Oct", present: 18, absent: 1, late: 3 },
    { month: "Nov", present: 15, absent: 0, late: 1 },
  ];

  const currentMonthAttendance = attendanceData[attendanceData.length - 1];
  const totalDays =
    currentMonthAttendance.present +
    currentMonthAttendance.absent +
    currentMonthAttendance.late;
  const attendancePercentage = Math.round(
    (currentMonthAttendance.present / totalDays) * 100
  );

  const announcements = [
    {
      id: 1,
      title: "Parent-Teacher Meeting",
      content:
        "The parent-teacher meeting will be held on Friday, November 15th from 3:00 PM to 5:00 PM.",
      date: "2024-11-10",
      teacher: "Ms. Ayesha Malik",
    },
    {
      id: 2,
      title: "Math Quiz Postponed",
      content:
        "The math quiz scheduled for tomorrow has been postponed to next Monday due to the school event.",
      date: "2024-11-08",
      teacher: "Mr. Faisal Ahmed",
    },
    {
      id: 3,
      title: "Science Project Deadline",
      content:
        "Reminder: Science project reports are due this Thursday. Please ensure your child submits their work on time.",
      date: "2024-11-05",
      teacher: "Ms. Sana Rizvi",
    },
  ];

  const assignments = [
    {
      id: 1,
      subject: "English",
      title: "Essay Writing",
      dueDate: "2024-11-20",
      status: "pending",
      teacher: "Ms. Ayesha Malik",
    },
    {
      id: 2,
      subject: "Mathematics",
      title: "Problem Set Chapter 7",
      dueDate: "2024-11-18",
      status: "pending",
      teacher: "Mr. Faisal Ahmed",
    },
    {
      id: 3,
      subject: "Science",
      title: "Lab Report",
      dueDate: "2024-11-15",
      status: "completed",
      teacher: "Ms. Sana Rizvi",
    },
    {
      id: 4,
      subject: "History",
      title: "Timeline Project",
      dueDate: "2024-11-10",
      status: "completed",
      teacher: "Mr. Tariq Khan",
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Annual Sports Day",
      date: "2024-11-25",
      time: "9:00 AM - 3:00 PM",
      location: "School Grounds",
    },
    {
      id: 2,
      title: "Science Fair",
      date: "2024-12-05",
      time: "10:00 AM - 1:00 PM",
      location: "School Hall",
    },
    {
      id: 3,
      title: "Winter Break Begins",
      date: "2024-12-20",
      time: "After School",
      location: "N/A",
    },
  ];

  const grades = [
    {
      subject: "Mathematics",
      currentGrade: "A-",
      previousGrade: "B+",
      teacher: "Mr. Faisal Ahmed",
      trend: "up",
    },
    {
      subject: "Science",
      currentGrade: "B+",
      previousGrade: "B",
      teacher: "Ms. Sana Rizvi",
      trend: "up",
    },
    {
      subject: "English",
      currentGrade: "A",
      previousGrade: "A",
      teacher: "Ms. Ayesha Malik",
      trend: "stable",
    },
    {
      subject: "Social Studies",
      currentGrade: "B",
      previousGrade: "B-",
      teacher: "Mr. Tariq Khan",
      trend: "up",
    },
    {
      subject: "Computer Science",
      currentGrade: "A+",
      previousGrade: "A",
      teacher: "Mr. Ali Hassan",
      trend: "up",
    },
    {
      subject: "Art",
      currentGrade: "B-",
      previousGrade: "A-",
      teacher: "Ms. Nadia Jamil",
      trend: "down",
    },
  ];

  return (
    <ParentLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Parent Dashboard</h1>
            <p className="text-foreground-600">
              Stay updated with your child's progress and school activities
            </p>
          </div>

          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                endContent={<Icon icon="lucide:chevron-down" />}
                className="flex items-center gap-2"
              >
                {selectedChildData ? (
                  <>
                    <Avatar
                      src={selectedChildData.avatar}
                      name={selectedChildData.name}
                      size="sm"
                      className="mr-1"
                    />
                    {selectedChildData.name}
                  </>
                ) : (
                  "Select Child"
                )}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Child selection"
              onAction={(key) => setSelectedChild(key)}
            >
              {children.map((child) => (
                <DropdownItem key={child.id} textValue={child.name}>
                  <div className="flex items-center gap-2">
                    <Avatar src={child.avatar} name={child.name} size="sm" />
                    <div>
                      <p>{child.name}</p>
                      <p className="text-foreground-500 text-xs">
                        {child.grade}
                      </p>
                    </div>
                  </div>
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>

        {selectedChildData && (
          <>
            <div className="mb-6">
              <Card>
                <CardBody className="p-4">
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <Avatar
                      src={selectedChildData.avatar}
                      name={selectedChildData.name}
                      size="lg"
                      className="w-20 h-20"
                    />
                    <div className="flex-grow">
                      <h2 className="text-xl font-bold">
                        {selectedChildData.name}
                      </h2>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <div>
                          <p className="text-foreground-500 text-sm">Grade</p>
                          <p className="font-medium">
                            {selectedChildData.grade}
                          </p>
                        </div>
                        <div>
                          <p className="text-foreground-500 text-sm">Class</p>
                          <p className="font-medium">
                            {selectedChildData.class}
                          </p>
                        </div>
                        <div>
                          <p className="text-foreground-500 text-sm">
                            Class Teacher
                          </p>
                          <p className="font-medium">Ms. Ayesha Malik</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="flat"
                        color="primary"
                        startContent={<Icon icon="lucide:message-square" />}
                      >
                        Message Teacher
                      </Button>
                      <Button
                        variant="bordered"
                        startContent={<Icon icon="lucide:calendar" />}
                      >
                        Schedule Meeting
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            <Tabs
              aria-label="Parent dashboard tabs"
              selectedKey={selectedTab}
              onSelectionChange={setSelectedTab}
              className="mb-6"
            >
              <Tab key="overview" title="Overview" />
              <Tab key="attendance" title="Attendance" />
              <Tab key="grades" title="Grades" />
              <Tab key="assignments" title="Assignments" />
              <Tab key="announcements" title="Announcements" />
            </Tabs>

            {selectedTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardBody>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-foreground-500">
                          Attendance This Month
                        </p>
                        <h3 className="text-3xl font-bold mt-1">
                          {attendancePercentage}%
                        </h3>
                      </div>
                      <div
                        className={`p-2 rounded-lg ${
                          attendancePercentage >= 90
                            ? "bg-success-100"
                            : attendancePercentage >= 80
                            ? "bg-warning-100"
                            : "bg-danger-100"
                        }`}
                      >
                        <Icon
                          icon={
                            attendancePercentage >= 90
                              ? "lucide:check-circle"
                              : "lucide:alert-circle"
                          }
                          className={`text-xl ${
                            attendancePercentage >= 90
                              ? "text-success"
                              : attendancePercentage >= 80
                              ? "text-warning"
                              : "text-danger"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>
                          Present: {currentMonthAttendance.present} days
                        </span>
                        <span>
                          Absent: {currentMonthAttendance.absent} days
                        </span>
                        <span>Late: {currentMonthAttendance.late} days</span>
                      </div>
                      <Progress
                        value={attendancePercentage}
                        color={
                          attendancePercentage >= 90
                            ? "success"
                            : attendancePercentage >= 80
                            ? "warning"
                            : "danger"
                        }
                      />
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-foreground-500">Overall Grade</p>
                        <h3 className="text-3xl font-bold mt-1">A-</h3>
                      </div>
                      <div className="bg-primary-100 p-2 rounded-lg">
                        <Icon
                          icon="lucide:award"
                          className="text-primary text-xl"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Current Term</span>
                        <span className="text-success">Improved from B+</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1 mt-2">
                        <div className="bg-success h-2 rounded"></div>
                        <div className="bg-success h-2 rounded"></div>
                        <div className="bg-success h-2 rounded"></div>
                        <div className="bg-success-200 h-2 rounded"></div>
                        <div className="bg-success-100 h-2 rounded"></div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-foreground-500">
                          Pending Assignments
                        </p>
                        <h3 className="text-3xl font-bold mt-1">2</h3>
                      </div>
                      <div className="bg-warning-100 p-2 rounded-lg">
                        <Icon
                          icon="lucide:file-text"
                          className="text-warning text-xl"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Due this week</span>
                        <span className="text-warning">2 assignments</span>
                      </div>
                      <div className="text-xs text-foreground-500 mt-2">
                        Next due: Math Problem Set (Nov 18)
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card className="md:col-span-2">
                  <CardBody>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">
                        Recent Announcements
                      </h3>
                      <Button
                        size="sm"
                        variant="light"
                        endContent={<Icon icon="lucide:arrow-right" />}
                      >
                        View All
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {announcements.slice(0, 2).map((announcement) => (
                        <div
                          key={announcement.id}
                          className="border-b border-divider pb-4 last:border-0"
                        >
                          <div className="flex justify-between">
                            <h4 className="font-medium">
                              {announcement.title}
                            </h4>
                            <span className="text-xs text-foreground-500">
                              {new Date(announcement.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-foreground-600 mt-1 line-clamp-2">
                            {announcement.content}
                          </p>
                          <div className="mt-2 text-xs text-foreground-500">
                            From: {announcement.teacher}
                          </div>
                        </div>
                      ))}
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
                      >
                        View All
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {upcomingEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start gap-3 border-b border-divider pb-4 last:border-0"
                        >
                          <div className="bg-content2 rounded p-2 text-center min-w-[48px]">
                            <div className="text-xs text-foreground-500">
                              {new Date(event.date).toLocaleDateString(
                                "en-US",
                                { month: "short" }
                              )}
                            </div>
                            <div className="text-lg font-bold">
                              {new Date(event.date).getDate()}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-xs text-foreground-500 mt-1">
                              {event.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                <Card className="md:col-span-3">
                  <CardBody>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">
                        Subject Performance
                      </h3>
                    </div>
                    <Table removeWrapper aria-label="Subject performance table">
                      <TableHeader>
                        <TableColumn>SUBJECT</TableColumn>
                        <TableColumn>CURRENT GRADE</TableColumn>
                        <TableColumn>PREVIOUS GRADE</TableColumn>
                        <TableColumn>TEACHER</TableColumn>
                        <TableColumn>TREND</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {grades.map((grade, index) => (
                          <TableRow key={index}>
                            <TableCell>{grade.subject}</TableCell>
                            <TableCell>
                              <span className="font-medium">
                                {grade.currentGrade}
                              </span>
                            </TableCell>
                            <TableCell>{grade.previousGrade}</TableCell>
                            <TableCell>{grade.teacher}</TableCell>
                            <TableCell>
                              {grade.trend === "up" ? (
                                <Icon
                                  icon="lucide:trending-up"
                                  className="text-success"
                                />
                              ) : grade.trend === "down" ? (
                                <Icon
                                  icon="lucide:trending-down"
                                  className="text-danger"
                                />
                              ) : (
                                <Icon
                                  icon="lucide:minus"
                                  className="text-foreground-500"
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardBody>
                </Card>
              </div>
            )}

            {selectedTab === "attendance" && (
              <Card>
                <CardBody>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Attendance Record</h3>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          variant="bordered"
                          endContent={<Icon icon="lucide:chevron-down" />}
                        >
                          Last 3 Months
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Time period selection">
                        <DropdownItem key="last-month">Last Month</DropdownItem>
                        <DropdownItem key="last-3-months">
                          Last 3 Months
                        </DropdownItem>
                        <DropdownItem key="last-6-months">
                          Last 6 Months
                        </DropdownItem>
                        <DropdownItem key="current-term">
                          Current Term
                        </DropdownItem>
                        <DropdownItem key="academic-year">
                          Academic Year
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {attendanceData.map((month, index) => {
                      const total = month.present + month.absent + month.late;
                      const percentage = Math.round(
                        (month.present / total) * 100
                      );

                      return (
                        <Card key={index}>
                          <CardBody>
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold">
                                {month.month} 2024
                              </h4>
                              <span
                                className={`text-sm font-medium ${
                                  percentage >= 90
                                    ? "text-success"
                                    : percentage >= 80
                                    ? "text-warning"
                                    : "text-danger"
                                }`}
                              >
                                {percentage}%
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Present</span>
                                  <span>{month.present} days</span>
                                </div>
                                <Progress
                                  value={(month.present / total) * 100}
                                  color="success"
                                  size="sm"
                                />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Absent</span>
                                  <span>{month.absent} days</span>
                                </div>
                                <Progress
                                  value={(month.absent / total) * 100}
                                  color="danger"
                                  size="sm"
                                />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Late</span>
                                  <span>{month.late} days</span>
                                </div>
                                <Progress
                                  value={(month.late / total) * 100}
                                  color="warning"
                                  size="sm"
                                />
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">
                      Detailed Attendance Log
                    </h4>
                    <Table removeWrapper aria-label="Attendance log table">
                      <TableHeader>
                        <TableColumn>DATE</TableColumn>
                        <TableColumn>STATUS</TableColumn>
                        <TableColumn>REASON</TableColumn>
                        <TableColumn>REPORTED BY</TableColumn>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Nov 15, 2024</TableCell>
                          <TableCell>
                            <Chip color="success" size="sm">
                              Present
                            </Chip>
                          </TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>Ms. Ayesha Malik</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Nov 14, 2024</TableCell>
                          <TableCell>
                            <Chip color="success" size="sm">
                              Present
                            </Chip>
                          </TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>Ms. Ayesha Malik</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Nov 13, 2024</TableCell>
                          <TableCell>
                            <Chip color="warning" size="sm">
                              Late
                            </Chip>
                          </TableCell>
                          <TableCell>Traffic delay (15 min)</TableCell>
                          <TableCell>Ms. Ayesha Malik</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Nov 12, 2024</TableCell>
                          <TableCell>
                            <Chip color="success" size="sm">
                              Present
                            </Chip>
                          </TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>Ms. Ayesha Malik</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Nov 11, 2024</TableCell>
                          <TableCell>
                            <Chip color="success" size="sm">
                              Present
                            </Chip>
                          </TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>Ms. Ayesha Malik</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Nov 10, 2024</TableCell>
                          <TableCell>
                            <Chip color="danger" size="sm">
                              Absent
                            </Chip>
                          </TableCell>
                          <TableCell>Sick leave (Parent notified)</TableCell>
                          <TableCell>Ms. Ayesha Malik</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            )}

            {selectedTab === "grades" && (
              <Card>
                <CardBody>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">
                      Academic Performance
                    </h3>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          variant="bordered"
                          endContent={<Icon icon="lucide:chevron-down" />}
                        >
                          Current Term
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Term selection">
                        <DropdownItem key="term1">Term 1</DropdownItem>
                        <DropdownItem key="term2">Term 2</DropdownItem>
                        <DropdownItem key="term3">Term 3</DropdownItem>
                        <DropdownItem key="full-year">
                          Full Academic Year
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <Card>
                      <CardBody>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-foreground-500">Overall Grade</p>
                            <h3 className="text-3xl font-bold mt-1">A-</h3>
                          </div>
                          <div className="bg-primary-100 p-2 rounded-lg">
                            <Icon
                              icon="lucide:award"
                              className="text-primary text-xl"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Current Term</span>
                            <span className="text-success">
                              Improved from B+
                            </span>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardBody>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-foreground-500">Class Rank</p>
                            <h3 className="text-3xl font-bold mt-1">5th</h3>
                          </div>
                          <div className="bg-success-100 p-2 rounded-lg">
                            <Icon
                              icon="lucide:trending-up"
                              className="text-success text-xl"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Out of 30 students</span>
                            <span className="text-success">Up from 8th</span>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardBody>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-foreground-500">Highest Grade</p>
                            <h3 className="text-3xl font-bold mt-1">A+</h3>
                          </div>
                          <div className="bg-warning-100 p-2 rounded-lg">
                            <Icon
                              icon="lucide:star"
                              className="text-warning text-xl"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Computer Science</span>
                            <span className="text-warning">Consistent</span>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>

                  <div className="mb-8">
                    <h4 className="font-semibold mb-4">Subject Grades</h4>
                    <Table removeWrapper aria-label="Subject grades table">
                      <TableHeader>
                        <TableColumn>SUBJECT</TableColumn>
                        <TableColumn>CURRENT GRADE</TableColumn>
                        <TableColumn>PREVIOUS GRADE</TableColumn>
                        <TableColumn>TEACHER</TableColumn>
                        <TableColumn>TREND</TableColumn>
                        <TableColumn>ACTIONS</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {grades.map((grade, index) => (
                          <TableRow key={index}>
                            <TableCell>{grade.subject}</TableCell>
                            <TableCell>
                              <span className="font-medium">
                                {grade.currentGrade}
                              </span>
                            </TableCell>
                            <TableCell>{grade.previousGrade}</TableCell>
                            <TableCell>{grade.teacher}</TableCell>
                            <TableCell>
                              {grade.trend === "up" ? (
                                <Icon
                                  icon="lucide:trending-up"
                                  className="text-success"
                                />
                              ) : grade.trend === "down" ? (
                                <Icon
                                  icon="lucide:trending-down"
                                  className="text-danger"
                                />
                              ) : (
                                <Icon
                                  icon="lucide:minus"
                                  className="text-foreground-500"
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="flat">
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">Recent Assessments</h4>
                    <Table removeWrapper aria-label="Recent assessments table">
                      <TableHeader>
                        <TableColumn>ASSESSMENT</TableColumn>
                        <TableColumn>SUBJECT</TableColumn>
                        <TableColumn>DATE</TableColumn>
                        <TableColumn>SCORE</TableColumn>
                        <TableColumn>CLASS AVERAGE</TableColumn>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Mid-Term Exam</TableCell>
                          <TableCell>Mathematics</TableCell>
                          <TableCell>Nov 5, 2024</TableCell>
                          <TableCell>85%</TableCell>
                          <TableCell>78%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Chapter 7 Quiz</TableCell>
                          <TableCell>Science</TableCell>
                          <TableCell>Nov 3, 2024</TableCell>
                          <TableCell>92%</TableCell>
                          <TableCell>80%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Essay Assignment</TableCell>
                          <TableCell>English</TableCell>
                          <TableCell>Oct 28, 2024</TableCell>
                          <TableCell>A</TableCell>
                          <TableCell>B+</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Project Presentation</TableCell>
                          <TableCell>Social Studies</TableCell>
                          <TableCell>Oct 25, 2024</TableCell>
                          <TableCell>B+</TableCell>
                          <TableCell>B</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Coding Challenge</TableCell>
                          <TableCell>Computer Science</TableCell>
                          <TableCell>Oct 20, 2024</TableCell>
                          <TableCell>A+</TableCell>
                          <TableCell>B+</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            )}

            {selectedTab === "assignments" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Assignments</h3>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        variant="bordered"
                        endContent={<Icon icon="lucide:chevron-down" />}
                      >
                        All Assignments
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Assignment filter">
                      <DropdownItem key="all">All Assignments</DropdownItem>
                      <DropdownItem key="pending">Pending</DropdownItem>
                      <DropdownItem key="completed">Completed</DropdownItem>
                      <DropdownItem key="overdue">Overdue</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>

                <Card>
                  <CardBody>
                    <Table removeWrapper aria-label="Assignments table">
                      <TableHeader>
                        <TableColumn>SUBJECT</TableColumn>
                        <TableColumn>ASSIGNMENT</TableColumn>
                        <TableColumn>DUE DATE</TableColumn>
                        <TableColumn>TEACHER</TableColumn>
                        <TableColumn>STATUS</TableColumn>
                        <TableColumn>ACTIONS</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {assignments.map((assignment) => (
                          <TableRow key={assignment.id}>
                            <TableCell>{assignment.subject}</TableCell>
                            <TableCell>{assignment.title}</TableCell>
                            <TableCell>
                              {new Date(
                                assignment.dueDate
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{assignment.teacher}</TableCell>
                            <TableCell>
                              <Chip
                                color={
                                  assignment.status === "completed"
                                    ? "success"
                                    : "warning"
                                }
                                size="sm"
                              >
                                {assignment.status === "completed"
                                  ? "Completed"
                                  : "Pending"}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="flat">
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardBody>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardBody>
                      <h4 className="font-semibold mb-4">
                        Upcoming Assignments
                      </h4>
                      <div className="space-y-4">
                        {assignments
                          .filter((a) => a.status === "pending")
                          .map((assignment) => (
                            <div
                              key={assignment.id}
                              className="flex items-start gap-3 border-b border-divider pb-4 last:border-0"
                            >
                              <div className="bg-content2 rounded p-2 text-center min-w-[48px]">
                                <div className="text-xs text-foreground-500">
                                  {new Date(
                                    assignment.dueDate
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                  })}
                                </div>
                                <div className="text-lg font-bold">
                                  {new Date(assignment.dueDate).getDate()}
                                </div>
                              </div>
                              <div className="flex-grow">
                                <h5 className="font-medium">
                                  {assignment.title}
                                </h5>
                                <p className="text-xs text-foreground-500 mt-1">
                                  {assignment.subject} • {assignment.teacher}
                                </p>
                              </div>
                              <Chip color="warning" size="sm">
                                Due Soon
                              </Chip>
                            </div>
                          ))}
                      </div>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <h4 className="font-semibold mb-4">Recently Completed</h4>
                      <div className="space-y-4">
                        {assignments
                          .filter((a) => a.status === "completed")
                          .map((assignment) => (
                            <div
                              key={assignment.id}
                              className="flex items-start gap-3 border-b border-divider pb-4 last:border-0"
                            >
                              <div className="bg-content2 rounded p-2 text-center min-w-[48px]">
                                <div className="text-xs text-foreground-500">
                                  {new Date(
                                    assignment.dueDate
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                  })}
                                </div>
                                <div className="text-lg font-bold">
                                  {new Date(assignment.dueDate).getDate()}
                                </div>
                              </div>
                              <div className="flex-grow">
                                <h5 className="font-medium">
                                  {assignment.title}
                                </h5>
                                <p className="text-xs text-foreground-500 mt-1">
                                  {assignment.subject} • {assignment.teacher}
                                </p>
                              </div>
                              <Chip color="success" size="sm">
                                Completed
                              </Chip>
                            </div>
                          ))}
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </div>
            )}

            {selectedTab === "announcements" && (
              <div className="space-y-6">
                <Card>
                  <CardBody>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">
                        Recent Announcements
                      </h3>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            variant="bordered"
                            endContent={<Icon icon="lucide:chevron-down" />}
                          >
                            All Announcements
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Announcement filter">
                          <DropdownItem key="all">
                            All Announcements
                          </DropdownItem>
                          <DropdownItem key="class">
                            Class Specific
                          </DropdownItem>
                          <DropdownItem key="school">School-wide</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>

                    <div className="space-y-6">
                      {announcements.map((announcement) => (
                        <div
                          key={announcement.id}
                          className="border-b border-divider pb-6 last:border-0"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-lg font-medium">
                                {announcement.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1 text-sm text-foreground-500">
                                <span>
                                  {new Date(
                                    announcement.date
                                  ).toLocaleDateString()}
                                </span>
                                <span>•</span>
                                <span>{announcement.teacher}</span>
                              </div>
                            </div>
                          </div>
                          <p className="mt-3 text-foreground-700">
                            {announcement.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <h3 className="text-lg font-semibold mb-4">
                      Upcoming Events
                    </h3>
                    <div className="space-y-4">
                      {upcomingEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start gap-4 border-b border-divider pb-6 last:border-0"
                        >
                          <div className="bg-content2 rounded-lg p-3 text-center min-w-[80px]">
                            <div className="text-sm text-foreground-500">
                              {new Date(event.date).toLocaleDateString(
                                "en-US",
                                { month: "short" }
                              )}
                            </div>
                            <div className="text-2xl font-bold">
                              {new Date(event.date).getDate()}
                            </div>
                            <div className="text-xs text-foreground-500">
                              {new Date(event.date).getFullYear()}
                            </div>
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-lg font-medium">
                              {event.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-2 text-sm text-foreground-600">
                              <Icon
                                icon="lucide:clock"
                                className="text-foreground-400"
                              />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-foreground-600">
                              <Icon
                                icon="lucide:map-pin"
                                className="text-foreground-400"
                              />
                              <span>{event.location}</span>
                            </div>
                          </div>
                          <Button size="sm" variant="flat">
                            Add to Calendar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </ParentLayout>
  );
};

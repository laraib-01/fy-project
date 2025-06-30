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
  Textarea,
  Chip,
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
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import classService from "../../services/classService";

export const TeacherDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    isOpen: isAnnouncementModalOpen,
    onOpen: onAnnouncementModalOpen,
    onOpenChange: onAnnouncementModalOpenChange,
  } = useDisclosure();
  const {
    isOpen: isAttendanceModalOpen,
    onOpen: onAttendanceModalOpen,
    onOpenChange: onAttendanceModalOpenChange,
  } = useDisclosure();
  const {
    isOpen: isGradeModalOpen,
    onOpen: onGradeModalOpen,
    onOpenChange: onGradeModalOpenChange,
  } = useDisclosure();

  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [classes, setClasses] = useState([]);

  // Fetch all classes from the school using classService
  const fetchClasses = async () => {
    try {
      const response = await classService.getTeacherClasses();
      setClasses(response?.classes || []);
      if (response?.classes?.length > 0) {
        setSelectedClass(response?.classes[0].class_id);
      }
    } catch (error) {
      console.error("Error fetching school classes:", error);
      addToast({
        title: "Error",
        description:
          error.response?.data?.message || "Unable to load school classes.",
        color: "error",
      });
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const students = [
    {
      id: 1,
      name: "Ahmed Khan",
      attendance: "present",
      grade: "A",
      parentName: "Farooq Khan",
    },
    {
      id: 2,
      name: "Fatima Ali",
      attendance: "absent",
      grade: "B+",
      parentName: "Zainab Ali",
    },
    {
      id: 3,
      name: "Hassan Raza",
      attendance: "present",
      grade: "A-",
      parentName: "Imran Raza",
    },
    {
      id: 4,
      name: "Ayesha Malik",
      attendance: "late",
      grade: "B",
      parentName: "Saima Malik",
    },
    {
      id: 5,
      name: "Usman Ahmed",
      attendance: "present",
      grade: "C+",
      parentName: "Tariq Ahmed",
    },
    {
      id: 6,
      name: "Zara Siddiqui",
      attendance: "present",
      grade: "A",
      parentName: "Asif Siddiqui",
    },
    {
      id: 7,
      name: "Ibrahim Shah",
      attendance: "absent",
      grade: "B-",
      parentName: "Khalid Shah",
    },
    {
      id: 8,
      name: "Maryam Nawaz",
      attendance: "present",
      grade: "A+",
      parentName: "Yasir Nawaz",
    },
  ];

  const announcements = [
    {
      id: 1,
      title: "Parent-Teacher Meeting",
      content:
        "The parent-teacher meeting will be held on Friday, November 15th from 3:00 PM to 5:00 PM.",
      date: "2024-11-10",
      class: "All Classes",
    },
    {
      id: 2,
      title: "Math Quiz Postponed",
      content:
        "The math quiz scheduled for tomorrow has been postponed to next Monday due to the school event.",
      date: "2024-11-08",
      class: "Class 5-A",
    },
    {
      id: 3,
      title: "Science Project Deadline",
      content:
        "Reminder: Science project reports are due this Thursday. Please ensure all students submit their work on time.",
      date: "2024-11-05",
      class: "Class 6-B",
    },
  ];

  const assignments = [
    {
      id: 1,
      title: "English Essay",
      description: "Write a 500-word essay on 'My Favorite Book'",
      dueDate: "2024-11-20",
      class: "Class 5-A",
      status: "active",
    },
    {
      id: 2,
      title: "Math Problem Set",
      description: "Complete problems 1-15 from Chapter 7",
      dueDate: "2024-11-18",
      class: "Class 5-A",
      status: "active",
    },
    {
      id: 3,
      title: "Science Lab Report",
      description: "Submit the lab report for the plant growth experiment",
      dueDate: "2024-11-15",
      class: "Class 6-B",
      status: "active",
    },
    {
      id: 4,
      title: "History Timeline",
      description: "Create a timeline of major events from 1900-1950",
      dueDate: "2024-11-10",
      class: "Class 7-C",
      status: "completed",
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

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePostAnnouncement = () => {
    if (announcementTitle && announcementContent) {
      // In a real app, this would be an API call
      addToast({
        title: "Announcement Posted",
        description: "Your announcement has been successfully posted.",
        color: "success",
      });

      setAnnouncementTitle("");
      setAnnouncementContent("");
      onAnnouncementModalOpenChange(false);
    }
  };

  const handleMarkAttendance = () => {
    // In a real app, this would be an API call
    addToast({
      title: "Attendance Recorded",
      description: "Attendance has been successfully recorded for the class.",
      color: "success",
    });

    onAttendanceModalOpenChange(false);
  };

  const handleUpdateGrades = () => {
    // In a real app, this would be an API call
    addToast({
      title: "Grades Updated",
      description: "Student grades have been successfully updated.",
      color: "success",
    });

    onGradeModalOpenChange(false);
  };

  return (
    <>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
            <p className="text-foreground-600">
              Manage your classes, students, and communications
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  endContent={<Icon icon="lucide:chevron-down" />}
                >
                  {classes?.find(
                    (c) => c?.class_id.toString() === selectedClass.toString()
                  )?.class_name || "Select Class"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Class selection"
                onAction={(key) => setSelectedClass(key)}
              >
                {classes?.map((cls) => (
                  <DropdownItem key={cls.class_id}>
                    {cls.class_name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Button
              color="primary"
              startContent={<Icon icon="lucide:plus" />}
              onPress={onAnnouncementModalOpen}
            >
              New Announcement
            </Button>
          </div>
        </div>

        <Tabs
          aria-label="Teacher dashboard tabs"
          selectedKey={selectedTab}
          onSelectionChange={setSelectedTab}
          className="mb-6"
        >
          <Tab key="overview" title="Overview" />
          <Tab key="students" title="Students" />
          <Tab key="announcements" title="Announcements" />
          <Tab key="assignments" title="Assignments" />
          <Tab key="events" title="Events" />
        </Tabs>

        {selectedTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardBody>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-foreground-500">Total Students</p>
                    <h3 className="text-3xl font-bold mt-1">
                      {students.length}
                    </h3>
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
                  <span className="text-success font-medium">2 new</span>
                  <span className="text-foreground-500 ml-1">this month</span>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-foreground-500">Attendance Rate</p>
                    <h3 className="text-3xl font-bold mt-1">87%</h3>
                  </div>
                  <div className="bg-success-100 p-2 rounded-lg">
                    <Icon
                      icon="lucide:check-circle"
                      className="text-success text-xl"
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Icon icon="lucide:arrow-down" className="text-danger mr-1" />
                  <span className="text-danger font-medium">3%</span>
                  <span className="text-foreground-500 ml-1">
                    from last week
                  </span>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-foreground-500">Pending Tasks</p>
                    <h3 className="text-3xl font-bold mt-1">5</h3>
                  </div>
                  <div className="bg-warning-100 p-2 rounded-lg">
                    <Icon
                      icon="lucide:alert-circle"
                      className="text-warning text-xl"
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Icon icon="lucide:arrow-up" className="text-danger mr-1" />
                  <span className="text-danger font-medium">2 more</span>
                  <span className="text-foreground-500 ml-1">
                    than yesterday
                  </span>
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
                  {announcements.slice(0, 3).map((announcement) => (
                    <div
                      key={announcement.id}
                      className="border-b border-divider pb-4 last:border-0"
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium">{announcement.title}</h4>
                        <span className="text-xs text-foreground-500">
                          {new Date(announcement.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground-600 mt-1 line-clamp-2">
                        {announcement.content}
                      </p>
                      <div className="mt-2">
                        <Chip size="sm" variant="flat">
                          {announcement.class}
                        </Chip>
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
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 border-b border-divider pb-4 last:border-0"
                    >
                      <div className="bg-content2 rounded p-2 text-center min-w-[48px]">
                        <div className="text-xs text-foreground-500">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                          })}
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
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    className="h-auto py-4 flex-col"
                    variant="flat"
                    onPress={onAttendanceModalOpen}
                  >
                    <Icon
                      icon="lucide:clipboard-check"
                      className="text-2xl mb-2"
                    />
                    <span>Mark Attendance</span>
                  </Button>
                  <Button
                    className="h-auto py-4 flex-col"
                    variant="flat"
                    onPress={onGradeModalOpen}
                  >
                    <Icon icon="lucide:award" className="text-2xl mb-2" />
                    <span>Update Grades</span>
                  </Button>
                  <Button className="h-auto py-4 flex-col" variant="flat">
                    <Icon icon="lucide:file-text" className="text-2xl mb-2" />
                    <span>Create Assignment</span>
                  </Button>
                  <Button className="h-auto py-4 flex-col" variant="flat">
                    <Icon
                      icon="lucide:calendar-plus"
                      className="text-2xl mb-2"
                    />
                    <span>Schedule Event</span>
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {selectedTab === "students" && (
          <Card>
            <CardBody>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <h3 className="text-lg font-semibold">
                  Students in{" "}
                  {classes.find((c) => c.id === selectedClass)?.name}
                </h3>
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  startContent={
                    <Icon
                      icon="lucide:search"
                      className="text-foreground-400"
                    />
                  }
                  className="w-full md:w-64"
                />
              </div>

              <Table removeWrapper aria-label="Students table">
                <TableHeader>
                  <TableColumn>NAME</TableColumn>
                  <TableColumn>PARENT</TableColumn>
                  <TableColumn>ATTENDANCE</TableColumn>
                  <TableColumn>GRADE</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.parentName}</TableCell>
                      <TableCell>
                        <Chip
                          color={
                            student.attendance === "present"
                              ? "success"
                              : student.attendance === "absent"
                              ? "danger"
                              : "warning"
                          }
                          size="sm"
                        >
                          {student.attendance}
                        </Chip>
                      </TableCell>
                      <TableCell>{student.grade}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="flat" isIconOnly>
                            <Icon icon="lucide:message-square" />
                          </Button>
                          <Button size="sm" variant="flat" isIconOnly>
                            <Icon icon="lucide:edit" />
                          </Button>
                          <Button size="sm" variant="flat" isIconOnly>
                            <Icon icon="lucide:more-vertical" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        )}

        {selectedTab === "announcements" && (
          <div className="space-y-6">
            <Card>
              <CardBody>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Recent Announcements
                  </h3>
                  <Button
                    color="primary"
                    onPress={onAnnouncementModalOpen}
                    startContent={<Icon icon="lucide:plus" />}
                  >
                    New Announcement
                  </Button>
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
                              {new Date(announcement.date).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <Chip size="sm" variant="flat">
                              {announcement.class}
                            </Chip>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="flat" isIconOnly>
                            <Icon icon="lucide:edit-2" />
                          </Button>
                          <Button
                            size="sm"
                            variant="flat"
                            isIconOnly
                            color="danger"
                          >
                            <Icon icon="lucide:trash-2" />
                          </Button>
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
          </div>
        )}

        {selectedTab === "assignments" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Assignments</h3>
              <Button
                color="primary"
                startContent={<Icon icon="lucide:plus" />}
              >
                Create Assignment
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardBody>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-medium">
                          {assignment.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-sm text-foreground-500">
                          <span>
                            Due:{" "}
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <Chip size="sm" variant="flat">
                            {assignment.class}
                          </Chip>
                        </div>
                      </div>
                      <Chip
                        color={
                          assignment.status === "active" ? "primary" : "success"
                        }
                        size="sm"
                      >
                        {assignment.status === "active"
                          ? "Active"
                          : "Completed"}
                      </Chip>
                    </div>
                    <p className="mt-3 text-foreground-700">
                      {assignment.description}
                    </p>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-foreground-500">
                        <span>Submissions: 12/24</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="flat">
                          View Submissions
                        </Button>
                        <Button size="sm" variant="flat" isIconOnly>
                          <Icon icon="lucide:more-vertical" />
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}

        {selectedTab === "events" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Upcoming Events</h3>
              <Button
                color="primary"
                startContent={<Icon icon="lucide:plus" />}
              >
                Add Event
              </Button>
            </div>

            <Card>
              <CardBody>
                <div className="space-y-6">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-4 border-b border-divider pb-6 last:border-0"
                    >
                      <div className="bg-content2 rounded-lg p-3 text-center min-w-[80px]">
                        <div className="text-sm text-foreground-500">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                          })}
                        </div>
                        <div className="text-2xl font-bold">
                          {new Date(event.date).getDate()}
                        </div>
                        <div className="text-xs text-foreground-500">
                          {new Date(event.date).getFullYear()}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-lg font-medium">{event.title}</h4>
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
                      <div className="flex gap-1">
                        <Button size="sm" variant="flat" isIconOnly>
                          <Icon icon="lucide:edit-2" />
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          isIconOnly
                          color="danger"
                        >
                          <Icon icon="lucide:trash-2" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>

      {/* Announcement Modal */}
      <Modal
        isOpen={isAnnouncementModalOpen}
        onOpenChange={onAnnouncementModalOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Create Announcement
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Title"
                  placeholder="Enter announcement title"
                  value={announcementTitle}
                  onValueChange={setAnnouncementTitle}
                />
                <Textarea
                  label="Content"
                  placeholder="Enter announcement content"
                  value={announcementContent}
                  onValueChange={setAnnouncementContent}
                  minRows={4}
                />
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      variant="bordered"
                      className="w-full justify-start"
                      endContent={<Icon icon="lucide:chevron-down" />}
                    >
                      {classes.find((c) => c.id === selectedClass)?.name ||
                        "Select Class"}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Class selection"
                    onAction={(key) => setSelectedClass(key)}
                  >
                    <DropdownItem key="all-classes">All Classes</DropdownItem>
                    {classes.map((cls) => (
                      <DropdownItem key={cls.id}>{cls.name}</DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handlePostAnnouncement}>
                  Post Announcement
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Attendance Modal */}
      <Modal
        isOpen={isAttendanceModalOpen}
        onOpenChange={onAttendanceModalOpenChange}
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Mark Attendance
              </ModalHeader>
              <ModalBody>
                <div className="flex justify-between items-center mb-4">
                  <h3>
                    {classes.find((c) => c.id === selectedClass)?.name ||
                      "Select Class"}
                  </h3>
                  <p className="text-foreground-500">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
                <Table removeWrapper aria-label="Attendance table">
                  <TableHeader>
                    <TableColumn>STUDENT</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              color={
                                student.attendance === "present"
                                  ? "success"
                                  : "default"
                              }
                              variant={
                                student.attendance === "present"
                                  ? "solid"
                                  : "bordered"
                              }
                            >
                              Present
                            </Button>
                            <Button
                              size="sm"
                              color={
                                student.attendance === "absent"
                                  ? "danger"
                                  : "default"
                              }
                              variant={
                                student.attendance === "absent"
                                  ? "solid"
                                  : "bordered"
                              }
                            >
                              Absent
                            </Button>
                            <Button
                              size="sm"
                              color={
                                student.attendance === "late"
                                  ? "warning"
                                  : "default"
                              }
                              variant={
                                student.attendance === "late"
                                  ? "solid"
                                  : "bordered"
                              }
                            >
                              Late
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleMarkAttendance}>
                  Save Attendance
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Grade Modal */}
      <Modal
        isOpen={isGradeModalOpen}
        onOpenChange={onGradeModalOpenChange}
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Update Grades
              </ModalHeader>
              <ModalBody>
                <div className="flex justify-between items-center mb-4">
                  <h3>
                    {classes.find((c) => c.id === selectedClass)?.name ||
                      "Select Class"}
                  </h3>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        variant="bordered"
                        endContent={<Icon icon="lucide:chevron-down" />}
                      >
                        Math Quiz #3
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Assessment selection">
                      <DropdownItem key="quiz1">Math Quiz #1</DropdownItem>
                      <DropdownItem key="quiz2">Math Quiz #2</DropdownItem>
                      <DropdownItem key="quiz3">Math Quiz #3</DropdownItem>
                      <DropdownItem key="midterm">Midterm Exam</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
                <Table removeWrapper aria-label="Grades table">
                  <TableHeader>
                    <TableColumn>STUDENT</TableColumn>
                    <TableColumn>GRADE</TableColumn>
                    <TableColumn>COMMENTS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>
                          <Input
                            size="sm"
                            defaultValue={student.grade}
                            className="max-w-[100px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Input size="sm" placeholder="Add comments..." />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleUpdateGrades}>
                  Save Grades
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

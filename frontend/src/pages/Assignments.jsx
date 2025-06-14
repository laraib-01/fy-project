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

export const Assignments = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedClass, setSelectedClass] = useState("class-1");
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

  const classes = [
    { id: "class-1", name: "Class 5-A" },
    { id: "class-2", name: "Class 6-B" },
    { id: "class-3", name: "Class 7-C" },
  ];

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
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-foreground-600">Manage your assignments</p>
        </div>

        <Button color="primary" startContent={<Icon icon="lucide:plus" />}>
          Create Assignment
        </Button>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardBody>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium">{assignment.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-foreground-500">
                      <span>
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
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
                    {assignment.status === "active" ? "Active" : "Completed"}
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
    </div>
  );
};

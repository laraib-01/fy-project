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
import axios from "axios";
import classService from "../services/classService";

export const Students = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all classes from the school using classService
  const fetchClasses = async () => {
    try {
      const response = await classService.getSchoolClasses();
      
      // Transform the response to match the expected format
      const formattedClasses = response?.data?.classes?.map(cls => ({
        id: cls.class_id,
        name: cls.class_name,
        ...cls
      })) || [];
      
      setClasses(formattedClasses);
      
      // Select first class by default if available
      if (formattedClasses.length > 0) {
        setSelectedClass(formattedClasses[0].id);
      }
    } catch (error) {
      console.error("Error fetching school classes:", error);
      addToast({
        title: "Error",
        description: error.response?.data?.message || "Unable to load school classes.",
        status: "error",
      });
    }
  };

  // Fetch students of selected class
  const fetchStudents = async () => {
    if (!selectedClass) return;
    try {
      setIsLoading(true);
      const token = localStorage.getItem("educonnect_token");
      const response = await axios.get(
        `http://localhost:5000/api/students/class/${selectedClass}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Transform the response to match the expected format
      const formattedStudents = response.data?.data?.students?.map(student => ({
        id: student.student_id,
        name: student.name,
        ...student
      })) || [];
      
      setStudents(formattedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      addToast({
        title: "Error",
        description: "Unable to load students.",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  const filteredStudents = students.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.parentName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-foreground-600">Manage your students</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                endContent={<Icon icon="lucide:chevron-down" />}
              >
                {classes?.find((c) => c?.id === selectedClass)?.name ||
                  "Select Class"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Class selection"
              onAction={(key) => setSelectedClass(key)}
            >
              {classes.map((cls) => (
                <DropdownItem key={cls.id}>{cls.name}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h3 className="text-lg font-semibold">
              Students in {classes.find((c) => c.id === selectedClass)?.name}
            </h3>
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={
                <Icon icon="lucide:search" className="text-foreground-400" />
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
    </div>
  );
};

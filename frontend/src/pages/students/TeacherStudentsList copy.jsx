import React, { useEffect, useState } from "react";
import {
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
  Select,
  SelectItem,
  Badge,
  DateInput,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import axios from "axios";
import classService from "../../services/classService";
import studentService from "../../services/studentService";
import {
  parseDate,
  parseTime,
  parseZonedDateTime,
} from "@internationalized/date";

export const TeacherStudentsListCopy = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState({});
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);

  console.log("students", students);

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

  // Fetch students of selected class
  const fetchStudents = async () => {
    if (!selectedClass) return;
    try {
      setIsLoading(true);
      const response = await studentService.getStudentsByClass(selectedClass);
      const studentsList = response?.students || [];
      setStudents(studentsList);

      // Initialize attendance status for all students
      const initialStatus = {};
      studentsList.forEach((student) => {
        initialStatus[student.id] = true; // Default to present
      });
      setAttendanceStatus(initialStatus);

      // Load today's attendance if available
      loadAttendanceForDate(attendanceDate);
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

  // Load attendance for a specific date
  const loadAttendanceForDate = async (date) => {
    if (!selectedClass) return;

    try {
      setIsLoadingAttendance(true);
      // This would be replaced with actual API call to fetch attendance
      // const response = await studentService.getAttendanceByDate(selectedClass, date);
      // setAttendanceHistory(prev => ({
      //   ...prev,
      //   [date]: response.attendance
      // }));
      //
      // // Update attendance status for the current view
      // const statusUpdate = {};
      // response.attendance.forEach(record => {
      //   statusUpdate[record.studentId] = record.status === 'present';
      // });
      // setAttendanceStatus(prev => ({
      //   ...prev,
      //   ...statusUpdate
      // }));
    } catch (error) {
      console.error("Error loading attendance:", error);
      addToast({
        title: "Error",
        description: "Unable to load attendance data.",
        status: "error",
      });
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  // Handle attendance status change
  const handleAttendanceChange = (studentId, isPresent) => {
    setAttendanceStatus((prev) => ({
      ...prev,
      [studentId]: isPresent,
    }));
  };

  // Submit attendance
  const submitAttendance = async () => {
    if (!selectedClass) return;

    try {
      setIsSubmitting(true);
      const attendanceData = Object.entries(attendanceStatus).map(
        ([studentId, isPresent]) => ({
          studentId,
          status: isPresent ? "present" : "absent",
          date: attendanceDate,
          classId: selectedClass,
        })
      );

      // This would be replaced with actual API call
      // await studentService.submitAttendance(attendanceData);

      // Update local state
      setAttendanceHistory((prev) => ({
        ...prev,
        [attendanceDate]: attendanceData,
      }));

      addToast({
        title: "Success",
        description: "Attendance recorded successfully!",
        status: "success",
      });

      setShowMarkAttendance(false);
    } catch (error) {
      console.error("Error submitting attendance:", error);
      addToast({
        title: "Error",
        description: "Failed to record attendance. Please try again.",
        status: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle all students' attendance
  const toggleAllAttendance = (isPresent) => {
    const newStatus = {};
    students.forEach((student) => {
      newStatus[student.id] = isPresent;
    });
    setAttendanceStatus(newStatus);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  const filteredStudents = students?.filter(
    (student) =>
      student.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-foreground-600">Manage your students</p>
        </div>
        <div className="flex gap-2">
          <Select
            label="Select Class"
            selectedKeys={selectedClass ? [selectedClass] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0];
              setSelectedClass(selected);
            }}
            className="w-48"
          >
            {classes.map((classItem) => (
              <SelectItem key={classItem.class_id} value={classItem.class_id}>
                {classItem.class_name}
              </SelectItem>
            ))}
          </Select>
          <Button
            color="primary"
            onPress={() => setShowMarkAttendance(true)}
            endContent={<Icon icon="mdi:clipboard-check" />}
          >
            Mark Attendance
          </Button>
        </div>
      </div>

      <Card>
        <CardBody>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table aria-label="Students list">
              <TableHeader>
                <TableColumn>ID</TableColumn>
                <TableColumn>Name</TableColumn>
                <TableColumn>Roll Number</TableColumn>
                <TableColumn>Today's Status</TableColumn>
                <TableColumn>Actions</TableColumn>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.id}</TableCell>
                    <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                    <TableCell>{student.roll_number || "N/A"}</TableCell>
                    <TableCell>
                      {attendanceHistory[attendanceDate]?.find(
                        (a) => a.studentId === student.id
                      ) ? (
                        <Badge
                          color={
                            attendanceStatus[student.id] ? "success" : "danger"
                          }
                          variant="flat"
                        >
                          {attendanceStatus[student.id] ? "Present" : "Absent"}
                        </Badge>
                      ) : (
                        <Badge color="warning" variant="flat">
                          Not Marked
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button isIconOnly size="sm" variant="light">
                        <Icon icon="mdi:eye" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Attendance Modal */}
      <Modal
        isOpen={showMarkAttendance}
        onClose={() => setShowMarkAttendance(false)}
        size="4xl"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Mark Attendance - {new Date(attendanceDate).toLocaleDateString()}
          </ModalHeader>
          <ModalBody>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                {/* <DateInput
                  label="Attendance Date"
                  value={attendanceDate}
                  onChange={(date) => {
                    setAttendanceDate(date);
                    loadAttendanceForDate(date);
                  }}
                /> */}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  color="success"
                  variant="flat"
                  onPress={() => toggleAllAttendance(true)}
                >
                  Mark All Present
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  onPress={() => toggleAllAttendance(false)}
                >
                  Mark All Absent
                </Button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-96">
              <Table aria-label="Attendance list">
                <TableHeader>
                  <TableColumn>Name</TableColumn>
                  <TableColumn>Roll Number</TableColumn>
                  <TableColumn>Status</TableColumn>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                      <TableCell>{student.roll_number || "N/A"}</TableCell>
                      <TableCell>
                        {/* <Toggle
                          isSelected={attendanceStatus[student.id] !== false}
                          onChange={(isSelected) => 
                            handleAttendanceChange(student.id, isSelected)
                          }
                          color="success"
                        >
                          {attendanceStatus[student.id] !== false ? 'Present' : 'Absent'}
                        </Toggle> */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setShowMarkAttendance(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={submitAttendance}
              isLoading={isSubmitting}
            >
              Save Attendance
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

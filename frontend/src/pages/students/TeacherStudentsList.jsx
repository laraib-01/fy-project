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
  DateInput,
  Select,
  SelectItem,
  ToastProvider,
  Badge,
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

export const TeacherStudentsList = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [attendanceHistory, setAttendanceHistory] = useState({});
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: parseDate(new Date().toISOString().split("T")[0]),
    end: parseDate(new Date().toISOString().split("T")[0]),
  });

  console.log("attendanceStatus", attendanceStatus);
  const {
    isOpen: isAttendanceModalOpen,
    onOpen: onAttendanceModalOpen,
    onOpenChange: onAttendanceModalOpenChange,
  } = useDisclosure();

  console.log("students", students);

  useEffect(() => {
    let parsedEnrollmentDate;

    try {
      const enrollmentDateTime = parseZonedDateTime(
        new Date().toISOString().split("T")[0]
      );
      parsedEnrollmentDate = enrollmentDateTime.toCalendarDate();
    } catch (error) {
      parsedEnrollmentDate = parseDate(new Date().toISOString().split("T")[0]);
    }
    setAttendanceDate(parsedEnrollmentDate);
  }, []);

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
        initialStatus[student.student_id] = "Present"; // Default to present
      });
      setAttendanceStatus(initialStatus);

      // Load today's attendance
      await loadAttendanceForDate(attendanceDate);
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
      const response = await studentService.getAttendanceByDate(
        selectedClass,
        date
      );

      console.log("response", response);
      setAttendanceHistory((prev) => ({
        ...prev,
        [date]: response?.attendance || [],
      }));

      // Update attendance status for the current view
      const statusUpdate = {};
      response?.attendance?.forEach((record) => {
        statusUpdate[record.studentId] = record.status;
      });
      setAttendanceStatus((prev) => ({
        ...prev,
        ...statusUpdate,
      }));
    } catch (error) {
      console.error("Error loading attendance:", error);
      addToast({
        title: "Error",
        description:
          error.response?.data?.message || "Unable to load attendance data.",
        color: "error",
      });
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  // Handle attendance status change
  const handleAttendanceChange = (studentId, status) => {
    setAttendanceStatus((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  function formatDate(date) {
    return `${date.year}-${String(date.month).padStart(2, "0")}-${String(
      date.day
    ).padStart(2, "0")}`;
  }

  // Submit attendance
  const submitAttendance = async () => {
    if (!selectedClass) return;

    try {
      setIsSubmitting(true);
      const attendanceData = Object.entries(attendanceStatus).map(
        ([studentId, status]) => ({
          studentId,
          status,
          date: formatDate(attendanceDate),
          classId: selectedClass,
        })
      );

      await studentService.submitAttendance(selectedClass, {
        date: formatDate(attendanceDate),
        attendanceData,
      });

      // Update local state
      setAttendanceHistory((prev) => ({
        ...prev,
        [attendanceDate]: attendanceData,
      }));

      addToast({
        title: "Success",
        description: "Attendance recorded successfully!",
        color: "success",
      });

      onAttendanceModalOpenChange(false);
    } catch (error) {
      console.error("Error submitting attendance:", error);
      addToast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to record attendance.",
        color: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle all students' attendance
  const toggleAllAttendance = (status) => {
    const newStatus = {};
    students.forEach((student) => {
      newStatus[student.student_id] = status;
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

  const getAttendanceBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "present":
        return <Badge color="success">Present</Badge>;
      case "absent":
        return <Badge color="danger">Absent</Badge>;
      case "late":
        return <Badge color="warning">Late</Badge>;
      default:
        return <Badge color="default">Not Marked</Badge>;
    }
  };

  const getAttendanceButtonVariant = (studentId, status) => {
    return attendanceStatus[studentId]?.toLowerCase() === status.toLowerCase()
      ? "solid"
      : "bordered";
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

  return (
    <>
      <ToastProvider placement="bottom-center" toastOffset={0} />
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
          </div>
        </div>

        <Card>
          <CardBody>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <h3 className="text-lg font-semibold">
                Students in{" "}
                {
                  classes?.find(
                    (c) => c.class_id.toString() === selectedClass.toString()
                  )?.class_name
                }
              </h3>
              <div className="flex flex-wrap gap-2">
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
                  className="w-full md:w-80"
                />
                <Button
                  color="primary"
                  onPress={onAttendanceModalOpen}
                  endContent={<Icon icon="mdi:clipboard-check" />}
                >
                  Mark Attendance
                </Button>
              </div>
            </div>

            <Table removeWrapper aria-label="Students table">
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>ROLL NUMBER</TableColumn>
                <TableColumn>PHONE NUMBER</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredStudents?.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      {student.first_name} {student.last_name}
                    </TableCell>
                    <TableCell>{student.roll_number || "N/A"}</TableCell>
                    <TableCell>{student.phone_number || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      {/* Attendance Modal */}
      <Modal
        isOpen={isAttendanceModalOpen}
        onOpenChange={onAttendanceModalOpenChange}
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Mark Attendance for{" "}
                {classes?.find((c) => c.class_id === selectedClass)
                  ?.class_name || "Select Class"}
              </ModalHeader>
              <ModalBody>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-foreground-500">
                    {new Date().toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      color="success"
                      variant="bordered"
                      onPress={() => toggleAllAttendance("Present")}
                    >
                      Mark All Present
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="bordered"
                      onPress={() => toggleAllAttendance("Absent")}
                    >
                      Mark All Absent
                    </Button>
                  </div>
                </div>

                <Table removeWrapper aria-label="Attendance table">
                  <TableHeader>
                    <TableColumn>STUDENT</TableColumn>
                    <TableColumn>ROLL NUMBER</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {students?.map((student) => (
                      <TableRow key={student.student_id}>
                        <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                        <TableCell>{student.roll_number || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              color={
                                getAttendanceButtonVariant(
                                  student.student_id,
                                  "Present"
                                ) === "solid"
                                  ? "success"
                                  : "default"
                              }
                              variant={getAttendanceButtonVariant(
                                student.student_id,
                                "Present"
                              )}
                              onPress={() =>
                                handleAttendanceChange(
                                  student.student_id,
                                  "Present"
                                )
                              }
                            >
                              Present
                            </Button>
                            <Button
                              size="sm"
                              color={
                                getAttendanceButtonVariant(
                                  student.student_id,
                                  "Absent"
                                ) === "solid"
                                  ? "danger"
                                  : "default"
                              }
                              variant={getAttendanceButtonVariant(
                                student.student_id,
                                "Absent"
                              )}
                              onPress={() =>
                                handleAttendanceChange(
                                  student.student_id,
                                  "Absent"
                                )
                              }
                            >
                              Absent
                            </Button>
                            <Button
                              size="sm"
                              color={
                                getAttendanceButtonVariant(
                                  student.student_id,
                                  "Late"
                                ) === "solid"
                                  ? "warning"
                                  : "default"
                              }
                              variant={getAttendanceButtonVariant(
                                student.student_id,
                                "Late"
                              )}
                              onPress={() =>
                                handleAttendanceChange(
                                  student.student_id,
                                  "Late"
                                )
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
                <Button
                  variant="flat"
                  onPress={onClose}
                  isDisabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={submitAttendance}
                  isLoading={isSubmitting}
                  isDisabled={isSubmitting || !students.length}
                >
                  Save Attendance
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

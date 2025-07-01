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
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import axios from "axios";
import classService from "../../services/classService";
import studentService from "../../services/studentService";
import { parseDate, parseZonedDateTime } from "@internationalized/date";

export const AdminStudentsList = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onOpenChange: onAddModalOpenChange,
  } = useDisclosure();

  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onOpenChange: onDeleteModalOpenChange,
  } = useDisclosure();

  console.log("students", students);

  const [formData, setFormData] = useState({
    // Student Information
    rollNumber: "",
    firstName: "",
    lastName: "",
    dateOfBirth: null,
    gender: "",
    address: "",
    phoneNumber: "",
    enrollmentDate: null,
    // Parent Information
    parentFirstName: "",
    parentLastName: "",
    parentEmail: "",
    parentPhone: "",
    parentAddress: "",
    parentPassword: "parent123", // Default password, can be changed by admin
    parentGender: "",
    parentId: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState(null);

  // Fetch all classes from the school using classService
  const fetchClasses = async () => {
    try {
      const response = await classService.getSchoolClasses();
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
      console.log("response", response);
      setStudents(response?.students || []);
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

  const resetForm = () => {
    setFormData({
      // Student Information
      rollNumber: "",
      firstName: "",
      lastName: "",
      dateOfBirth: null,
      gender: "",
      address: "",
      phoneNumber: "",
      enrollmentDate: null,
      // Parent Information
      parentFirstName: "",
      parentLastName: "",
      parentEmail: "",
      parentPhone: "",
      parentAddress: "",
      parentPassword: "parent123",
      parentGender: "",
      parentId: null,
    });
    setIsEditing(false);
    setCurrentStudentId(null);
  };

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  function formatDate(date) {
    return `${date.year}-${String(date.month).padStart(2, "0")}-${String(
      date.day
    ).padStart(2, "0")}`;
  }

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // Validate student fields
    const requiredStudentFields = [
      "rollNumber",
      "firstName",
      "lastName",
      "dateOfBirth",
      "gender",
      "address",
      "phoneNumber",
      "enrollmentDate",
    ];

    // Only require parent fields when not editing or when adding a new student
    const requiredParentFields = !isEditing
      ? [
          "parentFirstName",
          "parentLastName",
          "parentEmail",
          "parentPhone",
          "parentGender",
        ]
      : [];

    const missingFields = [
      ...requiredStudentFields.filter((field) => !formData[field]),
      ...requiredParentFields.filter((field) => !formData[field]),
    ];

    if (missingFields.length > 0) {
      addToast({
        title: "Missing Fields",
        description: `Please fill all required fields: ${missingFields.join(
          ", "
        )}`,
        color: "warning",
      });
      return;
    }

    // Prepare parent data
    const parentData = !isEditing
      ? {
          first_name: formData.parentFirstName,
          last_name: formData.parentLastName,
          email: formData.parentEmail,
          phone_number: formData.parentPhone,
          address: formData.parentAddress || formData.address, // Use student address if parent address not provided
          gender: formData.parentGender,
          password: formData.parentPassword,
          role: "Parent",
        }
      : null;

    // Prepare student payload
    const payload = {
      class_id: selectedClass,
      roll_number: formData.rollNumber,
      first_name: formData.firstName,
      last_name: formData.lastName,
      date_of_birth: formatDate(formData.dateOfBirth),
      gender: formData.gender,
      address: formData.address,
      phone_number: formData.phoneNumber,
      enrollment_date: formatDate(formData.enrollmentDate),
      // Include parent data when adding new student
      ...(!isEditing && { parent: parentData }),
      // Include parent_id when editing
      ...(isEditing && formData.parentId && { parent_id: formData.parentId }),
    };

    console.log("payload", payload);

    try {
      setIsSubmitting(true);

      if (isEditing && currentStudentId) {
        await studentService.updateStudent(currentStudentId, payload);
        addToast({
          description: "Student updated successfully",
          color: "success",
        });
      } else {
        await studentService.addStudent(payload);
        addToast({
          description: "Student created successfully",
          color: "success",
        });
      }

      resetForm();
      fetchStudents();
      onAddModalOpenChange(false);
    } catch (error) {
      console.error("Error saving teacher:", error.message);
      addToast({
        description: error.data?.message || "Failed to save event",
        color: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStudent = (student) => {
    let parsedEnrollmentDate;
    let parsedDateOfBirth;

    try {
      const enrollmentDateTime = parseZonedDateTime(student.enrollment_date);
      const dateOfBirthDateTime = parseZonedDateTime(student.date_of_birth);
      parsedEnrollmentDate = enrollmentDateTime.toCalendarDate();
      parsedDateOfBirth = dateOfBirthDateTime.toCalendarDate();
    } catch (error) {
      parsedEnrollmentDate = parseDate(student.enrollment_date.split("T")[0]);
      parsedDateOfBirth = parseDate(student.date_of_birth.split("T")[0]);
    }

    setFormData({
      rollNumber: student.roll_number || "",
      firstName: student.first_name || "",
      lastName: student.last_name || "",
      dateOfBirth: parsedDateOfBirth,
      gender: student.gender?.toLowerCase() || "",
      address: student.address || "",
      phoneNumber: student.phone_number || "",
      enrollmentDate: parsedEnrollmentDate,
      parentId: student.parent_id || null,
    });
    setCurrentStudentId(student.student_id);
    setIsEditing(true);
    onAddModalOpen();
  };

  const handleDeleteStudent = async () => {
    try {
      setIsLoading(true);
      await studentService.deleteStudent(currentStudentId);
      addToast({
        description: "Student deleted successfully",
        color: "success",
      });
      fetchStudents();
      onDeleteModalOpenChange(false);
    } catch (error) {
      console.error("Error deleting student:", error);
      addToast({
        description: error.message || "Failed to delete student",
        color: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students?.filter(
    (student) =>
      student.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  className="w-full md:w-64"
                />
                <Button
                  color="primary"
                  startContent={<Icon icon="lucide:plus" />}
                  onPress={() => {
                    resetForm();
                    onAddModalOpen();
                  }}
                >
                  Add Students
                </Button>
              </div>
            </div>

            <Table removeWrapper aria-label="Students table">
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>PARENT</TableColumn>
                <TableColumn>ENROLLMENT DATE</TableColumn>
                <TableColumn>ROLL NUMBER</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No students found">
                {filteredStudents?.map((student) => (
                  <TableRow key={student.student_id}>
                    <TableCell>
                      {student.first_name} {student.last_name}
                    </TableCell>
                    <TableCell>{`${student.parent_first_name} ${student.parent_last_name}` || "N/A"}</TableCell>
                    <TableCell>
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                      }).format(new Date(student.enrollment_date))}
                    </TableCell>
                    <TableCell>{student.roll_number}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={() => handleEditStudent(student)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          onPress={() => {
                            setCurrentStudentId(student.student_id);
                            onDeleteModalOpen();
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        <Modal
          size="lg"
          isOpen={isAddModalOpen}
          onOpenChange={onAddModalOpenChange}
        >
          <ModalContent >
            {(onClose) => (
              <>
                <ModalHeader>
                  {isEditing ? "Edit Student" : "Add New Student"}
                </ModalHeader>
                <ModalBody className="max-h-[400px] overflow-y-auto">
                  <div className="space-y-4">
                    <Input
                      label="Roll Number"
                      value={formData.rollNumber}
                      onChange={(e) =>
                        handleInputChange("rollNumber", e.target.value)
                      }
                      isRequired
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        isRequired
                      />
                      <Input
                        label="Last Name"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        isRequired
                      />
                      <DateInput
                        label="Date of Birth"
                        value={formData.dateOfBirth}
                        onChange={(value) =>
                          handleInputChange("dateOfBirth", value)
                        }
                        isRequired
                      />
                      <Select
                        label="Gender"
                        selectedKeys={formData.gender ? [formData.gender] : []}
                        value={formData.gender}
                        onChange={(e) =>
                          handleInputChange("gender", e.target.value)
                        }
                        isRequired
                      >
                        <SelectItem key="male">Male</SelectItem>
                        <SelectItem key="female">Female</SelectItem>
                        <SelectItem key="other">Other</SelectItem>
                      </Select>
                      <Input
                        label="Address"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        isRequired
                        className="md:col-span-2"
                      />
                      <Input
                        label="Phone Number"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          handleInputChange("phoneNumber", e.target.value)
                        }
                        isRequired
                      />
                      <DateInput
                        label="Enrollment Date"
                        value={formData.enrollmentDate}
                        onChange={(value) =>
                          handleInputChange("enrollmentDate", value)
                        }
                        isRequired
                      />
                    </div>
                  </div>

                  {!isEditing && (
                    <div className="space-y-2 pt-4 border-t border-default-200">
                      <h3 className="text-lg font-medium">
                        Parent/Guardian Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Parent First Name"
                          value={formData.parentFirstName}
                          onChange={(e) =>
                            handleInputChange("parentFirstName", e.target.value)
                          }
                          isRequired
                        />
                        <Input
                          label="Parent Last Name"
                          value={formData.parentLastName}
                          onChange={(e) =>
                            handleInputChange("parentLastName", e.target.value)
                          }
                          isRequired
                        />
                        <Input
                          label="Parent Email"
                          type="email"
                          value={formData.parentEmail}
                          onChange={(e) =>
                            handleInputChange("parentEmail", e.target.value)
                          }
                          isRequired
                        />
                        <Input
                          label="Parent Phone"
                          value={formData.parentPhone}
                          onChange={(e) =>
                            handleInputChange("parentPhone", e.target.value)
                          }
                          isRequired
                        />
                        <Select
                          label="Parent Gender"
                          selectedKeys={
                            formData.parentGender ? [formData.parentGender] : []
                          }
                          onChange={(e) =>
                            handleInputChange("parentGender", e.target.value)
                          }
                          isRequired
                        >
                          <SelectItem key="male">Male</SelectItem>
                          <SelectItem key="female">Female</SelectItem>
                          <SelectItem key="other">Other</SelectItem>
                        </Select>
                        <Input
                          label="Parent Address"
                          value={formData.parentAddress}
                          onChange={(e) =>
                            handleInputChange("parentAddress", e.target.value)
                          }
                          placeholder="Leave empty to use student's address"
                          className="md:col-span-2"
                        />
                        <div className="md:col-span-2 text-sm text-default-500">
                          <p>
                            Default password for parent account:{" "}
                            <span className="font-mono">parent123</span>
                          </p>
                          <p className="text-xs">
                            (Parent will be prompted to change this on first
                            login)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button variant="flat" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleSubmit}
                    isLoading={isSubmitting}
                  >
                    {isEditing ? "Update Student" : "Add Student"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        <Modal
          isOpen={isDeleteModalOpen}
          onOpenChange={onDeleteModalOpenChange}
          size="lg"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Delete Student
                </ModalHeader>
                <ModalBody>
                  <p>Are you sure you want to delete this student?</p>
                </ModalBody>
                <ModalFooter>
                  <Button variant="flat" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="danger"
                    onPress={handleDeleteStudent}
                    isLoading={isLoading}
                  >
                    Delete Student
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </>
  );
};

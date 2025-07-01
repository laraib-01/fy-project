import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Input,
  ModalFooter,
  Button,
  Textarea,
  Spinner,
  ToastProvider,
  TimeInput,
  DatePicker,
  DateInput,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Select,
  SelectItem,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import {
  parseDate,
  parseTime,
  parseZonedDateTime,
} from "@internationalized/date";
import teacherService from "../../services/teacherService";
import classService from "../../services/classService";

export const EyeSlashFilledIcon = (props) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M21.2714 9.17834C20.9814 8.71834 20.6714 8.28834 20.3514 7.88834C19.9814 7.41834 19.2814 7.37834 18.8614 7.79834L15.8614 10.7983C16.0814 11.4583 16.1214 12.2183 15.9214 13.0083C15.5714 14.4183 14.4314 15.5583 13.0214 15.9083C12.2314 16.1083 11.4714 16.0683 10.8114 15.8483C10.8114 15.8483 9.38141 17.2783 8.35141 18.3083C7.85141 18.8083 8.01141 19.6883 8.68141 19.9483C9.75141 20.3583 10.8614 20.5683 12.0014 20.5683C13.7814 20.5683 15.5114 20.0483 17.0914 19.0783C18.7014 18.0783 20.1514 16.6083 21.3214 14.7383C22.2714 13.2283 22.2214 10.6883 21.2714 9.17834Z"
        fill="currentColor"
      />
      <path
        d="M14.0206 9.98062L9.98062 14.0206C9.47062 13.5006 9.14062 12.7806 9.14062 12.0006C9.14062 10.4306 10.4206 9.14062 12.0006 9.14062C12.7806 9.14062 13.5006 9.47062 14.0206 9.98062Z"
        fill="currentColor"
      />
      <path
        d="M18.25 5.74969L14.86 9.13969C14.13 8.39969 13.12 7.95969 12 7.95969C9.76 7.95969 7.96 9.76969 7.96 11.9997C7.96 13.1197 8.41 14.1297 9.14 14.8597L5.76 18.2497H5.75C4.64 17.3497 3.62 16.1997 2.75 14.8397C1.75 13.2697 1.75 10.7197 2.75 9.14969C3.91 7.32969 5.33 5.89969 6.91 4.91969C8.49 3.95969 10.22 3.42969 12 3.42969C14.23 3.42969 16.39 4.24969 18.25 5.74969Z"
        fill="currentColor"
      />
      <path
        d="M14.8581 11.9981C14.8581 13.5681 13.5781 14.8581 11.9981 14.8581C11.9381 14.8581 11.8881 14.8581 11.8281 14.8381L14.8381 11.8281C14.8581 11.8881 14.8581 11.9381 14.8581 11.9981Z"
        fill="currentColor"
      />
      <path
        d="M21.7689 2.22891C21.4689 1.92891 20.9789 1.92891 20.6789 2.22891L2.22891 20.6889C1.92891 20.9889 1.92891 21.4789 2.22891 21.7789C2.37891 21.9189 2.56891 21.9989 2.76891 21.9989C2.96891 21.9989 3.15891 21.9189 3.30891 21.7689L21.7689 3.30891C22.0789 3.00891 22.0789 2.52891 21.7689 2.22891Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const EyeFilledIcon = (props) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M21.25 9.14969C18.94 5.51969 15.56 3.42969 12 3.42969C10.22 3.42969 8.49 3.94969 6.91 4.91969C5.33 5.89969 3.91 7.32969 2.75 9.14969C1.75 10.7197 1.75 13.2697 2.75 14.8397C5.06 18.4797 8.44 20.5597 12 20.5597C13.78 20.5597 15.51 20.0397 17.09 19.0697C18.67 18.0897 20.09 16.6597 21.25 14.8397C22.25 13.2797 22.25 10.7197 21.25 9.14969ZM12 16.0397C9.76 16.0397 7.96 14.2297 7.96 11.9997C7.96 9.76969 9.76 7.95969 12 7.95969C14.24 7.95969 16.04 9.76969 16.04 11.9997C16.04 14.2297 14.24 16.0397 12 16.0397Z"
        fill="currentColor"
      />
      <path
        d="M11.9984 9.14062C10.4284 9.14062 9.14844 10.4206 9.14844 12.0006C9.14844 13.5706 10.4284 14.8506 11.9984 14.8506C13.5684 14.8506 14.8584 13.5706 14.8584 12.0006C14.8584 10.4306 13.5684 9.14062 11.9984 9.14062Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    qualification: "",
    specialization: "",
    joining_date: null,
    class_id: null,
    status: "Active",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [currentTeacherId, setCurrentTeacherId] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);

  const {
    isOpen: isTeacherModalOpen,
    onOpen: onTeacherModalOpen,
    onOpenChange: onTeacherModalOpenChange,
  } = useDisclosure();

  const {
    isOpen: isDeleteTeacherModalOpen,
    onOpen: onDeleteTeacherModalOpen,
    onClose: onDeleteTeacherModalClose,
  } = useDisclosure();

  const {
    isOpen: isDeactivateTeacherModalOpen,
    onOpen: onDeactivateTeacherModalOpen,
    onClose: onDeactivateTeacherModalClose,
  } = useDisclosure();

  const {
    isOpen: isAssignClassesModalOpen,
    onOpen: onAssignClassesModalOpen,
    onClose: onAssignClassesModalClose,
  } = useDisclosure();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const response = await classService.getSchoolClasses();

      setClasses(response?.classes || []);
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

  const fetchTeachers = async () => {
    try {
      const response = await teacherService.getAllTeachers();

      setTeachers(response?.teachers || []);
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
    fetchTeachers();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      qualification: "",
      specialization: "",
      joining_date: null,
      class_id: null,
      status: "Active",
    });
    setIsEditing(false);
    setCurrentTeacherId(null);
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

    if (
      !formData.name ||
      !formData.email ||
      !formData.qualification ||
      !formData.specialization ||
      !formData.joining_date ||
      !formData.class_id ||
      !formData.status
    ) {
      addToast({
        description: "Please fill all fields",
        color: "warning",
      });
      return;
    }
    const payload = {
      name: formData.name,
      email: formData.email,
      ...(!isEditing ? { password: formData.password } : {}),
      qualification: formData.qualification,
      specialization: formData.specialization,
      joining_date: formatDate(formData.joining_date),
      class_id: formData.class_id,
      status: formData.status,
    };

    try {
      setIsSubmitting(true);

      if (isEditing && currentTeacherId) {
        await teacherService.updateTeacher(currentTeacherId, payload);
        addToast({
          description: "Teacher updated successfully",
          color: "success",
        });
      } else {
        await teacherService.createTeacher(payload);
        addToast({
          description: "Teacher created successfully",
          color: "success",
        });
      }

      onTeacherModalOpenChange(false);
      resetForm();
      fetchTeachers();
    } catch (error) {
      console.error("Error saving teacher:", error);
      addToast({
        description: error.message || "Failed to save event",
        color: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClassAssignment = async () => {
    try {
      setIsSubmitting(true);
      await teacherService.assignClasses(
        selectedTeacher.user_id,
        selectedClass
      );
      addToast({
        description: "Classes assigned successfully",
        color: "success",
      });
      onAssignClassesModalClose();
      setSelectedTeacher(null);
      setSelectedClass(null);
      fetchTeachers();
    } catch (error) {
      console.error("Error assigning classes:", error);
      addToast({
        description: error.message || "Failed to assign classes",
        color: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivateTeacher = async () => {
    try {
      setIsSubmitting(true);
      await teacherService.deactivateTeacher(currentTeacherId);
      await fetchTeachers();
      addToast({
        description: "Teacher deactivated successfully",
        color: "success",
      });
      onDeactivateTeacherModalClose();
    } catch (error) {
      console.error("Error deactivating teacher:", error);
      addToast({
        description:
          error.response?.data?.message || "Failed to deactivate teacher",
        color: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeacher = async () => {
    try {
      await teacherService.deleteTeacher(currentTeacherId);
      await fetchTeachers();
      addToast({
        description: "Teacher deleted successfully",
        color: "success",
      });
      onDeleteTeacherModalClose();
    } catch (error) {
      console.error("Error deleting teacher:", error);
      addToast({
        description:
          error.response?.data?.message || "Failed to delete teacher",
        color: "error",
      });
    }
  };

  const handleEditTeacher = (teacher) => {
    let parsedDate;

    try {
      const zonedDateTime = parseZonedDateTime(teacher.joining_date);
      parsedDate = zonedDateTime.toCalendarDate();
    } catch (error) {
      parsedDate = parseDate(teacher.joining_date.split("T")[0]);
    }

    setFormData({
      name: teacher.name || "",
      email: teacher.email || "",
      password: "",
      qualification: teacher.qualification || "",
      specialization: teacher.specialization || "",
      joining_date: parsedDate,
      class_id: teacher.class_id.toString() || null,
      status: teacher.status || "Active",
    });
    setCurrentTeacherId(teacher.user_id);
    setIsEditing(true);
    onTeacherModalOpen();
  };

  const filteredTeachers = teachers.filter((cls) =>
    cls.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <ToastProvider placement="bottom-center" toastOffset={0} />
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Teachers</h1>
            <p className="text-foreground-600">Manage your teachers</p>
          </div>
          <Button
            color="primary"
            startContent={<Icon icon="lucide:plus" />}
            onPress={() => {
              resetForm();
              onTeacherModalOpen();
            }}
          >
            Add Teacher
          </Button>
        </div>

        <Card>
          <CardBody>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <Input
                placeholder="Search classes..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={
                  <Icon icon="lucide:search" className="text-foreground-400" />
                }
                className="w-full"
              />
            </div>

            <Table removeWrapper aria-label="Students table">
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>QUALIFICATION</TableColumn>
                <TableColumn>SPECIALIZATION</TableColumn>
                <TableColumn>CLASS</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn className="w-1/6">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent={"No teachers to display."}>
                {filteredTeachers.map((tch) => (
                  <TableRow key={tch.user_id}>
                    <TableCell>{tch.name}</TableCell>
                    <TableCell>{tch?.qualification || "N/A"}</TableCell>
                    <TableCell>{tch?.specialization || "0"}</TableCell>
                    <TableCell>{tch?.class_name || "N/A"}</TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={tch.status === "Active" ? "success" : "danger"}
                      >
                        {tch.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button size="sm" variant="flat" isIconOnly>
                            <Icon icon="lucide:ellipsis-vertical" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Teacher actions"
                          variant="flat"
                          onAction={(key) => {
                            if (key === "deactivate") {
                              setCurrentTeacherId(tch.user_id);
                              onDeactivateTeacherModalOpen();
                            } else if (key === "delete") {
                              setCurrentTeacherId(tch.user_id);
                              onDeleteTeacherModalOpen();
                            }
                          }}
                        >
                          <DropdownItem
                            key="assign"
                            color="default"
                            onPress={() => {
                              setSelectedTeacher(tch);
                              setSelectedClass(tch.class_id?.toString() || "");
                              onAssignClassesModalOpen();
                            }}
                          >
                            Assign Class
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            color="primary"
                            onPress={() => handleEditTeacher(tch)}
                          >
                            Edit
                          </DropdownItem>
                          {tch.status === "Active" && (
                            <DropdownItem
                              key="deactivate"
                              color="warning"
                              onPress={() => {
                                setCurrentTeacherId(tch.user_id);
                                onDeactivateTeacherModalOpen();
                              }}
                            >
                              Deactivate
                            </DropdownItem>
                          )}
                          <DropdownItem
                            key="delete"
                            color="danger"
                            className="text-danger"
                          >
                            Delete Permanently
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      {/* Teacher Modal */}
      <Modal
        size="xl"
        isOpen={isTeacherModalOpen}
        onOpenChange={onTeacherModalOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {isEditing ? "Edit Teacher" : "Create Teacher"}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Name"
                      placeholder="Enter teacher name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      isRequired
                    />
                    <Input
                      label="Email"
                      placeholder="Enter teacher email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      isRequired
                    />
                  </div>

                  {!isEditing && (
                    <Input
                      endContent={
                        <button
                          aria-label="toggle password visibility"
                          className="focus:outline-none"
                          type="button"
                          onClick={toggleVisibility}
                        >
                          {isVisible ? (
                            <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                          ) : (
                            <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                          )}
                        </button>
                      }
                      label="Password"
                      placeholder="Enter your password"
                      type={isVisible ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                    />
                  )}
                  <Input
                    label="Qualification"
                    placeholder="Enter teacher qualification"
                    value={formData.qualification}
                    onChange={(e) =>
                      handleInputChange("qualification", e.target.value)
                    }
                    isRequired
                  />
                  <Input
                    label="Specialization"
                    placeholder="Enter teacher specialization"
                    value={formData.specialization}
                    onChange={(e) =>
                      handleInputChange("specialization", e.target.value)
                    }
                    isRequired
                  />
                  <DateInput
                    label="Joining Date"
                    placeholder="Enter joining date"
                    value={formData?.joining_date}
                    onChange={(value) =>
                      handleInputChange("joining_date", value)
                    }
                    isRequired
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Class"
                      placeholder="Select class"
                      defaultSelectedKeys={[formData?.class_id]}
                      selectedKeys={[formData?.class_id]}
                      onChange={(e) =>
                        handleInputChange("class_id", e.target.value)
                      }
                    >
                      {classes?.map((cls) => (
                        <SelectItem key={cls?.class_id}>
                          {cls?.class_name}
                        </SelectItem>
                      ))}
                    </Select>
                    <Select
                      label="Status"
                      placeholder="Select status"
                      defaultSelectedKeys={[formData?.status]}
                      selectedKeys={[formData?.status]}
                      onChange={(e) =>
                        handleInputChange("status", e.target.value)
                      }
                    >
                      {["Active", "On Leave", "Inactive"].map((status) => (
                        <SelectItem key={status}>{status}</SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={() => {
                    resetForm();
                    onClose();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleSubmit()}
                  isLoading={isSubmitting}
                >
                  {isEditing ? "Update Teacher" : "Post Teacher"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Teacher Modal */}
      <Modal
        isOpen={isDeleteTeacherModalOpen}
        onClose={onDeleteTeacherModalClose}
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete Teacher
              </ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this teacher?</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={handleDeleteTeacher}
                  isLoading={isLoading}
                >
                  Delete Teacher
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Teacher Modal */}
      <Modal
        isOpen={isDeactivateTeacherModalOpen}
        onClose={onDeactivateTeacherModalClose}
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Deactivate Teacher
              </ModalHeader>
              <ModalBody>
                <p>Are you sure you want to deactivate this teacher?</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={handleDeactivateTeacher}
                  isLoading={isSubmitting}
                >
                  Deactivate Teacher
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Assign Classes Modal */}
      <Modal
        isOpen={isAssignClassesModalOpen}
        onOpenChange={onAssignClassesModalClose}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Assign Classes to {selectedTeacher?.name}
              </ModalHeader>
              <ModalBody>
                <Select
                  label="Class"
                  placeholder="Select class"
                  defaultSelectedKeys={[selectedClass]}
                  selectedKeys={[selectedClass]}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  {classes?.map((cls) => (
                    <SelectItem key={cls?.class_id.toString()}>
                      {cls?.class_name}
                    </SelectItem>
                  ))}
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleClassAssignment}
                  isLoading={isSubmitting}
                >
                  Assign Classes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

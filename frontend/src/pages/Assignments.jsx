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
  ToastProvider,
  Select,
  SelectItem,
  DateInput,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import classService from "../services/classService";
import assignmentService from "../services/assignmentService";

export const Assignments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedClass, setSelectedClass] = useState("all");
  const [isEditing, setIsEditing] = useState(false);
  const [currentAssignmentId, setCurrentAssignmentId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: null,
    classId: "",
    status: "draft",
    points: 100,
  });

  const {
    isOpen: isAssignmentModalOpen,
    onOpen: onAssignmentModalOpen,
    onOpenChange: onAssignmentModalOpenChange,
  } = useDisclosure();

  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onOpenChange: onDeleteModalOpenChange,
  } = useDisclosure();

  console.log("assignments", assignments)

  // Fetch all classes from the school using classService
  const fetchClasses = async () => {
    try {
      const response = await classService.getTeacherClasses();
      setClasses(response?.classes || []);
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

  const fetchAssignments = async () => {
    try {
      const response = await assignmentService.getAllAssignments(statusFilter, selectedClass);
      console.log(response);
      setAssignments(response?.assignments || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      addToast({
        title: "Error",
        description: "Failed to load assignments. Please try again.",
        color: "error",
      });
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [statusFilter]);

  // Fetch assignments on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      dueDate: "",
      classId: "",
      status: "draft",
      points: 100,
    });
    setIsEditing(false);
    setCurrentAssignmentId(null);
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

    // Prepare student payload
    const payload = {
      title: formData.title,
      description: formData.description,
      due_date: formatDate(formData.dueDate),
      class_id: formData.classId,
      status: formData.status,
      points: formData.points,
    };

    console.log("payload", payload);

    try {
      setIsSubmitting(true);

      if (isEditing && currentAssignmentId) {
        await assignmentService.updateAssignment(currentAssignmentId, payload);
        addToast({
          description: "Assignment updated successfully",
          color: "success",
        });
      } else {
        await assignmentService.createAssignment(payload);
        addToast({
          description: "Assignment created successfully",
          color: "success",
        });
      }

      resetForm();
      fetchAssignments();
      onAssignmentModalOpenChange(false);
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

  const handleDeleteAssignment = async () => {
    try {
      await assignmentService.deleteAssignment(currentAssignmentId);
      addToast({
        title: "Success",
        description: "Assignment deleted successfully!",
        color: "success",
      });
      fetchAssignments();
      onDeleteModalOpenChange();
    } catch (error) {
      console.error("Error deleting assignment:", error);
      addToast({
        title: "Error",
        description: "Failed to delete assignment. Please try again.",
        color: "error",
      });
    }
  };

  return (
    <>
      <ToastProvider placement="bottom-center" toastOffset={0} />
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Assignments</h1>
            <p className="text-foreground-600">Manage your assignments</p>
          </div>

          <Input
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md bg-white"
            startContent={<Icon icon="lucide:search" />}
          />
          <Button
            color="primary"
            startContent={<Icon icon="lucide:plus" />}
            onPress={onAssignmentModalOpen}
          >
            Create Assignment
          </Button>
        </div>
        <Card>
          <CardBody>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Select
                label="Class"
                selectedKeys={[selectedClass]}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="min-w-[150px]"
              >
                <SelectItem key="all" value="all">
                  All Classes
                </SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.class_id} value={cls.class_id}>
                    {cls.class_name}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Status"
                selectedKeys={[statusFilter]}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="min-w-[150px]"
              >
                <SelectItem key="all" value="all">
                  All Statuses
                </SelectItem>
                <SelectItem key="active" value="active">
                  Active
                </SelectItem>
                <SelectItem key="draft" value="draft">
                  Draft
                </SelectItem>
                <SelectItem key="completed" value="completed">
                  Completed
                </SelectItem>
              </Select>
            </div>

            <Table removeWrapper aria-label="Students table">
              <TableHeader>
                <TableColumn>Title</TableColumn>
                <TableColumn>Description</TableColumn>
                <TableColumn>Due Date</TableColumn>
                <TableColumn>Class</TableColumn>
                <TableColumn>Status</TableColumn>
                <TableColumn>Actions</TableColumn>
              </TableHeader>
              <TableBody>
                {assignments?.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>{assignment.title}</TableCell>
                    <TableCell>{assignment.description}</TableCell>
                    <TableCell>
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                      }).format(new Date(assignment.due_date))}
                    </TableCell>
                    <TableCell>{assignment.class_name || "N/A"}</TableCell>
                    <TableCell>
                      <Chip
                        color={
                          assignment.status === "Active" ? "primary" : "success"
                        }
                        size="sm"
                      >
                        {assignment.status === "Active"
                          ? "Active"
                          : "Completed"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button size="sm" variant="flat" isIconOnly>
                            <Icon icon="lucide:more-vertical" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem>View</DropdownItem>
                          <DropdownItem>Edit</DropdownItem>
                          <DropdownItem
                            color="danger"
                            onPress={() => {
                              setCurrentAssignmentId(assignment.assignment_id);
                              onDeleteModalOpen();
                            }}
                          >
                            Delete
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

      {/* Create/Edit Assignment Modal */}
      <Modal
        isOpen={isAssignmentModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) resetForm();
          onAssignmentModalOpenChange();
        }}
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {isEditing ? "Edit Assignment" : "Create New Assignment"}
              </ModalHeader>
              <ModalBody className="space-y-4">
                <Input
                  isRequired
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter assignment title"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    isRequired
                    label="Class"
                    name="classId"
                    selectedKeys={[formData.classId]}
                    onChange={(e) =>
                      handleInputChange("classId", e.target.value)
                    }
                  >
                    {classes.map((cls) => (
                      <SelectItem key={cls.class_id} value={cls.class_id}>
                        {cls.class_name}
                      </SelectItem>
                    ))}
                  </Select>

                  <DateInput
                    isRequired
                    label="Due Date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={(value) => handleInputChange("dueDate", value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Points"
                    name="points"
                    type="number"
                    min="0"
                    value={formData.points}
                    onChange={(e) =>
                      handleInputChange("points", e.target.value)
                    }
                    placeholder="Points"
                  />

                  <Select
                    label="Status"
                    name="status"
                    selectedKeys={[formData.status]}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                  >
                    {[
                      { label: "Draft", value: "draft" },
                      { label: "Active", value: "active" },
                      { label: "Completed", value: "completed" },
                    ].map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <Textarea
                  isRequired
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Enter assignment description and instructions"
                  className="min-h-[150px]"
                />
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
                  type="submit"
                  onPress={handleSubmit}
                  isLoading={isSubmitting}
                  isDisabled={isSubmitting}
                >
                  {isEditing ? "Update" : "Create"} Assignment
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onOpenChange={onDeleteModalOpenChange}>
        <ModalContent>
          <ModalHeader>Delete Assignment</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete the assignment "
              {
                assignments?.find(
                  (assignment) => assignment.assignment_id === currentAssignmentId
                )?.title
              }
              "? This action cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={onDeleteModalOpenChange}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleDeleteAssignment}
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
            >
              Delete Assignment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

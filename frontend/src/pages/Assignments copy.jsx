import React, { useState, useEffect } from "react";
import {
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
  Spinner,
  Select,
  SelectItem,
  Divider,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import assignmentService from "../services/assignmentService";
import classService from "../services/classService";

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

export const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classes, setClasses] = useState([
    "Class 5-A",
    "Class 6-B",
    "Class 7-C",
  ]);

  // Assignment form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    classId: "",
    status: "draft",
    points: 100,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Modals
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

  const fetchAssignments = async () => {
    try {
      const response = await assignmentService.getAllAssignments();
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

  // Fetch assignments on component mount
  useEffect(() => {
    fetchClasses();
    fetchAssignments();
  }, []);

  // Filter assignments when search query or filters change
  useEffect(() => {
    let result = [...assignments];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query)
      );
    }

    // Apply class filter
    if (selectedClass !== "all") {
      result = result.filter((a) => a.classId === selectedClass);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((a) => a.status === statusFilter);
    }

    setFilteredAssignments(result);
  }, [searchQuery, selectedClass, statusFilter, assignments]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditAssignment = (assignment) => {
    setIsEditMode(true);
    setFormData({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate.split("T")[0],
      classId: assignment.classId,
      status: assignment.status,
      points: assignment.points || 100,
    });
    onAssignmentModalOpen();
  };

  const handleDeleteClick = (assignment) => {
    setFormData({
      id: assignment.id,
      title: assignment.title,
    });
    onDeleteModalOpen();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // if (isEditMode) {
      //   await assignmentService.updateAssignment(formData.id, formData);
      //   addToast({
      //     title: "Success",
      //     description: "Assignment updated successfully!",
      //     status: "success",
      //   });
      // } else {
      //   await assignmentService.createAssignment({
      //     ...formData,
      //     teacherId: currentUser.id,
      //   });
      //   addToast({
      //     title: "Success",
      //     description: "Assignment created successfully!",
      //     status: "success",
      //   });
      // }

      // Refresh assignments and close modal
      await fetchAssignments();
      onAssignmentModalOpenChange();
      resetForm();
    } catch (error) {
      console.error("Error saving assignment:", error);
      addToast({
        title: "Error",
        description: `Failed to ${
          isEditMode ? "update" : "create"
        } assignment. Please try again.`,
        status: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssignment = async () => {
    try {
      await assignmentService.deleteAssignment(formData.id);
      addToast({
        title: "Success",
        description: "Assignment deleted successfully!",
        status: "success",
      });
      fetchAssignments();
      onDeleteModalOpenChange();
    } catch (error) {
      console.error("Error deleting assignment:", error);
      addToast({
        title: "Error",
        description: "Failed to delete assignment. Please try again.",
        status: "error",
      });
    }
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
    setIsEditMode(false);
  };

  const handleCreateNew = () => {
    resetForm();
    onAssignmentModalOpen();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "primary";
      case "draft":
        return "warning";
      case "archived":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-foreground-600">
            {filteredAssignments.length} assignment
            {filteredAssignments.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Input
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
            startContent={
              <Icon icon="lucide:search" className="text-foreground-400" />
            }
          />
          <Button
            color="primary"
            startContent={<Icon icon="lucide:plus" />}
            onPress={handleCreateNew}
          >
            Create Assignment
          </Button>
        </div>
      </div>

      {/* Filters */}
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
            <SelectItem key={cls} value={cls}>
              {cls}
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
          <SelectItem key="published" value="published">
            Published
          </SelectItem>
          <SelectItem key="draft" value="draft">
            Draft
          </SelectItem>
          <SelectItem key="archived" value="archived">
            Archived
          </SelectItem>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="text-center py-12">
          <Icon
            icon="lucide:file-search"
            className="mx-auto text-4xl text-foreground-400 mb-4"
          />
          <h3 className="text-lg font-medium">No assignments found</h3>
          <p className="text-foreground-500 mb-4">
            {searchQuery || selectedClass !== "all" || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first assignment to get started"}
          </p>
          {!searchQuery &&
            selectedClass === "all" &&
            statusFilter === "all" && (
              <Button color="primary" onPress={handleCreateNew}>
                Create Assignment
              </Button>
            )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="h-full flex flex-col">
              <CardBody className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium">{assignment.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-foreground-500">
                      <span>Due: {assignment.dueDate}</span>
                      <span>•</span>
                      <Chip size="sm" variant="flat">
                        {assignment.classId}
                      </Chip>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip
                      color={getStatusColor(assignment.status)}
                      size="sm"
                      variant="flat"
                    >
                      {assignment.status.charAt(0).toUpperCase() +
                        assignment.status.slice(1)}
                    </Chip>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light">
                          <Icon icon="lucide:more-vertical" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Assignment actions">
                        <DropdownItem
                          key="edit"
                          startContent={<Icon icon="lucide:edit" />}
                          onPress={() => handleEditAssignment(assignment)}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          color="danger"
                          startContent={<Icon icon="lucide:trash-2" />}
                          onPress={() => handleDeleteClick(assignment)}
                          className="text-danger"
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>
                <p className="mt-3 text-foreground-700 line-clamp-3">
                  {assignment.description}
                </p>
                <div className="mt-4 pt-3 border-t border-default-100">
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-foreground-500">
                      <span>{assignment.points || 100} points</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        startContent={<Icon icon="lucide:list-checks" />}
                      >
                        Submissions
                      </Button>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => handleEditAssignment(assignment)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

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
                {isEditMode ? "Edit Assignment" : "Create New Assignment"}
              </ModalHeader>
              <form onSubmit={handleSubmit}>
                <ModalBody className="space-y-4">
                  <Input
                    isRequired
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter assignment title"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      isRequired
                      label="Class"
                      name="classId"
                      selectedKeys={[formData.classId]}
                      onChange={handleInputChange}
                    >
                      {classes.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          {cls}
                        </SelectItem>
                      ))}
                    </Select>

                    <Input
                      isRequired
                      label="Due Date"
                      name="dueDate"
                      type="datetime-local"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Points"
                      name="points"
                      type="number"
                      min="0"
                      value={formData.points}
                      onChange={handleInputChange}
                      placeholder="Points"
                    />

                    <Select
                      label="Status"
                      name="status"
                      selectedKeys={[formData.status]}
                      onChange={handleInputChange}
                    >
                      {statusOptions.map((status) => (
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
                    onChange={handleInputChange}
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
                    isLoading={isSubmitting}
                    isDisabled={isSubmitting}
                  >
                    {isEditMode ? "Update" : "Create"} Assignment
                  </Button>
                </ModalFooter>
              </form>
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
              Are you sure you want to delete the assignment "{formData.title}"?
              This action cannot be undone.
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
    </div>
  );
};

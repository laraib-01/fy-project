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
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import classService from "../../services/classService";
import teacherService from "../../services/teacherService";
import studentService from "../../services/studentService";

export const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [className, setClassName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [currentClassId, setCurrentClassId] = useState(null);

  const {
    isOpen: isClassModalOpen,
    onOpen: onClassModalOpen,
    onOpenChange: onClassModalOpenChange,
  } = useDisclosure();

  const {
    isOpen: isDeleteClassModalOpen,
    onOpen: onDeleteClassModalOpen,
    onOpenChange: onDeleteClassModalOpenChange,
  } = useDisclosure();

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

  useEffect(() => {
    fetchClasses();
  }, []);

  const resetForm = () => {
    setIsEditing(false);
    setCurrentClassId(null);
    setClassName("");
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (!className) {
      addToast({
        description: "Please fill class name",
        color: "warning",
      });
      return;
    }
    const payload = {
      class_name: className,
    };

    console.log("payload", payload);

    try {
      setIsSubmitting(true);

      if (isEditing && currentClassId) {
        await classService.updateClass(currentClassId, payload);
        addToast({
          description: "Class updated successfully",
          color: "success",
        });
      } else {
        await classService.createClass(payload);
        addToast({
          description: "Class created successfully",
          color: "success",
        });
      }

      onClassModalOpenChange(false);
      resetForm();
      fetchClasses();
    } catch (error) {
      console.error("Error saving class:", error);
      addToast({
        description: error.message || "Failed to save event",
        color: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClass = async () => {
    try {
      setIsLoading(true);
      await classService.deleteClass(currentClassId);
      addToast({
        description: "Class deleted successfully",
        color: "success",
      });
      fetchClasses();
      onDeleteClassModalOpenChange(false);
    } catch (error) {
      console.error("Error deleting class:", error);
      addToast({
        description: error.message || "Failed to delete class",
        color: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClass = (cls) => {
    setClassName(cls.class_name);
    setCurrentClassId(cls.class_id);
    setIsEditing(true);
    onClassModalOpen();
  };

  const filteredClasses = classes.filter((cls) =>
    cls.class_name?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-2xl font-bold">Classes</h1>
            <p className="text-foreground-600">Manage your classes</p>
          </div>
          <Button
            color="primary"
            startContent={<Icon icon="lucide:plus" />}
            onPress={() => {
              resetForm();
              onClassModalOpen();
            }}
          >
            Add Class
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
                <TableColumn>TEACHER</TableColumn>
                <TableColumn>STUDENTS</TableColumn>
                <TableColumn className="w-1/6">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredClasses.map((cls) => (
                  <TableRow key={cls.class_id}>
                    <TableCell>{cls.class_name}</TableCell>
                    <TableCell>{cls?.teacher_name || "N/A"}</TableCell>
                    <TableCell>{cls?.student_count || "0"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {/* <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={() => {
                            setCurrentClassId(cls.class_id);
                            onAssignStudentsModalOpen();
                          }}
                        >
                          Assign Students
                        </Button> */}
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={() => handleEditClass(cls)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          onPress={() => {
                            setCurrentClassId(cls.class_id);
                            onDeleteClassModalOpen();
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
      </div>

      {/* Class Modal */}
      <Modal isOpen={isClassModalOpen} onOpenChange={onClassModalOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {isEditing ? "Edit Class" : "Create Class"}
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Title"
                  placeholder="Enter class title"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  isRequired
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
                  onPress={() => handleSubmit()}
                  isLoading={isSubmitting}
                >
                  {isEditing ? "Update Class" : "Post Class"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Class Modal */}
      <Modal
        isOpen={isDeleteClassModalOpen}
        onOpenChange={onDeleteClassModalOpenChange}
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete Class
              </ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this class?</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={handleDeleteClass}
                  isLoading={isLoading}
                >
                  Delete Class
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableColumn,
  TableRow,
  Input,
  Spinner,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
  ToastProvider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import adminService from "../../services/adminService";

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

export const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const errors = [];
  const [isVisibleNewPassword, setIsVisibleNewPassword] = useState(false);
  const [isVisibleConfirmPassword, setIsVisibleConfirmPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  if (!isEditing && formData.password.length < 8) {
    errors.push("Password must be 8 characters or more.");
  }
  if (!isEditing && (formData.password.match(/[A-Z]/g) || []).length < 1) {
    errors.push("Password must include at least 1 upper case letter");
  }
  if (!isEditing && (formData.password.match(/[^a-z0-9]/gi) || []).length < 1) {
    errors.push("Password must include at least 1 symbol.");
  }

  const {
    isOpen: isAddEditAdminModalOpen,
    onOpen: onAddEditAdminModalOpen,
    onOpenChange: onAddEditAdminModalOpenChange,
  } = useDisclosure();

  const {
    isOpen: isDeleteAdminModalOpen,
    onOpen: onDeleteAdminModalOpen,
    onOpenChange: onDeleteAdminModalOpenChange,
  } = useDisclosure();

  // Fetch admins
  const fetchAdmins = async (page = 1) => {
    try {
      setLoading(true);
      const response = await adminService.getAllAdmins();
      console.log(response);
      setAdmins(response.data || []);
      setTotalPages(Math.ceil((response.data?.length || 0) / itemsPerPage));
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching admins:", error);
      addToast({
        title: "Error",
        description: "Failed to load admins. Please try again.",
        color: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setIsEditing(false);
    setCurrentAdminId(null);
  };

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Handle search
  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const paginatedAdmins = filteredAdmins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddAdmin = async () => {
    setIsSubmitLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        ...(!isEditing && !currentAdminId
          ? { confirmPassword: formData.confirmPassword }
          : {}),
      };

      const isEditable = isEditing && currentAdminId;

      let response;
      if (isEditable) {
        response = await adminService.updateAdmin(currentAdminId, payload);
      } else {
        response = await adminService.createAdmin(payload);
      }

      console.log("response", response);

      addToast({
        title: "Success",
        description: response?.message,
        color: "success",
        hideIcon: true,
      });

      fetchAdmins();
      resetForm();
      onAddEditAdminModalOpenChange();
    } catch (error) {
      console.error("Failed to save admin:", error);
      addToast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Could not save admin. Please try again.",
        color: "error",
        hideIcon: true,
      });
      setIsSubmitLoading(false);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleEditAdmin = (admin) => {
    setFormData({
      name: admin.name || "",
      email: admin.email || "",
    });
    setCurrentAdminId(admin.user_id);
    setIsEditing(true);
    onAddEditAdminModalOpen();
  };

  const handleDeleteAdmin = async () => {
    try {
      setIsDeleteLoading(true);
      await adminService.deleteAdmin(currentAdminId);
      addToast({
        title: "Success",
        description: "Admin deleted successfully",
        color: "success",
      });
      fetchAdmins();
    } catch (error) {
      console.error("Error deleting admin:", error);
      addToast({
        title: "Error",
        description: "Failed to delete admin. Please try again.",
        color: "error",
      });
    } finally {
      onDeleteAdminModalOpenChange();
      setIsDeleteLoading(false);
    }
  };

  // Handle page change
  const onPageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <ToastProvider placement="bottom-center" toastOffset={0} />
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admins</h1>
            <p className="text-foreground-600">Manage admins</p>
          </div>

          <Button
            color="primary"
            startContent={<Icon icon="lucide:plus" />}
            onPress={onAddEditAdminModalOpen}
          >
            Add Admin
          </Button>
        </div>

        <Card>
          <CardBody>
            <div className="flex gap-2 w-full md:w-auto mb-4">
              <Input
                placeholder="Search schools..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={
                  <Icon icon="lucide:search" className="text-foreground-400" />
                }
                className="w-full"
              />
            </div>

            <Table removeWrapper aria-label="Schools table">
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>JOINED</TableColumn>
                <TableColumn className="text-right">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedAdmins.length > 0 ? (
                  paginatedAdmins.map((admin) => (
                    <TableRow key={admin.user_id}>
                      <TableCell className="font-medium">
                        {admin.name}
                      </TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>
                        {new Date(admin.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            onPress={() => handleEditAdmin(admin)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => {
                              setCurrentAdminId(admin.user_id);
                              onDeleteAdminModalOpen();
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <Icon
                          icon="lucide:users"
                          className="h-12 w-12 text-gray-300 mb-2"
                        />
                        <p className="text-gray-500">
                          {searchQuery
                            ? "No matching admins found"
                            : "No admins found"}
                        </p>
                        {!searchQuery && (
                          <Button
                            color="primary"
                            variant="light"
                            className="mt-2"
                            onPress={() => {
                              setSelectedAdmin(null);
                              setIsEditing(false);
                              onAddEditAdminModalOpen();
                            }}
                          >
                            Add New Admin
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      <Modal
        isOpen={isAddEditAdminModalOpen}
        onOpenChange={onAddEditAdminModalOpenChange}
        size="lg"
      >
        <ModalContent>
          <ModalHeader>
            {isEditing ? "Edit Admin" : "Add New Admin"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                isRequired
              />
              <Input
                label="Email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                isRequired
              />
              <Input
                errorMessage={() => (
                  <ul>
                    {errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                )}
                endContent={
                  <button
                    aria-label="toggle password visibility"
                    className="focus:outline-none"
                    type="button"
                    onClick={() =>
                      setIsVisibleNewPassword(!isVisibleNewPassword)
                    }
                  >
                    {isVisibleNewPassword ? (
                      <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
                isInvalid={errors.length > 0}
                label="Password"
                name="password"
                type={isVisibleNewPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
              {!isEditing && (
                <>
                  <Input
                    label="Confirm Password"
                    endContent={
                      <button
                        aria-label="toggle password visibility"
                        className="focus:outline-none"
                        type="button"
                        onClick={() =>
                          setIsVisibleConfirmPassword(!isVisibleConfirmPassword)
                        }
                      >
                        {isVisibleConfirmPassword ? (
                          <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        ) : (
                          <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        )}
                      </button>
                    }
                    type={isVisibleConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    isInvalid={!!errors.confirmPassword}
                    errorMessage={errors.confirmPassword}
                  />
                </>
              )}
            </div>

            {isEditing && (
              <div className="text-sm text-gray-500 mt-2">
                <p>Leave password fields blank to keep the current password.</p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onAddEditAdminModalOpenChange}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleAddAdmin}
              isLoading={isSubmitLoading}
            >
              {isEditing ? "Update Admin" : "Add Admin"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isDeleteAdminModalOpen}
        onOpenChange={onDeleteAdminModalOpenChange}
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete Admin
              </ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this admin?</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={handleDeleteAdmin}
                  isLoading={isDeleteLoading}
                >
                  Delete Admin
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

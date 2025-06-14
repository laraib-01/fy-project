import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  Chip,
  Pagination,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
  Textarea,
  Tabs,
  Tab,
  CardBody,
  CardHeader,
  Divider,
  Badge,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Skeleton,
  addToast,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import {
  getTransactions,
  getSchoolTransactions,
  getTransactionDetails,
  createTransaction,
  updateTransactionStatus,
  getTransactionSummary,
  exportTransactionsToCSV,
} from "../../services/transactionService";

// Helper function to check if user has admin role
const isAdmin = (user) => {
  return user && user.role === "EduConnect_Admin";
};

const statusColorMap = {
  completed: "success",
  pending: "warning",
  failed: "danger",
  refunded: "secondary",
  cancelled: "danger",
};

// Constants
const ITEMS_PER_PAGE = 10;
const PAYMENT_METHODS = [
  { key: "credit_card", label: "Credit Card" },
  { key: "bank_transfer", label: "Bank Transfer" },
  { key: "paypal", label: "PayPal" },
  { key: "other", label: "Other" },
];

export const Transactions = () => {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 1,
  });

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    start_date: "",
    end_date: "",
    payment_method: "",
  });

  // Modals
  const {
    isOpen: isDetailsOpen,
    onOpen: onDetailsOpen,
    onClose: onDetailsClose,
  } = useDisclosure();
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const {
    isOpen: isStatusOpen,
    onOpen: onStatusOpen,
    onClose: onStatusClose,
  } = useDisclosure();

  // Form states
  const [newTransaction, setNewTransaction] = useState({
    school_id: "",
    subscription_plan_id: "",
    amount: "",
    payment_method: "credit_card",
    payment_gateway: "stripe",
    status: "completed",
    description: "",
    billing_cycle: "monthly",
  });
  const [statusUpdate, setStatusUpdate] = useState({
    status: "completed",
    metadata: {},
  });

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);

      const data = await getTransactions({
        ...filters,
        search: searchQuery,
        page: pagination.page,
        limit: pagination.pageSize,
      });

      setTransactions(data.transactions || []);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
        page: data.pagination?.page || 1,
        totalPages: data.pagination?.totalPages || 1,
      }));
    } catch (error) {
      addToast({
        title: "Error",
        description: error.message || "Failed to fetch transactions",
        color: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize, searchQuery]);

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchTransactions();
  }, [filters, pagination.page, pagination.pageSize, searchQuery]);

  // Fetch transaction details
  const fetchTransactionDetails = async (id) => {
    try {
      setIsDetailsLoading(true);
      const data = await getTransactionDetails(id);
      setSelectedTransaction(data);
      onDetailsOpen();
    } catch (error) {
      console.error("Error fetching transaction details:", error);
      addToast({
        title: "Error",
        description: error.message || "Failed to fetch transaction details",
        color: "error",
      });
    } finally {
      setIsDetailsLoading(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const csvData = await exportTransactionsToCSV({
        ...filters,
        search: searchQuery,
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([csvData]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `transactions_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      addToast({
        title: "Success",
        description: "Transactions exported successfully",
        color: "success",
      });
    } catch (error) {
      console.error("Error exporting transactions:", error);
      addToast({
        title: "Error",
        description: error.message || "Failed to export transactions",
        color: "error",
      });
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1); // Reset to first page when filters change
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM d, yyyy hh:mm a");
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle row click
  const handleRowClick = (transaction) => {
    setSelectedTransaction(transaction);
    fetchTransactionDetails(transaction.transaction_id);
  };

  // Handle status update click
  const handleStatusUpdateClick = (transaction) => {
    setSelectedTransaction(transaction);
    setStatusUpdate({
      status: transaction.status,
      metadata: {},
    });
    onStatusOpen();
  };

  return (
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Transactions History</h1>
            <p className="text-foreground-600">
              View and manage transaction history
            </p>
          </div>
        </div>

        <Card>
          <CardBody>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <div className="flex gap-2 w-full">
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  startContent={
                    <Icon
                      icon="lucide:search"
                      className="text-foreground-400"
                    />
                  }
                  className="w-full"
                />
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      variant="bordered"
                      endContent={<Icon icon="lucide:chevron-down" />}
                    >
                      Filter
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Transaction filter">
                    <DropdownItem key="all" onPress={() => handleFilterChange("status", "")}>
                      All Transactions
                    </DropdownItem>
                    <DropdownItem key="completed" onPress={() => handleFilterChange("status", "completed")}>
                      Completed
                    </DropdownItem>
                    <DropdownItem key="pending" onPress={() => handleFilterChange("status", "pending")}>
                      Pending
                    </DropdownItem>
                    <DropdownItem key="failed" onPress={() => handleFilterChange("status", "failed")}>
                      Failed
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>

            <Table
              removeWrapper
              aria-label="Transactions table"
              bottomContent={
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="default"
                    page={pagination.page}
                    total={pagination.totalPages}
                    onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
                  />
                </div>
              }
            >
              <TableHeader>
                <TableColumn>TRANSACTION ID</TableColumn>
                <TableColumn>SCHOOL</TableColumn>
                <TableColumn>DATE</TableColumn>
                <TableColumn>AMOUNT</TableColumn>
                <TableColumn>PLAN</TableColumn>
                <TableColumn>PAYMENT METHOD</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent={"No transactions found"}>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      #{transaction.id.toString().padStart(6, "0")}
                    </TableCell>
                    <TableCell>{transaction.school}</TableCell>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>{transaction.plan}</TableCell>
                    <TableCell>{transaction.method}</TableCell>
                    <TableCell>
                      <Chip
                        color={
                          transaction.status === "completed"
                            ? "success"
                            : transaction.status === "pending"
                            ? "warning"
                            : "danger"
                        }
                        size="sm"
                      >
                        {transaction.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="flat">
                          View
                        </Button>
                        <Button size="sm" variant="flat" isIconOnly>
                          <Icon icon="lucide:download" />
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

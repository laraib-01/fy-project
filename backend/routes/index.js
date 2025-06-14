import express from "express";
import { register, login, getProfile } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  updateEvent,
} from "../controllers/eventsController.js";
import {
  createRecord,
  getRecords,
} from "../controllers/records.js";
import {
  createSubscription,
  getSubscriptions,
} from "../controllers/subscriptions.js";
import {
  createSubscriptionPlan,
  getSubscriptionPlans,
  getSubscriptionPlanById,
  updateSubscriptionPlan,
  deleteSubscriptionPlan
} from "../controllers/subscriptionPlansController.js";
import {
  createAssignment,
  getAllAssignments,
  updateAssignment,
  deleteAssignment,
  assignmentSubmission,
} from "../controllers/assignments.js";
import {
  createAttendance,
  getAllAttendance,
  updateAttendance,
  deleteAttendance,
} from "../controllers/attendance.js";
import {
  createClass,
  getTeacherClasses,
  updateClass,
  deleteClass,
} from "../controllers/classes.js";
import { getStudents } from "../controllers/students.js";
import {
  getAllSchools,
  createSchool,
  updateSchool,
  deleteSchool,
} from "../controllers/schoolController.js";
import { 
  createTransaction, 
  getAllTransactions, 
  getSchoolTransactions, 
  getTransactionDetails, 
  getTransactionSummary, 
  updateTransactionStatus,
  exportTransactionsToCSV,
  getTransactionStats 
} from "../controllers/transactionsController.js";

const router = express.Router();

//
// 🧑‍💻 User Routes
//
router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getProfile);

//
// 📅 Events
//
router.get("/events", authMiddleware, getAllEvents);              // Get all events
router.post("/events", authMiddleware, createEvent);              // Create event
router.get("/events/:id", authMiddleware, getEventById);           // Get event by ID
router.put("/events/:id", authMiddleware, updateEvent);            // Update event
router.delete("/events/:id", authMiddleware, deleteEvent);         // Delete event

//
// 📂 Records
//
router.use("/records", authMiddleware);
router.post("/records", createRecord);            // Create record
router.get("/records/:student_id", getRecords);   // Get records by student

//
// 💳 Subscriptions
//
router.use("/subscriptions", authMiddleware);
router.post("/subscriptions", createSubscription);   // Create subscription
router.get("/subscriptions", getSubscriptions);      // Get all

//
// 📝 Assignments
//
router.use("/assignments", authMiddleware);
router.post("/assignments", createAssignment);                 // Create
router.get("/assignments", getAllAssignments);                 // Get all
router.put("/assignments/:assignment_id", updateAssignment);   // Update
router.delete("/assignments/:assignment_id", deleteAssignment);// Delete
router.post("/assignments/submit", assignmentSubmission);      // Submit

//
// 🧍 Attendance
//
router.use("/attendance", authMiddleware);
router.post("/attendance", createAttendance);                  // Create
router.get("/attendance", getAllAttendance);                   // Query by ?class_id=
router.put("/attendance/:attendance_id", updateAttendance);    // Update
router.delete("/attendance/:attendance_id", deleteAttendance); // Delete

//
// 🏫 Classes
//
router.use("/classes", authMiddleware);
router.post("/classes", createClass);                // Create class
router.get("/classes", getTeacherClasses);           // Get teacher classes
router.put("/classes/:class_id", updateClass);       // Update
router.delete("/classes/:class_id", deleteClass);    // Delete

//
// 👨‍🎓 Students
//
router.post("/students/:class_id", authMiddleware, getStudents); // Get students by class

//
// 🏢 Schools
//
router.get("/schools", getAllSchools);                         // Public
router.post("/schools", authMiddleware, createSchool);         // Create
router.put("/schools/:id", authMiddleware, updateSchool);      // Update
router.delete("/schools/:id", authMiddleware, deleteSchool);   // Delete

//
// 📝 Subscription Plans
//
router.get("/subscription-plans", authMiddleware, getSubscriptionPlans);                     // Public
router.get("/subscription-plans/:id", authMiddleware, getSubscriptionPlanById);              // Public
router.post("/subscription-plans", authMiddleware, createSubscriptionPlan);                  // Admin only
router.put("/subscription-plans/:id", authMiddleware, updateSubscriptionPlan);               // Admin only
router.delete("/subscription-plans/:id", authMiddleware, deleteSubscriptionPlan);

//
// 💳 Transactions
//
router.get("/transactions", authMiddleware, getAllTransactions);                      // Get all transactions (Admin only)
router.get("/transactions/export", authMiddleware, exportTransactionsToCSV);          // Export transactions to CSV (Admin only)
router.get("/transactions/stats", authMiddleware, getTransactionStats);               // Get transaction statistics (Admin only)
router.get("/transactions/school/:school_id", authMiddleware, getSchoolTransactions); // Get transactions for a school
router.get("/transactions/:id", authMiddleware, getTransactionDetails);                // Get transaction details
router.post("/transactions", authMiddleware, createTransaction);                       // Create transaction (Admin only)
router.put("/transactions/:id/status", authMiddleware, updateTransactionStatus);      // Update transaction status (Admin only)
router.get("/transactions/summary", authMiddleware, getTransactionSummary);           // Get transaction summary (Admin only)

export default router;

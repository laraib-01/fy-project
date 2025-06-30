import express from "express";
import {
  register,
  login,
  logout,
  getProfile,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleCheck from "../middleware/roleMiddleware.js";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  updateEvent,
} from "../controllers/eventsController.js";
import { createRecord, getRecords } from "../controllers/records.js";
import {
  createSubscription,
  getSubscriptions,
} from "../controllers/subscriptions.js";
import {
  createSubscriptionPlan,
  getSubscriptionPlans,
  getSubscriptionPlanById,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
} from "../controllers/subscriptionPlansController.js";
import {
  createClass,
  getTeacherClasses,
  updateClass,
  deleteClass,
  getSchoolClasses,
} from "../controllers/classesController.js";
import {
  getStudentsByClass,
  addStudent,
  updateStudent,
  deleteStudent,
  getAttendanceByDate,
  submitAttendance,
  getAttendanceByDateRange,
  getAttendanceSummary,
} from "../controllers/studentsController.js";
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
  getTransactionStats,
} from "../controllers/transactionsController.js";
import {
  assignClass,
  createTeacher,
  deleteTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
} from "../controllers/teachersController.js";
import {
  getLinkedStudents,
  getStudentAttendance,
  getStudentAssignments,
  getStudentPerformance,
  getSchoolEvents,
} from "../controllers/parentController.js";
import { getSchoolDashboardStats } from "../controllers/dashboardController.js";
import {
  assignmentSubmission,
  createAssignment,
  deleteAssignment,
  getAllAssignments,
  updateAssignment,
  getAssignmentSubmissions,
  getAssignmentSubmissionSummary,
} from "../controllers/assignmentsController.js";

const router = express.Router();

//
// 🧑‍💻 User Routes
//
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, getProfile);

//
// 📅 Events
//
router.get("/events", authMiddleware, getAllEvents); // Get all events
router.post("/events", authMiddleware, createEvent); // Create event
router.get("/events/:id", authMiddleware, getEventById); // Get event by ID
router.put("/events/:id", authMiddleware, updateEvent); // Update event
router.delete("/events/:id", authMiddleware, deleteEvent); // Delete event

//
// 📂 Records
//
router.use("/records", authMiddleware);
router.post("/records", createRecord); // Create record
router.get("/records/:student_id", getRecords); // Get records by student

//
// 💳 Subscriptions
//
router.use("/subscriptions", authMiddleware);
router.post("/subscriptions", createSubscription); // Create subscription
router.get("/subscriptions", getSubscriptions); // Get all

//
// 📝 Assignments
//
router.post(
  "/assignments",
  authMiddleware,
  roleCheck(["Teacher"]),
  createAssignment
); // Create assignment
router.get(
  "/assignments",
  authMiddleware,
  roleCheck(["Teacher", "School_Admin"]),
  getAllAssignments
); // Get all assignments
router.put(
  "/assignments/:assignmentId",
  authMiddleware,
  roleCheck(["Teacher"]),
  updateAssignment
); // Update assignment
router.delete(
  "/assignments/:assignmentId",
  authMiddleware,
  roleCheck(["Teacher"]),
  deleteAssignment
); // Delete assignment
router.post(
  "/assignments/:assignmentId/submissions",
  authMiddleware,
  roleCheck(["Student"]),
  assignmentSubmission
); // Submit assignment
router.get(
  "/assignments/:assignmentId/submissions",
  authMiddleware,
  roleCheck(["Teacher"]),
  getAssignmentSubmissions
); // Get submissions for an assignment
router.get(
  "/assignments/summary",
  authMiddleware,
  roleCheck(["Teacher"]),
  getAssignmentSubmissionSummary
); // Get assignment submission summary

//
//
// 🏫 Teachers
//
router.get(
  "/teachers",
  authMiddleware,
  roleCheck(["School_Admin"]),
  getAllTeachers
); // Get all teachers (School Admin only)
router.get("/teachers/:id", authMiddleware, getTeacherById); // Get teacher by ID
router.post(
  "/teachers",
  authMiddleware,
  roleCheck(["School_Admin"]),
  createTeacher
); // Create teacher (School Admin only)
router.put("/teachers/:id", authMiddleware, updateTeacher); // Update teacher
router.delete(
  "/teachers/:id",
  authMiddleware,
  roleCheck(["School_Admin"]),
  deleteTeacher
); // Delete teacher (School Admin only)
router.post(
  "/teachers/:id",
  authMiddleware,
  roleCheck(["School_Admin"]),
  assignClass
); // Assign class to teacher
router.get(
  "/teachers-classes",
  authMiddleware,
  roleCheck(["Teacher"]),
  getTeacherClasses
); // Get classes taught by teacher

//
// 🏫 Classes
//
router.post(
  "/classes",
  authMiddleware,
  roleCheck(["School_Admin"]),
  createClass
); // Create class
router.get(
  "/classes/all",
  authMiddleware,
  roleCheck(["School_Admin"]),
  getSchoolClasses
); // Get all classes in school (Admin only)
router.put(
  "/classes/:class_id",
  authMiddleware,
  roleCheck(["School_Admin"]),
  updateClass
); // Update
router.delete(
  "/classes/:class_id",
  authMiddleware,
  roleCheck(["School_Admin"]),
  deleteClass
); // Delete

//
// 👨‍🎓 Students
//
router.get(
  "/students/class/:classId",
  authMiddleware,
  roleCheck(["Teacher", "School_Admin"]),
  getStudentsByClass
); // Get students by class ID
router.post(
  "/students",
  authMiddleware,
  roleCheck(["School_Admin"]),
  addStudent
); // Add new student
router.put(
  "/students/:studentId",
  authMiddleware,
  roleCheck(["School_Admin"]),
  updateStudent
); // Update student
router.delete(
  "/students/:studentId",
  authMiddleware,
  roleCheck(["School_Admin"]),
  deleteStudent
); // Delete student
router.get("/:classId/attendance/:date", authMiddleware, getAttendanceByDate);
router.post("/:classId/attendance", authMiddleware, submitAttendance);
router.get(
  "/:classId/attendance/range",
  authMiddleware,
  getAttendanceByDateRange
);
router.get(
  "/:classId/attendance/summary",
  authMiddleware,
  getAttendanceSummary
);

//
// 👨‍👩‍👧‍👦 Parent Routes
//
router.get(
  "/parent/students",
  authMiddleware,
  roleCheck(["Parent"]),
  getLinkedStudents
); // Get all students linked to parent
router.get(
  "/parent/students/:studentId/attendance",
  authMiddleware,
  roleCheck(["Parent"]),
  getStudentAttendance
); // Get student attendance
router.get(
  "/parent/students/:studentId/assignments",
  authMiddleware,
  roleCheck(["Parent"]),
  getStudentAssignments
); // Get student assignments
router.get(
  "/parent/students/:studentId/performance",
  authMiddleware,
  roleCheck(["Parent"]),
  getStudentPerformance
); // Get student performance
router.get(
  "/parent/events",
  authMiddleware,
  roleCheck(["Parent"]),
  getSchoolEvents
); // Get school events

//
// 📊 Dashboard & Analytics
//
router.get(
  "/dashboard/stats",
  authMiddleware,
  roleCheck(["School_Admin"]),
  getSchoolDashboardStats
);

//
// 🏢 Schools
//
router.get("/schools", getAllSchools); // Public
router.post("/schools", authMiddleware, createSchool); // Create
router.put("/schools/:id", authMiddleware, updateSchool); // Update
router.delete("/schools/:id", authMiddleware, deleteSchool); // Delete

//
// 📝 Subscription Plans
//
router.get("/subscription-plans", authMiddleware, getSubscriptionPlans); // Public
router.get("/subscription-plans/:id", authMiddleware, getSubscriptionPlanById); // Public
router.post("/subscription-plans", authMiddleware, createSubscriptionPlan); // Admin only
router.put("/subscription-plans/:id", authMiddleware, updateSubscriptionPlan); // Admin only
router.delete(
  "/subscription-plans/:id",
  authMiddleware,
  deleteSubscriptionPlan
);

//
// 💳 Transactions
//
router.get("/transactions", authMiddleware, getAllTransactions); // Get all transactions (Admin only)
router.get("/transactions/export", authMiddleware, exportTransactionsToCSV); // Export transactions to CSV (Admin only)
router.get("/transactions/stats", authMiddleware, getTransactionStats); // Get transaction statistics (Admin only)
router.get(
  "/transactions/school/:school_id",
  authMiddleware,
  getSchoolTransactions
); // Get transactions for a school
router.get("/transactions/:id", authMiddleware, getTransactionDetails); // Get transaction details
router.post("/transactions", authMiddleware, createTransaction); // Create transaction (Admin only)
router.put("/transactions/:id/status", authMiddleware, updateTransactionStatus); // Update transaction status (Admin only)
router.get("/transactions/summary", authMiddleware, getTransactionSummary); // Get transaction summary (Admin only)

export default router;

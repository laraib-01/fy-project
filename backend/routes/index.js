const express = require("express");
const { register, login } = require("../controllers/user");
const authMiddleware = require("../middleware/auth");
const { createEvent, getAllEvents } = require("../controllers/events");
const { createRecord, getRecords } = require("../controllers/records");
const {
  createSubscription,
  getSubscriptions,
} = require("../controllers/subscriptions");
const {
  createAssignment,
  getAllAssignments,
  updateAssignment,
  deleteAssignment,
  assignmentSubmission,
} = require("../controllers/assignments");
const {
  createAttendance,
  getAllAttendance,
  updateAttendance,
  deleteAttendance,
} = require("../controllers/attendance");
const {
  createClass,
  getTeacherClasses,
  updateClass,
  deleteClass,
} = require("../controllers/classes");
const { getStudents } = require("../controllers/students");
const {
  getAllSchools,
  createSchool,
  updateSchool,
  deleteSchool,
} = require("../controllers/schools");
const router = express.Router();

// User Routes
router.post("/register", register);
router.post("/login", login);

// Events Routes
router.post("/save-event", authMiddleware, createEvent);
router.get("/events", authMiddleware, getAllEvents);

// Records Routes
router.post("/save-record", authMiddleware, createRecord);
router.get("/records/:student_id", authMiddleware, getRecords);

// Subscriptions Routes
router.post("/save-subscription", authMiddleware, createSubscription);
router.get("/subscriptions", authMiddleware, getSubscriptions);

// Assignments Routes
router.post("/save-assignment", authMiddleware, createAssignment);
router.get("/assignments", authMiddleware, getAllAssignments);
router.put(
  "/update-assignment/:assignment_id",
  authMiddleware,
  updateAssignment
);
router.delete(
  "/delete-assignment/:assignment_id",
  authMiddleware,
  deleteAssignment
);

// Assignment Submission Routes
router.post("/submit-assignment", authMiddleware, assignmentSubmission);

// Attendance Routes
router.post("/save-attendance", authMiddleware, createAttendance);
router.get("/attendance", authMiddleware, getAllAttendance);
// Optional query: ?class_id=3
router.put(
  "/update-attendance/:attendance_id",
  authMiddleware,
  updateAttendance
);
router.delete(
  "/delete-attendance/:attendance_id",
  authMiddleware,
  deleteAttendance
);

// # Create attendance
// POST /attendance
// {
//   "student_id": 1,
//   "attendance_date": "2025-05-27",
//   "status": "Present",
//   "class_id": 2
// }

// # Get attendance for class 2
// GET /attendance?class_id=2

// # Update attendance
// PUT /attendance/15
// {
//   "status": "Absent",
//   "attendance_date": "2025-05-27",
//   "class_id": 2
// }

// # Delete attendance
// DELETE /attendance/15

// Classes Routes
router.post("/save-class", authMiddleware, createClass);
router.get("/classes", authMiddleware, getTeacherClasses);
router.put("/update-class/:class_id", authMiddleware, updateClass);
router.delete("/delete-class/:class_id", authMiddleware, deleteClass);

// # Create class
// POST /classes
// {
//   "school_id": 1,
//   "class_name": "8th Grade A"
// }

// # Get all classes for current teacher
// GET /classes

// # Update class name
// PUT /classes/3
// {
//   "class_name": "6th Grade Science (Updated)"
// }

// # Delete class
// DELETE /classes/3

// Student Routes
router.post("/students/:class_id", authMiddleware, getStudents);

// No auth needed for fetching schools
router.get("/schools", getAllSchools);

// Auth + role check handled inline in controller
router.post("/schools", authMiddleware, createSchool);
router.put("/schools/:id", authMiddleware, updateSchool);
router.delete("/schools/:id", authMiddleware, deleteSchool);

module.exports = router;

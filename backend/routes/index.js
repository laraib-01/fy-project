const express = require("express");
const { register, login } = require("../controllers/user");
const authenticate = require("../middleware/auth");
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
router.post("/save-event", authenticate, createEvent);
router.get("/events", authenticate, getAllEvents);

// Records Routes
router.post("/save-record", authenticate, createRecord);
router.get("/records/:student_id", authenticate, getRecords);

// Subscriptions Routes
router.post("/save-subscription", authenticate, createSubscription);
router.get("/subscriptions", authenticate, getSubscriptions);

// Assignments Routes
router.post("/save-assignment", authenticate, createAssignment);
router.get("/assignments", authenticate, getAllAssignments);
router.put(
  "/update-assignment/:assignment_id",
  authenticate,
  updateAssignment
);
router.delete(
  "/delete-assignment/:assignment_id",
  authenticate,
  deleteAssignment
);

// Assignment Submission Routes
router.post("/submit-assignment", authenticate, assignmentSubmission);

// Attendance Routes
router.post("/save-attendance", authenticate, createAttendance);
router.get("/attendance", authenticate, getAllAttendance);
// Optional query: ?class_id=3
router.put(
  "/update-attendance/:attendance_id",
  authenticate,
  updateAttendance
);
router.delete(
  "/delete-attendance/:attendance_id",
  authenticate,
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
router.post("/save-class", authenticate, createClass);
router.get("/classes", authenticate, getTeacherClasses);
router.put("/update-class/:class_id", authenticate, updateClass);
router.delete("/delete-class/:class_id", authenticate, deleteClass);

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
router.post("/students/:class_id", authenticate, getStudents);

// No auth needed for fetching schools
router.get("/schools", getAllSchools);

// Auth + role check handled inline in controller
router.post("/schools", authenticate, createSchool);
router.put("/schools/:id", authenticate, updateSchool);
router.delete("/schools/:id", authenticate, deleteSchool);

module.exports = router;

import express from "express";
import { register, login } from "../controllers/user.js";
import authMiddleware from "../middleware/auth.js";
import {
  createEvent,
  getAllEvents,
} from "../controllers/events.js";
import {
  createRecord,
  getRecords,
} from "../controllers/records.js";
import {
  createSubscription,
  getSubscriptions,
} from "../controllers/subscriptions.js";
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
} from "../controllers/schools.js";

const router = express.Router();

//
// 🧑‍💻 User Routes
//
router.post("/register", register);
router.post("/login", login);

//
// 📅 Events
//
router.use("/events", authMiddleware);
router.post("/events", createEvent);              // Create event
router.get("/events", getAllEvents);              // Get all events

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

export default router;

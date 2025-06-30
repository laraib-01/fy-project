import { api, API_ENDPOINTS } from "../config/api";

const assignmentService = {
  // Get all assignments with optional filters
  getAllAssignments: async (statusFilter = 'all', classId = 'all') => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (classId && classId !== 'all') {
        params.append('class_id', classId);
      }
      
      // Make GET request with query parameters
      const response = await api.get(
        `${API_ENDPOINTS.ASSIGNMENTS.BASE}?${params.toString()}`
      );
      
      return response;
    } catch (err) {
      console.error("Error fetching all assignments:", err);
      throw err;
    }
  },

  // Get assignments by class
  getAssignmentsByClass: async (classId) => {
    try {
      const response = await api.get(
        API_ENDPOINTS.ASSIGNMENTS.BY_CLASS(classId)
      );
      return response.data;
    } catch (err) {
      console.error(`Error fetching assignments for class ${classId}:`, err);
      throw err;
    }
  },

  // Get assignments by teacher
  getAssignmentsByTeacher: async (teacherId) => {
    try {
      const response = await api.get(
        API_ENDPOINTS.ASSIGNMENTS.BY_TEACHER(teacherId)
      );
      return response.data;
    } catch (err) {
      console.error(
        `Error fetching assignments for teacher ${teacherId}:`,
        err
      );
      throw err;
    }
  },

  // Get assignment by ID
  getAssignmentById: async (assignmentId) => {
    try {
      const response = await api.get(
        API_ENDPOINTS.ASSIGNMENTS.BY_ID(assignmentId)
      );
      return response.data;
    } catch (err) {
      console.error(`Error fetching assignment ${assignmentId}:`, err);
      throw err;
    }
  },

  // Create a new assignment
  createAssignment: async (assignmentData) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.ASSIGNMENTS.BASE,
        assignmentData
      );
      return response.data;
    } catch (err) {
      console.error("Error creating assignment:", err);
      throw err;
    }
  },

  // Update an existing assignment
  updateAssignment: async (assignmentId, assignmentData) => {
    try {
      const response = await api.put(
        API_ENDPOINTS.ASSIGNMENTS.BY_ID(assignmentId),
        assignmentData
      );
      return response.data;
    } catch (err) {
      console.error(`Error updating assignment ${assignmentId}:`, err);
      throw err;
    }
  },

  // Delete an assignment
  deleteAssignment: async (assignmentId) => {
    try {
      const response = await api.delete(
        API_ENDPOINTS.ASSIGNMENTS.BY_ID(assignmentId)
      );
      return response.data;
    } catch (err) {
      console.error(`Error deleting assignment ${assignmentId}:`, err);
      throw err;
    }
  },

  // Submit an assignment
  submitAssignment: async (assignmentId, submissionData) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.ASSIGNMENTS.SUBMIT(assignmentId),
        submissionData
      );
      return response.data;
    } catch (err) {
      console.error(`Error submitting assignment ${assignmentId}:`, err);
      throw err;
    }
  },

  // Get all submissions for an assignment
  getSubmissions: async (assignmentId) => {
    try {
      const response = await api.get(
        API_ENDPOINTS.ASSIGNMENTS.SUBMISSIONS(assignmentId)
      );
      return response.data;
    } catch (err) {
      console.error(
        `Error fetching submissions for assignment ${assignmentId}:`,
        err
      );
      throw err;
    }
  },

  // Grade a submission
  gradeSubmission: async (assignmentId, submissionId, gradeData) => {
    try {
      const response = await api.put(
        API_ENDPOINTS.ASSIGNMENTS.GRADE_SUBMISSION(assignmentId, submissionId),
        gradeData
      );
      return response.data;
    } catch (err) {
      console.error(
        `Error grading submission ${submissionId} for assignment ${assignmentId}:`,
        err
      );
      throw err;
    }
  },

  // Get draft assignments
  getDraftAssignments: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.ASSIGNMENTS.DRAFTS);
      return response.data;
    } catch (err) {
      console.error("Error fetching draft assignments:", err);
      throw err;
    }
  },

  // Publish an assignment
  publishAssignment: async (assignmentId) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.ASSIGNMENTS.PUBLISH(assignmentId)
      );
      return response.data;
    } catch (err) {
      console.error(`Error publishing assignment ${assignmentId}:`, err);
      throw err;
    }
  },

  // Unpublish an assignment
  unpublishAssignment: async (assignmentId) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.ASSIGNMENTS.UNPUBLISH(assignmentId)
      );
      return response.data;
    } catch (err) {
      console.error(`Error unpublishing assignment ${assignmentId}:`, err);
      throw err;
    }
  },

  // Update assignment due date
  updateDueDate: async (assignmentId, dueDate) => {
    try {
      const response = await api.put(
        API_ENDPOINTS.ASSIGNMENTS.DUEDATE(assignmentId),
        {
          dueDate,
        }
      );
      return response.data;
    } catch (err) {
      console.error(
        `Error updating due date for assignment ${assignmentId}:`,
        err
      );
      throw err;
    }
  },

  // Get assignment statistics
  getAssignmentStats: async (assignmentId) => {
    try {
      const response = await api.get(
        API_ENDPOINTS.ASSIGNMENTS.STATS(assignmentId)
      );
      return response.data;
    } catch (err) {
      console.error(
        `Error fetching stats for assignment ${assignmentId}:`,
        err
      );
      throw err;
    }
  },

  // Send reminder for an assignment
  sendReminder: async (assignmentId, reminderData) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.ASSIGNMENTS.REMINDERS(assignmentId),
        reminderData
      );
      return response.data;
    } catch (err) {
      console.error(
        `Error sending reminder for assignment ${assignmentId}:`,
        err
      );
      throw err;
    }
  },
};

export default assignmentService;

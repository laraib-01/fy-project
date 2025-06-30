import { api, API_ENDPOINTS } from "../config/api";

const studentService = {
  getStudentsByClass: async (classId, token) => {
    try {
      const response = await api.get(
        API_ENDPOINTS.STUDENTS.BY_CLASS(classId),
        token
      );
      return response;
    } catch (error) {
      console.error("Error fetching students by class:", error);
      throw error;
    }
  },

  addStudent: async (studentData) => {
    try {
      // Format the data to match the backend expectations
      const formattedData = {
        ...studentData,
        // Ensure date fields are properly formatted if they exist
        date_of_birth: studentData.date_of_birth,
        enrollment_date: studentData.enrollment_date,
        // Include parent data if it exists
        parent: studentData.parent ? studentData.parent : undefined,
      };

      console.log("formattedData", formattedData);

      const response = await api.post(
        API_ENDPOINTS.STUDENTS.BASE,
        formattedData
      );

      // Return the complete student data including parent info
      return response.data;
    } catch (error) {
      console.error("Error adding student:", error);
      throw error;
    }
  },

  updateStudent: async (studentId, studentData, token) => {
    try {
      const response = await api.put(
        API_ENDPOINTS.STUDENTS.BY_ID(studentId),
        studentData,
        token
      );
      return response.data;
    } catch (error) {
      console.error("Error updating student:", error);
      throw error;
    }
  },

  deleteStudent: async (studentId, token) => {
    try {
      const response = await api.delete(
        API_ENDPOINTS.STUDENTS.BY_ID(studentId),
        token
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting student:", error);
      throw error;
    }
  },

  getStudentById: async (studentId, token) => {
    try {
      const response = await api.get(
        API_ENDPOINTS.STUDENTS.BY_ID(studentId),
        token
      );
      return response;
    } catch (error) {
      console.error("Error fetching student by ID:", error);
      throw error;
    }
  },

  getAttendanceByDate: async (classId, date, token = null) => {
    try {
      const response = await api.get(
        API_ENDPOINTS.STUDENTS.ATTENDANCE(classId, date),
        token
      );
      return response;
    } catch (error) {
      console.error("Error fetching student by ID:", error);
      throw error;
    }
  },

  getAttendanceByDateRange: async (
    classId,
    startDate,
    endDate,
    token = null
  ) => {
    const response = await api.get(
      API_ENDPOINTS.STUDENTS.ATTENDANCE_RANGE(classId, startDate, endDate),
      token
    );
    return response.data;
  },

  submitAttendance: async (classId, data, token = null) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.STUDENTS.SUBMIT_ATTENDANCE(classId),
        data,
        token
      );
      return response;
    } catch (error) {
      console.error("Error fetching student by ID:", error);
      throw error;
    }
  },

  getAttendanceSummary: async (classId, startDate, endDate, token = null) => {
    const response = await api.get(
      API_ENDPOINTS.STUDENTS.ATTENDANCE_SUMMARY(classId, startDate, endDate),
      token
    );
    return response.data;
  },
};

export default studentService;

import { api, API_ENDPOINTS } from "../config/api";

const teacherService = {
  // Get all teachers (for school admin)
  getAllTeachers: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.TEACHERS.BASE);
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Get teacher by ID
  getTeacherById: async (teacherId) => {
    try {
      const response = await api.get(API_ENDPOINTS.TEACHERS.BY_ID(teacherId));
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Create a new teacher (school admin only)
  createTeacher: async (teacherData) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.TEACHERS.BASE,
        teacherData
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Update teacher information
  updateTeacher: async (teacherId, teacherData) => {
    try {
      const response = await api.put(
        API_ENDPOINTS.TEACHERS.BY_ID(teacherId),
        teacherData
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Delete a teacher (soft delete, school admin only)
  deleteTeacher: async (teacherId) => {
    try {
      const response = await api.delete(
        API_ENDPOINTS.TEACHERS.BY_ID(teacherId)
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Get classes taught by a teacher
  getTeacherClasses: async (teacherId) => {
    try {
      const response = await api.get(
        API_ENDPOINTS.TEACHERS.CLASSES(teacherId)
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Search teachers by name or email
  searchTeachers: async (query) => {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.TEACHERS.BASE}/search?q=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Get teacher statistics (for dashboard)
  getTeacherStats: async (teacherId) => {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.TEACHERS.BASE}/${teacherId}/stats`
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Update teacher's profile picture
  updateProfilePicture: async (teacherId, file) => {
    try {
      const formData = new FormData();
      formData.append("profile_picture", file);

      const response = await api.upload(
        `${API_ENDPOINTS.TEACHERS.BASE}/${teacherId}/profile-picture`,
        formData
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  },
};

export default teacherService;

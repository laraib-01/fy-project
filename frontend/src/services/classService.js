import { api, API_ENDPOINTS } from "../config/api";

const classService = {
  // Get all classes for a school (for school admin)
  getSchoolClasses: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CLASSES.ALL);
      return response.data;
    } catch (err) {
      console.error("Error fetching school classes:", err);
      throw err;
    }
  },

  // Get all classes
  getAllClasses: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CLASSES.BASE);
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Get class by ID
  getClassById: async (classId) => {
    try {
      const response = await api.get(API_ENDPOINTS.CLASSES.BY_ID(classId));
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Create a new class
  createClass: async (classData) => {
    try {
      const response = await api.post(API_ENDPOINTS.CLASSES.BASE, classData);
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Update an existing class
  updateClass: async (classId, classData) => {
    try {
      const response = await api.put(
        API_ENDPOINTS.CLASSES.BY_ID(classId),
        classData
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Delete a class
  deleteClass: async (classId) => {
    try {
      const response = await api.delete(API_ENDPOINTS.CLASSES.BY_ID(classId));
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Get students in a class
  getClassStudents: async (classId) => {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.CLASSES.BASE}/${classId}/students`
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Add student to class
  addStudentToClass: async (classId, studentId) => {
    try {
      const response = await api.post(
        `${API_ENDPOINTS.CLASSES.BASE}/${classId}/students`,
        { studentId }
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Remove student from class
  removeStudentFromClass: async (classId, studentId) => {
    try {
      const response = await api.delete(
        `${API_ENDPOINTS.CLASSES.BASE}/${classId}/students/${studentId}`
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Get class schedule
  getClassSchedule: async (classId) => {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.CLASSES.BASE}/${classId}/schedule`
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Update class schedule
  updateClassSchedule: async (classId, scheduleData) => {
    try {
      const response = await api.put(
        `${API_ENDPOINTS.CLASSES.BASE}/${classId}/schedule`,
        scheduleData
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Get class assignments
  getClassAssignments: async (classId) => {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.CLASSES.BASE}/${classId}/assignments`
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Get class materials
  getClassMaterials: async (classId) => {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.CLASSES.BASE}/${classId}/materials`
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Upload class material
  uploadClassMaterial: async (classId, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.upload(
        `${API_ENDPOINTS.CLASSES.BASE}/${classId}/materials`,
        formData
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Delete class material
  deleteClassMaterial: async (classId, materialId) => {
    try {
      const response = await api.delete(
        `${API_ENDPOINTS.CLASSES.BASE}/${classId}/materials/${materialId}`
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Get class announcements
  getClassAnnouncements: async (classId) => {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.CLASSES.BASE}/${classId}/announcements`
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Create class announcement
  createClassAnnouncement: async (classId, announcementData) => {
    try {
      const response = await api.post(
        `${API_ENDPOINTS.CLASSES.BASE}/${classId}/announcements`,
        announcementData
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Update class announcement
  updateClassAnnouncement: async (
    classId,
    announcementId,
    announcementData
  ) => {
    try {
      const response = await api.put(
        `${API_ENDPOINTS.CLASSES.BASE}/${classId}/announcements/${announcementId}`,
        announcementData
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Delete class announcement
  deleteClassAnnouncement: async (classId, announcementId) => {
    try {
      const response = await api.delete(
        `${API_ENDPOINTS.CLASSES.BASE}/${classId}/announcements/${announcementId}`
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  },
};

export default classService;

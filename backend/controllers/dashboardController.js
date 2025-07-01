import db from "../config/db.js";

// Helper function to format time to 12-hour format
const formatTimeToAMPM = (timeString) => {
  if (!timeString) return "";

  // Split the time string into hours and minutes
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);

  // Determine AM or PM
  const period = hour >= 12 ? "PM" : "AM";

  // Convert to 12-hour format
  const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM

  return `${hour12}:${minutes} ${period}`;
};

// Utility to format responses
const sendResponse = (res, statusCode, status, data, message) => {
  return res.status(statusCode).json({ status, data, message });
};

// Get dashboard statistics for school admin
export const getSchoolDashboardStats = async (req, res) => {
  try {
    const { school_id, role } = req.user;

    // Validate school_id and role
    if (!school_id || role !== "School_Admin") {
      return sendResponse(
        res,
        403,
        "error",
        null,
        "Access denied: Valid School Admin role required"
      );
    }

    // 1. Get basic school statistics
    const [schoolStats] = await db.query(
      `SELECT 
        (SELECT COUNT(*) FROM Students s JOIN Classes c ON s.class_id = c.class_id WHERE c.school_id = ?) as total_students,
        (SELECT COUNT(*) FROM Users WHERE school_id = ? AND role = 'Teacher') as total_teachers,
        (SELECT COUNT(*) FROM Classes WHERE school_id = ?) as total_classes,
        (SELECT COUNT(*) FROM Events WHERE school_id = ?) as total_events,
        (SELECT COUNT(*) FROM Events WHERE school_id = ? AND event_date >= CURRENT_DATE()) as total_upcoming_events
       FROM DUAL`,
      [school_id, school_id, school_id, school_id, school_id]
    );

    // 2. Get attendance statistics for the current month
    const [attendanceStats] = await db.query(
      `SELECT 
        COUNT(CASE WHEN a.status = 'Present' THEN 1 END) as present_count,
        COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) as absent_count
       FROM Attendance a 
       JOIN Students s ON a.student_id = s.student_id 
       JOIN Classes c ON s.class_id = c.class_id 
       WHERE c.school_id = ? 
         AND MONTH(a.attendance_date) = MONTH(CURRENT_DATE())`,
      [school_id]
    );

    // 3. Get upcoming events
    const [upcomingEvents] = await db.query(
      `SELECT * FROM events WHERE school_id = ? AND (event_date > CURDATE() OR (event_date = CURDATE() AND event_time > CURTIME()))`,
      [school_id]
    );

    // 4. Get recent activities
    const [recentActivities] = await db.query(
      `(SELECT 'student' as type, student_id as id, CONCAT(first_name, ' ', last_name) as name, created_at
        FROM Students 
        WHERE class_id IN (SELECT class_id FROM Classes WHERE school_id = ?)
        ORDER BY created_at DESC
        LIMIT 10)
       UNION ALL
       (SELECT 'assignment' as type, assignment_id as id, title as name, created_at
        FROM Assignments 
        WHERE class_id IN (SELECT class_id FROM Classes WHERE school_id = ?)
        ORDER BY created_at DESC
        LIMIT 10)
       ORDER BY created_at DESC
       LIMIT 5`,
      [school_id, school_id]
    );

    // 5. Get class-wise student count
    const [classWiseStats] = await db.query(
      `SELECT c.class_id, c.class_name, COUNT(s.student_id) as student_count
       FROM Classes c
       LEFT JOIN Students s ON c.class_id = s.class_id
       WHERE c.school_id = ?
       GROUP BY c.class_id, c.class_name
       ORDER BY c.class_name`,
      [school_id]
    );

    // 6. Get monthly attendance trend (last 6 months)
    const [attendanceTrend] = await db.query(
      `SELECT 
          DATE_FORMAT(a.attendance_date, '%Y-%m') as month,
          COUNT(CASE WHEN a.status = 'Present' THEN 1 END) as present_count,
          COUNT(*) as total_count
       FROM Attendance a
       JOIN Students s ON a.student_id = s.student_id
       JOIN Classes c ON s.class_id = c.class_id
       WHERE c.school_id = ? 
         AND a.attendance_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(a.attendance_date, '%Y-%m')
       ORDER BY month`,
      [school_id]
    );

    // 7. Get user growth data (teachers, parents, and students, last 12 months)
    const [userGrowth] = await db.query(
      `SELECT 
            month,
            SUM(teachers) as teachers,
            SUM(parents) as parents,
            SUM(students) as students
        FROM (  
          SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            COUNT(*) as teachers,
            0 as parents,
            0 as students
          FROM Users
          WHERE school_id = ? AND role = 'Teacher'
            AND created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
          GROUP BY DATE_FORMAT(created_at, '%Y-%m')
          UNION ALL
          SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            0 as teachers,
            COUNT(*) as parents,
            0 as students
          FROM Users
          WHERE school_id = ? AND role = 'Parent'
            AND created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
          GROUP BY DATE_FORMAT(created_at, '%Y-%m')
          UNION ALL
          SELECT 
            DATE_FORMAT(s.created_at, '%Y-%m') as month,
            0 as teachers,
            0 as parents,
            COUNT(*) as students
          FROM Students s
          JOIN Classes c ON s.class_id = c.class_id
          WHERE c.school_id = ?
            AND s.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
          GROUP BY DATE_FORMAT(s.created_at, '%Y-%m')
        ) as combined
        GROUP BY month
        ORDER BY month`,
      [school_id, school_id, school_id]
    );
    // 8. Get subscription status
    const [subscriptionStatus] = await db.query(
      `SELECT plan_type, start_date, end_date, status, payment_status
       FROM Subscriptions
       WHERE school_id = ? 
         AND status = 'Active' 
         AND end_date >= CURRENT_DATE()
       LIMIT 1`,
      [school_id]
    );

    // Calculate attendance percentage
    const totalAttendance =
      attendanceStats[0].present_count + attendanceStats[0].absent_count;
    const attendancePercentage =
      totalAttendance > 0
        ? Math.round((attendanceStats[0].present_count / totalAttendance) * 100)
        : 0;

    // Format user growth data to match dummy data format
    const userGrowthData = userGrowth.map((item) => ({
      month: new Date(item.month + "-01").toLocaleString("en-US", {
        month: "short",
      }), // e.g., "Jan"
      teachers: Number(item.teachers),
      // parents: Number(item.parents),
      students: Number(item.students),
    }));

    // Format the response
    const response = {
      stats: {
        totalStudents: schoolStats[0].total_students,
        totalTeachers: schoolStats[0].total_teachers,
        totalClasses: schoolStats[0].total_classes,
        totalEvents: schoolStats[0].total_events,
        totalUpcomingEvents: schoolStats[0].total_upcoming_events,
        attendancePercentage,
        subscription: subscriptionStatus[0] || {
          status: "No active subscription",
        },
      },
      attendance: {
        present: attendanceStats[0].present_count,
        absent: attendanceStats[0].absent_count,
        trend: attendanceTrend.map((item) => ({
          month: new Date(item.month + "-01").toLocaleString("en-US", {
            month: "short",
          }),
          percentage:
            item.total_count > 0
              ? Math.round((item.present_count / item.total_count) * 100)
              : 0,
        })),
      },
      upcomingEvents: upcomingEvents.map((event) => ({
        ...event,
        event_time: formatTimeToAMPM(event.event_time), // Format time to 12-hour format
      })),
      recentActivities,
      classStats: classWiseStats,
      userGrowth: userGrowthData,
    };

    return sendResponse(
      res,
      200,
      "success",
      response,
      "Dashboard statistics fetched successfully"
    );
  } catch (error) {
    console.error("Error in getSchoolDashboardStats:", error);
    return sendResponse(
      res,
      500,
      "error",
      null,
      "Failed to fetch dashboard statistics"
    );
  }
};

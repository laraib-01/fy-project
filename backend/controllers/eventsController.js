import db from "../config/db.js";

// Error handler
const handleError = (res, status = 500, message = "An error occurred") => {
  console.error(message);
  return res.status(status).json({
    status: "error",
    message,
  });
};

// Input validation helper
const validateEventInput = (data) => {
  const { event_name, event_date, event_time, event_location } = data;
  const errors = [];

  if (!event_name || event_name.trim() === "")
    errors.push("Event name is required");
  if (!event_date || !Date.parse(event_date))
    errors.push("Valid event date is required");
  if (!event_time) errors.push("Event time is required");
  if (!event_location || event_location.trim() === "")
    errors.push("Event location is required");

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Create an event (Admin only)
export const createEvent = async (req, res) => {
  try {
    const { role, school_id } = req.user;
    const { event_name, event_date, event_time, event_location, description } =
      req.body;

    // Authorization check
    if (role !== "School_Admin") {
      return handleError(res, 403, "Access denied. Admin privileges required");
    }

    // Input validation
    const { isValid, errors } = validateEventInput({
      event_name,
      event_date,
      event_time,
      event_location,
    });

    if (!isValid) {
      return handleError(res, 400, errors.join(", "));
    }

    // Create new event
    const result = await db.query(
      `INSERT INTO events 
       (school_id, event_name, event_date, event_time, event_location, description) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        school_id,
        event_name,
        event_date,
        event_time,
        event_location,
        description || "",
      ]
    );

    // Fetch the created event
    const [newEvent] = await db.query(
      "SELECT * FROM events WHERE event_id = ?",
      [result.insertId]
    );

    return res.status(201).json({
      status: "success",
      message: "Event created successfully",
      data: newEvent,
    });
  } catch (error) {
    console.error("Error in createEvent:", error);
    return handleError(res, 500, "Failed to create event");
  }
};

// Get all events
export const getAllEvents = async (req, res) => {
  // Validate required user data
  if (!req.user || !req.user.school_id) {
    return res
      .status(401)
      .json({ status: "error", message: "Authentication required" });
  }

  try {
    const { school_id } = req.user;
    const { status, limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    let queryStr = "SELECT * FROM events WHERE school_id = ?";
    const queryParams = [school_id];

    // Add status filter if provided
    if (status === "upcoming") {
      queryStr +=
        " AND (event_date > CURDATE() OR (event_date = CURDATE() AND event_time > CURTIME()))";
    } else if (status === "past") {
      queryStr +=
        " AND (event_date < CURDATE() OR (event_date = CURDATE() AND event_time < CURTIME()))";
    }

    // Get total count for pagination
    const countQuery = queryStr.replace("SELECT *", "SELECT COUNT(*) as total");

    try {
      const [countResult] = await db.query(countQuery, [...queryParams]);
      const total = countResult?.total || 0;

      // Add sorting and pagination
      queryStr += " ORDER BY event_date, event_time LIMIT ? OFFSET ?";
      const paginationParams = [
        ...queryParams,
        parseInt(limit),
        parseInt(offset),
      ];

      const events = await db.query(queryStr, paginationParams);

      return res.status(200).json({
        status: "success",
        data: {
          events: events[0],
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (dbError) {
      return handleError(
        res,
        500,
        "Database error occurred while fetching events"
      );
    }
  } catch (error) {
    return handleError(res, 500, "Failed to fetch events");
  }
};

// Get event by ID
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id } = req.user;

    const event = await db.query(
      "SELECT * FROM events WHERE id = ? AND school_id = ?",
      [id, school_id]
    );

    if (event.length === 0) {
      return handleError(res, 404, "Event not found");
    }

    return res.status(200).json({
      status: "success",
      data: {
        event: event[0],
      },
    });
  } catch (error) {
    console.error("Error in getEventById:", error);
    return handleError(res, 500, "Failed to fetch event");
  }
};

// Update an event (Admin only)
export const updateEvent = async (req, res) => {
  try {
    const { role, school_id } = req.user;
    const { id } = req.params;
    const { event_name, event_date, event_time, event_location, description } =
      req.body;

    // Authorization check
    if (role !== "School_Admin") {
      return handleError(res, 403, "Access denied. Admin privileges required");
    }

    // Check if event exists
    const [existingEvent] = await db.query(
      "SELECT * FROM events WHERE event_id = ? AND school_id = ?",
      [id, school_id]
    );
    if (!existingEvent) {
      return handleError(res, 404, "Event not found");
    }

    // Use existing values if not provided in update
    const updatedEvent = {
      event_name: event_name || existingEvent.event_name,
      event_date: event_date || existingEvent.event_date,
      event_time: event_time || existingEvent.event_time,
      event_location: event_location || existingEvent.event_location,
      description:
        description !== undefined ? description : existingEvent.description,
    };

    // Update event
    await db.query(
      `UPDATE events 
       SET event_name = ?, event_date = ?, event_time = ?, 
           event_location = ?, description = ?, updated_at = NOW() 
       WHERE event_id = ? AND school_id = ?`,
      [
        updatedEvent.event_name,
        updatedEvent.event_date,
        updatedEvent.event_time,
        updatedEvent.event_location,
        updatedEvent.description,
        id,
        school_id,
      ]
    );

    // Fetch the updated event
    const [updated] = await db.query(
      "SELECT * FROM events WHERE event_id = ?",
      [id]
    );

    return res.status(200).json({
      status: "success",
      message: "Event updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error in updateEvent:", error);
    return handleError(res, 500, "Failed to update event");
  }
};

// Delete an event (Admin only)
export const deleteEvent = async (req, res) => {
  try {
    const { role, school_id } = req.user;
    const { id } = req.params;

    // Authorization check
    if (role !== "School_Admin") {
      return handleError(res, 403, "Access denied. Admin privileges required");
    }

    // Check if event exists
    const existingEvent = await db.query(
      "SELECT * FROM events WHERE event_id = ? AND school_id = ?",
      [id, school_id]
    );
    if (existingEvent.length === 0) {
      return handleError(res, 404, "Event not found");
    }

    // Delete event
    await db.query("DELETE FROM events WHERE event_id = ? AND school_id = ?", [
      id,
      school_id,
    ]);

    return res.status(200).json({
      status: "success",
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteEvent:", error);
    return handleError(res, 500, "Failed to delete event");
  }
};

// Get upcoming events
export const getUpcomingEvents = async (req, res) => {
  try {
    const { school_id } = req.user;
    const { limit = 5 } = req.query;

    const events = await db.query(
      `SELECT * FROM events 
       WHERE (event_date > CURDATE() OR 
             (event_date = CURDATE() AND event_time > CURTIME())) 
       AND school_id = ? 
       ORDER BY event_date, event_time 
       LIMIT ?`,
      [school_id, parseInt(limit)]
    );

    return res.status(200).json({
      status: "success",
      data: {
        events,
      },
    });
  } catch (error) {
    console.error("Error in getUpcomingEvents:", error);
    return handleError(res, 500, "Failed to fetch upcoming events");
  }
};

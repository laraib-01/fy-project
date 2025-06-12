const db = require("../config/db");

// Create School (EduConnect Admins Only)
const createSchool = async (req, res) => {
  if (req.user.role !== "EduConnect_Admin") {
    return res.status(403).json({
      status: "error",
      message: "You are not authorized to create a school",
    });
  }

  const { name, address, phone_number, email, admin_name, admin_email } =
    req.body;

  // Validate input
  if (
    !name ||
    !address ||
    !phone_number ||
    !email ||
    !admin_name ||
    !admin_email
  ) {
    return res.status(400).json({
      status: "error",
      message: "All fields are required",
    });
  }

  const sql = `
  INSERT INTO school (name, address, phone_number, email, admin_name, admin_email)
  VALUES (?, ?, ?, ?, ?, ?)
`;

  const values = [name, address, phone_number, email, admin_name, admin_email];

  try {
    const [result] = await db.query(sql, values);
    res.status(201).json({
      status: "success",
      message: "School created successfully",
      schoolId: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get All Schools (Public or Authenticated Users)
const getAllSchools = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.school_id,
        s.name,
        s.address,
        s.phone_number,
        s.email,
        s.admin_name,
        s.admin_email,
        sub.plan_type,
        sub.start_date,
        sub.end_date,
        sub.status AS subscription_status,
        sub.payment_status,
        sub.transaction_id
      FROM School s
      LEFT JOIN (
        SELECT * FROM Subscriptions sub
        WHERE (sub.subscription_id, sub.school_id) IN (
          SELECT MAX(subscription_id), school_id
          FROM Subscriptions
          GROUP BY school_id
        )
      ) sub ON s.school_id = sub.school_id
    `);

    res.json({
      status: "success",
      schools: rows,
    });
  } catch (error) {
    console.error("Failed to fetch schools with subscriptions:", error);
    res.status(500).json({
      status: "error",
      message: "Could not fetch schools",
      error: error.message,
    });
  }
};

// Update School (EduConnect Admins Only)
const updateSchool = async (req, res) => {
  if (req.user.role !== "EduConnect_Admin") {
    return res.status(403).json({
      status: "error",
      message: "You are not authorized to update this school",
    });
  }

  const { school_id } = req.params;
  const { name, address, phone_number, email, admin_name, admin_email } =
    req.body;

  if (
    !name ||
    !address ||
    !phone_number ||
    !email ||
    !admin_name ||
    !admin_email
  ) {
    return res.status(400).json({
      status: "error",
      message: "All fields are required",
    });
  }

  try {
    const [result] = await db.query(
      "UPDATE school SET name = ?, address = ?, phone_number = ?, email = ?, admin_name = ?, admin_email = ? WHERE school_id = ?",
      [name, address, phone_number, email, admin_name, admin_email, school_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "School not found",
      });
    }
    res
      .status(200)
      .json({ status: "success", message: "School updated successfully" });
  } catch (error) {
    console.error("Update school error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to update school" });
  }
};

// Delete School (EduConnect Admins Only)
const deleteSchool = async (req, res) => {
  if (req.user.role !== "EduConnect_Admin") {
    return res.status(403).json({
      status: "error",
      message: "You are not authorized to delete this school",
    });
  }

  const { school_id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM School WHERE school_id = ?", [
      school_id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "School not found",
      });
    }
    res.status(200).json({
      status: "success",
      message: "School deleted successfully",
    });
  } catch (error) {
    console.error("Delete school error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete school",
      error: error.message,
    });
  }
};

module.exports = {
  createSchool,
  getAllSchools,
  updateSchool,
  deleteSchool,
};

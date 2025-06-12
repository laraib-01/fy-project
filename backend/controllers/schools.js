const db = require("../config/db");

// Create School (Admins Only)
const createSchool = async (req, res) => {
  if (req.user.role !== "EduConnect_Admin") {
    return res.status(403).json({
      status: "error",
      message: "You are not authorized to create a school",
    });
  }

  const { name, address, phone_number, email, admin_name, admin_email } = req.body;

  if (!name || !address || !phone_number || !email || !admin_name || !admin_email) {
    return res.status(400).json({
      status: "error",
      message:
        "All fields are required: School name, School email, Phone number Address, Admin name, Admin email",
    });
  }

  try {
    db.query(
      "INSERT INTO school (name, address, phone_number, email, admin_name, admin_email) VALUES (?, ?, ?, ?)",
      [name, address, phone_number, email, admin_name, admin_email],
      (err, result) => {
        if (err) {
          console.error("Create school error:", err);
          return res.status(500).json({
            status: "error",
            message: "Failed to create school",
            error: err
          });
        }
        res.status(201).json({
          status: "success",
          message: "School created successfully",
          school_id: result.insertId,
        });
      }
    );
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get All Schools (Public or Authenticated Users)
const getAllSchools = async (req, res) => {
  try {
    db.query("SELECT * FROM school", (err, results) => {
      if (err) {
        console.error("Fetch schools error:", err);
        return res
          .status(500)
          .json({ status: "error", message: "Failed to fetch schools" });
      }
      res.status(200).json({ status: "success", schools: results });
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Update School (Admins Only)
const updateSchool = async (req, res) => {
  if (req.user.role !== "EduConnect_Admin") {
    return res.status(403).json({
      status: "error",
      message: "You are not authorized to update this school",
    });
  }

  const { id } = req.params;
  const { school_name, address, contact_number, email } = req.body;

  if (!school_name || !address || !contact_number || !email) {
    return res.status(400).json({
      status: "error",
      message: "All fields are required",
    });
  }

  try {
    db.query(
      "UPDATE schools SET school_name = ?, address = ?, contact_number = ?, email = ? WHERE id = ?",
      [school_name, address, contact_number, email, id],
      (err, result) => {
        if (err) {
          console.error("Update school error:", err);
          return res
            .status(500)
            .json({ status: "error", message: "Failed to update school" });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({
            status: "error",
            message: "School not found",
          });
        }
        res
          .status(200)
          .json({ status: "success", message: "School updated successfully" });
      }
    );
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Delete School (Admins Only)
const deleteSchool = async (req, res) => {
  if (req.user.role !== "EduConnect_Admin") {
    return res.status(403).json({
      status: "error",
      message: "You are not authorized to delete this school",
    });
  }

  const { id } = req.params;

  try {
    db.query("DELETE FROM schools WHERE id = ?", [id], (err, result) => {
      if (err) {
        console.error("Delete school error:", err);
        return res
          .status(500)
          .json({ status: "error", message: "Failed to delete school" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({
          status: "error",
          message: "School not found",
        });
      }
      res
        .status(200)
        .json({ status: "success", message: "School deleted successfully" });
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = {
  createSchool,
  getAllSchools,
  updateSchool,
  deleteSchool,
};

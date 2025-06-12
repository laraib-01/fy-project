const db = require("../config/db");

const getStudents = (req, res) => {
    const { class_id } = req.params;
    db.query(
        "SELECT * FROM students WHERE class_id = ?",
        [class_id],
        (err, results) => {
            if (err) return res.status(500).json({ error: "Failed to fetch students" });
            res.json(results);
        }
    );
}


module.exports = { getStudents };

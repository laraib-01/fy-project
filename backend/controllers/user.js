const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) return res.status(500).json({ status: "error", message: "Database error" });

        if (results?.length > 0) {
          return res
            .status(400)
            .json({ status: "error", message: "Email already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
          "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
          [name, email, password, role],
          (err, result) => {
            if (err)
              return res.status(500).json({ status: "error", message: "Registration failed" });

            res.status(201).json({
              status: "success",
              message: "User registered successfully",
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err || results.length === 0)
        return res.status(401).json({ status: "error", message: "Invalid credentials" });

      const user = results[0];
      // const isMatch = await bcrypt.compare(password, user.password);
      // if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
      if (password !== user.password) {
        return res.status(401).json({ status: "error", message: "Password is incorrect" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.json({
        status: "success",
        message: "Login successful",
        token,
        userId: user.id,
        role: user.role,
      });
    }
  );
};

module.exports = {
  register,
  login,
};

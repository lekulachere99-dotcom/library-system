const express = require("express");
const router = express.Router();
const pool = require("../config/db");

const ALLOWED_ROLES = ["member", "librarian", "admin"];

// GET /users
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /users
router.post("/", async (req, res, next) => {
  try {
    const { name, membership_id, role = "member" } = req.body;

    if (!name?.trim() || !membership_id?.trim()) {
      return res.status(400).json({ message: "Name and membership ID are required." });
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    const [result] = await pool.query(
      "INSERT INTO users (name, membership_id, role) VALUES (?, ?, ?)",
      [name.trim(), membership_id.trim(), role]
    );

    const [created] = await pool.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
    res.status(201).json(created[0]);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Membership ID already exists." });
    }
    next(err);
  }
});

// PUT /users/:id
router.put("/:id", async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const { name, membership_id, role } = req.body;

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "Invalid user ID." });
    }
    if (!name?.trim() || !membership_id?.trim()) {
      return res.status(400).json({ message: "Name and membership ID are required." });
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    const [result] = await pool.query(
      "UPDATE users SET name = ?, membership_id = ?, role = ? WHERE id = ?",
      [name.trim(), membership_id.trim(), role, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const [updated] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);
    res.json(updated[0]);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Membership ID already belongs to another user." });
    }
    next(err);
  }
});

// DELETE /users/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "User deleted successfully.", id: userId });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
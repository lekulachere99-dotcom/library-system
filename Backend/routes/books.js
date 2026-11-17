const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET /books
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM books ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /books
router.post("/", async (req, res, next) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;
    const qty = Number(quantity ?? 0);

    if (!title?.trim() || !author?.trim() || !genre?.trim() || !isbn?.trim()) {
      return res.status(400).json({ message: "Title, author, genre, and ISBN are required." });
    }
    if (!Number.isInteger(qty) || qty < 0) {
      return res.status(400).json({ message: "Quantity must be a non-negative integer." });
    }

    const [result] = await pool.query(
      "INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)",
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), qty]
    );

    const [created] = await pool.query("SELECT * FROM books WHERE id = ?", [result.insertId]);
    res.status(201).json(created[0]);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "A book with that ISBN already exists." });
    }
    next(err);
  }
});

// PUT /books/:id
router.put("/:id", async (req, res, next) => {
  try {
    const bookId = Number(req.params.id);
    const { title, author, genre, isbn, quantity } = req.body;
    const qty = Number(quantity);

    if (!Number.isInteger(bookId) || bookId <= 0) {
      return res.status(400).json({ message: "Invalid book ID." });
    }
    if (!title?.trim() || !author?.trim() || !genre?.trim() || !isbn?.trim()) {
      return res.status(400).json({ message: "Title, author, genre, and ISBN are required." });
    }
    if (!Number.isInteger(qty) || qty < 0) {
      return res.status(400).json({ message: "Quantity must be a non-negative integer." });
    }

    const [result] = await pool.query(
      "UPDATE books SET title = ?, author = ?, genre = ?, isbn = ?, quantity = ? WHERE id = ?",
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), qty, bookId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Book not found." });
    }

    const [updated] = await pool.query("SELECT * FROM books WHERE id = ?", [bookId]);
    res.json(updated[0]);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Another book already uses that ISBN." });
    }
    next(err);
  }
});

// DELETE /books/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const bookId = Number(req.params.id);
    if (!Number.isInteger(bookId) || bookId <= 0) {
      return res.status(400).json({ message: "Invalid book ID." });
    }

    const [result] = await pool.query("DELETE FROM books WHERE id = ?", [bookId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Book not found." });
    }

    res.json({ message: "Book deleted successfully.", id: bookId });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET /transactions
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        t.id,
        t.book_id,
        t.user_id,
        t.type,
        t.quantity,
        t.created_at,
        b.title AS book_title,
        b.isbn AS book_isbn,
        u.name AS user_name,
        u.membership_id
      FROM transactions t
      JOIN books b ON t.book_id = b.id
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC, t.id DESC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /transactions
router.post("/", async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { book_id, user_id = null, type, quantity } = req.body;
    const bookId = Number(book_id);
    const userId = user_id ? Number(user_id) : null;
    const qty = Number(quantity);

    if (!Number.isInteger(bookId) || bookId <= 0) {
      return res.status(400).json({ message: "Valid book_id is required." });
    }
    if (!["borrow", "restock"].includes(type)) {
      return res.status(400).json({ message: "Type must be 'borrow' or 'restock'." });
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ message: "Quantity must be a positive integer." });
    }

    await connection.beginTransaction();

    const [books] = await connection.query("SELECT * FROM books WHERE id = ? FOR UPDATE", [bookId]);
    if (books.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Book not found." });
    }

    const currentStock = Number(books[0].quantity);
    const newStock = type === "borrow" ? currentStock - qty : currentStock + qty;

    if (newStock < 0) {
      await connection.rollback();
      return res.status(400).json({
        message: `Insufficient stock. Only ${currentStock} copy/copies available.`,
      });
    }

    if (userId !== null) {
      const [users] = await connection.query("SELECT id FROM users WHERE id = ?", [userId]);
      if (users.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: "Selected user not found." });
      }
    }

    await connection.query("UPDATE books SET quantity = ? WHERE id = ?", [newStock, bookId]);

    const [txResult] = await connection.query(
      "INSERT INTO transactions (book_id, user_id, type, quantity) VALUES (?, ?, ?, ?)",
      [bookId, userId, type, qty]
    );

    await connection.commit();

    const [createdTx] = await connection.query(
      `SELECT
         t.id,
         t.book_id,
         t.user_id,
         t.type,
         t.quantity,
         t.created_at,
         b.title AS book_title,
         b.quantity AS updated_stock,
         u.name AS user_name
       FROM transactions t
       JOIN books b ON t.book_id = b.id
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.id = ?`,
      [txResult.insertId]
    );

    res.status(201).json(createdTx[0]);
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

module.exports = router;
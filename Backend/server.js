const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const booksRouter = require("./routes/books");
const usersRouter = require("./routes/users");
const transactionsRouter = require("./routes/transactions");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  })
);
app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

app.use("/books", booksRouter);
app.use("/users", usersRouter);
app.use("/transactions", transactionsRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error.",
  });
});

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
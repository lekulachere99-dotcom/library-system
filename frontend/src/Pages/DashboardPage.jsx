import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import BookList from "../components/BookList";

export default function DashboardPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBooks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/books");
      setBooks(Array.isArray(data) ? data : data.books || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const totalCopies = books.reduce((sum, b) => sum + Number(b.quantity || 0), 0);
  const lowStockBooks = books.filter((b) => Number(b.quantity || 0) < 2);

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard — Book Availability</h1>
        <button type="button" className="btn btn-secondary btn-sm" onClick={loadBooks}>
          Refresh
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Book Titles</div>
          <div className="stat-value">{books.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Copies in Stock</div>
          <div className="stat-value">{totalCopies}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Low Stock (&lt; 2 Copies)</div>
          <div className="stat-value" style={{ color: lowStockBooks.length ? "var(--danger)" : "inherit" }}>
            {lowStockBooks.length}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Current Inventory</h2>
        {loading ? <p>Loading books...</p> : <BookList books={books} lowStockThreshold={2} />}
      </div>
    </div>
  );
}
// src/components/TransactionForm.jsx
import { useState } from "react";

export default function TransactionForm({ books, users, onSubmitTransaction }) {
  const [form, setForm] = useState({
    book_id: books[0]?.id ? String(books[0].id) : "",
    user_id: users[0]?.id ? String(users[0].id) : "",
    type: "borrow", // "borrow" (deduct stock) | "restock" (add stock)
    quantity: "1",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(form.quantity);
    if (!form.book_id) {
      setError("Please select a book.");
      return;
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      setError("Quantity must be at least 1.");
      return;
    }

    const selectedBook = books.find((b) => String(b.id) === String(form.book_id));
    if (form.type === "borrow" && selectedBook && Number(selectedBook.quantity) < qty) {
      setError(`Only ${selectedBook.quantity} copy/copies in stock for borrowing.`);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitTransaction({
        book_id: Number(form.book_id),
        user_id: form.user_id ? Number(form.user_id) : null,
        type: form.type,
        quantity: qty,
      });
      setForm((prev) => ({ ...prev, quantity: "1" }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert-error">{error}</div>}
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="tx-book">Book *</label>
          <select id="tx-book" name="book_id" value={form.book_id} onChange={handleChange}>
            <option value="">-- Select Book --</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} (Stock: {b.quantity})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="tx-type">Action Type *</label>
          <select id="tx-type" name="type" value={form.type} onChange={handleChange}>
            <option value="borrow">Borrow (Deduct Stock)</option>
            <option value="restock">Restock / Return (Add Stock)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="tx-user">Member / User</label>
          <select id="tx-user" name="user_id" value={form.user_id} onChange={handleChange}>
            <option value="">-- Optional / Walk-in --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.membership_id || u.membershipId})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="tx-qty">Quantity *</label>
          <input
            id="tx-qty"
            name="quantity"
            type="number"
            min="1"
            value={form.quantity}
            onChange={handleChange}
          />
        </div>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Recording..." : "Record Transaction"}
        </button>
      </div>
    </form>
  );
}
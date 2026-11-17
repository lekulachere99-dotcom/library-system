import { useEffect, useState } from "react";

export default function EditBookModal({ book, onCancel, onSave }) {
  const [form, setForm] = useState({
    title: "",
    author: "",
    genre: "",
    isbn: "",
    quantity: "0",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (book) {
      setForm({
        title: book.title ?? "",
        author: book.author ?? "",
        genre: book.genre ?? "",
        isbn: book.isbn ?? "",
        quantity: String(book.quantity ?? 0),
      });
      setError("");
    }
  }, [book]);

  if (!book) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim() || !form.genre.trim() || !form.isbn.trim()) {
      setError("All fields are required.");
      return;
    }
    const qty = Number(form.quantity);
    if (!Number.isInteger(qty) || qty < 0) {
      setError("Quantity must be 0 or greater.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSave(book.id, {
        title: form.title.trim(),
        author: form.author.trim(),
        genre: form.genre.trim(),
        isbn: form.isbn.trim(),
        quantity: qty,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ borderColor: "var(--primary)" }}>
      <h3>Editing: {book.title}</h3>
      {error && <div className="alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="edit-title">Title</label>
            <input id="edit-title" name="title" value={form.title} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="edit-author">Author</label>
            <input id="edit-author" name="author" value={form.author} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="edit-genre">Genre</label>
            <input id="edit-genre" name="genre" value={form.genre} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="edit-isbn">ISBN</label>
            <input id="edit-isbn" name="isbn" value={form.isbn} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="edit-quantity">Quantity</label>
            <input
              id="edit-quantity"
              name="quantity"
              type="number"
              min="0"
              value={form.quantity}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="actions-row" style={{ marginTop: "1rem" }}>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? "Saving..." : "Update Book"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
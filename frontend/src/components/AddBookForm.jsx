import { useState } from "react";

const INITIAL_FORM = {
  title: "",
  author: "",
  genre: "",
  isbn: "",
  quantity: "1",
};

export default function AddBookForm({ onAddBook }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!form.author.trim()) nextErrors.author = "Author is required.";
    if (!form.genre.trim()) nextErrors.genre = "Genre is required.";
    if (!form.isbn.trim() || form.isbn.trim().length < 10) {
      nextErrors.isbn = "Valid ISBN (at least 10 characters) is required.";
    }
    const qty = Number(form.quantity);
    if (!Number.isInteger(qty) || qty < 0) {
      nextErrors.quantity = "Quantity must be 0 or a positive integer.";
    }
    return nextErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onAddBook({
        title: form.title.trim(),
        author: form.author.trim(),
        genre: form.genre.trim(),
        isbn: form.isbn.trim(),
        quantity: Number(form.quantity),
      });
      setForm(INITIAL_FORM);
      setErrors({});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="book-title">Title *</label>
          <input
            id="book-title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Clean Code"
          />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="book-author">Author *</label>
          <input
            id="book-author"
            name="author"
            type="text"
            value={form.author}
            onChange={handleChange}
            placeholder="e.g. Robert C. Martin"
          />
          {errors.author && <span className="field-error">{errors.author}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="book-genre">Genre *</label>
          <input
            id="book-genre"
            name="genre"
            type="text"
            value={form.genre}
            onChange={handleChange}
            placeholder="e.g. Programming"
          />
          {errors.genre && <span className="field-error">{errors.genre}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="book-isbn">ISBN *</label>
          <input
            id="book-isbn"
            name="isbn"
            type="text"
            value={form.isbn}
            onChange={handleChange}
            placeholder="e.g. 9780132350884"
          />
          {errors.isbn && <span className="field-error">{errors.isbn}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="book-quantity">Initial Quantity *</label>
          <input
            id="book-quantity"
            name="quantity"
            type="number"
            min="0"
            value={form.quantity}
            onChange={handleChange}
          />
          {errors.quantity && <span className="field-error">{errors.quantity}</span>}
        </div>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Adding..." : "Add Book"}
        </button>
      </div>
    </form>
  );
}
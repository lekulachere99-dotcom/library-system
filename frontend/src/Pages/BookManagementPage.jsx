import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import AddBookForm from "../components/AddBookForm";
import BookList from "../components/BookList";
import EditBookModal from "../components/EditBookModal";

export default function BookManagementPage() {
  const [books, setBooks] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchBooks = async () => {
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
    fetchBooks();
  }, []);

  const handleAddBook = async (newBook) => {
    setError("");
    setMessage("");
    const created = await apiRequest("/books", {
      method: "POST",
      body: JSON.stringify(newBook),
    });
    const bookRecord = created.book || created;
    setBooks((prev) => [bookRecord, ...prev]);
    setMessage(`Added "${newBook.title}" to catalog.`);
  };

  const handleUpdateBook = async (id, updatedFields) => {
    setError("");
    setMessage("");
    const result = await apiRequest(`/books/${id}`, {
      method: "PUT",
      body: JSON.stringify(updatedFields),
    });
    const updatedRecord = result.book || { id, ...updatedFields };
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updatedRecord } : b)));
    setEditingBook(null);
    setMessage(`Updated "${updatedFields.title}".`);
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm("Delete this book from the catalog?")) return;
    setError("");
    setMessage("");
    try {
      await apiRequest(`/books/${id}`, { method: "DELETE" });
      setBooks((prev) => prev.filter((b) => b.id !== id));
      if (editingBook?.id === id) setEditingBook(null);
      setMessage("Book deleted.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Book Management</h1>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {message && <div className="alert-success">{message}</div>}

      <div className="card">
        <h2>Add New Book</h2>
        <AddBookForm onAddBook={handleAddBook} />
      </div>

      {editingBook && (
        <EditBookModal
          book={editingBook}
          onCancel={() => setEditingBook(null)}
          onSave={handleUpdateBook}
        />
      )}

      <div className="card">
        <h2>All Books</h2>
        {loading ? (
          <p>Loading books...</p>
        ) : (
          <BookList
            books={books}
            editable
            onEdit={(book) => setEditingBook(book)}
            onDelete={handleDeleteBook}
          />
        )}
      </div>
    </div>
  );
}
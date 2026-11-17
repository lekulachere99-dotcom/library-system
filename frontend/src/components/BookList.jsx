export default function BookList({
  books,
  editable = false,
  onEdit,
  onDelete,
  lowStockThreshold = 2,
}) {
  if (!books.length) {
    return <p style={{ color: "var(--muted)" }}>No books available.</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Genre</th>
            <th>ISBN</th>
            <th>Stock</th>
            <th>Status</th>
            {editable && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {books.map((book) => {
            const qty = Number(book.quantity ?? 0);
            const isLow = qty < lowStockThreshold;

            return (
              <tr key={book.id} className={isLow ? "low-stock-row" : ""}>
                <td><strong>{book.title}</strong></td>
                <td>{book.author}</td>
                <td>{book.genre}</td>
                <td>{book.isbn}</td>
                <td>{qty}</td>
                <td>
                  {isLow ? (
                    <span className="low-stock-badge">Low Stock (&lt; {lowStockThreshold})</span>
                  ) : (
                    <span className="ok-stock-badge">Available</span>
                  )}
                </td>
                {editable && (
                  <td>
                    <div className="actions-row">
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => onEdit(book)}
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => onDelete(book.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
// src/components/TransactionLog.jsx
export default function TransactionLog({ transactions }) {
  if (!transactions.length) {
    return <p style={{ color: "var(--muted)" }}>No transactions recorded yet.</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Book</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>User</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>#{tx.id}</td>
              <td>{tx.book_title || tx.title || `Book #${tx.book_id}`}</td>
              <td>
                <strong>{tx.type === "restock" ? "Add Stock" : "Borrow / Deduct"}</strong>
              </td>
              <td>{tx.quantity}</td>
              <td>{tx.user_name || tx.name || (tx.user_id ? `User #${tx.user_id}` : "—")}</td>
              <td>{tx.created_at ? new Date(tx.created_at).toLocaleString() : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
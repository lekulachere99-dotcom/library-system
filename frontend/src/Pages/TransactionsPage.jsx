import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import TransactionForm from "../components/TransactionForm";
import TransactionLog from "../components/TransactionLog";

export default function TransactionsPage() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [booksData, usersData, txData] = await Promise.all([
        apiRequest("/books"),
        apiRequest("/users").catch(() => []),
        apiRequest("/transactions"),
      ]);
      setBooks(Array.isArray(booksData) ? booksData : booksData.books || []);
      setUsers(Array.isArray(usersData) ? usersData : usersData.users || []);
      setTransactions(Array.isArray(txData) ? txData : txData.transactions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTransaction = async (payload) => {
    setError("");
    setMessage("");
    await apiRequest("/transactions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setMessage(
      payload.type === "restock"
        ? `Added ${payload.quantity} copy/copies to stock.`
        : `Deducted ${payload.quantity} copy/copies for borrowing.`
    );
    await loadData();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Transactions &amp; Stock Control</h1>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {message && <div className="alert-success">{message}</div>}

      <div className="card">
        <h2>Record Borrow / Restock</h2>
        {loading ? (
          <p>Loading form data...</p>
        ) : (
          <TransactionForm
            books={books}
            users={users}
            onSubmitTransaction={handleTransaction}
          />
        )}
      </div>

      <div className="card">
        <h2>Transaction History Log</h2>
        {loading ? <p>Loading transactions...</p> : <TransactionLog transactions={transactions} />}
      </div>
    </div>
  );
}
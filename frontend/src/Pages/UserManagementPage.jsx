import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import LoginForm from "../components/LoginForm";
import UserForm from "../components/Userform";

export default function UserManagementPage({ currentUser, onLoginSuccess }) {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/users");
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogin = async (membershipId) => {
    setError("");
    // Matches user by membership_id against /users (or POST /users/login if your backend exposes it)
    const matched = users.find(
      (u) => String(u.membership_id || u.membershipId).toLowerCase() === membershipId.toLowerCase()
    );
    if (!matched) {
      throw new Error(`No user found with Membership ID "${membershipId}".`);
    }
    onLoginSuccess(matched);
    setMessage(`Logged in as ${matched.name} (${matched.role}).`);
  };

  const handleSaveUser = async (payload, userId) => {
    setError("");
    setMessage("");
    if (userId) {
      const res = await apiRequest(`/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const updated = res.user || { id: userId, ...payload };
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
      setEditingUser(null);
      setMessage(`Updated user "${payload.name}".`);
    } else {
      const res = await apiRequest("/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const created = res.user || res;
      setUsers((prev) => [created, ...prev]);
      setMessage(`Added user "${payload.name}".`);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    setError("");
    setMessage("");
    try {
      await apiRequest(`/users/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== id));
      if (editingUser?.id === id) setEditingUser(null);
      setMessage("User deleted.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>User Management</h1>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {message && <div className="alert-success">{message}</div>}

      <div className="two-col">
        <div className="card">
          <h2>User Login</h2>
          {currentUser ? (
            <p>
              Signed in as <strong>{currentUser.name}</strong> ({currentUser.role})
            </p>
          ) : (
            <LoginForm onLogin={handleLogin} />
          )}
        </div>

        <div className="card">
          <h2>{editingUser ? "Edit User" : "Add New User"}</h2>
          <UserForm
            editingUser={editingUser}
            onCancelEdit={() => setEditingUser(null)}
            onSaveUser={handleSaveUser}
          />
        </div>
      </div>

      <div className="card">
        <h2>Users Directory</h2>
        {loading ? (
          <p>Loading users...</p>
        ) : !users.length ? (
          <p style={{ color: "var(--muted)" }}>No users found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Membership ID</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.membership_id || u.membershipId}</td>
                    <td>{u.role}</td>
                    <td>
                      <div className="actions-row">
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => setEditingUser(u)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
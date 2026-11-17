// src/components/LoginForm.jsx
import { useState } from "react";

export default function LoginForm({ onLogin }) {
  const [membershipId, setMembershipId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!membershipId.trim()) {
      setError("Please enter your Membership ID.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onLogin(membershipId.trim());
      setMembershipId("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert-error">{error}</div>}
      <div className="form-group">
        <label htmlFor="login-membership-id">Membership ID</label>
        <input
          id="login-membership-id"
          type="text"
          value={membershipId}
          onChange={(e) => setMembershipId(e.target.value)}
          placeholder="e.g. MEM-001"
        />
      </div>
      <div style={{ marginTop: "0.9rem" }}>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </form>
  );
}
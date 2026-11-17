// src/components/UserForm.jsx
import { useEffect, useState } from "react";

const EMPTY_USER = {
  name: "",
  membership_id: "",
  role: "member",
};

export default function UserForm({ editingUser, onCancelEdit, onSaveUser }) {
  const [form, setForm] = useState(EMPTY_USER);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setForm({
        name: editingUser.name ?? "",
        membership_id: editingUser.membership_id ?? editingUser.membershipId ?? "",
        role: editingUser.role ?? "member",
      });
      setErrors({});
    } else {
      setForm(EMPTY_USER);
    }
  }, [editingUser]);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Full name is required.";
    if (!form.membership_id.trim()) next.membership_id = "Membership ID is required.";
    if (!["member", "admin", "librarian"].includes(form.role)) {
      next.role = "Select a valid role.";
    }
    return next;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSaveUser(
        {
          name: form.name.trim(),
          membership_id: form.membership_id.trim(),
          role: form.role,
        },
        editingUser?.id
      );
      if (!editingUser) setForm(EMPTY_USER);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="user-name">Name *</label>
          <input
            id="user-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Thabo Mokoena"
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="user-membership">Membership ID *</label>
          <input
            id="user-membership"
            name="membership_id"
            type="text"
            value={form.membership_id}
            onChange={handleChange}
            placeholder="e.g. MEM-102"
          />
          {errors.membership_id && <span className="field-error">{errors.membership_id}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="user-role">Role *</label>
          <select id="user-role" name="role" value={form.role} onChange={handleChange}>
            <option value="member">Member</option>
            <option value="librarian">Librarian</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && <span className="field-error">{errors.role}</span>}
        </div>
      </div>

      <div className="actions-row" style={{ marginTop: "1rem" }}>
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Saving..." : editingUser ? "Update User" : "Add User"}
        </button>
        {editingUser && (
          <button type="button" className="btn btn-secondary" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
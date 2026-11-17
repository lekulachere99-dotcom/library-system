import { NavLink } from "react-router-dom";

export default function Navbar({ currentUser, onLogout }) {
  return (
    <header className="navbar">
      <div className="navbar-brand">BIWA2110 Library System</div>

      <nav className="nav-links" aria-label="Main Navigation">
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          Dashboard
        </NavLink>
        <NavLink to="/books" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          Book Management
        </NavLink>
        <NavLink to="/transactions" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          Transactions
        </NavLink>
        <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          User Management
        </NavLink>
      </nav>

      <div className="actions-row">
        {currentUser ? (
          <>
            <span className="nav-user">
              {currentUser.name} ({currentUser.role})
            </span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <span className="nav-user">Guest</span>
        )}
      </div>
    </header>
  );
}
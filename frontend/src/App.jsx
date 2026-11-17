import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import DashboardPage from "./Pages/DashboardPage";
import BookManagementPage from "./Pages/BookManagementPage";
import TransactionsPage from "./Pages/TransactionsPage";
import UserManagementPage from "./Pages/UserManagementPage";
import "./App.css";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar currentUser={currentUser} onLogout={() => setCurrentUser(null)} />
        <main className="container">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/books" element={<BookManagementPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route
              path="/users"
              element={
                <UserManagementPage
                  currentUser={currentUser}
                  onLoginSuccess={(user) => setCurrentUser(user)}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
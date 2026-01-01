import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./DashboardLayout.css";

function DashboardLayout({ children }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">K SmartOps</div>

        <NavLink to="/" className="nav-link">
          Dashboard
        </NavLink>

        <NavLink to="/upload" className="nav-link">
          Upload Data
        </NavLink>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>

        <div className="user-box">
          <div className="email">{user?.email}</div>
          <div className="role">{user?.role}</div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="main-area">
        <header className="topbar">
          KSH SmartOps Dashboard
        </header>

        <main className="page-content">
          {children}
        </main>

        <footer className="footer">
          © 2025 KSH SmartOps. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default DashboardLayout;

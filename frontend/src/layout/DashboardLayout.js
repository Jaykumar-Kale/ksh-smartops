import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

function DashboardLayout({ children }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
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

        <div className="user-info">
          <strong>{user?.email}</strong>
          <div className="role">{user?.role}</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          KSH SmartOps Dashboard
        </header>

        <section className="content">
          {children}
        </section>

        <footer className="footer">
          © 2025 KSH SmartOps. All rights reserved.
        </footer>
      </main>
    </div>
  );
}

export default DashboardLayout;

import React from 'react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AppLayout.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/accounts', label: 'Accounts', icon: '💼' },
  { path: '/transfer', label: 'Transfer', icon: '💸' },
  { path: '/transactions', label: 'Transactions', icon: '📊' },
];

function AppLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="app-sidebar">
        <div className="sidebar-brand-wrap">
          <h1 className="sidebar-brand">{collapsed ? 'BA' : 'BankingApp'}</h1>
        </div>

        <nav className="sidebar-nav" aria-label="Main Navigation">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className="sidebar-link">
              <span className="sidebar-icon">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}

          <button type="button" className="sidebar-link logout-link" onClick={handleLogout}>
            <span className="sidebar-icon">🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </nav>
      </aside>

      <div className="app-main-column">
        <header className="top-navbar">
          <button
            type="button"
            className="toggle-button"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>

          <h2 className="app-title">BankingApp</h2>

          <div className="top-user-block">
            <span className="profile-icon" aria-hidden="true">👤</span>
            <span>{user?.name || 'User'}</span>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
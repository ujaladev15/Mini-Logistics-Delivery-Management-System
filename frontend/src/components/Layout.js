import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleLabel = { admin: 'Administrator', driver: 'Driver', customer: 'Customer' };

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || '??';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>SwiftRoute</h1>
          <span>Logistics Platform</span>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <div className="user-info">
            <div className="name">{user?.name}</div>
            <div className="role">{roleLabel[user?.role]}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">Navigation</div>
          <NavLink to="/dashboard" className={({isActive}) => `nav-link${isActive?' active':''}`}>
            <span className="icon">◈</span> Dashboard
          </NavLink>

          {(user?.role === 'admin' || user?.role === 'customer') && (
            <NavLink to="/orders" className={({isActive}) => `nav-link${isActive?' active':''}`}>
              <span className="icon">⊞</span> Orders
            </NavLink>
          )}

          {user?.role === 'customer' && (
            <>
              <div className="nav-section">Actions</div>
              <NavLink to="/orders/create" className={({isActive}) => `nav-link${isActive?' active':''}`}>
                <span className="icon">＋</span> Create Order
              </NavLink>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <div className="nav-section">Admin</div>
              <NavLink to="/orders/assign" className={({isActive}) => `nav-link${isActive?' active':''}`}>
                <span className="icon">↗</span> Assign Drivers
              </NavLink>
            </>
          )}

          {user?.role === 'driver' && (
            <>
              <div className="nav-section">My Work</div>
              <NavLink to="/driver/orders" className={({isActive}) => `nav-link${isActive?' active':''}`}>
                <span className="icon">⊡</span> My Orders
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span>⏻</span> Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

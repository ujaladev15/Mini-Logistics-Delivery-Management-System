import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.role === 'admin') {
          const [statsRes, ordersRes] = await Promise.all([
            api.get('/users/stats'),
            api.get('/orders?limit=5'),
          ]);
          setStats(statsRes.data.stats);
          setRecentOrders(ordersRes.data.orders);
        } else if (user.role === 'customer') {
          const ordersRes = await api.get('/orders?limit=5');
          setRecentOrders(ordersRes.data.orders);
          const total = ordersRes.data.pagination.total;
          setStats({ totalOrders: total });
        } else if (user.role === 'driver') {
          const ordersRes = await api.get('/orders/driver/assigned?limit=5');
          setRecentOrders(ordersRes.data.orders);
          setStats({ totalOrders: ordersRes.data.pagination.total });
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user.role]);

  const fmt = (dt) => dt ? new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  if (loading) return <div className="loading-inline"><div className="spinner-sm" /><span>Loading...</span></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user.name}</p>
        </div>
        {user.role === 'customer' && (
          <Link to="/orders/create" className="btn btn-primary">＋ New Order</Link>
        )}
        {user.role === 'admin' && (
          <Link to="/orders/assign" className="btn btn-primary">↗ Assign Drivers</Link>
        )}
      </div>

      {user.role === 'admin' && stats && (
        <div className="stats-grid">
          <div className="stat-card amber">
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{stats.totalOrders}</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{stats.byStatus?.pending || 0}</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-label">Assigned</div>
            <div className="stat-value">{stats.byStatus?.assigned || 0}</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Delivered</div>
            <div className="stat-value">{stats.byStatus?.delivered || 0}</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-label">Drivers</div>
            <div className="stat-value">{stats.totalDrivers}</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Customers</div>
            <div className="stat-value">{stats.totalCustomers}</div>
          </div>
        </div>
      )}

      {(user.role === 'customer' || user.role === 'driver') && stats && (
        <div className="stats-grid">
          <div className="stat-card amber">
            <div className="stat-label">{user.role === 'driver' ? 'Assigned Orders' : 'My Orders'}</div>
            <div className="stat-value">{stats.totalOrders}</div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            {user.role === 'driver' ? 'My Recent Assignments' : 'Recent Orders'}
          </h2>
          <Link to={user.role === 'driver' ? '/driver/orders' : '/orders'} className="btn btn-ghost btn-sm">
            View All →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📦</div>
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Pickup</th>
                  <th>Delivery</th>
                  {user.role !== 'customer' && <th>Customer</th>}
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td><span className="id-cell mono">{order.id.slice(0,8)}…</span></td>
                    <td><div className="address-cell"><span>{order.pickup_address}</span></div></td>
                    <td><div className="address-cell"><span>{order.delivery_address}</span></div></td>
                    {user.role !== 'customer' && <td>{order.customer_name}</td>}
                    <td><StatusBadge status={order.status} /></td>
                    <td style={{color:'var(--text-muted)',fontSize:13}}>{fmt(order.created_at)}</td>
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

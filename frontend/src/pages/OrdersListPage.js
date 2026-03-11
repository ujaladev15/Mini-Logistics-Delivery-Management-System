import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';

export default function OrdersListPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (status) params.set('status', status);
      const { data } = await api.get(`/orders?${params}`);
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [status]);

  useEffect(() => { fetchOrders(1); }, [fetchOrders]);

  const fmt = (dt) => dt ? new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{pagination.total} total orders</p>
        </div>
        {user.role === 'customer' && (
          <Link to="/orders/create" className="btn btn-primary">＋ New Order</Link>
        )}
        {user.role === 'admin' && (
          <Link to="/orders/assign" className="btn btn-primary">↗ Assign Drivers</Link>
        )}
      </div>

      <div className="filter-bar">
        <label style={{fontSize:12,color:'var(--text-muted)',fontFamily:'IBM Plex Mono'}}>FILTER BY STATUS</label>
        <select
          className="form-select"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="picked">Picked</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      <div className="card" style={{padding:0,overflow:'hidden'}}>
        {loading ? (
          <div className="loading-inline"><div className="spinner-sm" /><span>Loading orders...</span></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <p>No orders found{status ? ` with status "${status}"` : ''}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  {user.role === 'admin' && <th>Customer</th>}
                  <th>Pickup Address</th>
                  <th>Delivery Address</th>
                  <th>Status</th>
                  {user.role === 'admin' && <th>Driver</th>}
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td><span className="id-cell mono" title={order.id}>{order.id.slice(0,8)}…</span></td>
                    {user.role === 'admin' && <td style={{fontWeight:500}}>{order.customer_name}</td>}
                    <td>
                      <div className="address-cell">
                        <span>{order.pickup_address}</span>
                      </div>
                    </td>
                    <td>
                      <div className="address-cell">
                        <span>{order.delivery_address}</span>
                      </div>
                    </td>
                    <td><StatusBadge status={order.status} /></td>
                    {user.role === 'admin' && (
                      <td style={{color: order.driver_name ? 'var(--text)' : 'var(--text-muted)', fontSize: 13}}>
                        {order.driver_name || '— unassigned'}
                      </td>
                    )}
                    <td style={{color:'var(--text-muted)',fontSize:13}}>{fmt(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={fetchOrders}
      />
    </div>
  );
}

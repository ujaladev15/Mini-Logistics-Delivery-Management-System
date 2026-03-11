import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';

const TRANSITIONS = { assigned: 'picked', picked: 'delivered' };
const TRANSITION_LABELS = { assigned: '◕ Mark as Picked', picked: '● Mark as Delivered' };

function UpdateModal({ order, onClose, onSuccess }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nextStatus = TRANSITIONS[order.status];

  const handleUpdate = async () => {
    if (!nextStatus) return;
    setLoading(true);
    setError('');
    try {
      await api.patch(`/orders/${order.id}/status`, { status: nextStatus });
      onSuccess(nextStatus);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Update Order Status</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div style={{marginBottom:20,padding:16,background:'var(--bg)',borderRadius:'var(--radius)',border:'1px solid var(--border)'}}>
          <div style={{fontSize:11,fontFamily:'IBM Plex Mono',color:'var(--text-muted)',marginBottom:4}}>ORDER</div>
          <div style={{fontSize:13,fontFamily:'IBM Plex Mono',color:'var(--accent)',marginBottom:8}}>{order.id.slice(0,8)}…</div>
          <div style={{fontSize:13,marginBottom:4}}><span style={{color:'var(--text-muted)'}}>From: </span>{order.pickup_address}</div>
          <div style={{fontSize:13,marginBottom:8}}><span style={{color:'var(--text-muted)'}}>To: </span>{order.delivery_address}</div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:12,color:'var(--text-muted)'}}>Current:</span>
            <StatusBadge status={order.status} />
            {nextStatus && <><span style={{fontSize:12}}>→</span><StatusBadge status={nextStatus} /></>}
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {!nextStatus ? (
          <p style={{color:'var(--green)',fontSize:14}}>✓ This order has been delivered.</p>
        ) : (
          <div style={{display:'flex',gap:10}}>
            <button className="btn btn-success" onClick={handleUpdate} disabled={loading}>
              {loading ? <><span className="spinner-sm" /> Updating...</> : TRANSITION_LABELS[order.status]}
            </button>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DriverDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/orders/driver/assigned?${params}`);
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchOrders(1); }, [fetchOrders]);

  const handleSuccess = (newStatus) => {
    setSelectedOrder(null);
    setSuccessMsg(`Order updated to "${newStatus}"!`);
    setTimeout(() => setSuccessMsg(''), 3000);
    fetchOrders(pagination.page);
  };

  const fmt = (dt) => dt ? new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Deliveries</h1>
          <p className="page-subtitle">{pagination.total} orders assigned to you</p>
        </div>
      </div>

      {successMsg && <div className="alert alert-success">✓ {successMsg}</div>}

      <div className="filter-bar">
        <label style={{fontSize:12,color:'var(--text-muted)',fontFamily:'IBM Plex Mono'}}>FILTER</label>
        <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All</option>
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
            <div className="icon">🚚</div>
            <p>No orders assigned to you yet</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Pickup</th>
                  <th>Delivery</th>
                  <th>Status</th>
                  <th>Assigned</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td><span className="id-cell mono">{order.id.slice(0,8)}…</span></td>
                    <td style={{fontWeight:500}}>{order.customer_name}</td>
                    <td><div className="address-cell"><span>{order.pickup_address}</span></div></td>
                    <td><div className="address-cell"><span>{order.delivery_address}</span></div></td>
                    <td><StatusBadge status={order.status} /></td>
                    <td style={{color:'var(--text-muted)',fontSize:13}}>{fmt(order.assigned_at)}</td>
                    <td>
                      {order.status === 'delivered' ? (
                        <span style={{color:'var(--green)',fontSize:13}}>✓ Done</span>
                      ) : (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          Update Status
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={fetchOrders} />

      {selectedOrder && (
        <UpdateModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

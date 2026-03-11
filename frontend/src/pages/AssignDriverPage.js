import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';

function AssignModal({ order, drivers, onClose, onSuccess }) {
  const [driverId, setDriverId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!driverId) { setError('Please select a driver'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post(`/orders/${order.id}/assign`, { driver_id: driverId });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign driver.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Assign Driver</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div style={{marginBottom:20,padding:16,background:'var(--bg)',borderRadius:'var(--radius)',border:'1px solid var(--border)'}}>
          <div style={{fontSize:11,fontFamily:'IBM Plex Mono',color:'var(--text-muted)',marginBottom:4}}>ORDER</div>
          <div style={{fontSize:13,marginBottom:8,fontFamily:'IBM Plex Mono',color:'var(--accent)'}}>{order.id.slice(0,8)}…</div>
          <div style={{fontSize:13,marginBottom:4}}><span style={{color:'var(--text-muted)'}}>From: </span>{order.pickup_address}</div>
          <div style={{fontSize:13}}><span style={{color:'var(--text-muted)'}}>To: </span>{order.delivery_address}</div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Select Driver *</label>
          <select className="form-select" value={driverId} onChange={e => setDriverId(e.target.value)}>
            <option value="">— Choose a driver —</option>
            {drivers.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.email})</option>
            ))}
          </select>
        </div>

        <div style={{display:'flex',gap:10,marginTop:20}}>
          <button className="btn btn-primary" onClick={handleAssign} disabled={loading}>
            {loading ? <><span className="spinner-sm" /> Assigning...</> : '↗ Assign Driver'}
          </button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function AssignDriverPage() {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const [ordersRes, driversRes] = await Promise.all([
        api.get(`/orders?status=pending&page=${page}&limit=10`),
        api.get('/users/drivers'),
      ]);
      setOrders(ordersRes.data.orders);
      setPagination(ordersRes.data.pagination);
      setDrivers(driversRes.data.drivers);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(1); }, [fetchData]);

  const handleSuccess = () => {
    setSelectedOrder(null);
    setSuccessMsg('Driver assigned successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
    fetchData(pagination.page);
  };

  const fmt = (dt) => dt ? new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Assign Drivers</h1>
          <p className="page-subtitle">{pagination.total} pending orders awaiting assignment</p>
        </div>
      </div>

      {successMsg && <div className="alert alert-success">✓ {successMsg}</div>}

      {drivers.length === 0 && !loading && (
        <div className="alert alert-error">⚠ No drivers in the system. Register driver accounts first.</div>
      )}

      <div className="card" style={{padding:0,overflow:'hidden'}}>
        <div className="card-header" style={{padding:'16px 24px'}}>
          <h2 className="card-title">Pending Orders</h2>
          <span className="badge badge-pending">{pagination.total} pending</span>
        </div>

        {loading ? (
          <div className="loading-inline"><div className="spinner-sm" /><span>Loading...</span></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="icon">✅</div>
            <p>All orders have been assigned!</p>
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
                  <th>Date</th>
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
                    <td style={{color:'var(--text-muted)',fontSize:13}}>{fmt(order.created_at)}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setSelectedOrder(order)}
                        disabled={drivers.length === 0}
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={fetchData} />

      {selectedOrder && (
        <AssignModal
          order={selectedOrder}
          drivers={drivers}
          onClose={() => setSelectedOrder(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

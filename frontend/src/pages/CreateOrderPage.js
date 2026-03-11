import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ pickup_address: '', delivery_address: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.pickup_address.trim()) e.pickup_address = 'Pickup address is required';
    else if (form.pickup_address.trim().length < 10) e.pickup_address = 'Please enter a complete address';
    if (!form.delivery_address.trim()) e.delivery_address = 'Delivery address is required';
    else if (form.delivery_address.trim().length < 10) e.delivery_address = 'Please enter a complete address';
    if (form.pickup_address.trim() === form.delivery_address.trim())
      e.delivery_address = 'Pickup and delivery addresses must be different';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    setSuccess('');
    try {
      const { data } = await api.post('/orders', form);
      setSuccess(`Order #${data.order.id.slice(0,8)} created successfully!`);
      setForm({ pickup_address: '', delivery_address: '', notes: '' });
      setTimeout(() => navigate('/orders'), 2000);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to create order.');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Create New Order</h1>
          <p className="page-subtitle">Schedule a pickup and delivery</p>
        </div>
      </div>

      <div className="card" style={{maxWidth: 640}}>
        <div className="card-header">
          <h2 className="card-title">Order Details</h2>
          <span className="badge badge-pending">○ Pending</span>
        </div>

        {apiError && <div className="alert alert-error">{apiError}</div>}
        {success && <div className="alert alert-success">✓ {success}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Pickup Address *</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. 123 Main Street, Connaught Place, New Delhi"
              value={form.pickup_address}
              onChange={set('pickup_address')}
            />
            {errors.pickup_address && <div className="form-error">{errors.pickup_address}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Address *</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. 456 Park Avenue, Lajpat Nagar, New Delhi"
              value={form.delivery_address}
              onChange={set('delivery_address')}
            />
            {errors.delivery_address && <div className="form-error">{errors.delivery_address}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Special delivery instructions, fragile items, etc."
              value={form.notes}
              onChange={set('notes')}
            />
          </div>

          <div style={{display:'flex', gap:12, marginTop:8}}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? <><span className="spinner-sm" /> Creating...</> : '＋ Create Order'}
            </button>
            <button type="button" className="btn btn-outline btn-lg" onClick={() => navigate('/orders')}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{maxWidth: 640}}>
        <div style={{color:'var(--text-muted)'}}>
          <h3 style={{fontSize:16,marginBottom:12,color:'var(--text)'}}>Order Flow</h3>
          <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
            <span className="badge badge-pending">○ Pending</span>
            <span style={{fontSize:12}}>→</span>
            <span className="badge badge-assigned">◑ Assigned</span>
            <span style={{fontSize:12}}>→</span>
            <span className="badge badge-picked">◕ Picked</span>
            <span style={{fontSize:12}}>→</span>
            <span className="badge badge-delivered">● Delivered</span>
          </div>
          <p style={{fontSize:13,marginTop:12}}>Your order will be assigned to a driver and you can track its progress in the Orders page.</p>
        </div>
      </div>
    </div>
  );
}

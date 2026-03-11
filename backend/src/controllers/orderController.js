const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../config/database');

const STATUS_TRANSITIONS = {
  pending: ['assigned'],
  assigned: ['picked'],
  picked: ['delivered'],
  delivered: [],
};

// Helper: fetch full order with joins
async function fetchOrder(db, id) {
  return db('orders as o')
    .select(
      'o.*',
      'u.name as customer_name', 'u.email as customer_email',
      'd.driver_id', 'drv.name as driver_name', 'drv.email as driver_email',
      'd.assigned_at'
    )
    .join('users as u', 'o.customer_id', 'u.id')
    .leftJoin('deliveries as d', 'o.id', 'd.order_id')
    .leftJoin('users as drv', 'd.driver_id', 'drv.id')
    .where('o.id', id)
    .first();
}

// POST /orders
const createOrder = async (req, res) => {
  try {
    const { pickup_address, delivery_address, notes } = req.body;
    const db = getDb();
    const id = uuidv4();
    await db('orders').insert({ id, customer_id: req.user.id, pickup_address, delivery_address, notes: notes || null });
    const order = await fetchOrder(db, id);
    res.status(201).json({ message: 'Order created successfully', order });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /orders
const getOrders = async (req, res) => {
  try {
    const db = getDb();
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let baseQuery = db('orders as o')
      .join('users as u', 'o.customer_id', 'u.id')
      .leftJoin('deliveries as d', 'o.id', 'd.order_id')
      .leftJoin('users as drv', 'd.driver_id', 'drv.id');

    if (req.user.role === 'customer') baseQuery = baseQuery.where('o.customer_id', req.user.id);
    if (status) baseQuery = baseQuery.where('o.status', status);

    const [{ count: total }] = await baseQuery.clone().count('o.id as count');

    const orders = await baseQuery.clone()
      .select('o.*', 'u.name as customer_name', 'u.email as customer_email',
              'd.driver_id', 'drv.name as driver_name', 'drv.email as driver_email', 'd.assigned_at')
      .orderBy('o.created_at', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    res.json({
      orders,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: parseInt(total), totalPages: Math.ceil(parseInt(total) / parseInt(limit)) },
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /orders/:id
const getOrder = async (req, res) => {
  try {
    const db = getDb();
    const order = await fetchOrder(db, req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    if (req.user.role === 'customer' && order.customer_id !== req.user.id)
      return res.status(403).json({ error: 'Access denied.' });
    res.json({ order });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /orders/:id/assign
const assignDriver = async (req, res) => {
  try {
    const { driver_id } = req.body;
    const db = getDb();

    const order = await db('orders').where('id', req.params.id).first();
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    if (order.status !== 'pending')
      return res.status(400).json({ error: `Cannot assign driver. Order status is '${order.status}'. Only pending orders can be assigned.` });

    const driver = await db('users').where({ id: driver_id, role: 'driver' }).first();
    if (!driver) return res.status(404).json({ error: 'Driver not found.' });

    // Transaction: insert delivery + update order status
    await db.transaction(async (trx) => {
      await trx('deliveries').insert({ id: uuidv4(), order_id: order.id, driver_id });
      await trx('orders').where('id', order.id).update({ status: 'assigned', updated_at: new Date().toISOString() });
    });

    const updated = await fetchOrder(db, order.id);
    res.json({ message: 'Driver assigned successfully', order: updated });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// PATCH /orders/:id/status
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const db = getDb();

    const order = await db('orders as o')
      .select('o.*', 'd.driver_id')
      .leftJoin('deliveries as d', 'o.id', 'd.order_id')
      .where('o.id', req.params.id)
      .first();

    if (!order) return res.status(404).json({ error: 'Order not found.' });
    if (req.user.role === 'driver' && order.driver_id !== req.user.id)
      return res.status(403).json({ error: 'You are not assigned to this order.' });

    const allowed = STATUS_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status))
      return res.status(400).json({ error: `Invalid status transition from '${order.status}' to '${status}'.`, allowedTransitions: allowed });

    await db('orders').where('id', order.id).update({ status, updated_at: new Date().toISOString() });

    const updated = await fetchOrder(db, order.id);
    res.json({ message: `Order status updated to '${status}'`, order: updated });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /orders/driver/assigned
const getDriverOrders = async (req, res) => {
  try {
    const db = getDb();
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let baseQuery = db('orders as o')
      .join('users as u', 'o.customer_id', 'u.id')
      .join('deliveries as d', 'o.id', 'd.order_id')
      .where('d.driver_id', req.user.id);

    if (status) baseQuery = baseQuery.where('o.status', status);

    const [{ count: total }] = await baseQuery.clone().count('o.id as count');

    const orders = await baseQuery.clone()
      .select('o.*', 'u.name as customer_name', 'd.assigned_at')
      .orderBy('d.assigned_at', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    res.json({
      orders,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: parseInt(total), totalPages: Math.ceil(parseInt(total) / parseInt(limit)) },
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { createOrder, getOrders, getOrder, assignDriver, updateStatus, getDriverOrders };

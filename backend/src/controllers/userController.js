const { getDb } = require('../config/database');

const getUsers = async (req, res) => {
  try {
    const db = getDb();
    const { role } = req.query;
    let query = db('users').select('id','name','email','role','created_at').orderBy('created_at','desc');
    if (role) query = query.where('role', role);
    const users = await query;
    res.json({ users });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getDrivers = async (req, res) => {
  try {
    const db = getDb();
    const drivers = await db('users').select('id','name','email','role','created_at')
      .where('role','driver').orderBy('name');
    res.json({ drivers });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getStats = async (req, res) => {
  try {
    const db = getDb();
    const orderStats = await db('orders').select('status').count('id as count').groupBy('status');
    const [{ count: totalOrders }] = await db('orders').count('id as count');
    const [{ count: totalDrivers }] = await db('users').where('role','driver').count('id as count');
    const [{ count: totalCustomers }] = await db('users').where('role','customer').count('id as count');

    const statusMap = { pending: 0, assigned: 0, picked: 0, delivered: 0 };
    orderStats.forEach(s => { statusMap[s.status] = parseInt(s.count); });

    res.json({ stats: { totalOrders: parseInt(totalOrders), totalDrivers: parseInt(totalDrivers), totalCustomers: parseInt(totalCustomers), byStatus: statusMap } });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getUsers, getDrivers, getStats };

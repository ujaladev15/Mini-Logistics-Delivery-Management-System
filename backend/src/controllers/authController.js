const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../config/database');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDb();
    const user = await db('users').where('email', email).first();
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ message: 'Login successful', token, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const db = getDb();
    const existing = await db('users').where('email', email).first();
    if (existing) 
      return res.status(409).json({ error: 'Email already registered.' });
    
    const hashed = bcrypt.hashSync(password, 10);
    const id = uuidv4();
    await db('users').insert({ id, name, email, password: hashed, role: role || 'customer' });
    const user = await db('users').select('id','name','email','role','created_at').where('id', id).first();
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
    res.status(201).json({ message: 'Registration successful', token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMe = (req, res) => res.json({ user: req.user });

module.exports = { login, register, getMe };

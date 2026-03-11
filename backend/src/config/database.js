const knex = require('knex');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = process.env.DB_PATH || './logistics.db';

let db;

function getDb() {
  if (!db) {
    db = knex({
      client: 'sqlite3',
      connection: { filename: path.resolve(DB_PATH) },
      useNullAsDefault: true,
    });
  }
  return db;
}

async function initializeDatabase() {
  const database = getDb();

  await database.schema.createTableIfNotExists('users', (t) => {
    t.string('id').primary();
    t.string('name').notNullable();
    t.string('email').unique().notNullable();
    t.string('password').notNullable();
    t.string('role').notNullable();
    t.datetime('created_at').defaultTo(database.fn.now());
  });

  await database.schema.createTableIfNotExists('orders', (t) => {
    t.string('id').primary();
    t.string('customer_id').notNullable().references('id').inTable('users');
    t.text('pickup_address').notNullable();
    t.text('delivery_address').notNullable();
    t.string('status').notNullable().defaultTo('pending');
    t.text('notes');
    t.datetime('created_at').defaultTo(database.fn.now());
    t.datetime('updated_at').defaultTo(database.fn.now());
  });

  await database.schema.createTableIfNotExists('deliveries', (t) => {
    t.string('id').primary();
    t.string('order_id').notNullable().unique().references('id').inTable('orders');
    t.string('driver_id').notNullable().references('id').inTable('users');
    t.datetime('assigned_at').defaultTo(database.fn.now());
  });

  // Seed demo users if not exists
  const existing = await database('users').where('email', 'admin@logistics.com').first();
  if (!existing) {
    const hashedPassword = bcrypt.hashSync('password123', 10);
    await database('users').insert([
      { id: uuidv4(), name: 'Admin User',     email: 'admin@logistics.com',     password: hashedPassword, role: 'admin' },
      { id: uuidv4(), name: 'John Driver',    email: 'driver@logistics.com',    password: hashedPassword, role: 'driver' },
      { id: uuidv4(), name: 'Jane Driver',    email: 'driver2@logistics.com',   password: hashedPassword, role: 'driver' },
      { id: uuidv4(), name: 'Alice Customer', email: 'customer@logistics.com',  password: hashedPassword, role: 'customer' },
      { id: uuidv4(), name: 'Bob Customer',   email: 'customer2@logistics.com', password: hashedPassword, role: 'customer' },
    ]);
    console.log('✅ Demo users seeded');
    console.log('   admin@logistics.com / password123');
    console.log('   driver@logistics.com / password123');
    console.log('   customer@logistics.com / password123');
  }

  console.log('✅ Database initialized');
  return database;
}

module.exports = { getDb, initializeDatabase };

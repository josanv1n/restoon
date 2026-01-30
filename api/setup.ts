
import { createPool } from '@vercel/postgres';
import { VercelRequest, VercelResponse } from '@vercel/node';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!process.env.POSTGRES_URL) {
      throw new Error("POSTGRES_URL is missing.");
    }

    // 1. Core Tables
    await pool.sql`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        table_number INTEGER,
        items TEXT NOT NULL,
        total NUMERIC NOT NULL,
        status TEXT NOT NULL,
        created_at BIGINT NOT NULL,
        order_date TEXT,
        payment_status TEXT NOT NULL DEFAULT 'UNPAID',
        payment_method TEXT,
        origin TEXT DEFAULT 'OFFLINE',
        customer_id TEXT
      );
    `;

    await pool.sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        payment_method TEXT NOT NULL,
        created_at BIGINT NOT NULL,
        transaction_date TEXT NOT NULL
      );
    `;

    await pool.sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        name TEXT NOT NULL
      );
    `;

    await pool.sql`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT
      );
    `;

    // 2. Migration: Update existing tables
    try { await pool.sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_date TEXT`; } catch(e) {}
    try { await pool.sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id TEXT`; } catch(e) {}

    // 3. Default Admin Account (Username: admin, Pass: admin123)
    const { rowCount: userCount } = await pool.sql`SELECT * FROM users WHERE username = 'admin'`;
    if (userCount === 0) {
      await pool.sql`
        INSERT INTO users (id, username, password, role, name)
        VALUES ('1', 'admin', 'admin123', 'ADMIN', 'Super Admin')
      `;
      // Default Staff for Testing
      await pool.sql`INSERT INTO users (id, username, password, role, name) VALUES ('2', 'pelayan1', '12345', 'PELAYAN', 'Budi Waiter') ON CONFLICT DO NOTHING`;
      await pool.sql`INSERT INTO users (id, username, password, role, name) VALUES ('3', 'kasir1', '12345', 'KASIR', 'Siti Cashier') ON CONFLICT DO NOTHING`;
    }

    await pool.sql`
      CREATE TABLE IF NOT EXISTS menu_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price NUMERIC NOT NULL,
        stock INTEGER DEFAULT 100
      );
    `;

    await pool.sql`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `;

    // Seeding menu items if empty
    const { rowCount: menuCount } = await pool.sql`SELECT * FROM menu_items LIMIT 1`;
    if (menuCount === 0) {
      await pool.sql`
        INSERT INTO menu_items (id, name, category, price, stock) VALUES 
        ('1', 'Nasi + Rendang', 'FOOD', 26000, 100),
        ('2', 'Nasi + Ayam Goreng', 'FOOD', 23000, 100),
        ('3', 'Nasi + Ayam Bakar', 'FOOD', 23000, 100),
        ('4', 'Nasi + Ayam Telur Dadar', 'FOOD', 20000, 100),
        ('5', 'Nasi + Tunjang', 'FOOD', 27500, 100),
        ('6', 'Rendang', 'FOOD', 20000, 100),
        ('7', 'Ayam Goreng', 'FOOD', 16000, 100),
        ('8', 'Ayam Bakar', 'FOOD', 16000, 100),
        ('9', 'Telur Dadar', 'FOOD', 14000, 100),
        ('10', 'Sayur Nangka', 'FOOD', 10000, 100),
        ('11', 'Jengkol Balado', 'FOOD', 31000, 100),
        ('12', 'Minuman Es Kelapa Jeruk', 'DRINK', 25000, 50),
        ('13', 'Minuman Es Teh', 'DRINK', 3000, 100),
        ('14', 'Minuman Teh Hangat', 'DRINK', 2000, 100),
        ('15', 'Minuman Es Jeruk', 'DRINK', 10000, 100);
      `;
    }
    
    return res.status(200).json({ status: "Success", message: "Database Resto-On v3.0 (Auth Ready) Upgraded." });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
}

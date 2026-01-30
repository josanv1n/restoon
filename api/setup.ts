
import { createPool } from '@vercel/postgres';
import { VercelRequest, VercelResponse } from '@vercel/node';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!process.env.POSTGRES_URL) throw new Error("POSTGRES_URL is missing.");

    // Core Tables Creation
    await pool.sql`CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, type TEXT, table_number INTEGER, items TEXT, total NUMERIC, status TEXT, created_at BIGINT, order_date TEXT, payment_status TEXT, payment_method TEXT, origin TEXT, customer_id TEXT)`;
    await pool.sql`CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY, order_id TEXT, amount NUMERIC, payment_method TEXT, created_at BIGINT, transaction_date TEXT)`;
    await pool.sql`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE, password TEXT, role TEXT, name TEXT)`;
    await pool.sql`CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY, email TEXT UNIQUE, password TEXT, name TEXT, phone TEXT)`;
    await pool.sql`CREATE TABLE IF NOT EXISTS menu_items (id TEXT PRIMARY KEY, name TEXT, category TEXT, price NUMERIC, stock INTEGER)`;
    await pool.sql`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`;

    // Migration Check
    try { await pool.sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT`; } catch(e) {}

    // Seed Users based on USER SCREENSHOT
    const { rowCount: userCount } = await pool.sql`SELECT * FROM users LIMIT 1`;
    if (userCount === 0) {
      await pool.sql`
        INSERT INTO users (id, username, password, role, name) VALUES 
        ('admin-1', 'admin1', 'admin123', 'ADMIN', 'Super Admin'),
        ('ksr-1', 'kasir1', 'kasir123', 'KASIR', 'Siti Kasir'),
        ('mgt-1', 'manager1', 'manager123', 'MANAGEMENT', 'Budi Manager'),
        ('ply-1', 'pelayan1', 'ply1', 'PELAYAN', 'Andi Pelayan')
      `;
    }

    // Seed Menu if empty
    const { rowCount: menuCount } = await pool.sql`SELECT * FROM menu_items LIMIT 1`;
    if (menuCount === 0) {
      await pool.sql`
        INSERT INTO menu_items (id, name, category, price, stock) VALUES 
        ('1', 'Nasi + Rendang', 'FOOD', 26000, 100), ('2', 'Nasi + Ayam Goreng', 'FOOD', 23000, 100),
        ('3', 'Nasi + Ayam Bakar', 'FOOD', 23000, 100), ('4', 'Nasi + Ayam Telur Dadar', 'FOOD', 20000, 100),
        ('5', 'Nasi + Tunjang', 'FOOD', 27500, 100), ('6', 'Rendang', 'FOOD', 20000, 100),
        ('7', 'Ayam Goreng', 'FOOD', 16000, 100), ('8', 'Ayam Bakar', 'FOOD', 16000, 100),
        ('9', 'Telur Dadar', 'FOOD', 14000, 100), ('10', 'Sayur Nangka', 'FOOD', 10000, 100),
        ('11', 'Jengkol Balado', 'FOOD', 31000, 100), ('12', 'Minuman Es Kelapa Jeruk', 'DRINK', 25000, 100),
        ('13', 'Minuman Es Teh', 'DRINK', 3000, 100), ('14', 'Minuman Teh Hangat', 'DRINK', 2000, 100),
        ('15', 'Minuman Es Jeruk', 'DRINK', 10000, 100)
      `;
    }
    
    return res.status(200).json({ success: true, message: "Database Resto-On Synced with User Data." });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

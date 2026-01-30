
import { createPool } from '@vercel/postgres';
import { VercelRequest, VercelResponse } from '@vercel/node';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!process.env.POSTGRES_URL) {
      throw new Error("POSTGRES_URL is missing. Please connect Neon in Vercel Storage tab.");
    }

    // 1. Tables for Core Logic
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
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        table_number INTEGER,
        items TEXT NOT NULL,
        total NUMERIC NOT NULL,
        status TEXT NOT NULL,
        created_at BIGINT NOT NULL,
        payment_status TEXT NOT NULL,
        payment_method TEXT,
        origin TEXT DEFAULT 'OFFLINE'
      );
    `;

    await pool.sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL
      );
    `;

    await pool.sql`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `;

    await pool.sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        order_id TEXT REFERENCES orders(id),
        type TEXT NOT NULL, -- 'SALE' or 'PURCHASE'
        amount NUMERIC NOT NULL,
        description TEXT,
        created_at BIGINT NOT NULL
      );
    `;

    // 2. Seeding Initial Data if empty
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

    const { rowCount: userCount } = await pool.sql`SELECT * FROM users LIMIT 1`;
    if (userCount === 0) {
      await pool.sql`
        INSERT INTO users (id, username, password, role) VALUES 
        ('admin-1', 'admin', 'admin123', 'ADMIN'),
        ('mgt-1', 'manager', 'manager123', 'MANAGEMENT'),
        ('ksr-1', 'kasir', 'kasir123', 'KASIR');
      `;
    }

    const { rowCount: settingsCount } = await pool.sql`SELECT * FROM settings LIMIT 1`;
    if (settingsCount === 0) {
      await pool.sql`
        INSERT INTO settings (key, value) VALUES 
        ('promoText', 'Diskon 10% untuk Pembelian via Transfer BCA!'),
        ('restaurantName', 'BAGINDO RAJO'),
        ('address', 'Jl. Future No. 101, Techno City');
      `;
    }
    
    return res.status(200).json({ 
      status: "Success", 
      message: "Database Resto-On v2.6 berhasil diinisialisasi!",
      details: "Semua tabel dan data Bagindo Rajo telah siap."
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      status: "Error", 
      message: error.message 
    });
  }
}

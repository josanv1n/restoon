
import { createPool } from '@vercel/postgres';
import { VercelRequest, VercelResponse } from '@vercel/node';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!process.env.POSTGRES_URL) throw new Error("POSTGRES_URL is missing.");

    // 1. Pastikan semua tabel inti tersedia (Tanpa menghapus data)
    await pool.sql`CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, type TEXT, table_number INTEGER, items TEXT, total NUMERIC, status TEXT, created_at BIGINT, order_date TEXT, payment_status TEXT, payment_method TEXT, origin TEXT, customer_id TEXT)`;
    await pool.sql`CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY, order_id TEXT, amount NUMERIC, payment_method TEXT, created_at BIGINT, transaction_date TEXT)`;
    await pool.sql`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE, password TEXT, role TEXT, name TEXT)`;
    await pool.sql`CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY, email TEXT UNIQUE, password TEXT, name TEXT, phone TEXT)`;
    await pool.sql`CREATE TABLE IF NOT EXISTS menu_items (id TEXT PRIMARY KEY, name TEXT, category TEXT, price NUMERIC, stock INTEGER, image_url TEXT)`;
    await pool.sql`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`;

    // 2. Migrasi: Tambahkan kolom baru jika belum ada (Safe Migration)
    try { await pool.sql`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url TEXT`; } catch(e) {}
    try { await pool.sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT`; } catch(e) {}

    // 3. Update data yang sudah ada: Jika ada menu lama tanpa gambar, berikan gambar default yang baru
    const imageUpdates = [
      { id: '1', url: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=800&auto=format&fit=crop' },
      { id: '6', url: 'https://images.unsplash.com/photo-1541544741938-0af808b77e40?q=80&w=800&auto=format&fit=crop' },
      { id: '11', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop' }
    ];

    for (const item of imageUpdates) {
      await pool.sql`UPDATE menu_items SET image_url = ${item.url} WHERE id = ${item.id} AND (image_url IS NULL OR image_url = '')`;
    }

    // 4. Seeding: Hanya isi jika tabel benar-benar kosong
    const { rowCount: menuCount } = await pool.sql`SELECT * FROM menu_items LIMIT 1`;
    if (menuCount === 0) {
      await pool.sql`
        INSERT INTO menu_items (id, name, category, price, stock, image_url) VALUES 
        ('1', 'Nasi + Rendang', 'FOOD', 26000, 100, 'https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=800&auto=format&fit=crop'), 
        ('2', 'Nasi + Ayam Goreng', 'FOOD', 23000, 100, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=800&auto=format&fit=crop'),
        ('3', 'Nasi + Ayam Bakar', 'FOOD', 23000, 100, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=800&auto=format&fit=crop'), 
        ('11', 'Jengkol Balado Luxury', 'FOOD', 31000, 100, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop'),
        ('15', 'Es Jeruk Peras', 'DRINK', 10000, 100, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=800&auto=format&fit=crop')
      `;
    }
    
    return res.status(200).json({ 
      success: true, 
      message: "Protokol Resto-On Berhasil Disinkronkan. Data lama Anda tetap aman, kolom gambar telah diperbarui." 
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

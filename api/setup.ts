
import { createPool } from '@vercel/postgres';
import { VercelRequest, VercelResponse } from '@vercel/node';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!process.env.POSTGRES_URL) throw new Error("POSTGRES_URL is missing.");
    const OPT = 'q=40&w=320&auto=format&fit=crop';

    await pool.sql`CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, type TEXT, table_number INTEGER, items TEXT, total NUMERIC, status TEXT, created_at BIGINT, order_date TEXT, payment_status TEXT, payment_method TEXT, origin TEXT, customer_id TEXT)`;
    await pool.sql`CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY, order_id TEXT, amount NUMERIC, payment_method TEXT, created_at BIGINT, transaction_date TEXT)`;
    await pool.sql`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE, password TEXT, role TEXT, name TEXT)`;
    await pool.sql`CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY, email TEXT UNIQUE, password TEXT, name TEXT, phone TEXT)`;
    await pool.sql`CREATE TABLE IF NOT EXISTS menu_items (id TEXT PRIMARY KEY, name TEXT, category TEXT, price NUMERIC, stock INTEGER, image_url TEXT)`;
    await pool.sql`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`;

    // Check if tablesCount exists
    const { rows: tableSetting } = await pool.sql`SELECT * FROM settings WHERE key = 'tablesCount'`;
    if (tableSetting.length === 0) {
      await pool.sql`INSERT INTO settings (key, value) VALUES ('tablesCount', '12')`;
    }

    try { await pool.sql`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url TEXT`; } catch(e) {}

    // Force update all images to low-res for existing data
    const { rows: currentMenu } = await pool.sql`SELECT id, image_url FROM menu_items`;
    for (const item of currentMenu) {
        if (item.image_url && item.image_url.includes('unsplash.com') && !item.image_url.includes('q=40')) {
            const cleanUrl = item.image_url.split('?')[0];
            await pool.sql`UPDATE menu_items SET image_url = ${`${cleanUrl}?${OPT}`} WHERE id = ${item.id}`;
        }
    }

    const { rowCount: menuCount } = await pool.sql`SELECT * FROM menu_items LIMIT 1`;
    if (menuCount === 0) {
      await pool.sql`
        INSERT INTO menu_items (id, name, category, price, stock, image_url) VALUES 
        ('1', 'Nasi + Rendang', 'FOOD', 26000, 100, ${`https://images.unsplash.com/photo-1626074353765-517a681e40be?${OPT}`}), 
        ('2', 'Nasi + Ayam Goreng', 'FOOD', 23000, 100, ${`https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?${OPT}`}),
        ('11', 'Jengkol Balado Luxury', 'FOOD', 31000, 100, ${`https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?${OPT}`}),
        ('15', 'Es Jeruk Peras', 'DRINK', 10000, 100, ${`https://images.unsplash.com/photo-1613478223719-2ab802602423?${OPT}`})
      `;
    }
    
    return res.status(200).json({ success: true, message: "Protocol Optimized for Speed." });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

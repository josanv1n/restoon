
import { createPool } from '@vercel/postgres';
import { VercelRequest, VercelResponse } from '@vercel/node';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!process.env.POSTGRES_URL) throw new Error("POSTGRES_URL is missing.");
    
    const OPT = 'q=20&w=300&auto=format&fit=crop&fm=webp';

    // 1. Pastikan Tabel Tersedia
    // Update tabel customers dengan kolom created_at
    await Promise.all([
      pool.sql`CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, type TEXT, table_number INTEGER, items TEXT, total NUMERIC, status TEXT, created_at BIGINT, order_date TEXT, payment_status TEXT, payment_method TEXT, origin TEXT, customer_id TEXT)`,
      pool.sql`CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY, order_id TEXT, amount NUMERIC, payment_method TEXT, created_at BIGINT, transaction_date TEXT)`,
      pool.sql`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE, password TEXT, role TEXT, name TEXT)`,
      pool.sql`CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY, email TEXT UNIQUE, password TEXT, name TEXT, phone TEXT, created_at BIGINT)`,
      pool.sql`CREATE TABLE IF NOT EXISTS menu_items (id TEXT PRIMARY KEY, name TEXT, category TEXT, price NUMERIC, stock INTEGER, image_url TEXT)`,
      pool.sql`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`
    ]);

    // 2. Default Settings
    await pool.sql`INSERT INTO settings (key, value) VALUES ('tablesCount', '12') ON CONFLICT (key) DO NOTHING`;
    await pool.sql`INSERT INTO settings (key, value) VALUES ('restaurantName', 'RM. Bagindo Rajo') ON CONFLICT (key) DO NOTHING`;

    // 3. Initial Seeding Menu
    const fullMenu = [
      { id: '1', name: 'Nasi + Rendang', price: 26000, cat: 'FOOD', img: '1626074353765-517a681e40be' }, 
      { id: '2', name: 'Nasi + Ayam Goreng', price: 23000, cat: 'FOOD', img: '1626645738196-c2a7c87a8f58' },
      { id: '3', name: 'Nasi + Ayam Bakar', price: 23000, cat: 'FOOD', img: '1598515214211-89d3c73ae83b' },
      { id: '4', name: 'Nasi + Ayam Telur Dadar', price: 20000, cat: 'FOOD', img: '1518492104633-130d0cc84637' },
      { id: '5', name: 'Nasi + Tunjang', price: 27500, cat: 'FOOD', img: '1546069901-ba9599a7e63c' },
      { id: '6', name: 'Rendang Premium', price: 20000, cat: 'FOOD', img: '1585032226651-759b368d7246' }, 
      { id: '7', name: 'Ayam Goreng Lengkuas', price: 16000, cat: 'FOOD', img: '1567620832903-9fc6debc209f' },
      { id: '8', name: 'Ayam Bakar Spesial', price: 16000, cat: 'FOOD', img: '1555939594-58d7cb561ad1' },
      { id: '9', name: 'Telur Dadar Barembo', price: 14000, cat: 'FOOD', img: '1525351484163-7529414344d8' },
      { id: '10', name: 'Sayur Nangka Kapau', price: 10000, cat: 'FOOD', img: '1512621776951-a57141f2eefd' },
      { id: '11', name: 'Jengkol Balado Luxury', price: 31000, cat: 'FOOD', img: '1563379091339-03b21ab4a4f8' },
      { id: '12', name: 'Es Kelapa Muda (Dogan)', price: 15000, cat: 'DRINK', img: '1544145945-f904253d0c7b' },
      { id: '13', name: 'Es Teh Manis', price: 3000, cat: 'DRINK', img: '1556679343-c7306c1976bc' },
      { id: '14', name: 'Teh Hangat', price: 2000, cat: 'DRINK', img: '1564890369478-c89ca6d9cde9' },
      { id: '15', name: 'Es Jeruk Peras', price: 10000, cat: 'DRINK', img: '1613478223719-2ab802602423' },
      { id: '16', name: 'Nasi Putih Hangat', price: 6000, cat: 'FOOD', img: '1536304993881-ff6e9eefa2a6' },
    ];

    for (const item of fullMenu) {
      const imageUrl = `https://images.unsplash.com/photo-${item.img}?${OPT}`;
      await pool.sql`
        INSERT INTO menu_items (id, name, category, price, stock, image_url)
        VALUES (${item.id}, ${item.name}, ${item.cat}, ${item.price}, 100, ${imageUrl})
        ON CONFLICT (id) DO NOTHING
      `;
    }

    return res.status(200).json({ success: true, message: "Database restoon initialized with created_at support." });
  } catch (error: any) {
    console.error("Setup Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

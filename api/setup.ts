
import { createPool } from '@vercel/postgres';
import { VercelRequest, VercelResponse } from '@vercel/node';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
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
        payment_method TEXT
      );
    `;
    return res.status(200).json({ message: "Tables initialized successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

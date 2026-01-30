
import { createPool } from '@vercel/postgres';
import { VercelRequest, VercelResponse } from '@vercel/node';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { rows } = await pool.sql`SELECT * FROM settings`;
    const settingsMap = rows.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as any);
    return res.json(settingsMap);
  }

  if (req.method === 'POST') {
    const updates = req.body; // { key: value }
    for (const [key, value] of Object.entries(updates)) {
      await pool.sql`
        INSERT INTO settings (key, value)
        VALUES (${key}, ${String(value)})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
    }
    return res.json({ success: true });
  }

  return res.status(405).end();
}

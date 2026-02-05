
import { createPool } from '@vercel/postgres';
import { VercelRequest, VercelResponse } from '@vercel/node';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { username, password, type } = req.body;

    if (type === 'STAFF') {
      const { rows } = await pool.sql`
        SELECT id, username, role, name 
        FROM users 
        WHERE username = ${username} AND password = ${password}
      `;

      if (rows.length > 0) {
        const user = rows[0];
        // Normalisasi role ke UPPERCASE agar sesuai dengan enum di frontend
        return res.status(200).json({ 
          success: true, 
          user: { ...user, role: user.role.toUpperCase() } 
        });
      }
    } else {
      // Customer Login
      const { rows } = await pool.sql`
        SELECT id, name, email, phone, address
        FROM customers 
        WHERE email = ${username} AND password = ${password}
      `;

      if (rows.length > 0) {
        return res.status(200).json({ success: true, user: rows[0] });
      }
    }

    return res.status(401).json({ success: false, error: 'Kredensial tidak valid' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

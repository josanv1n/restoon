
import { createPool } from '@vercel/postgres';
import { VercelRequest, VercelResponse } from '@vercel/node';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Data tidak lengkap' });
    }

    const id = 'CUST-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const createdAt = Date.now();

    // Simpan ke tabel customers termasuk alamat
    await pool.sql`
      INSERT INTO customers (id, name, email, password, phone, address, created_at)
      VALUES (${id}, ${name}, ${email}, ${password}, ${phone || null}, ${address || null}, ${createdAt})
    `;

    return res.status(201).json({ success: true, message: 'Registrasi Berhasil' });
  } catch (error: any) {
    if (error.message.includes('unique constraint')) {
      return res.status(409).json({ error: 'Email sudah terdaftar' });
    }
    return res.status(500).json({ error: error.message });
  }
}

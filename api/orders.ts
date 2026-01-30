
import { createPool } from '@vercel/postgres';
import { VercelRequest, VercelResponse } from '@vercel/node';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { rows } = await pool.sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 200`;
      
      const orders = rows.map(row => ({
        id: row.id,
        type: row.type,
        tableNumber: row.table_number !== null ? Number(row.table_number) : undefined,
        items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []),
        total: Number(row.total),
        status: row.status,
        createdAt: Number(row.created_at),
        paymentStatus: row.payment_status,
        paymentMethod: row.payment_method,
        origin: row.origin || 'OFFLINE'
      }));
      
      return res.status(200).json(orders);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { id, type, tableNumber, items, total, status, createdAt, paymentStatus, origin } = req.body;
      const itemsJson = JSON.stringify(items);
      
      // Paksa payment_status menjadi UNPAID jika tidak ada (untuk billing baru)
      const pStatus = paymentStatus || 'UNPAID';
      const orderOrigin = origin || 'OFFLINE';
      const orderType = type || 'DINE_IN';

      await pool.sql`
        INSERT INTO orders (id, type, table_number, items, total, status, created_at, payment_status, origin)
        VALUES (${id}, ${orderType}, ${tableNumber || null}, ${itemsJson}, ${total}, ${status}, ${createdAt}, ${pStatus}, ${orderOrigin})
      `;
      
      return res.status(201).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { id, status, paymentStatus, paymentMethod, items, total } = req.body;
      
      if (items !== undefined && total !== undefined) {
        // Mode: Tambah Menu ke Meja
        const itemsJson = JSON.stringify(items);
        await pool.sql`
          UPDATE orders 
          SET items = ${itemsJson}, total = ${total}
          WHERE id = ${id}
        `;
      } else if (paymentStatus) {
        // Mode: Pembayaran di Kasir
        await pool.sql`
          UPDATE orders 
          SET status = ${status}, payment_status = ${paymentStatus}, payment_method = ${paymentMethod}
          WHERE id = ${id}
        `;
      } else if (status) {
        // Mode: Update Status Order (Preparing/Served)
        await pool.sql`
          UPDATE orders SET status = ${status} WHERE id = ${id}
        `;
      }
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

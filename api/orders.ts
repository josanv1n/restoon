
import { createPool } from '@vercel/postgres';
import { VercelRequest, VercelResponse } from '@vercel/node';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { rows } = await pool.sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 100`;
      // Parse items string to JSON
      const orders = rows.map(row => ({
        ...row,
        items: JSON.parse(row.items),
        createdAt: Number(row.created_at)
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
      await pool.sql`
        INSERT INTO orders (id, type, table_number, items, total, status, created_at, payment_status, origin)
        VALUES (${id}, ${type}, ${tableNumber || null}, ${itemsJson}, ${total}, ${status}, ${createdAt}, ${paymentStatus}, ${origin || 'OFFLINE'})
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
        // Support for appending items to an existing order
        const itemsJson = JSON.stringify(items);
        await pool.sql`
          UPDATE orders 
          SET items = ${itemsJson}, total = ${total}
          WHERE id = ${id}
        `;
      } else if (paymentStatus) {
        // Standard payment/closing update
        await pool.sql`
          UPDATE orders 
          SET status = ${status}, payment_status = ${paymentStatus}, payment_method = ${paymentMethod}
          WHERE id = ${id}
        `;
      } else if (status) {
        // Simple status change
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

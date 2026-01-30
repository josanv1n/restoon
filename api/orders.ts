
import { createPool } from '@vercel/postgres';
import { VercelRequest, VercelResponse } from '@vercel/node';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const { rows } = await pool.sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 300`;
      
      const orders = rows.map(row => ({
        id: row.id,
        type: row.type || 'DINE_IN',
        tableNumber: row.table_number !== null ? Number(row.table_number) : undefined,
        items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []),
        total: Number(row.total),
        status: row.status,
        createdAt: Number(row.created_at),
        paymentStatus: row.payment_status || 'UNPAID',
        paymentMethod: row.payment_method,
        origin: row.origin || 'OFFLINE'
      }));
      
      return res.status(200).json(orders);
    }

    if (req.method === 'POST') {
      const { id, type, tableNumber, items, total, status, createdAt, paymentStatus, origin } = req.body;
      
      const itemsJson = JSON.stringify(items);
      const pStatus = (paymentStatus || 'UNPAID').toUpperCase();
      const oOrigin = (origin || 'OFFLINE').toUpperCase();
      const oType = (type || 'DINE_IN').toUpperCase();
      const tNum = tableNumber ? Number(tableNumber) : null;
      const oTotal = Number(total);
      const oTime = createdAt ? Number(createdAt) : Date.now();

      await pool.sql`
        INSERT INTO orders (id, type, table_number, items, total, status, created_at, payment_status, origin)
        VALUES (${id}, ${oType}, ${tNum}, ${itemsJson}, ${oTotal}, ${status || 'PENDING'}, ${oTime}, ${pStatus}, ${oOrigin})
      `;
      
      return res.status(201).json({ success: true, message: "Order stored" });
    }

    if (req.method === 'PATCH') {
      const { id, status, paymentStatus, paymentMethod, items, total } = req.body;
      
      if (items !== undefined && total !== undefined) {
        const itemsJson = JSON.stringify(items);
        await pool.sql`UPDATE orders SET items = ${itemsJson}, total = ${Number(total)} WHERE id = ${id}`;
      } else if (paymentStatus) {
        await pool.sql`
          UPDATE orders 
          SET status = ${status || 'PAID'}, payment_status = ${paymentStatus}, payment_method = ${paymentMethod}
          WHERE id = ${id}
        `;
      } else if (status) {
        await pool.sql`UPDATE orders SET status = ${status} WHERE id = ${id}`;
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error("Orders API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
